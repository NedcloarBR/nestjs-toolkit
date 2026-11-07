import { emitKeypressEvents } from "node:readline";
import type { Readable } from "node:stream";
import { CommandFailed } from "../errors/index.js";
import { ExitCode } from "../kernel/exit-code.js";
import {
	CLEAR_DOWN,
	cursorUp,
	HIDE_CURSOR,
	SHOW_CURSOR,
	truncate,
} from "../output/ansi.js";
import type { Output } from "../output/output.js";

export interface Key {
	name?: string;
	ctrl?: boolean;
	meta?: boolean;
	shift?: boolean;
}

export type Reaction<S, R> =
	| { kind: "update"; state: S; later?: Promise<S> }
	| { kind: "submit"; value: R };

/** One interactive question: how it looks, and how it answers each key. */
export interface Screen<S, R> {
	title: string;
	initial: S;
	render(state: S, error: string | undefined): string[];
	settle(value: R): string;
	press(state: S, key: Key, text: string): Reaction<S, R>;
	validate?(value: R): string | undefined;
}

type RawInput = Readable & {
	isRaw?: boolean;
	setRawMode?: (mode: boolean) => unknown;
};

export const update = <S, R>(state: S, later?: Promise<S>): Reaction<S, R> => ({
	kind: "update",
	state,
	later,
});

export const submit = <S, R>(value: R): Reaction<S, R> => ({
	kind: "submit",
	value,
});

/** Text typed into a field: answers the new text, or undefined when the key does not edit. */
export function edit(
	value: string,
	key: Key,
	text: string,
): string | undefined {
	if (key.name === "backspace") return value.slice(0, -1);
	if (key.ctrl && key.name === "u") return "";
	if (key.ctrl || key.meta || !text) return undefined;
	if (["return", "enter", "tab", "escape"].includes(key.name ?? "")) {
		return undefined;
	}
	// biome-ignore lint/suspicious/noControlCharactersInRegex: drops control characters from pasted text
	const printable = text.replace(/[\u0000-\u001f\u007f]/g, "");
	return printable ? value + printable : undefined;
}

/**
 * Runs a screen in raw mode, redrawing it in place after every key. Raw mode
 * swallows Ctrl+C, so it is turned into the same interruption a signal causes.
 */
export function interact<S, R>(
	input: Readable,
	output: Output,
	screen: Screen<S, R>,
): Promise<R> {
	const terminal = input as RawInput;
	return new Promise<R>((resolve, reject) => {
		let state = screen.initial;
		let drawn = 0;
		let version = 0;
		const wasRaw = terminal.isRaw ?? false;

		const draw = (lines: readonly string[]): void => {
			const fitted = lines.map((line) => truncate(line, output.columns - 1));
			output.prompt(`${cursorUp(drawn)}${CLEAR_DOWN}${fitted.join("\n")}\n`);
			drawn = fitted.length;
		};

		const close = (): void => {
			terminal.off("keypress", onKey);
			terminal.setRawMode?.(wasRaw);
			terminal.pause();
			output.prompt(SHOW_CURSOR);
		};

		const show = (next: S, error?: string): void => {
			state = next;
			draw(screen.render(state, error));
		};

		const onKey = (text: string | undefined, key: Key = {}): void => {
			if (key.ctrl && (key.name === "c" || key.name === "d")) {
				draw([`${output.paint("red")("✖")} ${screen.title}`]);
				close();
				reject(new CommandFailed("interrupted", ExitCode.INTERRUPTED));
				return;
			}
			const reaction = screen.press(state, key, text ?? "");
			if (reaction.kind === "update") {
				const current = ++version;
				show(reaction.state);
				void reaction.later?.then(
					(loaded) => current === version && show(loaded),
					(error: unknown) => current === version && show(state, String(error)),
				);
				return;
			}
			const problem = screen.validate?.(reaction.value);
			if (problem) {
				show(state, problem);
				return;
			}
			draw([screen.settle(reaction.value)]);
			close();
			resolve(reaction.value);
		};

		emitKeypressEvents(terminal);
		terminal.setRawMode?.(true);
		terminal.resume();
		output.prompt(HIDE_CURSOR);
		show(state);
		terminal.on("keypress", onKey);
	});
}
