/**
 * Slugifies a string by normalizing, lowercasing, trimming, and replacing spaces with hyphens.
 * @param {string} text - The text to be slugified
 * @returns {string} - The slugified text
 *
 * @example
 * ```typescript
 * slugify("Hello World!") // "hello-world"
 * slugify("  This is a Test.  ") // "this-is-a-test"
 * slugify("Café del Mar") // "cafe-del-mar"
 * ```
 */
export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-");
}

/**
 * Capitalizes the first character of a string.
 * @param str - The string to capitalize
 * @returns The string with the first character in uppercase
 * @example
 * ```typescript
 * capitalize("hello") // Returns "Hello"
 * capitalize("world") // Returns "World"
 * ```
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to title case (each word starts with uppercase).
 * @param str - The string to convert to title case
 * @returns The string with each word capitalized
 * @example
 * ```typescript
 * titleCase("hello world") // Returns "Hello World"
 * titleCase("the quick BROWN fox") // Returns "The Quick Brown Fox"
 * ```
 */
export function titleCase(str: string): string {
	return str.replace(
		/\w\S*/g,
		(word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
	);
}

/**
 * Truncates a string to a specified length and adds a suffix if truncated.
 * @param str - The string to truncate
 * @param limit - The maximum length of the string
 * @param suffix - The suffix to append when truncated (default: "...")
 * @returns The original string if within limit, or the truncated string with suffix
 * @example
 * ```typescript
 * truncate("Hello World", 5) // Returns "Hello..."
 * truncate("Short", 10) // Returns "Short"
 * truncate("Long text here", 8, "…") // Returns "Long tex…"
 * ```
 */
export function truncate(str: string, limit: number, suffix = "..."): string {
	return str.length > limit ? str.slice(0, limit) + suffix : str;
}
