export class AsyncEnvSchemaError extends Error {
	public constructor(vendor: string) {
		super(
			`The "${vendor}" schema validated asynchronously, but ConfigModule.forRoot({ validate }) calls the validator synchronously. Use a schema whose validation is synchronous.`,
		);
		this.name = "AsyncEnvSchemaError";
	}
}
