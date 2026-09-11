export class ConfigDirectoryError extends Error {
	public constructor(dir: string, cause: unknown) {
		super(
			`Cannot read the config directory "${dir}". It must point at the built output (e.g. join(import.meta.dirname, "config")), not the TypeScript sources.`,
			{ cause },
		);
		this.name = "ConfigDirectoryError";
	}
}
