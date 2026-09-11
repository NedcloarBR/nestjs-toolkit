export class EnvNotInitializedError extends Error {
	public constructor(namespace: string) {
		super(
			`The "${namespace}" config factory ran before its environment was validated. Pass the same factories to both defineEnv({ configs }) and ConfigModule.forRoot({ load }).`,
		);
		this.name = "EnvNotInitializedError";
	}
}
