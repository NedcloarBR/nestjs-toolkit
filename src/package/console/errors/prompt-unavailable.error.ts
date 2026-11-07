/** A question asked with --no-interaction, or with nobody at the terminal, that has no default to fall back on. */
export class PromptUnavailableError extends Error {
	public constructor(question: string) {
		super(
			`"${question}" needs an answer, and the run is not interactive (drop --no-interaction, or pass the value as an option)`,
		);
		this.name = "PromptUnavailableError";
	}
}
