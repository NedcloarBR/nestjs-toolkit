export class ConfigNotExistsError extends Error {
	public constructor() {
		super(
			"Config file does not exist. Please run the init command to create it.\n",
		);
		this.name = "ConfigNotExistsError";
	}
}
