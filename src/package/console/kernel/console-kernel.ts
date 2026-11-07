import { Inject, Injectable, Optional } from "@nestjs/common";
import {
	type CommandRuntime,
	commandContext,
} from "../command/command-context.js";
import {
	CommandFailed,
	InputError,
	PromptUnavailableError,
} from "../errors/index.js";
import {
	CONSOLE_MUTEX,
	type CommandMutex,
	LocalMutex,
} from "../mutex/mutex.js";
import {
	CONSOLE_OPTIONS,
	CONSOLE_OUTPUT,
	type ConfirmationTexts,
	type ConsoleOptions,
	DEFAULT_CONFIRMATION,
} from "../options/console.options.js";
import { Output } from "../output/output.js";
import { parseInput } from "../parsing/input.js";
import type { CommandSignature } from "../parsing/signature.js";
import { Prompt } from "../prompt/prompt.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { CommandRegistry, type RegisteredCommand } from "./command-registry.js";
import { ExitCode } from "./exit-code.js";
import { GLOBAL_OPTIONS, type Globals, readGlobals } from "./globals.js";
import { closeNames } from "./suggest.js";

interface ExecuteSettings {
	silent?: boolean;
}

/** Resolves what was typed to a command and runs it, answering the exit code. */
@Injectable()
export class ConsoleKernel {
	private readonly controller = new AbortController();
	private readonly mutex: CommandMutex;
	private readonly baseOutput: Output;
	private output: Output;
	private globals: Globals = {
		help: false,
		interactive: false,
		quiet: false,
		verbose: false,
		argv: [],
	};

	public constructor(
		private readonly registry: CommandRegistry,
		@Inject(CONSOLE_OPTIONS) private readonly options: ConsoleOptions,
		@Optional() @Inject(CONSOLE_MUTEX) mutex?: CommandMutex,
		@Optional() @Inject(CONSOLE_OUTPUT) output?: Output,
	) {
		this.mutex = mutex ?? new LocalMutex();
		this.baseOutput = output ?? new Output();
		this.output = this.baseOutput;
	}

	public get signal(): AbortSignal {
		return this.controller.signal;
	}

	public get name(): string {
		return this.options.name;
	}

	public get consoleOptions(): ConsoleOptions {
		return this.options;
	}

	/** The mutex exclusive commands take, by class: what `about` reports. */
	public get mutexName(): string {
		return this.mutex.constructor.name;
	}

	/** Asks the running command to stop at its next checkpoint. */
	public interrupt(): void {
		this.controller.abort();
	}

	public async run(
		argv: readonly string[],
		isTerminal = Boolean(process.stdin.isTTY),
	): Promise<number> {
		this.globals = readGlobals(argv, isTerminal);
		this.output = this.baseOutput.with({ quiet: this.globals.quiet });
		const [name, ...rest] = this.globals.argv;
		if (!name) return this.execute("list", []);
		if (this.globals.help && this.registry.find(name)) {
			return this.execute("help", [name]);
		}
		return this.execute(name, rest);
	}

	/** Runs a command by name; what `call()` inside another command goes through. */
	public async execute(
		name: string,
		argv: readonly string[],
		{ silent = false }: ExecuteSettings = {},
	): Promise<number> {
		const command = this.registry.find(name);
		if (!command) return this.notFound(name);

		const output = silent ? this.output.with({ quiet: true }) : this.output;
		let release: (() => Promise<void>) | null = null;
		try {
			const input = parseInput(command.signature, argv);
			if (command.options.exclusive) {
				release = await this.mutex.acquire(command.signature.name);
				if (!release) {
					output.error(
						`"${command.signature.name}" is already running in another process; nothing was done.`,
					);
					return ExitCode.LOCKED;
				}
			}
			const context = {
				input,
				output,
				prompt: new Prompt(this.globals.interactive, output),
				runtime: this.runtime(),
			};
			const code = await commandContext.run(context, () =>
				command.instance.handle(),
			);
			return typeof code === "number" ? code : ExitCode.SUCCESS;
		} catch (error) {
			return this.failed(command, error, output);
		} finally {
			await release?.();
		}
	}

	/** The usage of one command, for `help` and for input errors. */
	public describe(command: RegisteredCommand): void {
		const { signature, options } = command;
		this.output.title(options.description);
		this.output.newLine();
		this.output.line("Usage:");
		this.output.line(`  ${this.usage(signature)}`);
		if (options.aliases?.length) {
			this.output.line(`  also: ${options.aliases.join(", ")}`);
		}
		if (signature.arguments.length) {
			this.output.newLine();
			this.output.line("Arguments:");
			this.output.definitions(
				signature.arguments.map((argument) => [
					argument.name,
					withDefault(argument.description, argument.default),
				]),
			);
		}
		this.output.newLine();
		this.output.line("Options:");
		this.output.definitions([
			...signature.options.map((option): [string, string] => [
				`${option.shortcut ? `-${option.shortcut}, ` : ""}--${option.name}${option.acceptsValue ? "=VALUE" : ""}${option.array ? " (repeatable)" : ""}`,
				withDefault(option.description, option.default),
			]),
			...GLOBAL_OPTIONS,
		]);
	}

	private runtime(): CommandRuntime {
		return {
			call: (name, argv = []): Promise<number> => this.execute(name, argv),
			callSilently: (name, argv = []): Promise<number> =>
				this.execute(name, argv, { silent: true }),
			signal: this.controller.signal,
			interactive: this.globals.interactive,
			production: this.options.isProduction?.() ?? false,
			confirmation: this.confirmation(),
		};
	}

	private confirmation(): ConfirmationTexts {
		return { ...DEFAULT_CONFIRMATION, ...this.options.confirmation };
	}

	private usage(signature: CommandSignature): string {
		const args = signature.arguments.map((argument) => {
			const label = `${argument.name}${argument.array ? "..." : ""}`;
			return argument.required ? `<${label}>` : `[${label}]`;
		});
		return [
			this.options.name,
			signature.name,
			signature.options.length ? "[options]" : "",
			...args,
		]
			.filter(Boolean)
			.join(" ");
	}

	private notFound(name: string): number {
		this.output.error(`Command "${name}" does not exist.`);
		const names = this.registry
			.all()
			.filter((command) => !command.options.hidden)
			.map((command) => command.signature.name);
		const close = closeNames(name, names);
		if (close.length) this.output.line(`Did you mean: ${close.join(", ")}?`);
		else this.output.line(`See the commands with: ${this.options.name} list`);
		return ExitCode.USAGE;
	}

	private failed(
		command: RegisteredCommand,
		error: unknown,
		output: Output,
	): number {
		if (error instanceof InputError) {
			output.error(error.message);
			output.line(
				`Usage: ${this.usage(command.signature)}  (${this.options.name} help ${command.signature.name})`,
			);
			return ExitCode.USAGE;
		}
		if (error instanceof PromptUnavailableError) {
			output.error(error.message);
			return ExitCode.USAGE;
		}
		if (error instanceof CommandFailed) {
			output.error(error.message);
			return error.exitCode;
		}
		const { message, stack, code } = toErrorShape(error);
		output.error(`${typeof code === "string" ? `${code} ` : ""}${message}`);
		if (this.globals.verbose && stack) output.comment(stack);
		return ExitCode.FAILURE;
	}
}

function withDefault(
	description: string,
	fallback: string | undefined,
): string {
	return fallback === undefined
		? description
		: `${description} (default: ${fallback})`;
}

function toErrorShape(error: unknown): {
	message: string;
	stack?: string;
	code?: unknown;
} {
	if (error instanceof Error) {
		return {
			message: error.message,
			stack: error.stack,
			code: (error as Error & { code?: unknown }).code,
		};
	}
	return { message: String(error) };
}
