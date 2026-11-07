import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { CommandRegistry } from "../kernel/command-registry.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { ConsoleKernel } from "../kernel/console-kernel.js";
import type { AboutSections } from "../options/console.options.js";
import { readAppVersion } from "../options/toolkit-config.js";

const requireFrom = createRequire(import.meta.url);

function versionIn(file: string, name: string): string | undefined {
	const json: unknown = JSON.parse(readFileSync(file, "utf8"));
	if (typeof json !== "object" || json === null) return undefined;
	const { name: found, version } = json as Record<string, unknown>;
	return found === name && typeof version === "string" ? version : undefined;
}

/** The nearest package.json above `from` that belongs to `name`. */
function versionAbove(from: string, name: string): string {
	for (let dir = from; dir !== dirname(dir); dir = dirname(dir)) {
		const file = join(dir, "package.json");
		const version = existsSync(file) ? versionIn(file, name) : undefined;
		if (version) return version;
	}
	return "unknown";
}

/** Found from the package's entry point upwards: an `exports` map may not expose its package.json. */
function packageVersion(name: string): string {
	try {
		return versionAbove(dirname(requireFrom.resolve(name)), name);
	} catch {
		return "unknown";
	}
}

function slug(text: string): string {
	return text.toLowerCase().replace(/\s+/g, "_");
}

/** Laravel's `about`: what the application is and where it runs, at a glance. */
@Command({
	signature:
		"about {--only= : Only the section with this name} {--json : As JSON}",
	description: "Display basic information about the application",
})
export class AboutCommand extends ConsoleCommand {
	public constructor(
		private readonly registry: CommandRegistry,
		private readonly kernel: ConsoleKernel,
	) {
		super();
	}

	public async handle(): Promise<void> {
		const only = this.option("only");
		const sections = Object.entries(await this.sections()).filter(
			([section]) => typeof only !== "string" || slug(section) === slug(only),
		);
		if (!sections.length) this.fail(`There is no "${String(only)}" section.`);

		if (this.option("json") === true) {
			const json = Object.fromEntries(
				sections.map(([section, values]) => [
					slug(section),
					Object.fromEntries(
						Object.entries(values).map(([key, value]) => [slug(key), value]),
					),
				]),
			);
			this.line(JSON.stringify(json, null, 2));
			return;
		}
		for (const [section, values] of sections) this.print(section, values);
	}

	private async sections(): Promise<AboutSections> {
		const options = this.kernel.consoleOptions;
		const commands = this.registry.all();
		const builtIn: AboutSections = {
			Environment: {
				Application: options.description ?? options.name,
				Version: options.version ?? readAppVersion() ?? "unknown",
				Environment: process.env.NODE_ENV ?? "unset",
				Production: options.isProduction?.() ?? false,
				"Node.js": process.versions.node,
				NestJS: packageVersion("@nestjs/core"),
				Toolkit: versionAbove(
					dirname(fileURLToPath(import.meta.url)),
					"@nedcloarbr/nestjs-toolkit",
				),
				Platform: `${process.platform} ${process.arch}`,
			},
			Console: {
				Executable: options.name,
				Commands: commands.length,
				Exclusive: commands.filter((command) => command.options.exclusive)
					.length,
				Mutex: this.kernel.mutexName,
			},
		};
		const extra = (await options.about?.()) ?? {};
		const merged: AboutSections = { ...builtIn };
		for (const [section, values] of Object.entries(extra)) {
			merged[section] = { ...merged[section], ...values };
		}
		return merged;
	}

	private print(section: string, values: Record<string, unknown>): void {
		const width = Math.min(80, process.stdout.columns ?? 80);
		this.newLine();
		this.info(`  ${section}`);
		for (const [label, raw] of Object.entries(values)) {
			const value =
				typeof raw === "boolean" ? (raw ? "YES" : "NO") : String(raw);
			const dots = Math.max(2, width - label.length - value.length - 6);
			this.line(`  ${label} ${".".repeat(dots)} ${value}`);
		}
	}
}
