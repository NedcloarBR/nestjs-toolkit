import { CommandFactory } from "nest-commander";
import { Commander } from "nest-commander/src/constants";
import { version } from "../package.json";
import { AppModule } from "./app.module";
import { categorizedHelp } from "./cli/ui";
import { commandHelp } from "./cli/ui/command-help";

async function bootstrap() {
	const app = await CommandFactory.createWithoutRunning(AppModule, {
		cliName: "nestjs-toolkit",
		version,
		helpConfiguration: {
			formatHelp: (cmd, _helper) => {
				const commander = app.get(Commander);
				if (cmd === commander) {
					return categorizedHelp(app, commander.name());
				}

				return commandHelp(app, cmd);
			},
		},
	});

	const commander = app.get(Commander);
	commander.addHelpCommand(false);

	CommandFactory.runApplication(app);
}

bootstrap();
