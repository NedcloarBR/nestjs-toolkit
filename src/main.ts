import { CommandFactory } from "nest-commander";
import { Commander } from "nest-commander/src/constants";
import { version } from "../package.json";
import { CommandsService } from "./cli/services";
import { categorizedHelp, commandHelp } from "./cli/ui";
import { CLIModule } from "./cli.module";

async function bootstrap() {
	const app = await CommandFactory.createWithoutRunning(CLIModule, {
		cliName: "nestjs-toolkit",
		version,
		helpConfiguration: {
			formatHelp: (cmd, _helper) => {
				const commander = app.get(Commander);
				const commandsService = app.get(CommandsService);
				if (cmd === commander) {
					return categorizedHelp(commandsService.getAll(), commander.name());
				}

				return commandHelp(commandsService.getAll(), cmd);
			},
		},
	});

	const commander = app.get(Commander);
	commander.addHelpCommand(false);

	CommandFactory.runApplication(app);
}

bootstrap();
