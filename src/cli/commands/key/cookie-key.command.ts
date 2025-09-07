/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator";
import { ConfigService } from "../../services";
import { KeyUtils } from "../../utils/key.utils";

@Command({
	name: "cookie:key",
	description: "Generate a new Cookie key",
})
@CommandExtra({
	category: "key",
})
export class CookieKeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(): Promise<void> {
		if (KeyUtils.addToEnv("COOKIE_SECRET", this.configService)) {
			console.log("COOKIE_SECRET generated and added to .env");
		}
	}
}
