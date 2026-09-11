import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	ConfigFactory,
	ConfigFactoryKeyHost,
	ConfigObject,
	registerAs,
} from "@nestjs/config";
import { ConfigSourceError, EnvNotInitializedError } from "./errors/index.js";
import { loadPeer } from "./optional-peer.js";
import type { ConfigSource } from "./types.js";
import {
	CONFIG_ENV_BINDING,
	type ConfigEnvBinding,
	type EnvSchema,
	type SchemaOutput,
} from "./types.js";

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

export function defineConfig<
	TConfig extends ConfigObject,
	TFactory extends ConfigFactory = ConfigFactory<TConfig>,
>(
	source: ConfigSource,
	factory: TFactory,
): TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>>;
export function defineConfig<
	TSchema extends EnvSchema,
	TConfig extends ConfigObject,
>(
	source: ConfigSource,
	schema: TSchema,
	factory: (env: SchemaOutput<TSchema>) => TConfig | Promise<TConfig>,
): (() => TConfig | Promise<TConfig>) &
	ConfigFactoryKeyHost<TConfig | Promise<TConfig>> & {
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

	// The factory is a provider, so it runs after defineEnv has validated and
	// filled the binding — the guard only fires if the same factories were not
	// handed to both defineEnv and ConfigModule.
	const registered = register(namespace, () => {
		if (!binding.current) {
			throw new EnvNotInitializedError(namespace);
		}
		return maybeFactory(binding.current as never);
	});

	Object.defineProperty(registered, CONFIG_ENV_BINDING, {
		configurable: false,
		enumerable: false,
		value: binding,
		writable: false,
	});

	return registered;
}
