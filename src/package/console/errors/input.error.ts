/** What the person typed does not fit the command; the message says how. */
export class InputError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "InputError";
	}
}
