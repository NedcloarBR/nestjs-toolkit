/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner } from "nest-commander";
import { ConfigService } from "../../services";
import { KeyUtils } from "../../utils/key.utils";

@Command({
	name: "app:key",
	description: "Generate a new APP key",
})
export class APPKeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(): Promise<void> {
		KeyUtils.addToEnv("APP_SECRET", this.configService);
	}
}
