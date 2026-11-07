import type { Writable } from "node:stream";
import { COLORS, type Color, visibleLength } from "./ansi.js";

type Paint = (text: string) => string;

interface Terminal {
	isTTY?: boolean;
	columns?: number;
}

export interface OutputSettings {
	/** Coloured output; by default when stdout is a terminal and NO_COLOR is unset. */
	colored?: boolean;
	/** Silences everything but warnings and errors, as `-q` does. */
	quiet?: boolean;
}

/** Writes what a command says: coloured on a terminal, plain when piped or with NO_COLOR. */
export class Output {
	public readonly colored: boolean;
	public readonly quiet: boolean;

	public constructor(
		private readonly out: Writable = process.stdout,
		private readonly err: Writable = process.stderr,
		settings: OutputSettings = {},
	) {
		this.colored =
			settings.colored ?? (this.isTerminal && !process.env.NO_COLOR);
		this.quiet = settings.quiet ?? false;
	}

	/** The same streams, with other settings: what `-q` and `callSilently` run with. */
	public with(settings: OutputSettings): Output {
		return new Output(this.out, this.err, {
			colored: this.colored,
			quiet: this.quiet,
			...settings,
		});
	}

	public get isTerminal(): boolean {
		return Boolean((this.out as Terminal).isTTY);
	}

	/** Whether spinners and progress bars draw: on a terminal, and not silenced. */
	public get animated(): boolean {
		return this.isTerminal && !this.quiet;
	}

	public get columns(): number {
		return (this.out as Terminal).columns || 80;
	}

	/** Raw text, for what redraws itself in place. */
	public write(text: string): void {
		if (!this.quiet) this.out.write(text);
	}

	/** Raw text that shows even when silenced: questions still need to be seen to be answered. */
	public prompt(text: string): void {
		this.out.write(text);
	}

	public line(text = ""): void {
		this.write(`${text}\n`);
	}

	public newLine(count = 1): void {
		this.write("\n".repeat(count));
	}

	public info(text: string): void {
		this.line(this.paint("green")(text));
	}

	public comment(text: string): void {
		this.line(this.paint("dim")(text));
	}

	public title(text: string): void {
		this.line(this.paint("bold")(text));
	}

	public note(text: string): void {
		for (const line of text.split("\n")) this.line(` ${line}`);
	}

	/** A heading that opens a longer run, as Laravel Prompts' `intro`. */
	public intro(text: string): void {
		this.line(this.paint("inverse")(` ${text} `));
		this.newLine();
	}

	/** Closes what `intro` opened. */
	public outro(text: string): void {
		this.newLine();
		this.line(this.paint("green")(this.paint("inverse")(` ${text} `)));
	}

	/** A framed warning that cannot be missed, as Artisan's `alert`. */
	public alert(text: string): void {
		const lines = text.split("\n");
		const width = Math.max(...lines.map((line) => line.length)) + 6;
		const border = "*".repeat(width);
		const paint = this.paint("yellow");
		this.err.write(`${paint(border)}\n`);
		for (const line of lines) {
			this.err.write(`${paint(`*  ${line.padEnd(width - 6)}  *`)}\n`);
		}
		this.err.write(`${paint(border)}\n\n`);
	}

	public warn(text: string): void {
		this.err.write(`${this.paint("yellow")(text)}\n`);
	}

	public error(text: string): void {
		this.err.write(`${this.paint("red")(text)}\n`);
	}

	public table(
		headers: readonly string[],
		rows: readonly (readonly unknown[])[],
	): void {
		const cells = rows.map((row) =>
			row.map((cell) =>
				cell === null || cell === undefined ? "" : String(cell),
			),
		);
		const widths = headers.map((header, column) =>
			Math.max(
				header.length,
				...cells.map((row) => visibleLength(row[column] ?? "")),
			),
		);
		const render = (row: readonly string[]): string =>
			row
				.map(
					(cell, column) =>
						cell + " ".repeat(widths[column] - visibleLength(cell)),
				)
				.join("  ")
				.trimEnd();
		this.line(this.paint("bold")(render(headers)));
		this.line(
			this.paint("dim")(widths.map((width) => "─".repeat(width)).join("  ")),
		);
		for (const row of cells) this.line(render(row));
	}

	/** Two columns, the first padded: how `list` and `help` lay out names and descriptions. */
	public definitions(
		entries: readonly (readonly [string, string])[],
		indent = 2,
	): void {
		const width = Math.max(0, ...entries.map(([term]) => term.length));
		for (const [term, description] of entries) {
			this.line(
				`${" ".repeat(indent)}${this.paint("cyan")(term.padEnd(width))}  ${description}`,
			);
		}
	}

	public paint(color: Color): Paint {
		if (!this.colored) return (text): string => text;
		const [open, close] = COLORS[color];
		return (text): string => `\u001b[${open}m${text}\u001b[${close}m`;
	}
}
