export class ConfigCycleError extends Error {
	public constructor(file: string, cause: unknown) {
		super(
			`"${file}" imports the module that loads it, and loadConfigsSync cannot resolve a cycle. A config file should depend only on its own schema — declare what it needs via defineConfig(source, Schema, factory), which hands the factory an already validated environment.`,
			{ cause },
		);
		this.name = "ConfigCycleError";
	}
}
