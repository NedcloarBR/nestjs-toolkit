const IMPORT_STATEMENT = /^import\s[\s\S]*?["'][^"']+["'];?[ \t]*$/gm;
const MODULE_DECORATOR = /@Module\(\s*\{/g;
const PROVIDERS = /providers\s*:\s*\[/g;

export type Registration =
	| { status: "registered" }
	| { status: "already" }
	| { status: "manual"; reason: string };

function insertImport(source: string, line: string): string {
	const imports = [...source.matchAll(IMPORT_STATEMENT)];
	const last = imports.at(-1);
	if (!last) return `${line}\n${source}`;
	const end = last.index + last[0].length;
	return `${source.slice(0, end)}\n${line}${source.slice(end)}`;
}

function insertProvider(source: string, at: number, className: string): string {
	const rest = source.slice(at);
	if (/^\s*\]/.test(rest)) {
		return `${source.slice(0, at)}${className}${source.slice(at).replace(/^\s*/, "")}`;
	}
	const multiline = /^([ \t]*\r?\n)([ \t]*)/.exec(rest);
	if (multiline) {
		const [, newline, indent] = multiline;
		return `${source.slice(0, at)}${newline}${indent}${className},${rest}`;
	}
	return `${source.slice(0, at)}${className}, ${rest}`;
}

/**
 * Adds the class to the providers of the one @Module in the file. Anything less
 * plain than that — no @Module, several, or providers built elsewhere — is left
 * for the person to do, rather than edited by guesswork.
 */
export function registerProvider(
	source: string,
	className: string,
	importLine: string,
): { source: string; registration: Registration } {
	if (new RegExp(`\\b${className}\\b`).test(source)) {
		return { source, registration: { status: "already" } };
	}
	const modules = [...source.matchAll(MODULE_DECORATOR)];
	if (modules.length !== 1) {
		const reason = modules.length
			? "there is more than one @Module"
			: "there is no @Module";
		return { source, registration: { status: "manual", reason } };
	}
	const providers = [...source.slice(modules[0].index).matchAll(PROVIDERS)];
	if (providers.length !== 1) {
		const reason = providers.length
			? "providers appears more than once"
			: "the @Module has no providers: [ … ] list";
		return { source, registration: { status: "manual", reason } };
	}
	const at = modules[0].index + providers[0].index + providers[0][0].length;
	const withProvider = insertProvider(source, at, className);
	return {
		source: insertImport(withProvider, importLine),
		registration: { status: "registered" },
	};
}
