/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import path from "node:path";
import chalk from "chalk";
import { Command, CommandRunner, Option } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator.js";
import { ConfigService } from "../../services/index.js";
import { CommandCategories } from "../../types/categories.js";
import {
	CONFIG_SCHEMA_KINDS,
	type ConfigSchemaKind,
	DEFAULT_CONFIG_DIR,
	DEFAULT_CONFIG_SCHEMA,
	isConfigSchemaKind,
	isModuleKind,
	MODULE_KINDS,
	type ModuleKind,
} from "../../types/config.js";
import {
	ConfigScaffoldUtils,
	type Registration,
} from "../../utils/config-scaffold.utils.js";

interface MakeConfigOptions {
	schema?: string;
	module?: string;
	dir?: string;
	force?: boolean;
	skipRegister?: boolean;
}

const MODULE_LABEL: Record<ModuleKind, string> = {
	esm: "ESM",
	cjs: "CommonJS",
};

function relative(file: string): string {
	return path.relative(process.cwd(), file) || ".";
}

@Command({
	name: "make:config",
	description: "Create a config file in the standard format",
	arguments: "<name>",
})
@CommandExtra({
	category: CommandCategories.CONFIG,
})
export class MakeConfigCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(
		inputs: string[],
		options: MakeConfigOptions,
	): Promise<void> {
		const saved = this.configService.existConfigFile()
			? this.configService.readConfigFile().config
			: undefined;
		const dir = path.resolve(options.dir ?? saved?.dir ?? DEFAULT_CONFIG_DIR);
		const schema = options.schema ?? saved?.schema ?? DEFAULT_CONFIG_SCHEMA;
		const moduleFlag = options.module;

		// Validated here rather than in the option parsers: an error thrown from a
		// parser is printed but leaves the exit code at 0.
		if (!isConfigSchemaKind(schema)) {
			this.fail(
				`"${schema}" is not a schema kind. Use one of: ${CONFIG_SCHEMA_KINDS.join(", ")}`,
			);
			return;
		}
		if (moduleFlag !== undefined && !isModuleKind(moduleFlag)) {
			this.fail(
				`"${moduleFlag}" is not a module format. Use one of: ${MODULE_KINDS.join(", ")}`,
			);
			return;
		}

		try {
			const { module, origin } = this.resolveModule(dir, moduleFlag);
			const result = ConfigScaffoldUtils.create({
				name: inputs[0],
				dir,
				schema,
				module,
				force: options.force === true,
				register: options.skipRegister !== true,
			});

			console.log(
				`Created ${relative(result.file)} ${chalk.dim(`(${schema}, ${MODULE_LABEL[module]}${origin})`)}`,
			);
			this.report(result.registration, result.namespace, schema);

			if (!saved && !options.dir && !options.schema) {
				console.log(
					chalk.dim(
						"Used the defaults — run nestjs-toolkit init to set the config directory and schema.",
					),
				);
			}
		} catch (error) {
			this.fail((error as Error).message);
		}
	}

	private resolveModule(
		dir: string,
		flag: ModuleKind | undefined,
	): { module: ModuleKind; origin: string } {
		if (flag) {
			return { module: flag, origin: "" };
		}

		const { kind, packageJson } = ConfigScaffoldUtils.detectModule(dir);
		if (!packageJson) {
			return { module: kind, origin: " — no package.json found" };
		}

		const file = relative(packageJson);
		return {
			module: kind,
			origin:
				kind === "esm"
					? ` — "type": "module" in ${file}`
					: ` — no "type": "module" in ${file}`,
		};
	}

	private fail(message: string): void {
		console.error(chalk.red(message));
		process.exitCode = 1;
	}

	private report(
		registration: Registration,
		namespace: string,
		schema: ConfigSchemaKind,
	): void {
		switch (registration.status) {
			case "registered":
				console.log(
					`Registered ${namespace} in ${relative(registration.file)}`,
				);
				return;
			case "already":
				console.log(
					chalk.dim(
						`${namespace} is already registered in ${relative(registration.file)}`,
					),
				);
				return;
			case "manual": {
				const where = registration.file
					? ` in ${relative(registration.file)}`
					: "";
				console.log(
					chalk.yellow(
						`Add it to defineEnv({ namespaces })${where} by hand — ${registration.reason}:`,
					),
				);
				console.log(`  ${registration.importLine}`);
				console.log(`  namespaces: { …, ${registration.entry} }`);
				return;
			}
			case "folder":
				console.log(
					chalk.dim(
						`${namespace} is picked up from the folder by defineEnv in ${relative(registration.file)}`,
					),
				);
				return;
			case "no-env":
				console.log(
					schema === "none"
						? chalk.dim(
								`No defineEnv under ${relative(registration.root)} — load the folder with loadConfigsSync, or add the config to ConfigModule.forRoot({ load }).`,
							)
						: chalk.yellow(
								`No defineEnv under ${relative(registration.root)}: the env schema is only validated there, so the app stops with EnvNotInitializedError until defineEnv({ configs }) is wired in. For a config without env variables, recreate it with --schema none --force.`,
							),
				);
				return;
			case "skipped":
				return;
		}
	}

	@Option({
		flags: "-s, --schema <kind>",
		description: `Schema for the env variables: ${CONFIG_SCHEMA_KINDS.join(", ")}`,
	})
	public parseSchema(value: string): string {
		return value;
	}

	@Option({
		flags: "-m, --module <format>",
		description: "esm or cjs (read from the nearest package.json when omitted)",
	})
	public parseModule(value: string): string {
		return value;
	}

	@Option({
		flags: "-d, --dir <path>",
		description: "Directory to create the file in",
	})
	public parseDir(value: string): string {
		return value;
	}

	@Option({
		flags: "-f, --force",
		description: "Overwrite the file if it already exists",
	})
	public parseForce(): boolean {
		return true;
	}

	@Option({
		flags: "--skip-register",
		description: "Do not add the config to defineEnv({ namespaces })",
	})
	public parseSkipRegister(): boolean {
		return true;
	}
}
