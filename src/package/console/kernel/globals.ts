export interface Globals {
	help: boolean;
	interactive: boolean;
	quiet: boolean;
	verbose: boolean;
	argv: string[];
}

export const GLOBAL_OPTIONS: readonly (readonly [string, string])[] = [
	["-h, --help", "Show the help of the command"],
	["-n, --no-interaction", "Ask nothing: use the defaults, or fail"],
	["-q, --quiet", "Show only warnings and errors"],
	["-v, --verbose", "Show the stack trace of an error"],
];

const FLAGS = {
	help: ["-h", "--help"],
	noInteraction: ["-n", "--no-interaction"],
	quiet: ["-q", "--quiet"],
	verbose: ["-v", "--verbose"],
} as const;

const ALL_FLAGS: readonly string[] = Object.values(FLAGS).flat();

/** The options every command takes, read only before `--`: past it, `-v` is a word for the command. */
export function readGlobals(
	argv: readonly string[],
	isTerminal: boolean,
): Globals {
	const end = argv.indexOf("--");
	const head = end === -1 ? argv : argv.slice(0, end);
	const tail = end === -1 ? [] : argv.slice(end);
	const has = (flags: readonly string[]): boolean =>
		head.some((token) => flags.includes(token));
	return {
		help: has(FLAGS.help),
		interactive: isTerminal && !has(FLAGS.noInteraction),
		quiet: has(FLAGS.quiet),
		verbose: has(FLAGS.verbose),
		argv: [...head.filter((token) => !ALL_FLAGS.includes(token)), ...tail],
	};
}
