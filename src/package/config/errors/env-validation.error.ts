export class EnvValidationError extends Error {
	public readonly constraints: readonly string[];

	public constructor(constraints: readonly string[]) {
		super(
			`Environment validation failed:\n${constraints.map((constraint) => `  - ${constraint}`).join("\n")}`,
		);
		this.name = "EnvValidationError";
		this.constraints = constraints;
	}
}
