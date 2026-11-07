import { SignatureError } from "../errors/index.js";

/** A positional argument, in the order the signature declares it. */
export interface ArgumentDefinition {
	name: string;
	description: string;
	required: boolean;
	/** Takes every remaining word; only the last argument can. */
	array: boolean;
	default?: string;
}

export interface OptionDefinition {
	name: string;
	shortcut?: string;
	description: string;
	/** `--flag` is a switch; `--name=` takes a value. */
	acceptsValue: boolean;
	/** `--name=*` can be given more than once. */
	array: boolean;
	default?: string;
}

export interface CommandSignature {
	name: string;
	arguments: ArgumentDefinition[];
	options: OptionDefinition[];
}

const TOKEN = /\{\s*([^}]+?)\s*\}/g;
const COMMAND_NAME = /^[a-z][\w-]*(:[\w-]+)*$/i;
const IDENTIFIER = /^[a-z][\w-]*$/i;

function split(token: string): [string, string] {
	const at = token.indexOf(" : ");
	return at === -1
		? [token.trim(), ""]
		: [token.slice(0, at).trim(), token.slice(at + 3).trim()];
}

function splitOnce(
	text: string,
	separator: string,
): [string, string | undefined] {
	const at = text.indexOf(separator);
	return at === -1
		? [text, undefined]
		: [text.slice(0, at), text.slice(at + 1)];
}

function parseArgument(spec: string, description: string): ArgumentDefinition {
	const [head, fallback] = splitOnce(spec, "=");
	const array = head.endsWith("*");
	const bare = head.replace(/\*$/, "");
	const optional = bare.endsWith("?") || fallback !== undefined;
	const name = bare.replace(/\?$/, "");
	if (!IDENTIFIER.test(name)) {
		throw new SignatureError(`invalid argument name "${name}"`);
	}
	return {
		name,
		description,
		required: !optional,
		array,
		...(fallback !== undefined && { default: fallback }),
	};
}

function parseOption(spec: string, description: string): OptionDefinition {
	const [names, value] = splitOnce(spec.slice(2), "=");
	const [first, second] = names.split("|");
	const [shortcut, name] =
		second === undefined ? [undefined, first] : [first, second];
	if (!IDENTIFIER.test(name)) {
		throw new SignatureError(`invalid option name "${name}"`);
	}
	const array = value === "*";
	return {
		name,
		...(shortcut && { shortcut }),
		description,
		acceptsValue: value !== undefined,
		array,
		...(value !== undefined && value !== "" && !array && { default: value }),
	};
}

function assertArgumentOrder(parsed: CommandSignature): void {
	const { name, arguments: args } = parsed;
	const arrays = args.filter((argument) => argument.array);
	if (arrays.length > 1 || (arrays[0] && args.at(-1) !== arrays[0])) {
		throw new SignatureError(
			`${name}: only the last argument can take the remaining words`,
		);
	}
	const firstOptional = args.findIndex((argument) => !argument.required);
	if (
		firstOptional !== -1 &&
		args.slice(firstOptional).some((argument) => argument.required)
	) {
		throw new SignatureError(
			`${name}: a required argument cannot follow an optional one`,
		);
	}
}

/**
 * Reads a signature the way Artisan writes one:
 *
 *     user:create {email : The address} {roles?* : Profiles} {--F|force : No questions} {--password= : Skip the prompt}
 *
 * `{name}` is required, `{name?}` optional, `{name=x}` defaults to x, `{name*}`
 * takes the rest; `{--flag}` is a switch, `{--name=}` takes a value, `{--name=x}`
 * defaults to x, `{--name=*}` repeats, and `{--S|name}` adds a shortcut.
 */
export function parseSignature(signature: string): CommandSignature {
	const name = signature.trim().split(/\s+/, 1)[0] ?? "";
	if (!COMMAND_NAME.test(name)) {
		throw new SignatureError(`invalid command name "${name}"`);
	}

	const stray = signature.trim().slice(name.length).replace(TOKEN, "").trim();
	if (stray) {
		throw new SignatureError(`${name}: "${stray}" is outside any {…}`);
	}

	const parsed: CommandSignature = { name, arguments: [], options: [] };
	for (const [, token] of signature.matchAll(TOKEN)) {
		const [spec, description] = split(token);
		if (spec.startsWith("--")) {
			parsed.options.push(parseOption(spec, description));
		} else {
			parsed.arguments.push(parseArgument(spec, description));
		}
	}
	assertArgumentOrder(parsed);
	return parsed;
}
