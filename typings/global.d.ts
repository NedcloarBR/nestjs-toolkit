/**
 * AUTO-GENERATED FILE.
 * Global helper function declarations.
 * Run "yarn generate:helpers" to update automatically.
 */

declare global {

  /**
   * Pauses execution for a specified duration.
   * @param ms - The number of milliseconds to sleep
   * @returns A promise that resolves after the specified delay
   * @example
   * ```typescript
   * await sleep(1000) // Waits for 1 second
   * await sleep(500)  // Waits for 0.5 seconds
   * ```
   */
  function sleep(ms: number): Promise<void>;

  /**
   * Retries an asynchronous function a specified number of times with delays between attempts.
   * @template T - The return type of the function being retried
   * @param fn - The asynchronous function to retry
   * @param attempts - The maximum number of attempts (default: 3)
   * @param delayMs - The delay in milliseconds between retry attempts (default: 500)
   * @returns A promise that resolves with the function's result if successful
   * @throws The last error encountered if all retry attempts fail
   * @example
   * ```typescript
   * const result = await retry(() => fetchData(), 5, 1000)
   * // Tries to fetch data up to 5 times with 1 second delay between attempts
   * ```
   */
  function retry(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T>;

  /**
   * Races a promise against a timeout, rejecting if the timeout is exceeded.
   * @template T - The return type of the promise
   * @param promise - The promise to race against the timeout
   * @param ms - The timeout duration in milliseconds
   * @returns A promise that resolves with the original promise's result if completed in time
   * @throws An error with message "Timeout exceeded" if the timeout is reached first
   * @example
   * ```typescript
   * const result = await timeout(fetchData(), 5000)
   * // Fails if fetchData takes longer than 5 seconds
   * ```
   */
  function timeout(promise: Promise<T>, ms: number): Promise<T>;

  /**
   * Returns the current date and time.
   * @returns A new Date object representing the current moment
   * @example
   * ```typescript
   * const currentDate = now()
   * ```
   */
  function now(): Date;

  /**
   * Returns today's date in ISO format (YYYY-MM-DD).
   * @returns A string representing today's date in ISO 8601 format
   * @example
   * ```typescript
   * today() // Returns "2025-10-05"
   * ```
   */
  function today(): string;

  /**
   * Adds a specified number of days to a date.
   * @param date - The base date
   * @param days - The number of days to add (can be negative to subtract)
   * @returns A new Date object with the days added
   * @example
   * ```typescript
   * addDays(new Date('2025-01-01'), 5) // Returns 2025-01-06
   * addDays(new Date('2025-01-01'), -2) // Returns 2024-12-30
   * ```
   */
  function addDays(date: Date, days: number): Date;

  /**
   * Subtracts a specified number of days from a date.
   * @param date - The base date
   * @param days - The number of days to subtract
   * @returns A new Date object with the days subtracted
   * @example
   * ```typescript
   * subDays(new Date('2025-01-10'), 3) // Returns 2025-01-07
   * ```
   */
  function subDays(date: Date, days: number): Date;

  /**
   * Calculates the absolute difference in days between two dates.
   * @param date1 - The first date
   * @param date2 - The second date
   * @returns The number of days between the two dates (always positive)
   * @example
   * ```typescript
   * diffInDays(new Date('2025-01-10'), new Date('2025-01-05')) // Returns 5
   * diffInDays(new Date('2025-01-05'), new Date('2025-01-10')) // Returns 5
   * ```
   */
  function diffInDays(date1: Date, date2: Date): number;

  /**
   * Checks if a date is in the past.
   * @param date - The date to check
   * @returns True if the date is before the current moment, false otherwise
   * @example
   * ```typescript
   * isPast(new Date('2020-01-01')) // Returns true
   * isPast(new Date('2030-01-01')) // Returns false
   * ```
   */
  function isPast(date: Date): boolean;

  /**
   * Checks if a date is in the future.
   * @param date - The date to check
   * @returns True if the date is after the current moment, false otherwise
   * @example
   * ```typescript
   * isFuture(new Date('2030-01-01')) // Returns true
   * isFuture(new Date('2020-01-01')) // Returns false
   * ```
   */
  function isFuture(date: Date): boolean;

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
  function randomHex(length: number): string;

  /**
   * Converts an input string to its SHA-256 hash representation.
   * @param input - The string to be hashed
   * @returns The SHA-256 hash of the input as a hexadecimal string
   * @example
   * ```typescript
   * toSha256("password") // Returns the SHA-256 hash of "password"
   * ```
   */
  function toSha256(input: string): string;

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
  function mask(str: string, visible: number, maskChar: string): string;

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
  function slugify(text: string): string;

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
  function capitalize(str: string): string;

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
  function titleCase(str: string): string;

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
  function truncate(str: string, limit: number, suffix: string): string;
}

export {};
