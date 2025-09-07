/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import {
	Command,
	CommandRunner,
	InquirerService,
	Option,
} from "nest-commander";
import { CommandExtra } from "../common/decorators/command-extras.decorator";
import { ConfigService } from "../services";
import { ConfigFile } from "../types/config";

interface Options {
	force: boolean;
}

@Command({
	name: "init",
	description: "Initialize the CLI config file",
	aliases: ["i"],
})
@CommandExtra({
	category: "config",
})
export class InitCommand extends CommandRunner {
	public constructor(
		private readonly inquirerService: InquirerService,
		private readonly configService: ConfigService,
	) {
		super();
	}

	public async run(_inputs: string[], options: Options): Promise<void> {
		const configFile = this.configService.existConfigFile();
		if (configFile) {
			if (!options.force) {
				const { recreate } = await this.inquirerService.ask<{
					recreate: boolean;
				}>("recreate", undefined);

				if (!recreate) {
					process.exit(0);
				}
			}
		}

		const configQuestions = await this.inquirerService.ask<ConfigFile>(
			"init",
			undefined,
		);

		this.configService.createConfigFile(configQuestions);

		process.exit(0);
	}

	@Option({
		flags: "-f, --force",
		description: "Force the initialization without confirmation",
	})
	public parseForce() {}
}
