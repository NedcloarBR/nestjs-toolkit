export class ConfigSourceError extends Error {
	public constructor(source: string, cause?: unknown) {
		super(
			`Cannot derive a config namespace from "${source}". defineConfig() expects a file named <namespace>.config.<ext> — pass import.meta (ESM) or __filename (CommonJS) from that file.`,
			{ cause },
		);
		this.name = "ConfigSourceError";
	}
}
