import * as crypto from "node:crypto";

/**
 * Generates a random hexadecimal string of specified length.
 * @param length - The number of random bytes to generate (default: 16)
 * @returns A hexadecimal string representation of the random bytes
 * @example
 * ```typescript
 * randomHex(16) // Returns a 32-character hex string
 * randomHex(32) // Returns a 64-character hex string
 * ```
 */
export function randomHex(length: number = 16): string {
	return crypto.randomBytes(length).toString("hex");
}

/**
 * Converts an input string to its SHA-256 hash representation.
 * @param input - The string to be hashed
 * @returns The SHA-256 hash of the input as a hexadecimal string
 * @example
 * ```typescript
 * toSha256("password") // Returns the SHA-256 hash of "password"
 * ```
 */
export function toSha256(input: string): string {
	return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Masks a string by replacing characters with a mask character, leaving only the last few characters visible.
 * @param str - The string to be masked
 * @param visible - The number of characters to keep visible at the end (default: 4)
 * @param maskChar - The character to use for masking (default: "*")
 * @returns The masked string with only the specified number of trailing characters visible
 * @example
 * ```typescript
 * mask("1234567890") // Returns "******7890"
 * mask("secret", 2) // Returns "****et"
 * mask("password", 3, "#") // Returns "#####ord"
 * ```
 */
export function mask(str: string, visible = 4, maskChar = "*"): string {
	if (str.length <= visible) return str;
	return maskChar.repeat(str.length - visible) + str.slice(-visible);
}
