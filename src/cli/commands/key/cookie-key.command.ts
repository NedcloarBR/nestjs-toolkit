/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner } from "nest-commander";
import { ConfigService } from "../../services";
import { KeyUtils } from "../../utils/key.utils";

@Command({
	name: "cookie:key",
	description: "Generate a new Cookie key",
})
export class CookieKeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(): Promise<void> {
		KeyUtils.addToEnv("COOKIE_SECRET", this.configService);
	}
}
