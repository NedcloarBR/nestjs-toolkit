import fs from "node:fs";
import path from "node:path";
import type { ConfigSchemaKind, ModuleKind } from "../types/config.js";

const CONFIG_SUFFIX = /\.config(?:\.(?:ts|mts|cts))?$/;
// No dots: ConfigService would read `my.cdn.key` as a nested path.
const NAMESPACE = /^[A-Za-z][A-Za-z0-9_-]*$/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const SOURCE_FILE = /\.(?:ts|mts|cts)$/;
const DECLARATION_FILE = /\.d\.(?:ts|mts|cts)$/;
const EMITTED_EXTENSION = /\.[cm]?js$/;
const SKIPPED_DIRS = new Set(["node_modules", "dist", "build", ".git"]);
const IMPORT_STATEMENT = /^import\s[\s\S]*?["']([^"']+)["'];?[ \t]*$/gm;
const NAMESPACES_OBJECT = /namespaces\s*:\s*\{([^{}]*)\}/;
const RESERVED = new Set([
	"await",
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"enum",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"let",
	"new",
	"null",
	"return",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
]);

const TOOLKIT_IMPORT =
	'import { defineConfig, type InferConfig } from "@nedcloarbr/nestjs-toolkit";';
const DEFAULT_URL = "http://localhost";
// Biome's default width — the narrowest in common use, so wider configs accept
// anything that fits it.
const MAX_INLINE_WIDTH = 80;

// How a config file names itself to defineConfig: `import.meta` does not
// compile in a file that builds to CommonJS.
const SOURCE_ARGUMENT: Record<ModuleKind, string> = {
	esm: "import.meta",
	cjs: "__filename",
};

interface Names {
	namespace: string;
	pascal: string;
	camel: string;
	constant: string;
}

export interface ScaffoldOptions {
	name: string;
	dir: string;
	schema: ConfigSchemaKind;
	module: ModuleKind;
	force: boolean;
	register: boolean;
}

export interface ModuleDetection {
	kind: ModuleKind;
	/** The package.json that decided it, when one was found. */
	packageJson?: string;
}

export type Registration =
	| { status: "registered"; file: string }
	| { status: "already"; file: string }
	| { status: "skipped" }
	| { status: "folder"; file: string }
	| { status: "no-env"; root: string }
	| {
			status: "manual";
			file?: string;
			reason: string;
			importLine: string;
			entry: string;
	  };

export interface ScaffoldResult {
	file: string;
	namespace: string;
	registration: Registration;
}

function footer(
	names: Names,
	source: string,
	schemaArgument: string,
	value: string,
): string[] {
	const factory = schemaArgument
		? `defineConfig(${source}, ${schemaArgument}, (env) => ({`
		: `defineConfig(${source}, () => ({`;

	return [
		`const ${names.camel}Config = ${factory}`,
		`\turl: ${value},`,
		"}));",
		"",
		`export default ${names.camel}Config;`,
		`export type ${names.pascal} = InferConfig<typeof ${names.camel}Config>;`,
		"",
	];
}

const TEMPLATES: Record<
	ConfigSchemaKind,
	(names: Names, source: string) => string[]
> = {
	"class-validator": (names, source) => [
		TOOLKIT_IMPORT,
		'import { IsString } from "class-validator";',
		"",
		`class ${names.pascal}Env {`,
		"\t@IsString()",
		`\treadonly ${names.constant}_URL: string = "${DEFAULT_URL}";`,
		"}",
		"",
		...footer(names, source, `${names.pascal}Env`, `env.${names.constant}_URL`),
	],
	zod: (names, source) => [
		TOOLKIT_IMPORT,
		'import { z } from "zod";',
		"",
		`const ${names.pascal}Env = z.object({`,
		`\t${names.constant}_URL: z.string().default("${DEFAULT_URL}"),`,
		"});",
		"",
		...footer(names, source, `${names.pascal}Env`, `env.${names.constant}_URL`),
	],
	valibot: (names, source) => [
		TOOLKIT_IMPORT,
		'import * as v from "valibot";',
		"",
		`const ${names.pascal}Env = v.object({`,
		`\t${names.constant}_URL: v.optional(v.string(), "${DEFAULT_URL}"),`,
		"});",
		"",
		...footer(names, source, `${names.pascal}Env`, `env.${names.constant}_URL`),
	],
	arktype: (names, source) => [
		TOOLKIT_IMPORT,
		'import { type } from "arktype";',
		"",
		`const ${names.pascal}Env = type({`,
		`\t${names.constant}_URL: "string = '${DEFAULT_URL}'",`,
		"});",
		"",
		...footer(names, source, `${names.pascal}Env`, `env.${names.constant}_URL`),
	],
	none: (names, source) => [
		TOOLKIT_IMPORT,
		"",
		...footer(names, source, "", `"${DEFAULT_URL}"`),
	],
};

// biome-ignore lint/complexity/noStaticOnlyClass: Utils class
export class ConfigScaffoldUtils {
	/** Reads the nearest package.json the way Node does: no `"type": "module"` means CommonJS. */
	public static detectModule(dir: string): ModuleDetection {
		const packageJson = path.join(dir, "package.json");

		if (fs.existsSync(packageJson)) {
			const { type } = JSON.parse(fs.readFileSync(packageJson, "utf-8")) as {
				type?: unknown;
			};
			return { kind: type === "module" ? "esm" : "cjs", packageJson };
		}

		const parent = path.dirname(dir);
		return parent === dir
			? { kind: "cjs" }
			: ConfigScaffoldUtils.detectModule(parent);
	}

	public static create(options: ScaffoldOptions): ScaffoldResult {
		const names = ConfigScaffoldUtils.names(options.name);
		const file = path.join(options.dir, `${names.namespace}.config.ts`);

		if (fs.existsSync(file) && !options.force) {
			throw new Error(`${file} already exists. Pass --force to overwrite it.`);
		}

		const content = TEMPLATES[options.schema](
			names,
			SOURCE_ARGUMENT[options.module],
		);
		fs.mkdirSync(options.dir, { recursive: true });
		fs.writeFileSync(file, content.join("\n"), "utf-8");

		const registration: Registration = options.register
			? ConfigScaffoldUtils.register(names, file, options.dir, options.module)
			: { status: "skipped" };

		return { file, namespace: names.namespace, registration };
	}

	private static names(input: string): Names {
		const namespace = (input ?? "").trim().replace(CONFIG_SUFFIX, "");
		if (!NAMESPACE.test(namespace)) {
			throw new Error(
				`"${input}" is not a valid config name. Use letters, digits, "-" or "_", starting with a letter.`,
			);
		}

		const words = namespace
			.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
			.split(/[\s_-]+/)
			.filter(Boolean);
		const pascal = words
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join("");

		return {
			namespace,
			pascal,
			camel: pascal.charAt(0).toLowerCase() + pascal.slice(1),
			constant: words.map((word) => word.toUpperCase()).join("_"),
		};
	}

	private static register(
		names: Names,
		configFile: string,
		dir: string,
		module: ModuleKind,
	): Registration {
		const root = path.dirname(dir);
		const envFiles = ConfigScaffoldUtils.sourceFiles(root).filter((file) =>
			/defineEnv\s*[<(]/.test(fs.readFileSync(file, "utf-8")),
		);
		const candidates = envFiles.filter((file) =>
			/namespaces\s*:/.test(fs.readFileSync(file, "utf-8")),
		);

		if (envFiles.length === 0) {
			return { status: "no-env", root };
		}
		if (candidates.length === 0) {
			return { status: "folder", file: envFiles[0] };
		}

		const file = candidates[0];
		const source = fs.readFileSync(file, "utf-8");
		const fromDir = path.dirname(file);
		const imports = [...source.matchAll(IMPORT_STATEMENT)];

		const alreadyImported = [true, false]
			.map((withExtension) =>
				ConfigScaffoldUtils.importSpecifier(fromDir, configFile, withExtension),
			)
			.some((specifier) => imports.some((match) => match[1] === specifier));
		if (alreadyImported) {
			return { status: "already", file };
		}

		const specifier = ConfigScaffoldUtils.importSpecifier(
			fromDir,
			configFile,
			ConfigScaffoldUtils.usesExtensions(imports, module),
		);
		const binding = ConfigScaffoldUtils.bindingFor(names, source);
		const key = IDENTIFIER.test(names.namespace)
			? names.namespace
			: JSON.stringify(names.namespace);
		const entry = key === binding ? binding : `${key}: ${binding}`;
		const importLine = `import ${binding} from "${specifier}";`;
		const manual = (reason: string, at?: string): Registration => ({
			status: "manual",
			file: at,
			reason,
			importLine,
			entry,
		});

		if (candidates.length > 1) {
			return manual("defineEnv({ namespaces }) appears in several files");
		}

		const object = NAMESPACES_OBJECT.exec(source);
		const lastImport = imports.at(-1);

		if (!object) {
			return manual("its namespaces is not an inline object", file);
		}
		if (!lastImport || object.index < lastImport.index + lastImport[0].length) {
			return manual("its imports could not be located", file);
		}

		// The object sits after every import, so editing it first leaves the
		// import offsets below valid.
		const bodyStart = object.index + object[0].indexOf("{") + 1;
		const body = object[1];
		const withEntry =
			source.slice(0, bodyStart) +
			ConfigScaffoldUtils.fitEntry(source, bodyStart, body, entry) +
			source.slice(bodyStart + body.length);

		const configImports = imports.filter((match) =>
			CONFIG_SUFFIX.test(match[1].replace(EMITTED_EXTENSION, "")),
		);
		const before = configImports.find((match) => match[1] > specifier);
		const anchor = configImports.at(-1) ?? lastImport;
		const insertAt = before ? before.index : anchor.index + anchor[0].length;
		const line = before ? `${importLine}\n` : `\n${importLine}`;

		fs.writeFileSync(
			file,
			withEntry.slice(0, insertAt) + line + withEntry.slice(insertAt),
			"utf-8",
		);

		return { status: "registered", file };
	}

	// Follows the file being edited: CommonJS projects usually import without an
	// extension, ESM ones must spell `.js`. With nothing to follow, the module
	// format decides.
	private static usesExtensions(
		imports: RegExpMatchArray[],
		module: ModuleKind,
	): boolean {
		const relatives = imports
			.map((match) => match[1])
			.filter((specifier) => specifier.startsWith("."));

		return relatives.length > 0
			? relatives.some((specifier) => EMITTED_EXTENSION.test(specifier))
			: module === "esm";
	}

	// Formatters keep an object expanded once it starts on a new line, so the
	// expanded form is stable under any width; one line is kept only while it
	// fits, or when `namespaces` shares its line and the formatter has to lay it
	// out anyway.
	private static fitEntry(
		source: string,
		bodyStart: number,
		body: string,
		entry: string,
	): string {
		const appended = ConfigScaffoldUtils.appendEntry(body, entry);
		if (appended.includes("\n")) {
			return appended;
		}

		const lineStart = source.lastIndexOf("\n", bodyStart) + 1;
		const prefix = source.slice(lineStart, bodyStart);
		const bodyEnd = bodyStart + body.length;
		const lineEnd = source.indexOf("\n", bodyEnd);
		const line =
			prefix +
			appended +
			source.slice(bodyEnd, lineEnd === -1 ? undefined : lineEnd);

		if (
			!/^\s*namespaces\s*:/.test(prefix) ||
			line.replace(/\t/g, "  ").length <= MAX_INLINE_WIDTH
		) {
			return appended;
		}

		const indent = prefix.match(/^[ \t]*/)?.[0] ?? "";
		const unit = /^ +$/.test(indent) ? "  " : "\t";
		const entries = appended
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean);

		return `\n${entries.map((part) => `${indent}${unit}${part},`).join("\n")}\n${indent}`;
	}

	private static appendEntry(body: string, entry: string): string {
		if (body.trim() === "") {
			return ` ${entry} `;
		}

		if (!body.includes("\n")) {
			return ` ${body.trim().replace(/,$/, "")}, ${entry} `;
		}

		const content = body.replace(/\s*$/, "");
		const closing = body.slice(content.length);
		const indent =
			body
				.split("\n")
				.find((line) => line.trim())
				?.match(/^\s*/)?.[0] ?? "\t";
		const comma = content.endsWith(",") ? "" : ",";

		return `${content}${comma}\n${indent}${entry},${closing}`;
	}

	private static bindingFor(names: Names, source: string): string {
		const free = (id: string) => !new RegExp(`\\b${id}\\b`).test(source);

		if (
			IDENTIFIER.test(names.namespace) &&
			!RESERVED.has(names.namespace) &&
			free(names.namespace)
		) {
			return names.namespace;
		}

		const base = `${names.camel}Config`;
		let id = base;
		for (let suffix = 2; !free(id); suffix++) {
			id = `${base}${suffix}`;
		}
		return id;
	}

	private static sourceFiles(dir: string): string[] {
		if (!fs.existsSync(dir)) {
			return [];
		}

		return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return SKIPPED_DIRS.has(entry.name)
					? []
					: ConfigScaffoldUtils.sourceFiles(full);
			}
			return SOURCE_FILE.test(entry.name) && !DECLARATION_FILE.test(entry.name)
				? [full]
				: [];
		});
	}

	// Relative and POSIX; with the extension the file will have once emitted, or
	// without any.
	private static importSpecifier(
		fromDir: string,
		file: string,
		withExtension: boolean,
	): string {
		const relative = path
			.relative(fromDir, file)
			.split(path.sep)
			.join("/")
			.replace(/\.(m|c)?ts$/, (_match, kind: string | undefined) =>
				withExtension ? `.${kind ?? ""}js` : "",
			);
		return relative.startsWith(".") ? relative : `./${relative}`;
	}
}
