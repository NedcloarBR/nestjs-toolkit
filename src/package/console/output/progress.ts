import { CLEAR_LINE, HIDE_CURSOR, SHOW_CURSOR, truncate } from "./ansi.js";
import type { Output } from "./output.js";

const REDRAW_EVERY = 50;
const BAR_WIDTH = 28;

/** A bar that fills as work advances; silent when not on a terminal. */
export class ProgressBar {
	private current = 0;
	private drawnAt = 0;
	private finished = false;

	public constructor(
		private readonly output: Output,
		private readonly total: number,
		private label = "",
	) {
		if (this.output.animated) this.output.write(HIDE_CURSOR);
		this.draw(true);
	}

	public advance(step = 1): void {
		this.current = Math.min(this.total, this.current + step);
		this.draw(this.current === this.total);
	}

	/** Changes the text beside the bar, as what is being worked on moves along. */
	public setLabel(label: string): void {
		this.label = label;
		this.draw(false);
	}

	public finish(): void {
		if (this.finished) return;
		this.finished = true;
		this.current = this.total;
		this.draw(true);
		if (this.output.animated) this.output.write(`\n${SHOW_CURSOR}`);
	}

	private draw(force: boolean): void {
		if (!this.output.animated) return;
		const now = Date.now();
		if (!force && now - this.drawnAt < REDRAW_EVERY) return;
		this.drawnAt = now;

		const ratio = this.total === 0 ? 1 : this.current / this.total;
		const filled = Math.round(ratio * BAR_WIDTH);
		const bar =
			this.output.paint("cyan")("█".repeat(filled)) +
			this.output.paint("dim")("░".repeat(BAR_WIDTH - filled));
		const counter = `${this.current}/${this.total} ${Math.round(ratio * 100)}%`;
		const text = [bar, counter, this.label].filter(Boolean).join("  ");
		this.output.write(
			`${CLEAR_LINE}${truncate(text, this.output.columns - 1)}`,
		);
	}
}
