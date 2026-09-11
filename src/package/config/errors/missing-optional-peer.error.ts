export class MissingOptionalPeerError extends Error {
	public constructor(pkg: string, feature: string, cause: unknown) {
		super(
			`${feature} requires the optional peer dependency "${pkg}", which is not installed. Install it to use the config subsystem.`,
			{ cause },
		);
		this.name = "MissingOptionalPeerError";
	}
}
