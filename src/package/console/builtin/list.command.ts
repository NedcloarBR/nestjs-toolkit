import { Command } from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { CommandRegistry } from "../kernel/command-registry.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { ConsoleKernel } from "../kernel/console-kernel.js";
import { GLOBAL_OPTIONS } from "../kernel/globals.js";
import { readAppVersion } from "../options/toolkit-config.js";

type Entry = [string, string];

/** Every command, grouped by the namespace before the colon. */
@Command({
	signature: "list {namespace? : Only the commands of this group}",
	description: "List the commands",
})
export class ListCommand extends ConsoleCommand {
	public constructor(
		private readonly registry: CommandRegistry,
		private readonly kernel: ConsoleKernel,
	) {
		super();
	}

	public async handle(): Promise<void> {
		const only = this.argument("namespace");
		const groups = this.groups(only);
		if (only && !groups.size) {
			this.fail(`There are no commands in the "${only}" namespace.`);
		}

		const { name, description, version } = this.kernel.consoleOptions;
		const shownVersion = version ?? readAppVersion();
		if (description) {
			this.line(`${description}${shownVersion ? ` ${shownVersion}` : ""}`);
			this.newLine();
		}
		this.info("Usage:");
		this.line(`  ${name} <command> [arguments] [options]`);
		this.newLine();
		this.info("Options:");
		this.definitions(GLOBAL_OPTIONS);
		this.newLine();
		this.info(
			only ? `Available commands for "${only}":` : "Available commands:",
		);
		const width = Math.max(
			...[...groups.values()].flat().map(([command]) => command.length),
		);
		for (const [group, commands] of this.sorted(groups)) {
			if (group) this.comment(` ${group}`);
			this.definitions(commands, width);
		}
	}

	private groups(only: string | undefined): Map<string, Entry[]> {
		const groups = new Map<string, Entry[]>();
		for (const { signature, options } of this.registry.all()) {
			if (options.hidden) continue;
			const group = signature.name.includes(":")
				? signature.name.split(":")[0]
				: "";
			if (only && group !== only) continue;
			groups.set(group, [
				...(groups.get(group) ?? []),
				[signature.name, options.description],
			]);
		}
		return groups;
	}

	private sorted(groups: Map<string, Entry[]>): [string, Entry[]][] {
		return [...groups].sort(([a], [b]) =>
			a === "" ? -1 : b === "" ? 1 : a.localeCompare(b),
		);
	}

	private definitions(
		entries: readonly (readonly [string, string])[],
		width = Math.max(0, ...entries.map(([term]) => term.length)),
	): void {
		for (const [term, text] of entries) {
			this.line(`  ${term.padEnd(width)}  ${text}`);
		}
	}
}
