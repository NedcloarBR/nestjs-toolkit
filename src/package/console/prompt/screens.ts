import type { Choice } from "./choices.js";
import { matches } from "./choices.js";
import { type Frame, wrap } from "./frame.js";
import { edit, type Key, type Screen, submit, update } from "./terminal.js";

export type Validate<T> = (value: T) => string | undefined;

function isEnter(key: Key): boolean {
	return key.name === "return" || key.name === "enter";
}

function move(key: Key, cursor: number, length: number): number | undefined {
	if (key.name === "up" || (key.shift && key.name === "tab")) {
		return wrap(cursor - 1, length);
	}
	if (key.name === "down" || key.name === "tab")
		return wrap(cursor + 1, length);
	if (key.name === "home") return 0;
	if (key.name === "end") return Math.max(0, length - 1);
	return undefined;
}

export interface TextScreenOptions {
	placeholder?: string;
	fallback?: string;
	masked?: boolean;
	validate?: Validate<string>;
}

export function textScreen(
	frame: Frame,
	question: string,
	{ placeholder, fallback, masked = false, validate }: TextScreenOptions,
): Screen<string, string> {
	const show = (value: string): string =>
		masked ? "•".repeat(value.length) : value;
	return {
		title: question,
		initial: "",
		render: (value, error) => [
			frame.title(question),
			frame.field(show(value), placeholder ?? fallback ?? ""),
			...frame.problem(error),
		],
		settle: (value) => frame.answered(question, show(value)),
		press: (value, key, text) => {
			if (isEnter(key)) return submit(value || fallback || "");
			const edited = edit(value, key, text);
			return update(edited ?? value);
		},
		validate,
	};
}

export function confirmScreen(
	frame: Frame,
	question: string,
	fallback: boolean,
	labels: { yes: string; no: string },
): Screen<boolean, boolean> {
	const option = (label: string, active: boolean): string =>
		active ? `● ${label}` : `○ ${label}`;
	return {
		title: question,
		initial: fallback,
		render: (value) => [
			frame.title(question),
			`  ${option(labels.yes, value)} / ${option(labels.no, !value)}`,
		],
		settle: (value) => frame.answered(question, value ? labels.yes : labels.no),
		press: (value, key, text) => {
			if (isEnter(key)) return submit(value);
			const letter = text.toLowerCase();
			if (letter === "y") return submit(true);
			if (letter === "n") return submit(false);
			if (
				["left", "right", "tab", "space", "h", "l"].includes(key.name ?? "")
			) {
				return update(!value);
			}
			return update(value);
		},
	};
}

interface SelectState {
	cursor: number;
}

export function selectScreen(
	frame: Frame,
	question: string,
	choices: readonly Choice[],
	{ fallback, scroll }: { fallback?: string; scroll: number },
): Screen<SelectState, string> {
	const start = Math.max(
		0,
		choices.findIndex((choice) => choice.value === fallback),
	);
	const label = (value: string): string =>
		choices.find((choice) => choice.value === value)?.label ?? value;
	return {
		title: question,
		initial: { cursor: start },
		render: ({ cursor }) => [
			frame.title(question),
			...frame.list(choices, cursor, scroll, () => ""),
			frame.hint("↑↓ to move · enter to choose"),
		],
		settle: (value) => frame.answered(question, label(value)),
		press: (state, key) => {
			if (isEnter(key)) return submit(choices[state.cursor].value);
			const cursor = move(key, state.cursor, choices.length);
			return update(cursor === undefined ? state : { cursor });
		},
	};
}

interface MultiState {
	cursor: number;
	selected: ReadonlySet<string>;
}

export function multiselectScreen(
	frame: Frame,
	question: string,
	choices: readonly Choice[],
	options: {
		fallback: readonly string[];
		scroll: number;
		validate: Validate<string[]>;
	},
): Screen<MultiState, string[]> {
	const label = (values: string[]): string =>
		choices
			.filter((choice) => values.includes(choice.value))
			.map((choice) => choice.label)
			.join(", ") || "none";
	const toggle = (
		selected: ReadonlySet<string>,
		value: string,
	): Set<string> => {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		return next;
	};
	return {
		title: question,
		initial: { cursor: 0, selected: new Set(options.fallback) },
		render: ({ cursor, selected }, error) => [
			frame.title(question),
			...frame.list(choices, cursor, options.scroll, (choice) =>
				selected.has(choice.value) ? "◼ " : "◻ ",
			),
			...frame.problem(error),
			frame.hint("↑↓ to move · space to pick · a for all · enter to confirm"),
		],
		settle: (values) => frame.answered(question, label(values)),
		press: (state, key, text) => {
			if (isEnter(key)) {
				return submit(
					choices
						.map((choice) => choice.value)
						.filter((value) => state.selected.has(value)),
				);
			}
			if (key.name === "space" && choices.length) {
				return update({
					...state,
					selected: toggle(state.selected, choices[state.cursor].value),
				});
			}
			if (text === "a") {
				const all = state.selected.size === choices.length;
				return update({
					...state,
					selected: new Set(all ? [] : choices.map((choice) => choice.value)),
				});
			}
			const cursor = move(key, state.cursor, choices.length);
			return update(cursor === undefined ? state : { ...state, cursor });
		},
		validate: options.validate,
	};
}

export type Source<T> = (query: string) => readonly T[] | Promise<readonly T[]>;

interface SearchState {
	query: string;
	cursor: number;
	results: readonly Choice[];
}

/** Narrows a list as the person types, and answers the value of the one picked. */
export function searchScreen(
	frame: Frame,
	question: string,
	source: Source<Choice>,
	{
		placeholder,
		scroll,
		initial,
	}: { placeholder?: string; scroll: number; initial: readonly Choice[] },
): Screen<SearchState, Choice> {
	const reload = (state: SearchState): Promise<SearchState> =>
		Promise.resolve(source(state.query)).then((results) => ({
			...state,
			results,
			cursor: 0,
		}));
	return {
		title: question,
		initial: { query: "", cursor: 0, results: initial },
		render: ({ query, cursor, results }, error) => [
			frame.title(question),
			frame.field(query, placeholder ?? "Type to search"),
			...frame.list(results, cursor, scroll, () => ""),
			...frame.problem(error),
		],
		settle: (choice) => frame.answered(question, choice.label),
		press: (state, key, text) => {
			if (isEnter(key)) {
				const picked = state.results[state.cursor];
				return picked ? submit(picked) : update(state);
			}
			const query = edit(state.query, key, text);
			if (query !== undefined) {
				const next = { ...state, query };
				return update(next, reload(next));
			}
			const cursor = move(key, state.cursor, state.results.length);
			return update(cursor === undefined ? state : { ...state, cursor });
		},
	};
}

interface SuggestState {
	query: string;
	cursor: number;
	suggestions: readonly string[];
}

/** Free text, with suggestions to take with tab or the arrows. */
export function suggestScreen(
	frame: Frame,
	question: string,
	source: Source<string>,
	options: {
		placeholder?: string;
		fallback?: string;
		scroll: number;
		initial: readonly string[];
		validate?: Validate<string>;
	},
): Screen<SuggestState, string> {
	const reload = (state: SuggestState): Promise<SuggestState> =>
		Promise.resolve(source(state.query)).then((suggestions) => ({
			...state,
			suggestions,
			cursor: -1,
		}));
	const asChoices = (values: readonly string[]): Choice[] =>
		values.map((value) => ({ value, label: value }));
	return {
		title: question,
		initial: { query: "", cursor: -1, suggestions: options.initial },
		render: ({ query, cursor, suggestions }, error) => [
			frame.title(question),
			frame.field(query, options.placeholder ?? options.fallback ?? ""),
			...(suggestions.length
				? frame.list(asChoices(suggestions), cursor, options.scroll, () => "")
				: []),
			...frame.problem(error),
		],
		settle: (value) => frame.answered(question, value),
		press: (state, key, text) => {
			const highlighted = state.suggestions[state.cursor];
			if (isEnter(key)) {
				return submit(highlighted ?? (state.query || options.fallback || ""));
			}
			if (key.name === "tab" && highlighted !== undefined) {
				const next = { ...state, query: highlighted };
				return update(next, reload(next));
			}
			const query = edit(state.query, key, text);
			if (query !== undefined) {
				const next = { ...state, query };
				return update(next, reload(next));
			}
			if (key.name === "up" || key.name === "down") {
				const length = state.suggestions.length;
				const step = key.name === "up" ? -1 : 1;
				const cursor = length ? wrap(state.cursor + step, length) : -1;
				return update({ ...state, cursor });
			}
			return update(state);
		},
		validate: options.validate,
	};
}

export function filterChoices(choices: readonly Choice[]): Source<Choice> {
	return (query) => choices.filter((choice) => matches(choice, query));
}

export function filterStrings(values: readonly string[]): Source<string> {
	const needle = (query: string): string => query.trim().toLowerCase();
	return (query) =>
		values.filter((value) => value.toLowerCase().includes(needle(query)));
}
