import chalk from "chalk";
import { CommandCategories, type CommandType } from "../types";
import { banner } from "./banner";

export function commandHelp(
	commands: CommandType[],
	cmd,
	showBanner = true,
): string {
	const command = commands.find((c) => c.name === cmd.name());

	if (!command) return chalk.red("Command not found.");

	const metadata = `Command name: ${chalk.green(cmd.name())}\nCategory: ${chalk.cyan(command.category)}\nDescription: ${command.description}`;
	const aliases = `Aliases: ${
		// biome-ignore lint/complexity/useLiteralKeys: magic access to private property
		cmd["_aliases"].map((alias) => chalk.yellow(alias)).join(", ") ||
		chalk.gray("No aliases")
	}\n`;

	const usage = `Usage: ${cmd.name()} ${cmd.usage()}`;
	let options = cmd.options
		.map((option) => {
			const flags = option.flags;
			const description = option.description || chalk.gray("No description");
			return `  ${chalk.yellow(flags)}\t${description}`;
		})
		.join("\n");

	if (cmd.name() === "category") {
		options += `\nAvailable categories: ${chalk.yellow([...new Set(Object.values(CommandCategories))].join(", "))}`;
	}

	return [showBanner ? banner : "", metadata, aliases, usage, options]
		.join("\n")
		.concat("\n");
}
