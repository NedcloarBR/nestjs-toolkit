import { CommandFactory } from "nest-commander";
import { Commander } from "nest-commander/src/constants";
import { version } from "../package.json";
import { AppModule } from "./app.module";
import { banner, categorizedHelp } from "./cli/ui";

async function bootstrap() {
	const app = await CommandFactory.createWithoutRunning(AppModule, {
		cliName: "nestjs-toolkit",
		version,
		helpConfiguration: {
			formatHelp: (cmd, helper) => {
				console.info(banner);
				return categorizedHelp(app);
			},
		},
	});

	const commander = app.get(Commander);
	commander.addHelpCommand(false);

	CommandFactory.runApplication(app);
}

bootstrap();
