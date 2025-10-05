import { CommandFactory } from "nest-commander";
import { Commander } from "nest-commander/src/constants";
import { version } from "../package.json";
import { AppModule } from "./app.module";
import { CommandsService } from "./cli/services/commands.service";
import { categorizedHelp, commandHelp } from "./cli/ui";

async function bootstrap() {
	const app = await CommandFactory.createWithoutRunning(AppModule, {
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
