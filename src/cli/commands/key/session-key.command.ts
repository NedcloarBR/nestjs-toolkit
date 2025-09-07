/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator";
import { ConfigService } from "../../services";
import { KeyUtils } from "../../utils/key.utils";

@Command({
	name: "session:key",
	description: "Generate a new Session key",
})
@CommandExtra({
	category: "key",
})
export class SessionKeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(): Promise<void> {
		if (KeyUtils.addToEnv("SESSION_SECRET", this.configService)) {
			console.log("SESSION_SECRET generated and added to .env");
		}
	}
}
