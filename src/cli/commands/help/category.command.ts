import chalk from "chalk";
import { Command, CommandRunner, Option } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator";
// biome-ignore lint/style/useImportType: Dependency Injection
import { CommandsService } from "../../services/commands.service";
import { CommandCategories } from "../../types/categories";
import { commandHelp } from "../../ui/command-help";

interface Options {
	detailed: boolean;
}

@Command({
	name: "category",
	arguments: "<category>",
	description: "Display all commands from the specified category",
	aliases: ["c"],
})
@CommandExtra({
	category: CommandCategories.HELP,
})
export class CategoryCommand extends CommandRunner {
	public constructor(private readonly commandsService: CommandsService) {
		super();
	}

	public async run(inputs: string[], options: Options): Promise<void> {
		const category = inputs[0];

		const validCategories = Object.values(CommandCategories).map((c) =>
			c.toLowerCase(),
		);
		const inputCategory = category.toLowerCase();

		if (!validCategories.includes(inputCategory)) {
			console.error(
				chalk.red(
					`Invalid category '${category}'. Please provide a valid category. Available: ${validCategories.join(", ")}`,
				),
			);
			return;
		}

		// biome-ignore lint/style/noNonNullAssertion: We have already validated the input
		const matchedCategory = Object.values(CommandCategories).find(
			(category) => category.toLowerCase() === inputCategory,
		)!;

		const filteredCommands =
			this.commandsService.getByCategory(matchedCategory);

		const maxNameLength = filteredCommands.reduce(
			(max, cmd) => Math.max(max, cmd.name.length),
			0,
		);

		console.log(`\nCommands in category '${matchedCategory}':\n`);
		for (const cmd of filteredCommands) {
			if (!options.detailed) {
				console.log(
					`${chalk.green(cmd.name.padEnd(maxNameLength))}   ${cmd.description}`,
				);
				continue;
			}
			console.log(
				commandHelp(
					this.commandsService.getAll(),
					// biome-ignore lint/complexity/useLiteralKeys: Magic access to private property
					cmd.instance["command"],
					false,
				),
			);
		}
	}

	@Option({
		flags: "-d, --detailed",
		description: "Show detailed information for each command",
	})
	parseDetailed() {}
}
