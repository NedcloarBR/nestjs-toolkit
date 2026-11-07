/** How a run ended, as the shell sees it. */
export enum ExitCode {
	SUCCESS = 0,
	FAILURE = 1,
	USAGE = 2,
	LOCKED = 3,
	INTERRUPTED = 130,
}
