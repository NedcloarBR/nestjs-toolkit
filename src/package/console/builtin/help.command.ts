import { Command } from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { CommandRegistry } from "../kernel/command-registry.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { ConsoleKernel } from "../kernel/console-kernel.js";

@Command({
	signature: "help {command=help : The command}",
	description: "Show how to use a command",
})
export class HelpCommand extends ConsoleCommand {
	public constructor(
		private readonly registry: CommandRegistry,
		private readonly kernel: ConsoleKernel,
	) {
		super();
	}

	public async handle(): Promise<number | undefined> {
		const name = this.argument("command") ?? "help";
		const command = this.registry.find(name);
		if (!command) return this.call(name);
		this.kernel.describe(command);
		return undefined;
	}
}
