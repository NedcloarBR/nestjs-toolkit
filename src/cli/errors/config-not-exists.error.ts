import chalk from "chalk";

export class ConfigNotExistsError extends Error {
	public constructor() {
		super(
			chalk.red.bold(
				"Config file does not exist. Please run the init command to create it.\n",
			),
		);
		this.name = "ConfigNotExistsError";
	}
}
