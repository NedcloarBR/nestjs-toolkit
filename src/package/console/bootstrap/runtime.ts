/** Set by the console entry point before the application module is loaded. */
const CONSOLE_RUNTIME = "NEST_CONSOLE_RUNTIME";

/** Whether this process is a console run rather than the server: what schedulers and listeners leave out. */
export function isConsoleRuntime(): boolean {
	return process.env[CONSOLE_RUNTIME] === "1";
}

export function markConsoleRuntime(): void {
	process.env[CONSOLE_RUNTIME] = "1";
}
