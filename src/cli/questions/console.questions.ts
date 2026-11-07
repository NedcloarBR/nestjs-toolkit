import { Question, QuestionSet } from "nest-commander";
import { CONSOLE_MAKE_DEFAULTS } from "../../package/console/options/toolkit-config.js";

@QuestionSet({ name: "console" })
export class ConsoleQuestions {
	@Question({
		name: "sourceRoot",
		message: "Console — source directory make:command writes under",
		default: CONSOLE_MAKE_DEFAULTS.sourceRoot,
	})
	public parseSourceRoot(value: string) {
		return value;
	}

	@Question({
		name: "modulesDir",
		message: "Console — modules directory, inside the source directory",
		default: CONSOLE_MAKE_DEFAULTS.modulesDir,
	})
	public parseModulesDir(value: string) {
		return value;
	}

	@Question({
		name: "commandsDir",
		message: "Console — commands directory, inside each module",
		default: CONSOLE_MAKE_DEFAULTS.commandsDir,
	})
	public parseCommandsDir(value: string) {
		return value;
	}

	@Question({
		name: "importFrom",
		message: "Console — what new commands import the console from",
		default: CONSOLE_MAKE_DEFAULTS.importFrom,
	})
	public parseImportFrom(value: string) {
		return value;
	}
}
