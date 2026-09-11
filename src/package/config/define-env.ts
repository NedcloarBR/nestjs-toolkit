import type { ConfigFactory } from "@nestjs/config";
import type { UnionToIntersection } from "../types.js";
import { ConfigNamespacesError, EnvValidationError } from "./errors/index.js";
import {
	CONFIG_ENV_BINDING,
	type ConfigEnvBinding,
	type EnvSchema,
	type InferConfig,
	type SchemaOutput,
} from "./types.js";
import { validateSchema } from "./validate-schema.js";

// Type-only: carries the `namespaces` map on the validator so InferAppConfig
// can read it back. Nothing is ever stored under it.
declare const DEFINED_NAMESPACES: unique symbol;

// `KEY` is `getConfigToken(namespace)` from @nestjs/config.
const CONFIG_TOKEN = /^CONFIGURATION\((.*)\)$/;

/**
 * What `ConfigModule.forRoot({ validate })` expects: it is handed the raw
 * environment and returns the validated one, throwing to block the boot.
 */
export type EnvValidator<T> = (config: Record<string, unknown>) => T;

/** Config factories, imported and keyed by namespace. */
export type ConfigNamespaceMap = Record<string, (...args: never[]) => unknown>;

export interface DefineEnvOptions<
	TSchemas extends readonly EnvSchema[],
	TNamespaces extends ConfigNamespaceMap = Record<never, never>,
> {
	/**
	 * Schemas that are not tied to a single config file — the application's own
	 * variables, or ones several configs share.
	 */
	schemas?: TSchemas;
	/**
	 * Config factories from `loadConfigsSync`. Any schema co-located through
	 * `defineConfig(source, Schema, factory)` is validated and handed to its
	 * factory from here.
	 */
	configs?: readonly ConfigFactory[];
	/**
	 * The same configs, imported and keyed by namespace, so `InferAppConfig` can
	 * type every `ConfigService` path. When `configs` is given too, both are
	 * checked against each other: a loaded config missing here, or a key that
	 * does not match its file name, throws.
	 */
	namespaces?: TNamespaces;
	/**
	 * Coerce raw environment strings to the declared property types.
	 *
	 * Booleans and numbers are parsed strictly rather than with class-transformer's
	 * `Boolean(value)` / `Number(value)`: `"false"` stays false, and garbage or an
	 * empty string is rejected instead of passing as `true` or `0`. Turn it off to
	 * validate the raw strings (`@IsPort()`, `@IsBooleanString()`) and convert
	 * explicitly inside the config factory.
	 *
	 * Ignored by Standard Schema validators, which handle coercion themselves.
	 *
	 * @default true
	 */
	enableImplicitConversion?: boolean;
}

export type ComposedEnv<TSchemas extends readonly EnvSchema[]> = [
	SchemaOutput<TSchemas[number]>,
] extends [never]
	? Record<never, never>
	: UnionToIntersection<SchemaOutput<TSchemas[number]>>;

/** A `defineEnv` validator, remembering the `namespaces` it was given. */
export type DefinedEnv<
	TEnv,
	TNamespaces extends ConfigNamespaceMap = Record<never, never>,
> = EnvValidator<TEnv> & { readonly [DEFINED_NAMESPACES]?: TNamespaces };

// `never` for a config without a schema, so it drops out of the union instead
// of widening it to `unknown`.
type CoLocatedEnvOf<TFactory> = TFactory extends {
	readonly [CONFIG_ENV_BINDING]: ConfigEnvBinding<infer TEnv>;
}
	? TEnv
	: never;

/**
 * Everything `ConfigService<…, true>` can read for a `defineEnv` validator: the
 * validated environment, the variables each config declares next to itself,
 * and every namespace passed in `namespaces`.
 */
export type InferAppConfig<TValidator> = TValidator extends DefinedEnv<
	infer TEnv,
	infer TNamespaces extends ConfigNamespaceMap
>
	? TEnv &
			UnionToIntersection<
				{
					[TName in keyof TNamespaces]: CoLocatedEnvOf<TNamespaces[TName]>;
				}[keyof TNamespaces]
			> & {
				[TName in keyof TNamespaces]: InferConfig<TNamespaces[TName]>;
			}
	: never;

function bindingOf(factory: ConfigFactory): ConfigEnvBinding | undefined {
	return (factory as { [CONFIG_ENV_BINDING]?: ConfigEnvBinding })[
		CONFIG_ENV_BINDING
	];
}

function namespaceOf(factory: unknown): string | undefined {
	const key = (factory as { KEY?: unknown } | undefined)?.KEY;
	return typeof key === "string" ? CONFIG_TOKEN.exec(key)?.[1] : undefined;
}

function resolveConfigs(
	configs: readonly ConfigFactory[] | undefined,
	namespaces: ConfigNamespaceMap | undefined,
): readonly ConfigFactory[] {
	if (!namespaces) {
		return configs ?? [];
	}

	const listed = Object.entries(namespaces);
	const problems: string[] = [];

	for (const [key, factory] of listed) {
		const actual = namespaceOf(factory);
		if (actual !== undefined && actual !== key) {
			problems.push(
				`the "${key}" entry points at the "${actual}" config — the key must match its file name`,
			);
		}
	}

	if (configs) {
		const listedNames = new Set(
			listed.map(([, factory]) => namespaceOf(factory)),
		);
		const loadedNames = new Set(configs.map(namespaceOf));

		for (const name of loadedNames) {
			if (name !== undefined && !listedNames.has(name)) {
				problems.push(
					`"${name}" is loaded from the config folder but missing from namespaces, so its keys are not typed`,
				);
			}
		}
		for (const [key, factory] of listed) {
			const name = namespaceOf(factory);
			if (name !== undefined && !loadedNames.has(name)) {
				problems.push(`the "${key}" entry is not among the loaded configs`);
			}
		}
	}

	if (problems.length > 0) {
		throw new ConfigNamespacesError(problems);
	}

	return configs ?? listed.map(([, factory]) => factory as ConfigFactory);
}

function isOptions(
	value: EnvSchema | DefineEnvOptions<readonly EnvSchema[], ConfigNamespaceMap>,
): value is DefineEnvOptions<readonly EnvSchema[], ConfigNamespaceMap> {
	return typeof value === "object" && value !== null && !("~standard" in value);
}

export function defineEnv<TSchema extends EnvSchema>(
	schema: TSchema,
	options?: Pick<DefineEnvOptions<never>, "enableImplicitConversion">,
): DefinedEnv<SchemaOutput<TSchema>>;
export function defineEnv<
	const TSchemas extends readonly EnvSchema[] = [],
	TNamespaces extends ConfigNamespaceMap = Record<never, never>,
>(
	options: DefineEnvOptions<TSchemas, TNamespaces>,
): DefinedEnv<ComposedEnv<TSchemas>, TNamespaces>;
export function defineEnv(
	schemaOrOptions:
		| EnvSchema
		| DefineEnvOptions<readonly EnvSchema[], ConfigNamespaceMap>,
	maybeOptions: { enableImplicitConversion?: boolean } = {},
): EnvValidator<object> {
	const options: DefineEnvOptions<readonly EnvSchema[], ConfigNamespaceMap> =
		isOptions(schemaOrOptions)
			? schemaOrOptions
			: { schemas: [schemaOrOptions], ...maybeOptions };

	const {
		schemas = [],
		configs,
		namespaces,
		enableImplicitConversion = true,
	} = options;

	// Checked eagerly, so a stale `namespaces` map fails at import, not later.
	const factories = resolveConfigs(configs, namespaces);

	return (config) => {
		const bindings = factories
			.map(bindingOf)
			.filter((binding): binding is ConfigEnvBinding => binding !== undefined);

		const targets = [
			...schemas.map((schema) => ({ schema, scope: "", binding: undefined })),
			...bindings.map((binding) => ({
				schema: binding.schema,
				scope: `[${binding.namespace}]`,
				binding,
			})),
		];

		const constraints: string[] = [];
		// Nothing is stripped, so the result carries the whole source environment
		// alongside the declared keys — never log it as a whole.
		const merged: Record<string, unknown> = { ...config };

		for (const { schema, scope, binding } of targets) {
			const result = validateSchema(schema, config, {
				enableImplicitConversion,
				scope,
				feature: "defineEnv()",
			});

			if (result.constraints.length > 0) {
				constraints.push(...result.constraints);
				continue;
			}

			for (const key of result.keys) {
				merged[key] = result.value[key];
			}

			if (binding) {
				binding.current = result.value;
			}
		}

		if (constraints.length > 0) {
			throw new EnvValidationError(constraints);
		}

		return merged;
	};
}
