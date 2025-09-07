import type { INestApplicationContext } from "@nestjs/common";
import chalk from "chalk";
import { getAllCommands } from "./all-commands";
import { banner } from "./banner";

export function categorizedHelp(
	app: INestApplicationContext,
	cliName: string,
): string {
	const commands = getAllCommands(app);

	const groupedCommands = commands.reduce(
		(groups, command) => {
			const category = command.category || "other";
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(command);
			return groups;
		},
		{} as Record<string, typeof commands>,
	);

	const maxCategoryLength = Math.max(
		"Category".length,
		...Object.keys(groupedCommands).map((category) => category.length),
	);
	const maxNameLength = Math.max(
		"Name".length,
		...commands.map((c) => c.name?.length ?? 0),
	);
	const maxDescLength = Math.max(
		"Description".length,
		...commands.map((c) => c.description?.length ?? 0),
	);

	const message = `List of available commands:`;

	const top = `┌${"─".repeat(maxCategoryLength + 2)}┬${"─".repeat(maxNameLength + 2)}┬${"─".repeat(maxDescLength + 2)}┐`;

	const header = `│ ${chalk.red(pad("Category", maxCategoryLength))} │ ${chalk.red(pad("Name", maxNameLength))} │ ${chalk.red(pad("Description", maxDescLength))} │`;

	const separator = `├${"─".repeat(maxCategoryLength + 2)}┼${"─".repeat(maxNameLength + 2)}┼${"─".repeat(maxDescLength + 2)}┤`;

	const rows: string[] = [];
	const categories = Object.keys(groupedCommands).sort();

	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		const categoryCommands = groupedCommands[category];
		const middleIndex = Math.floor(categoryCommands.length / 2);

		for (let j = 0; j < categoryCommands.length; j++) {
			const command = categoryCommands[j];
			const categoryDisplay = j === middleIndex ? category : "";
			const name = command.name || "";
			const desc = command.description || "";

			const categoryCell =
				j === middleIndex
					? chalk.cyan(centerPad(categoryDisplay, maxCategoryLength))
					: pad("", maxCategoryLength);
			rows.push(
				`│ ${categoryCell} │ ${chalk.green(pad(name, maxNameLength))} │ ${chalk.white(pad(desc, maxDescLength))} │`,
			);
		}

		if (i < categories.length - 1) {
			rows.push(
				`├${"─".repeat(maxCategoryLength + 2)}┼${"─".repeat(maxNameLength + 2)}┼${"─".repeat(maxDescLength + 2)}┤`,
			);
		}
	}

	const bottom = `└${"─".repeat(maxCategoryLength + 2)}┴${"─".repeat(maxNameLength + 2)}┴${"─".repeat(maxDescLength + 2)}┘`;

	const footer = `\nRun ${chalk.green(`${cliName} <command> --help`)} for more information on a command.\n`;

	return [banner, message, top, header, separator, ...rows, bottom, footer]
		.join("\n")
		.concat("\n");
}

function pad(str: string, length: number): string {
	return str + " ".repeat(length - str.length);
}

function centerPad(str: string, length: number): string {
	const padding = length - str.length;
	const leftPadding = Math.floor(padding / 2);
	const rightPadding = padding - leftPadding;
	return " ".repeat(leftPadding) + str + " ".repeat(rightPadding);
}
