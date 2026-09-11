export class ConfigFactoryError extends Error {
	public constructor(file: string) {
		super(
			`"${file}" does not default-export a config factory. Wrap the factory with defineConfig() and export it as the default export.`,
		);
		this.name = "ConfigFactoryError";
	}
}
