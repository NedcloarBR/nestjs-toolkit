import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	ConfigCycleError,
	ConfigDirectoryError,
	ConfigFactoryError,
} from "./errors/index.js";
import type { RegisteredConfigFactory } from "./types.js";

// Only built files: the runtime scans dist, and the narrow suffix keeps a
// sibling index.js or define.js out of the result.
const BUILT_CONFIG_FILE = /\.config\.(?:js|cjs|mjs)$/;

const requireConfig = createRequire(import.meta.url);

type MaybeWrapped = { default?: unknown } | null | undefined;

function toDirPath(dir: string | URL): string {
	return typeof dir === "string" ? dir : fileURLToPath(dir);
}

function configFilesIn(dir: string): string[] {
	try {
		return readdirSync(dir)
			.filter((entry) => BUILT_CONFIG_FILE.test(entry))
			.sort();
	} catch (cause) {
		throw new ConfigDirectoryError(dir, cause);
	}
}

// The namespace shape depends on how the file was loaded: a native import() of
// a CommonJS module exposes the whole module.exports as `default`, so a
// transpiled `export default` sits one level deeper than under require.
function unwrap(mod: unknown, file: string): RegisteredConfigFactory {
	const outer = (mod as MaybeWrapped)?.default;
	const inner = (outer as MaybeWrapped)?.default;
	const factory = inner ?? outer ?? mod;

	if (typeof factory !== "function") {
		throw new ConfigFactoryError(file);
	}

	return factory as RegisteredConfigFactory;
}

export function loadConfigs(
	dir: string | URL,
): Array<Promise<RegisteredConfigFactory>> {
	const path = toDirPath(dir);

	return configFilesIn(path).map(async (file) => {
		const fullPath = join(path, file);
		return unwrap(await import(pathToFileURL(fullPath).href), fullPath);
	});
}

export function loadConfigsSync(dir: string | URL): RegisteredConfigFactory[] {
	const path = toDirPath(dir);

	return configFilesIn(path).map((file) => {
		const fullPath = join(path, file);

		try {
			return unwrap(requireConfig(fullPath), fullPath);
		} catch (cause) {
			// require(esm) refuses cycles outright, and the raw error points at
			// this file rather than at the config that closed the loop.
			if (
				(cause as NodeJS.ErrnoException)?.code === "ERR_REQUIRE_CYCLE_MODULE"
			) {
				throw new ConfigCycleError(fullPath, cause);
			}
			throw cause;
		}
	});
}
