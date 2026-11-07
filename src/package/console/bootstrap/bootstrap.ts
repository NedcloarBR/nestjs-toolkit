import type {
	DynamicModule,
	INestApplicationContext,
	LogLevel,
	Type,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConsoleKernel } from "../kernel/console-kernel.js";
import { ExitCode } from "../kernel/exit-code.js";
import { markConsoleRuntime } from "./runtime.js";

export interface ConsoleBootstrap {
	/** Loaded after the process is marked as a console run, so modules can tell. */
	module: () => Promise<Type | DynamicModule> | Type | DynamicModule;
	/** What Nest logs while the console runs; errors and warnings by default. */
	logger?: LogLevel[] | false;
}

export interface ConsoleApplication {
	readonly app: INestApplicationContext;
	readonly kernel: ConsoleKernel;
	/** Runs one command line, answering its exit code. */
	run(argv: readonly string[], isTerminal?: boolean): Promise<number>;
	/** Asks the running command to stop at its next checkpoint. */
	interrupt(): void;
	close(): Promise<void>;
}

/** The application without HTTP, ready to run commands; what `runConsole` wraps, and what a test drives. */
export async function createConsole({
	module,
	logger = ["error", "warn"],
}: ConsoleBootstrap): Promise<ConsoleApplication> {
	markConsoleRuntime();
	const app = await NestFactory.createApplicationContext(await module(), {
		logger,
		abortOnError: false,
	});
	const kernel = app.get(ConsoleKernel);
	return {
		app,
		kernel,
		run: (argv, isTerminal) => kernel.run(argv, isTerminal),
		interrupt: () => kernel.interrupt(),
		close: () => app.close(),
	};
}

function describeError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Runs one command in a process of its own: the application without HTTP,
 * beside the server rather than inside it. Ctrl+C asks the command to stop at
 * its next checkpoint; a second one ends the process.
 */
export async function runConsole({
	argv = process.argv.slice(2),
	...bootstrap
}: ConsoleBootstrap & { argv?: string[] }): Promise<never> {
	let application: ConsoleApplication | undefined;
	let code: number = ExitCode.FAILURE;
	try {
		const running = await createConsole(bootstrap);
		application = running;
		let interrupted = false;
		const stop = (): void => {
			if (interrupted) process.exit(ExitCode.INTERRUPTED);
			interrupted = true;
			process.stderr.write(
				"\nStopping at the next safe point… (again to quit now)\n",
			);
			running.interrupt();
		};
		process.on("SIGINT", stop);
		process.on("SIGTERM", stop);

		code = await running.run(argv);
	} catch (error) {
		process.stderr.write(`${describeError(error)}\n`);
	} finally {
		await application?.close().catch(() => undefined);
	}
	// Watchers and pools some libraries leave open would keep the process alive.
	process.exit(code);
}
