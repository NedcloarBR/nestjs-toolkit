import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { Command } from "../../command/command.decorator.js";
import { ConsoleCommand } from "../../command/console-command.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { ConsoleKernel } from "../../kernel/console-kernel.js";
import {
	type ConsoleMakeConfig,
	isEsmProject,
	readMakeConfig,
} from "../../options/toolkit-config.js";
import { parseSignature } from "../../parsing/signature.js";
import { registerProvider } from "./register-provider.js";

interface Target {
	dir: string;
	modulePath?: string;
}

function pascal(name: string): string {
	return name
		.split(/[:\-_]/)
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join("");
}

function template(
	importFrom: string,
	name: string,
	className: string,
	description: string,
	exclusive: boolean,
): string {
	const options = [
		`signature: ${JSON.stringify(name)}`,
		`description: ${JSON.stringify(description)}`,
		...(exclusive ? ["exclusive: true"] : []),
	].join(", ");
	return `import { Command, ConsoleCommand } from ${JSON.stringify(importFrom)};

@Command({ ${options} })
export class ${className} extends ConsoleCommand {
	public async handle(): Promise<void> {
		this.info(${JSON.stringify(`${name}: done.`)});
	}
}
`;
}

function show(path: string): string {
	return relative(process.cwd(), path) || ".";
}

function directories(path: string): string[] {
	if (!existsSync(path)) return [];
	return readdirSync(path, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

/** Writes a command into a module and registers it there, ready to fill in. */
@Command({
	signature:
		"make:command {name : The name, with its group: reports:export} {--module= : The module it lives in} {--description=Describe the command : What list shows} {--exclusive : One run at a time}",
	description: "Create a new command",
})
export class MakeCommandCommand extends ConsoleCommand {
	public constructor(private readonly kernel: ConsoleKernel) {
		super();
	}

	public async handle(): Promise<void> {
		const config = readMakeConfig();
		const root =
			this.kernel.consoleOptions.sourceRoot ?? resolve(config.sourceRoot);
		if (!existsSync(root)) {
			this.fail(
				`make:command needs the source code, and there is none at ${show(root)}.`,
			);
		}

		const name = this.argument("name") ?? "";
		const { name: parsed } = parseSignature(name);
		const target = await this.target(root, config);
		const className = `${pascal(parsed)}Command`;
		const fileName = `${parsed.replace(/:/g, "-")}.command.ts`;
		const filePath = join(target.dir, fileName);
		if (existsSync(filePath)) this.fail(`${show(filePath)} already exists.`);

		await mkdir(target.dir, { recursive: true });
		await writeFile(
			filePath,
			template(
				config.importFrom,
				parsed,
				className,
				String(this.option("description")),
				this.option("exclusive") === true,
			),
		);
		this.info(`✔ Created ${show(filePath)}`);

		await this.register(target, className, fileName, config);
		this.comment(`Run it: ${this.kernel.name} ${parsed}`);
	}

	/** The module's commands directory, or the top-level one when the project has no modules. */
	private async target(
		root: string,
		config: ConsoleMakeConfig,
	): Promise<Target> {
		const modulesRoot = join(root, config.modulesDir);
		const modules = directories(modulesRoot);
		const given = this.option("module");
		if (typeof given !== "string" && !modules.length) {
			return { dir: join(root, config.commandsDir) };
		}

		const module =
			typeof given === "string"
				? given
				: await this.search("Which module does it belong to?", modules);
		const moduleDir = join(modulesRoot, module);
		if (!existsSync(moduleDir)) {
			this.fail(`There is no "${module}" module in ${show(modulesRoot)}.`);
		}
		return {
			dir: join(moduleDir, config.commandsDir),
			modulePath: join(moduleDir, `${module}.module.ts`),
		};
	}

	private async register(
		target: Target,
		className: string,
		fileName: string,
		config: ConsoleMakeConfig,
	): Promise<void> {
		const { modulePath } = target;
		if (!(modulePath && existsSync(modulePath))) {
			this.warn(
				`Add ${className} to a module's providers for the console to find it.`,
			);
			return;
		}
		const extension = isEsmProject() ? ".js" : "";
		const specifier = `./${config.commandsDir}/${fileName.replace(/\.ts$/, extension)}`;
		const { source, registration } = registerProvider(
			await readFile(modulePath, "utf8"),
			className,
			`import { ${className} } from "${specifier}";`,
		);
		switch (registration.status) {
			case "registered":
				await writeFile(modulePath, source);
				this.info(`✔ Registered in ${show(modulePath)}`);
				return;
			case "already":
				this.comment(`${className} is already in ${show(modulePath)}`);
				return;
			case "manual":
				this.warn(
					`Add ${className} to the providers of ${show(modulePath)} by hand: ${registration.reason}.`,
				);
		}
	}
}
