import type { Readable } from "node:stream";
import { PromptUnavailableError } from "../errors/index.js";
import { Output } from "../output/output.js";
import { type Choice, type Choices, normalizeChoices } from "./choices.js";
import { Frame } from "./frame.js";
import {
	confirmScreen,
	filterChoices,
	filterStrings,
	multiselectScreen,
	type Source,
	searchScreen,
	selectScreen,
	suggestScreen,
	textScreen,
	type Validate,
} from "./screens.js";
import { interact, type Screen } from "./terminal.js";

const SCROLL = 7;

export interface TextOptions {
	default?: string;
	placeholder?: string;
	/** True, or the message to show, to refuse an empty answer. Defaults to true when there is no default. */
	required?: boolean | string;
	validate?: Validate<string>;
}

export interface SecretOptions {
	/** Asks twice and compares, for a new password. */
	confirm?: boolean;
	required?: boolean | string;
	validate?: Validate<string>;
}

export interface ConfirmOptions {
	default?: boolean;
	yes?: string;
	no?: string;
}

export interface SelectOptions {
	default?: string;
	/** How many choices show at once. */
	scroll?: number;
}

export interface MultiselectOptions {
	default?: readonly string[];
	scroll?: number;
	required?: boolean | string;
}

export interface SearchOptions {
	placeholder?: string;
	scroll?: number;
	/** The answer when the run is not interactive. */
	default?: string;
}

export interface SuggestOptions extends TextOptions {
	scroll?: number;
}

export type ChoiceSource =
	| Choices
	| ((query: string) => Choices | Promise<Choices>);
export type SuggestionSource =
	| readonly string[]
	| ((query: string) => readonly string[] | Promise<readonly string[]>);

function requirement(
	required: boolean | string | undefined,
	fallback: string | undefined,
): string | undefined {
	const needed = required ?? fallback === undefined;
	if (!needed) return undefined;
	return typeof needed === "string" ? needed : "An answer is required.";
}

function textValidator(
	required: string | undefined,
	validate: Validate<string> | undefined,
): Validate<string> {
	return (value) =>
		(required && !value.trim() ? required : undefined) ?? validate?.(value);
}

/**
 * Asks the person at the terminal, moving through choices with the arrows;
 * without a terminal, or with -n, answers with the defaults or says what to pass.
 */
export class Prompt {
	private readonly frame: Frame;

	public constructor(
		public readonly interactive: boolean,
		private readonly output: Output = new Output(),
		private readonly input: Readable = process.stdin,
	) {
		this.frame = new Frame(output);
	}

	public async ask(
		question: string,
		options: string | TextOptions = {},
	): Promise<string> {
		const settings =
			typeof options === "string" ? { default: options } : options;
		const required = requirement(settings.required, settings.default);
		if (!this.interactive) {
			return this.fallback(
				question,
				settings.default ?? (required ? undefined : ""),
			);
		}
		return this.run(
			textScreen(this.frame, question, {
				placeholder: settings.placeholder,
				fallback: settings.default,
				validate: textValidator(required, settings.validate),
			}),
		);
	}

	/** Not echoed while typed. */
	public async secret(
		question: string,
		options: SecretOptions = {},
	): Promise<string> {
		if (!this.interactive) return this.fallback(question);
		const validate = textValidator(
			requirement(options.required, undefined),
			options.validate,
		);
		const screen = (
			title: string,
			check: Validate<string>,
		): Screen<string, string> =>
			textScreen(this.frame, title, { masked: true, validate: check });

		const value = await this.run(screen(question, validate));
		if (!options.confirm) return value;
		await this.run(
			screen(`${question} (again)`, (again) =>
				again === value ? undefined : "The two do not match.",
			),
		);
		return value;
	}

	public async confirm(
		question: string,
		options: boolean | ConfirmOptions = false,
	): Promise<boolean> {
		const settings =
			typeof options === "boolean" ? { default: options } : options;
		const fallback = settings.default ?? false;
		if (!this.interactive) return fallback;
		return this.run(
			confirmScreen(this.frame, question, fallback, {
				yes: settings.yes ?? "Yes",
				no: settings.no ?? "No",
			}),
		);
	}

	/** One of the choices, moved through with the arrows; answers its value. */
	public async select(
		question: string,
		choices: Choices,
		options: SelectOptions = {},
	): Promise<string> {
		const list = normalizeChoices(choices);
		if (!this.interactive || !list.length) {
			return this.fallback(question, options.default);
		}
		return this.run(
			selectScreen(this.frame, question, list, {
				fallback: options.default,
				scroll: options.scroll ?? SCROLL,
			}),
		);
	}

	public async multiselect(
		question: string,
		choices: Choices,
		options: MultiselectOptions = {},
	): Promise<string[]> {
		const required = requirement(options.required ?? false, undefined);
		if (!this.interactive) {
			if (options.default) return [...options.default];
			if (required) this.fallback(question);
			return [];
		}
		return this.run(
			multiselectScreen(this.frame, question, normalizeChoices(choices), {
				fallback: options.default ?? [],
				scroll: options.scroll ?? SCROLL,
				validate: (values) =>
					required && !values.length ? required : undefined,
			}),
		);
	}

	/** Narrows the choices as the person types; `source` can query anything, a database included. */
	public async search(
		question: string,
		source: ChoiceSource,
		options: SearchOptions = {},
	): Promise<string> {
		if (!this.interactive) return this.fallback(question, options.default);
		const lookup: Source<Choice> =
			typeof source === "function"
				? async (query) => normalizeChoices(await source(query))
				: filterChoices(normalizeChoices(source));
		const choice = await this.run(
			searchScreen(this.frame, question, lookup, {
				placeholder: options.placeholder,
				scroll: options.scroll ?? SCROLL,
				initial: await lookup(""),
			}),
		);
		return choice.value;
	}

	/** Free text, offering what matches as the person types. */
	public async suggest(
		question: string,
		source: SuggestionSource,
		options: SuggestOptions = {},
	): Promise<string> {
		const required = requirement(options.required, options.default);
		if (!this.interactive) {
			return this.fallback(
				question,
				options.default ?? (required ? undefined : ""),
			);
		}
		const lookup: Source<string> =
			typeof source === "function" ? source : filterStrings(source);
		return this.run(
			suggestScreen(this.frame, question, lookup, {
				placeholder: options.placeholder,
				fallback: options.default,
				scroll: options.scroll ?? SCROLL,
				initial: await lookup(""),
				validate: textValidator(required, options.validate),
			}),
		);
	}

	private run<S, R>(screen: Screen<S, R>): Promise<R> {
		return interact(this.input, this.output, screen);
	}

	private fallback(question: string, fallback?: string): string {
		if (fallback !== undefined) return fallback;
		throw new PromptUnavailableError(question);
	}
}
