export class ConfigNamespacesError extends Error {
	public readonly problems: readonly string[];

	public constructor(problems: readonly string[]) {
		super(
			`defineEnv({ namespaces }) does not match the loaded configs:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
		);
		this.name = "ConfigNamespacesError";
		this.problems = problems;
	}
}
