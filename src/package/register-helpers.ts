import chalk from "chalk";
import { HELPER_CATEGORIES, type HelperCategory } from "../helpers/index.js";

export interface RegisterHelpersOptions {
	/**
	 * Categories to include. If not set, all are included.
	 */
	include?: HelperCategory[];

	/**
	 * Categories to exclude.
	 */
	exclude?: HelperCategory[];

	/**
	 * Enable verbose logging.
	 */
	verbose?: boolean;

	/**
	 * Allow overwriting existing globals.
	 */
	override?: boolean;
}

/**
 * Dynamically registers helper functions into the global scope.
 */
export async function registerHelpers(options: RegisterHelpersOptions = {}) {
	const { include, exclude, verbose = false, override = false } = options;

	const helpersDir = new URL("../helpers/", import.meta.url);
	const ext = import.meta.filename.endsWith(".ts") ? ".ts" : ".js";

	let categoriesToLoad = include?.length ? include : [...HELPER_CATEGORIES];

	if (exclude?.length) {
		categoriesToLoad = categoriesToLoad.filter((c) => !exclude.includes(c));
	}

	if (verbose) {
		console.log(
			chalk.cyan("🔍 Available helper categories:"),
			chalk.white(HELPER_CATEGORIES.join(", ")),
		);
		console.log(
			chalk.green("✅ Registering categories:"),
			chalk.white(categoriesToLoad.join(", ")),
		);
	}

	for (const category of categoriesToLoad) {
		const helperFile = new URL(`${category}.helpers${ext}`, helpersDir);

		try {
			const mod = await import(helperFile.href);

			for (const [exportName, exported] of Object.entries(mod)) {
				if (typeof exported === "function") {
					// biome-ignore lint/suspicious/noExplicitAny: <>
					if (!(globalThis as any)[exportName] || override) {
						// biome-ignore lint/suspicious/noExplicitAny: <>
						(globalThis as any)[exportName] = exported;
						if (verbose)
							console.log(
								chalk.blue("→"),
								chalk.white("Registered global helper:"),
								chalk.yellow(exportName),
							);
					} else if (verbose) {
						console.warn(
							chalk.yellow("⚠️"),
							chalk.white(
								`Helper "${exportName}" already exists and was not overridden.`,
							),
						);
					}
				}
			}
		} catch (err) {
			console.error(
				chalk.red(`Error registering helpers from category "${category}":`),
				err,
			);
		}
	}

	if (verbose) console.log(chalk.green("🚀 Helper registration completed."));
}
