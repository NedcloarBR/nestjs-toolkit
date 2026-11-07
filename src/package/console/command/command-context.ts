import { AsyncLocalStorage } from "node:async_hooks";
import type { ConfirmationTexts } from "../options/console.options.js";
import type { Output } from "../output/output.js";
import type { CommandInput } from "../parsing/input.js";
import type { Prompt } from "../prompt/prompt.js";

/** What a command can do besides its own work: call another one, and know it was asked to stop. */
export interface CommandRuntime {
	call(name: string, argv?: readonly string[]): Promise<number>;
	/** Like `call`, with the other command's output silenced; its errors still show. */
	callSilently(name: string, argv?: readonly string[]): Promise<number>;
	/** Aborted on Ctrl+C or SIGTERM: a long command checks it between steps and stops cleanly. */
	signal: AbortSignal;
	interactive: boolean;
	/** Where destructive commands ask before running, unless given --force. */
	production: boolean;
	confirmation: ConfirmationTexts;
}

export interface CommandContext {
	input: CommandInput;
	output: Output;
	prompt: Prompt;
	runtime: CommandRuntime;
}

/**
 * The run a command's code belongs to. Commands are singletons, so their state
 * lives here rather than on the instance: a command that calls itself, directly
 * or through others, would otherwise overwrite what its caller was reading.
 */
export const commandContext = new AsyncLocalStorage<CommandContext>();
