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
 * Converts a string to camelCase (lowercase first character, removes separators).
 * @param str - The input string to convert.
 * @returns The camelCased string.
 * @example
 * ```typescript
 * camelCase("hello world") // "helloWorld"
 * camelCase("Foo-bar_baz") // "fooBarBaz"
 * camelCase("  multiple   separators--here") // "multipleSeparatorsHere"
 * ```
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^./, (c) => c.toLowerCase());
}

/**
 * Converts a string to PascalCase (uppercase first character, uses `camelCase`).
 * @param str - The input string to convert
 * @returns The PascalCased string
 * @example
 * ```typescript
 * pascalCase("hello world") // "HelloWorld"
 * pascalCase("foo-bar") // "FooBar"
 * ```
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
/**
 * Converts a string to snake_case (underscores between words, lowercase).
 * @param str - The input string to convert
 * @returns The snake_cased string
 * @example
 * ```typescript
 * snakeCase("Hello World") // "hello_world"
 * snakeCase("fooBarBaz") // "foo_bar_baz"
 * ```
 */
export function snakeCase(str: string): string {
  return str
    .trim()
    .replace(/[-_\s]+/g, "_")
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Converts a string to kebab-case (hyphens between words, lowercase).
 * @param str - The input string to convert
 * @returns The kebab-cased string
 * @example
 * ```typescript
 * kebabCase("Hello World") // "hello-world"
 * kebabCase("fooBarBaz") // "foo-bar-baz"
 * ```
 */
export function kebabCase(str: string): string {
  return str
    .trim()
    .replace(/_+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

/**
 * Removes non-ASCII characters from a string.
 * @param str - The string to process
 * @returns The string containing only ASCII characters
 * @example
 * ```typescript
 * removeNonAscii("Café") // "Caf"
 * removeNonAscii("naïve — test") // "naive  test"
 * ```
 */
export function removeNonAscii(str: string): string {
  return str.replace(/[^\x00-\x7F]/g, "");
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

/**
 * Sanitizes a filename by replacing disallowed characters with an underscore.
 * @param str - The filename to sanitize
 * @returns The sanitized filename
 * @example
 * ```typescript
 * sanitizeFilename("my file!.txt") // "my_file_.txt"
 * sanitizeFilename("unsafe/<>name") // "unsafe__name"
 * ```
 */
export function sanitizeFilename(str: string): string {
  return str.replace(/[^a-z0-9_\-\.]/gi, "_");
}

/**
 * Checks whether a string is empty, null, or only whitespace.
 * @param str - The string to check
 * @returns True when the string is null/undefined/empty or contains only whitespace
 * @example
 * ```typescript
 * isEmpty(undefined) // true
 * isEmpty('') // true
 * isEmpty('  ') // true
 * isEmpty('hello') // false
 * ```
 */
export const isEmpty = (str?: string | null): boolean =>
  !str || str.trim().length === 0;

/**
 * Checks whether a string is not empty (opposite of `isEmpty`).
 * @param str - The string to check
 * @returns True when the string contains non-whitespace characters
 * @example
 * ```typescript
 * isNotEmpty('hello') // true
 * isNotEmpty('') // false
 * ```
 */
export const isNotEmpty = (str?: string | null): boolean => !isEmpty(str);
