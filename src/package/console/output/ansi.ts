const ESC = "\u001b[";

export const COLORS = {
	bold: [1, 22],
	dim: [2, 22],
	inverse: [7, 27],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	cyan: [36, 39],
	gray: [90, 39],
} as const;

export type Color = keyof typeof COLORS;

export const HIDE_CURSOR = `${ESC}?25l`;
export const SHOW_CURSOR = `${ESC}?25h`;
export const CLEAR_LINE = `\r${ESC}2K`;
export const CLEAR_DOWN = `\r${ESC}J`;

export function cursorUp(lines: number): string {
	return lines > 0 ? `${ESC}${lines}A` : "";
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: matches ANSI escape sequences
const SEQUENCE = /\u001b\[[0-9;?]*[A-Za-z]/g;

export function visibleLength(text: string): number {
	return text.replace(SEQUENCE, "").length;
}

/** Cuts text to a visible width, keeping escape sequences whole so colours never bleed. */
export function truncate(text: string, width: number): string {
	if (visibleLength(text) <= width) return text;
	let visible = 0;
	let result = "";
	for (let index = 0; index < text.length && visible < width - 1; ) {
		SEQUENCE.lastIndex = index;
		const match = SEQUENCE.exec(text);
		if (match && match.index === index) {
			result += match[0];
			index += match[0].length;
			continue;
		}
		result += text[index];
		visible++;
		index++;
	}
	return `${result}…${ESC}0m`;
}
