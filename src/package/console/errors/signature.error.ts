/** A command signature that cannot be read unambiguously. */
export class SignatureError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "SignatureError";
	}
}
