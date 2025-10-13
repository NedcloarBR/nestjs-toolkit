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
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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
export async function retry<T>(
	fn: () => Promise<T>,
	attempts = 3,
	delayMs = 500,
): Promise<T> {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <>
	let lastError;
	for (let i = 0; i < attempts; i++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
			await sleep(delayMs);
		}
	}
	throw lastError;
}

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
export async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	let timer: NodeJS.Timeout;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error("Timeout exceeded")), ms);
	});
	return Promise.race([promise, timeoutPromise]).finally(() =>
		clearTimeout(timer),
	);
}
