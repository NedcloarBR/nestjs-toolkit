/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator";
import { ConfigService } from "../../services";
import { KeyUtils } from "../../utils/key.utils";

@Command({
	name: "jwt:key",
	description: "Generate a new JWT key",
})
@CommandExtra({
	category: "key",
})
export class JwtKeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(): Promise<void> {
		KeyUtils.addToEnv("JWT_SECRET", this.configService);
	}
}
