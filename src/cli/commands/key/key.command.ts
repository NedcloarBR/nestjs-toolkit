/** biome-ignore-all lint/style/useImportType: Cannot use import type in dependency injection */
import { Command, CommandRunner, Option } from "nest-commander";
import { CommandExtra } from "../../common/decorators/command-extras.decorator";
import { ConfigService } from "../../services";
import { CommandCategories } from "../../types/categories";
import { KeyUtils } from "../../utils/key.utils";

interface KeyOptions {
	length?: number;
	env?: string;
	ifEmpty?: boolean;
}

@Command({
	name: "key",
	description: "Generate a random key for a custom env variable",
	arguments: "<name>",
})
@CommandExtra({
	category: CommandCategories.KEY,
})
export class KeyCommand extends CommandRunner {
	public constructor(private readonly configService: ConfigService) {
		super();
	}

	public async run(inputs: string[], options: KeyOptions): Promise<void> {
		const name = inputs[0];
		const written = KeyUtils.addToEnv(name, this.configService, {
			length: options.length,
			envFilePath: options.env,
			ifEmpty: options.ifEmpty,
		});
		console.log(
			written
				? `${name} generated and added to .env`
				: `${name} already set — kept existing value`,
		);
	}

	@Option({
		flags: "-l, --length <bytes>",
		description: "Key length in bytes (default 32)",
	})
	public parseLength(value: string): number {
		const length = Number(value);
		if (!Number.isInteger(length) || length < 1) {
			throw new Error("length must be a positive integer");
		}
		return length;
	}

	@Option({
		flags: "-e, --env <path>",
		description: "Target env file (defaults to the configured envFilePath)",
	})
	public parseEnv(value: string): string {
		return value;
	}

	@Option({
		flags: "--if-empty",
		description: "Only generate when the variable is missing or empty",
	})
	public parseIfEmpty(): boolean {
		return true;
	}
}
