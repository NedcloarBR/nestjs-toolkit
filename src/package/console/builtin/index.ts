import { AboutCommand } from "./about.command.js";
import { CompletionCommand } from "./completion.command.js";
import { HelpCommand } from "./help.command.js";
import { ListCommand } from "./list.command.js";
import { MakeCommandCommand } from "./make-command/make-command.command.js";
import { ReplCommand } from "./repl.command.js";

export const BUILTIN_COMMANDS = [
	AboutCommand,
	CompletionCommand,
	HelpCommand,
	ListCommand,
	MakeCommandCommand,
	ReplCommand,
];
