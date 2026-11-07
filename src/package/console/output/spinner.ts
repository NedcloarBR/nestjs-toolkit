import { CLEAR_LINE, HIDE_CURSOR, SHOW_CURSOR } from "./ansi.js";
import type { Output } from "./output.js";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL = 80;

/** Runs the work behind a spinner on a terminal; elsewhere it just runs it. */
export async function spin<T>(
	output: Output,
	label: string,
	work: () => Promise<T> | T,
): Promise<T> {
	if (!output.animated) return work();

	let frame = 0;
	const draw = (): void => {
		output.write(
			`${CLEAR_LINE}${output.paint("cyan")(FRAMES[frame])} ${label}`,
		);
		frame = (frame + 1) % FRAMES.length;
	};
	const settle = (mark: string): void => {
		output.write(`${CLEAR_LINE}${mark} ${label}\n${SHOW_CURSOR}`);
	};

	output.write(HIDE_CURSOR);
	draw();
	const timer = setInterval(draw, INTERVAL);
	try {
		const result = await work();
		settle(output.paint("green")("✔"));
		return result;
	} catch (error) {
		settle(output.paint("red")("✖"));
		throw error;
	} finally {
		clearInterval(timer);
	}
}
