export type ConfigSchemaKind =
	| "class-validator"
	| "zod"
	| "valibot"
	| "arktype"
	| "none";

export const CONFIG_SCHEMA_KINDS: readonly ConfigSchemaKind[] = [
	"class-validator",
	"zod",
	"valibot",
	"arktype",
	"none",
];

export const DEFAULT_CONFIG_DIR = "src/config";
export const DEFAULT_CONFIG_SCHEMA: ConfigSchemaKind = "class-validator";

export interface ConfigFile {
	envFilePath: string;
	config?: {
		/** Directory `make:config` writes to. */
		dir?: string;
		/** Schema `make:config` declares the env variables with. */
		schema?: ConfigSchemaKind;
	};
}

export interface InitAnswers {
	envFilePath: string;
	configDir: string;
	configSchema: ConfigSchemaKind;
}

export function isConfigSchemaKind(value: unknown): value is ConfigSchemaKind {
	return CONFIG_SCHEMA_KINDS.includes(value as ConfigSchemaKind);
}

export type ModuleKind = "esm" | "cjs";

export const MODULE_KINDS: readonly ModuleKind[] = ["esm", "cjs"];

export function isModuleKind(value: unknown): value is ModuleKind {
	return MODULE_KINDS.includes(value as ModuleKind);
}
