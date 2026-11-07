import { applyDecorators, Injectable, SetMetadata } from "@nestjs/common";

export const COMMAND_METADATA = "console:command";

export interface CommandOptions {
	/** Name, arguments and options, Artisan style: `user:create {email} {--F|force}`. */
	signature: string;
	description: string;
	/**
	 * Only one run at a time, across every process and machine sharing the
	 * console's mutex: a second one stops instead of racing the first.
	 */
	exclusive?: boolean;
	/** Left out of `list` and shell completion; still runs when named. */
	hidden?: boolean;
	/** Other names the command answers to. */
	aliases?: string[];
}

/**
 * Makes a class a console command. Register it as a provider of the module
 * whose services it uses; the console finds it there.
 */
export const Command = (options: CommandOptions): ClassDecorator =>
	applyDecorators(Injectable(), SetMetadata(COMMAND_METADATA, options));
