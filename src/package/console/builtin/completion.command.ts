import { Command } from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";
// biome-ignore lint/style/useImportType: Dependency injection
import {
	CommandRegistry,
	type RegisteredCommand,
} from "../kernel/command-registry.js";
// biome-ignore lint/style/useImportType: Dependency injection
import { ConsoleKernel } from "../kernel/console-kernel.js";
import { GLOBAL_OPTIONS } from "../kernel/globals.js";

const SHELLS = ["bash", "zsh"] as const;
type Shell = (typeof SHELLS)[number];

interface Completion {
	name: string;
	description: string;
	options: [string, string][];
}

function isShell(value: string): value is Shell {
	return (SHELLS as readonly string[]).includes(value);
}

function single(text: string): string {
	return `'${text.replace(/'/g, `'\\''`)}'`;
}

function functionName(executable: string): string {
	return `_${executable.replace(/[^\w]/g, "_")}_complete`;
}

function globalOptions(): [string, string][] {
	return GLOBAL_OPTIONS.flatMap(([flags, description]) =>
		flags.split(", ").map((flag): [string, string] => [flag, description]),
	);
}

function describe(command: RegisteredCommand): Completion {
	const options = command.signature.options.flatMap((option) => [
		...(option.shortcut
			? [[`-${option.shortcut}`, option.description] as [string, string]]
			: []),
		[`--${option.name}`, option.description] as [string, string],
	]);
	return {
		name: command.signature.name,
		description: command.options.description,
		options: [...options, ...globalOptions()],
	};
}

function bash(executable: string, commands: readonly Completion[]): string {
	const fn = functionName(executable);
	const names = commands.map((command) => command.name).join(" ");
	const cases = commands
		.map(
			(command) =>
				`\t\t${single(command.name)}) options=${single(command.options.map(([flag]) => flag).join(" "))} ;;`,
		)
		.join("\n");
	return `# ${executable} completion for bash. Load it with:
#   eval "$(${executable} completion bash)"
${fn}() {
	local line="\${COMP_LINE:0:COMP_POINT}" options=""
	local -a words
	read -ra words <<< "$line"
	[[ "$line" == *" " ]] && words+=("")
	local current="\${words[\${#words[@]}-1]}"
	if (( \${#words[@]} <= 2 )); then
		options=${single(names)}
	else
		case "\${words[1]}" in
${cases}
		esac
	fi
	COMPREPLY=($(compgen -W "$options" -- "$current"))
	# bash splits words at colons: answer only what follows the last one.
	if [[ "$current" == *:* && "$COMP_WORDBREAKS" == *:* ]]; then
		local prefix="\${current%"\${current##*:}"}"
		COMPREPLY=("\${COMPREPLY[@]#"$prefix"}")
	fi
}
complete -o default -F ${fn} ${executable}
`;
}

function zshEntry(name: string, description: string): string {
	return single(`${name.replace(/:/g, "\\:")}:${description}`);
}

function zsh(executable: string, commands: readonly Completion[]): string {
	const fn = functionName(executable);
	const list = commands
		.map((command) => `\t\t${zshEntry(command.name, command.description)}`)
		.join("\n");
	const cases = commands
		.map(
			(command) =>
				`\t\t${single(command.name)}) options=(${command.options.map(([flag, text]) => zshEntry(flag, text)).join(" ")}) ;;`,
		)
		.join("\n");
	return `#compdef ${executable}
# ${executable} completion for zsh. Load it with:
#   eval "$(${executable} completion zsh)"
${fn}() {
	local -a commands options
	commands=(
${list}
	)
	if (( CURRENT == 2 )); then
		_describe 'command' commands
		return
	fi
	case "\${words[2]}" in
${cases}
	esac
	_describe 'option' options
}
compdef ${fn} ${executable}
`;
}

/**
 * Prints a completion script for the shell, with every command and option
 * written into it: pressing Tab never boots the application. Regenerate it when
 * commands change.
 */
@Command({
	signature: "completion {shell=bash : bash or zsh}",
	description: "Print the shell completion script",
})
export class CompletionCommand extends ConsoleCommand {
	public constructor(
		private readonly registry: CommandRegistry,
		private readonly kernel: ConsoleKernel,
	) {
		super();
	}

	public async handle(): Promise<void> {
		const shell = this.argument("shell") ?? "bash";
		if (!isShell(shell)) {
			this.fail(
				`"${shell}" is not supported; use one of: ${SHELLS.join(", ")}.`,
				2,
			);
		}
		const commands = this.registry
			.all()
			.filter((command) => !command.options.hidden)
			.map(describe);
		const script = shell === "bash" ? bash : zsh;
		this.line(script(this.kernel.name, commands).trimEnd());
	}
}
