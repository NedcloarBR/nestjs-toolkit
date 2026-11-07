import { InputError } from "../errors/index.js";
import type { CommandSignature, OptionDefinition } from "./signature.js";

export type ArgumentValue = string | string[] | undefined;
export type OptionValue = string | string[] | boolean | undefined;

export interface CommandInput {
	arguments: Record<string, ArgumentValue>;
	options: Record<string, OptionValue>;
}

function optionFor(signature: CommandSignature, raw: string): OptionDefinition {
	const option = raw.startsWith("--")
		? signature.options.find((candidate) => candidate.name === raw.slice(2))
		: signature.options.find(
				(candidate) => candidate.shortcut === raw.slice(1),
			);
	if (!option) throw new InputError(`the "${raw}" option does not exist`);
	return option;
}

function store(
	options: Record<string, OptionValue>,
	option: OptionDefinition,
	value: string | boolean,
): void {
	if (!option.array) {
		options[option.name] = value;
		return;
	}
	const previous = options[option.name];
	options[option.name] = [
		...(Array.isArray(previous) ? previous : []),
		String(value),
	];
}

function defaults(signature: CommandSignature): CommandInput {
	const input: CommandInput = { arguments: {}, options: {} };
	for (const argument of signature.arguments) {
		input.arguments[argument.name] = argument.array ? [] : argument.default;
	}
	for (const option of signature.options) {
		input.options[option.name] = option.array
			? []
			: option.acceptsValue
				? option.default
				: false;
	}
	return input;
}

/** One option token, and its value when it takes the next word; answers how many words it used. */
function readOption(
	signature: CommandSignature,
	input: CommandInput,
	token: string,
	next: string | undefined,
): number {
	const equals = token.indexOf("=");
	const raw = equals === -1 ? token : token.slice(0, equals);
	const inline = equals === -1 ? undefined : token.slice(equals + 1);
	const option = optionFor(signature, raw);
	if (!option.acceptsValue) {
		if (inline !== undefined) {
			throw new InputError(`the "--${option.name}" option takes no value`);
		}
		store(input.options, option, true);
		return 1;
	}
	const value = inline ?? next;
	if (value === undefined) {
		throw new InputError(`the "--${option.name}" option needs a value`);
	}
	store(input.options, option, value);
	return inline === undefined ? 2 : 1;
}

function assignWords(
	signature: CommandSignature,
	input: CommandInput,
	words: readonly string[],
): void {
	signature.arguments.forEach((argument, position) => {
		if (argument.array) {
			input.arguments[argument.name] = words.slice(position);
			if (argument.required && words.length <= position) {
				throw new InputError(`missing argument "${argument.name}"`);
			}
			return;
		}
		const word = words[position];
		if (word !== undefined) input.arguments[argument.name] = word;
		else if (argument.required) {
			throw new InputError(`missing argument "${argument.name}"`);
		}
	});

	const last = signature.arguments.at(-1);
	if (!last?.array && words.length > signature.arguments.length) {
		throw new InputError(
			`too many arguments: "${words.slice(signature.arguments.length).join(" ")}"`,
		);
	}
}

/** Reads argv against the command's signature: `--name=value`, `--name value`, `-S value`, `--` ends the options. */
export function parseInput(
	signature: CommandSignature,
	argv: readonly string[],
): CommandInput {
	const input = defaults(signature);
	const words: string[] = [];
	let onlyWords = false;

	for (let index = 0; index < argv.length; ) {
		const token = argv[index];
		if (onlyWords || !token.startsWith("-") || token === "-") {
			words.push(token);
			index++;
		} else if (token === "--") {
			onlyWords = true;
			index++;
		} else {
			index += readOption(signature, input, token, argv[index + 1]);
		}
	}

	assignWords(signature, input, words);
	return input;
}
