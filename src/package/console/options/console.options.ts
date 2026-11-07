import type { Type } from "@nestjs/common";
import type { CommandMutex, MutexProvider } from "../mutex/mutex.js";

/** What `confirmToProceed` says, Artisan's wording unless the application gives its own. */
export interface ConfirmationTexts {
	warning: string;
	question: string;
	cancelled: string;
}

export const DEFAULT_CONFIRMATION: ConfirmationTexts = {
	warning: "Application In Production",
	question: "Are you sure you want to run this command?",
	cancelled: "Command cancelled.",
};

/** Extra sections for `about`, Laravel's `AboutCommand::add`: section → label → value. */
export type AboutSections = Record<string, Record<string, unknown>>;

export interface ConsoleOptions {
	/** The executable, as usage lines show it. */
	name: string;
	description?: string;
	/** Shown by `list` and `about`; read from the package.json in the working directory when left out. */
	version?: string;
	/** Destructive commands ask before running here, unless given --force. */
	isProduction?: () => boolean;
	/**
	 * Where `make:command` writes, overriding `console.sourceRoot` of
	 * nestjs-toolkit.json; without source code, scaffolding is unavailable (as in a built image).
	 */
	sourceRoot?: string;
	confirmation?: Partial<ConfirmationTexts>;
	about?: () => AboutSections | Promise<AboutSections>;
}

export interface ConsoleModuleOptions extends ConsoleOptions {
	/** Keeps exclusive commands to one run across processes: a class resolved like any provider, or an adapter. */
	mutex?: Type<CommandMutex> | MutexProvider;
}

export const CONSOLE_OPTIONS = Symbol("CONSOLE_OPTIONS");

/** Where commands write; the process's stdout and stderr unless the application provides its own. */
export const CONSOLE_OUTPUT = Symbol("CONSOLE_OUTPUT");
