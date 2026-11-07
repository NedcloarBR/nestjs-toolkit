import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The `console` section of nestjs-toolkit.json: where `make:command` writes. */
export interface ConsoleMakeConfig {
	/** The source directory, relative to the working directory. */
	sourceRoot: string;
	/** Where the feature modules live, under `sourceRoot`; each is `<dir>/<name>/<name>.module.ts`. */
	modulesDir: string;
	/** Where a module keeps its commands, inside its own directory. */
	commandsDir: string;
	/** What the generated command imports the console from. */
	importFrom: string;
}

export const CONSOLE_MAKE_DEFAULTS: ConsoleMakeConfig = {
	sourceRoot: "src",
	modulesDir: "modules",
	commandsDir: "commands",
	importFrom: "@nedcloarbr/nestjs-toolkit/console",
};

export const TOOLKIT_CONFIG_FILE = "nestjs-toolkit.json";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(file: string): unknown {
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch (cause) {
		throw new Error(`${file} is not valid JSON`, { cause });
	}
}

/** The saved settings over the defaults; a missing file or key keeps the default. */
export function readMakeConfig(cwd = process.cwd()): ConsoleMakeConfig {
	const file = join(cwd, TOOLKIT_CONFIG_FILE);
	if (!existsSync(file)) return { ...CONSOLE_MAKE_DEFAULTS };
	const json = readJson(file);
	const saved = isRecord(json) && isRecord(json.console) ? json.console : {};
	const pick = (key: keyof ConsoleMakeConfig): string => {
		const value = saved[key];
		return typeof value === "string" ? value : CONSOLE_MAKE_DEFAULTS[key];
	};
	return {
		sourceRoot: pick("sourceRoot"),
		modulesDir: pick("modulesDir"),
		commandsDir: pick("commandsDir"),
		importFrom: pick("importFrom"),
	};
}

/** Whether the project compiles to ES modules, whose relative imports need the `.js` extension. */
export function isEsmProject(cwd = process.cwd()): boolean {
	const file = join(cwd, "package.json");
	if (!existsSync(file)) return true;
	const json = readJson(file);
	return isRecord(json) && json.type === "module";
}

/** The version of the application in the working directory, from its package.json. */
export function readAppVersion(cwd = process.cwd()): string | undefined {
	const file = join(cwd, "package.json");
	if (!existsSync(file)) return undefined;
	const json = readJson(file);
	return isRecord(json) && typeof json.version === "string"
		? json.version
		: undefined;
}
