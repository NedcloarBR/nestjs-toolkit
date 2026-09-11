import type {
	ConfigFactory,
	ConfigFactoryKeyHost,
	ConfigObject,
} from "@nestjs/config";

/**
 * A config factory as `defineConfig` returns it: callable, and carrying the
 * `KEY` token and `asProvider()` that `registerAs` attaches.
 */
export type RegisteredConfigFactory<TConfig = unknown> = ConfigFactory<
	TConfig & ConfigObject
> &
	ConfigFactoryKeyHost<TConfig>;

/**
 * Where a config file identifies itself from. ESM files pass `import.meta`,
 * CommonJS files pass `__filename`.
 */
export type ConfigSource = string | URL | ImportMeta;

/**
 * Minimal inline copy of the Standard Schema v1 contract (standardschema.dev),
 * so Zod, Valibot, ArkType and friends are accepted structurally without the
 * toolkit taking a dependency on any of them.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly "~standard": StandardSchemaProps<Input, Output>;
}

export interface StandardSchemaProps<Input = unknown, Output = Input> {
	readonly version: 1;
	readonly vendor: string;
	readonly validate: (
		value: unknown,
	) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
	readonly types?: StandardSchemaTypes<Input, Output> | undefined;
}

export type StandardSchemaResult<Output> =
	| StandardSchemaSuccess<Output>
	| StandardSchemaFailure;

export interface StandardSchemaSuccess<Output> {
	readonly value: Output;
	readonly issues?: undefined;
}

export interface StandardSchemaFailure {
	readonly issues: readonly StandardSchemaIssue[];
}

export interface StandardSchemaIssue {
	readonly message: string;
	readonly path?:
		| readonly (PropertyKey | StandardSchemaPathSegment)[]
		| undefined;
}

export interface StandardSchemaPathSegment {
	readonly key: PropertyKey;
}

export interface StandardSchemaTypes<Input, Output> {
	readonly input: Input;
	readonly output: Output;
}

export type InferStandardOutput<TSchema extends StandardSchemaV1> = NonNullable<
	TSchema["~standard"]["types"]
>["output"];

/**
 * The object a config factory produces, awaited when the factory is async.
 * Mirrors `ConfigType` from `@nestjs/config`, so a config file never has to
 * import it.
 */
export type InferConfig<TFactory> = TFactory extends (
	...args: never[]
) => infer TReturn
	? TReturn extends Promise<infer TResolved>
		? TResolved
		: TReturn
	: never;

/**
 * Links a config factory to the environment schema declared next to it, so
 * `defineEnv` can find and fill it without the file being registered anywhere.
 */
export const CONFIG_ENV_BINDING: unique symbol = Symbol.for(
	"@nedcloarbr/nestjs-toolkit/config-env-binding",
);

export interface ConfigEnvBinding<TEnv = object> {
	readonly schema: EnvSchema;
	readonly namespace: string;
	current?: TEnv;
}

/** Either kind of schema is accepted anywhere the toolkit takes one. */
export type EnvSchema =
	// biome-ignore lint/suspicious/noExplicitAny: a class constructor of any shape
	(new (...args: any[]) => object) | StandardSchemaV1;

/** The object a schema produces once validated. */
export type SchemaOutput<TSchema> = TSchema extends StandardSchemaV1
	? InferStandardOutput<TSchema>
	: TSchema extends new (
				// biome-ignore lint/suspicious/noExplicitAny: matches any constructor
				...args: any[]
			) => infer TInstance
		? TInstance
		: never;
