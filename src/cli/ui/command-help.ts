import type { INestApplicationContext } from "@nestjs/common";
import chalk from "chalk";
import { getAllCommands } from "./all-commands";
import { banner } from "./banner";

export function commandHelp(app: INestApplicationContext, cmd) {
	const command = getAllCommands(app).find((c) => c.name === cmd.name());

	if (!command) return chalk.red("Command not found.");

	const metadata = `Command name: ${chalk.green(cmd.name())}\nCategory: ${chalk.cyan(command.category)}\nDescription: ${command.description}`;
	const aliases = `Aliases: ${
		// biome-ignore lint/complexity/useLiteralKeys: magic access to private property
		cmd["_aliases"].map((alias) => chalk.yellow(alias)).join(", ") ||
		chalk.gray("No aliases")
	}\n`;

	const usage = `Usage: ${cmd.name()} ${cmd.usage()}`;
	const options = cmd.options
		.map((option) => {
			const flags = option.flags;
			const description = option.description || chalk.gray("No description");
			return `  ${chalk.yellow(flags)}\t${description}`;
		})
		.join("\n");

	return [banner, metadata, aliases, usage, options].join("\n").concat("\n");
}
