/** Ends the command with this exit code and message, without a stack trace. */
export class CommandFailed extends Error {
	public constructor(
		message: string,
		public readonly exitCode = 1,
	) {
		super(message);
		this.name = "CommandFailed";
	}
}
