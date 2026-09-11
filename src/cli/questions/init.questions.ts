import { Question, QuestionSet } from "nest-commander";
import {
	CONFIG_SCHEMA_KINDS,
	type ConfigSchemaKind,
	DEFAULT_CONFIG_DIR,
	DEFAULT_CONFIG_SCHEMA,
} from "../types/config.js";

@QuestionSet({ name: "init" })
export class InitQuestions {
	@Question({
		name: "envFilePath",
		message: "Path to the .env file",
		default: ".env",
	})
	public parseEnvPath(value: string) {
		return value;
	}

	@Question({
		name: "configDir",
		message: "Directory for config files",
		default: DEFAULT_CONFIG_DIR,
	})
	public parseConfigDir(value: string) {
		return value;
	}

	@Question({
		name: "configSchema",
		message: "Schema for the env variables of new config files",
		type: "list",
		choices: [...CONFIG_SCHEMA_KINDS],
		default: DEFAULT_CONFIG_SCHEMA,
	})
	public parseConfigSchema(value: ConfigSchemaKind) {
		return value;
	}
}
