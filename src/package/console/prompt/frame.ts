import type { Output } from "../output/output.js";
import type { Choice } from "./choices.js";

/** The pieces every screen shares, painted the same way. */
export class Frame {
	public constructor(private readonly output: Output) {}

	public title(question: string): string {
		return `${this.output.paint("cyan")("?")} ${this.output.paint("bold")(question)}`;
	}

	public answered(question: string, answer: string): string {
		return `${this.output.paint("green")("✔")} ${question} ${this.output.paint("dim")(answer)}`;
	}

	public hint(text: string): string {
		return `  ${this.output.paint("gray")(text)}`;
	}

	public problem(error: string | undefined): string[] {
		return error ? [`  ${this.output.paint("red")(`✖ ${error}`)}`] : [];
	}

	public field(value: string, placeholder = ""): string {
		const caret = this.output.paint("inverse")(" ");
		return value
			? `  ${value}${caret}`
			: `  ${caret}${this.output.paint("gray")(placeholder)}`;
	}

	/** The visible slice of a long list, with the cursor kept inside it. */
	public list(
		choices: readonly Choice[],
		cursor: number,
		scroll: number,
		mark: (choice: Choice, index: number) => string,
	): string[] {
		if (!choices.length)
			return [`  ${this.output.paint("gray")("No results.")}`];
		const start = Math.min(
			Math.max(0, cursor - Math.floor(scroll / 2)),
			Math.max(0, choices.length - scroll),
		);
		const visible = choices.slice(start, start + scroll);
		const lines = visible.map((choice, offset) => {
			const index = start + offset;
			const active = index === cursor;
			const pointer = active ? this.output.paint("cyan")("›") : " ";
			const label = active
				? this.output.paint("cyan")(choice.label)
				: choice.label;
			const hint = choice.hint
				? ` ${this.output.paint("gray")(choice.hint)}`
				: "";
			return `${pointer} ${mark(choice, index)}${label}${hint}`;
		});
		if (choices.length > scroll) {
			lines.push(
				this.hint(
					`${start + 1}–${start + visible.length} of ${choices.length}`,
				),
			);
		}
		return lines;
	}
}

export function wrap(index: number, length: number): number {
	return length === 0 ? 0 : (index + length) % length;
}
