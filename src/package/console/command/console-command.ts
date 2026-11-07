import { CommandFailed } from "../errors/index.js";
import { ExitCode } from "../kernel/exit-code.js";
import { ProgressBar } from "../output/progress.js";
import { spin } from "../output/spinner.js";
import type { ArgumentValue, OptionValue } from "../parsing/input.js";
import type { Choices } from "../prompt/choices.js";
import type {
	ChoiceSource,
	ConfirmOptions,
	MultiselectOptions,
	SearchOptions,
	SecretOptions,
	SelectOptions,
	SuggestionSource,
	SuggestOptions,
	TextOptions,
} from "../prompt/prompt.js";
import { type CommandContext, commandContext } from "./command-context.js";

/**
 * What every console command extends. Implement `handle`; read what was typed
 * with `argument` and `option`, talk with `info`, `table`, `ask`, `select`.
 * Returning nothing is success; a number is the exit code.
 */
export abstract class ConsoleCommand {
	// biome-ignore lint/suspicious/noConfusingVoidType: lets a command's handle() end without a return, as Artisan's does
	public abstract handle(): Promise<number | void>;

	protected argument(name: string): string | undefined {
		const value = this.context().input.arguments[name];
		return Array.isArray(value) ? value.join(" ") : value;
	}

	protected arguments(name: string): string[] {
		const value: ArgumentValue = this.context().input.arguments[name];
		return Array.isArray(value) ? value : value === undefined ? [] : [value];
	}

	/** A switch is true or false; an option that takes a value is its text, or undefined. */
	protected option(name: string): string | boolean | undefined {
		const value: OptionValue = this.context().input.options[name];
		return Array.isArray(value) ? value.at(-1) : value;
	}

	protected options(name: string): string[] {
		const value = this.context().input.options[name];
		return Array.isArray(value)
			? value
			: typeof value === "string"
				? [value]
				: [];
	}

	protected hasOption(name: string): boolean {
		return name in this.context().input.options;
	}

	protected line(text = ""): void {
		this.context().output.line(text);
	}

	protected newLine(count = 1): void {
		this.context().output.newLine(count);
	}

	protected info(text: string): void {
		this.context().output.info(text);
	}

	protected comment(text: string): void {
		this.context().output.comment(text);
	}

	protected note(text: string): void {
		this.context().output.note(text);
	}

	protected intro(text: string): void {
		this.context().output.intro(text);
	}

	protected outro(text: string): void {
		this.context().output.outro(text);
	}

	protected alert(text: string): void {
		this.context().output.alert(text);
	}

	protected warn(text: string): void {
		this.context().output.warn(text);
	}

	protected error(text: string): void {
		this.context().output.error(text);
	}

	protected table(
		headers: readonly string[],
		rows: readonly (readonly unknown[])[],
	): void {
		this.context().output.table(headers, rows);
	}

	protected ask(
		question: string,
		options?: string | TextOptions,
	): Promise<string> {
		return this.context().prompt.ask(question, options);
	}

	protected secret(question: string, options?: SecretOptions): Promise<string> {
		return this.context().prompt.secret(question, options);
	}

	protected confirm(
		question: string,
		options?: boolean | ConfirmOptions,
	): Promise<boolean> {
		return this.context().prompt.confirm(question, options);
	}

	/** Artisan's name for `select`. */
	protected choice(
		question: string,
		choices: Choices,
		fallback?: string,
	): Promise<string> {
		return this.select(question, choices, { default: fallback });
	}

	protected select(
		question: string,
		choices: Choices,
		options?: SelectOptions,
	): Promise<string> {
		return this.context().prompt.select(question, choices, options);
	}

	protected multiselect(
		question: string,
		choices: Choices,
		options?: MultiselectOptions,
	): Promise<string[]> {
		return this.context().prompt.multiselect(question, choices, options);
	}

	protected search(
		question: string,
		source: ChoiceSource,
		options?: SearchOptions,
	): Promise<string> {
		return this.context().prompt.search(question, source, options);
	}

	protected suggest(
		question: string,
		source: SuggestionSource,
		options?: SuggestOptions,
	): Promise<string> {
		return this.context().prompt.suggest(question, source, options);
	}

	/** Runs the work behind a spinner, settling it with ✔ or ✖. */
	protected spin<T>(label: string, work: () => Promise<T> | T): Promise<T> {
		return spin(this.context().output, label, work);
	}

	/** A bar to advance by hand, for work that is not a list of items. */
	protected progress(total: number, label?: string): ProgressBar {
		return new ProgressBar(this.context().output, total, label);
	}

	/** Runs `work` over every item behind a progress bar, Laravel's `withProgressBar`, answering the results in order. */
	protected async withProgressBar<T, R>(
		items: Iterable<T> | number,
		work: (item: T, bar: ProgressBar) => Promise<R> | R,
	): Promise<R[]> {
		const list =
			typeof items === "number"
				? (Array.from({ length: items }, (_, index) => index) as T[])
				: [...items];
		const bar = this.progress(list.length);
		const results: R[] = [];
		try {
			for (const item of list) {
				results.push(await work(item, bar));
				bar.advance();
			}
		} finally {
			bar.finish();
		}
		return results;
	}

	/** Runs another command, Artisan's `$this->call()`: same process, and its exit code back. */
	protected call(name: string, argv: readonly string[] = []): Promise<number> {
		return this.context().runtime.call(name, argv);
	}

	/** Artisan's `callSilently`: like `call`, without the other command's output. */
	protected callSilently(
		name: string,
		argv: readonly string[] = [],
	): Promise<number> {
		return this.context().runtime.callSilently(name, argv);
	}

	protected get signal(): AbortSignal {
		return this.context().runtime.signal;
	}

	protected get interactive(): boolean {
		return this.context().runtime.interactive;
	}

	/** Stops here when the command was asked to; the work done so far stays done. */
	protected checkpoint(): void {
		if (this.signal.aborted) {
			throw new CommandFailed("interrupted", ExitCode.INTERRUPTED);
		}
	}

	/**
	 * Artisan's ConfirmableTrait: before something that cannot be undone, in
	 * production (or when `when` says so) it shows the warning and asks, unless
	 * the command was given --force (declare `{--force}` in the signature for that).
	 */
	protected async confirmToProceed(
		warning?: string,
		when?: boolean | (() => boolean),
	): Promise<boolean> {
		const { input, output, prompt, runtime } = this.context();
		const ask =
			typeof when === "function" ? when() : (when ?? runtime.production);
		if (!ask || input.options.force === true) return true;

		output.alert(warning ?? runtime.confirmation.warning);
		const confirmed = await prompt.confirm(runtime.confirmation.question);
		if (!confirmed) {
			const hint =
				!runtime.interactive && "force" in input.options
					? " Pass --force to run it without asking."
					: "";
			output.warn(`${runtime.confirmation.cancelled}${hint}`);
		}
		return confirmed;
	}

	protected fail(message: string, exitCode: number = ExitCode.FAILURE): never {
		throw new CommandFailed(message, exitCode);
	}

	private context(): CommandContext {
		const context = commandContext.getStore();
		if (!context) {
			throw new Error(
				`${this.constructor.name} runs through the console kernel, not directly`,
			);
		}
		return context;
	}
}
