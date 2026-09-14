import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ConfigFactory,
	ConfigFactoryKeyHost,
	ConfigObject,
	registerAs,
} from "@nestjs/config";
import { hasDefineEnvRun } from "./env-state.js";
import {
	ConfigSourceError,
	EnvNotInitializedError,
	EnvValidationError,
} from "./errors/index.js";
import { loadPeer } from "./optional-peer.js";
import type { ConfigSource } from "./types.js";
import {
	CONFIG_ENV_BINDING,
	type ConfigEnvBinding,
	type EnvSchema,
	type SchemaOutput,
} from "./types.js";
import { validateSchema } from "./validate-schema.js";

const CONFIG_FILE = /\.config\.(?:js|cjs|mjs|ts|cts|mts)$/;

function toFilePath(source: ConfigSource): string {
	if (typeof source === "string") {
		return source.startsWith("file://") ? fileURLToPath(source) : source;
	}
	if (source instanceof URL) {
		return fileURLToPath(source);
	}
	return source.filename ?? fileURLToPath(source.url);
}

function describeSource(source: ConfigSource): string {
	if (typeof source === "string") {
		return source;
	}
	return source instanceof URL ? source.href : source.url;
}

function configNamespaceFrom(source: ConfigSource): string {
	let filePath: string;
	try {
		filePath = toFilePath(source);
	} catch (cause) {
		throw new ConfigSourceError(describeSource(source), cause);
	}

	const file = basename(filePath);
	if (!CONFIG_FILE.test(file)) {
		throw new ConfigSourceError(filePath);
	}

	return file.replace(CONFIG_FILE, "");
}

function resolveEnv(binding: ConfigEnvBinding): object {
	if (binding.current) {
		return binding.current;
	}

	// A defineEnv that ran without filling the binding never saw this config:
	// it is missing from `configs`, or `load` is async and was not awaited.
	if (hasDefineEnvRun()) {
		throw new EnvNotInitializedError(binding.namespace);
	}

	const result = validateSchema(binding.schema, process.env, {
		enableImplicitConversion: true,
		scope: `[${binding.namespace}]`,
		feature: "defineConfig()",
	});

	if (result.constraints.length > 0) {
		throw new EnvValidationError(result.constraints);
	}

	return result.value;
}

export function defineConfig<
	TConfig extends ConfigObject,
	TFactory extends ConfigFactory = ConfigFactory<TConfig>,
>(
	source: ConfigSource,
	factory: TFactory,
): TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>>;
export function defineConfig<
	TSchema extends EnvSchema,
	TReturn extends ConfigObject | Promise<ConfigObject>,
>(
	source: ConfigSource,
	schema: TSchema,
	factory: (env: SchemaOutput<TSchema>) => TReturn,
): (() => TReturn) &
	ConfigFactoryKeyHost<TReturn> & {
		readonly [CONFIG_ENV_BINDING]: ConfigEnvBinding<SchemaOutput<TSchema>>;
	};
export function defineConfig(
	source: ConfigSource,
	schemaOrFactory: EnvSchema | ConfigFactory,
	maybeFactory?: (env: never) => ConfigObject | Promise<ConfigObject>,
): ConfigFactory & ConfigFactoryKeyHost<ConfigObject | Promise<ConfigObject>> {
	const namespace = configNamespaceFrom(source);
	const { registerAs: register } = loadPeer<{ registerAs: typeof registerAs }>(
		"@nestjs/config",
		"defineConfig()",
	);

	if (!maybeFactory) {
		return register(namespace, schemaOrFactory as ConfigFactory);
	}

	const binding: ConfigEnvBinding = {
		schema: schemaOrFactory as EnvSchema,
		namespace,
	};

	// Inside the app defineEnv has already filled the binding, honouring its
	// options. Where no defineEnv runs — a script, a DataSource, a test — the
	// factory reads process.env like registerAs does, with the default options.
	const registered = register(namespace, () =>
		maybeFactory(resolveEnv(binding) as never),
	);

	Object.defineProperty(registered, CONFIG_ENV_BINDING, {
		configurable: false,
		enumerable: false,
		value: binding,
		writable: false,
	});

	return registered;
}
