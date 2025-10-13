/**
 * Returns the current date and time.
 * @returns A new Date object representing the current moment
 * @example
 * ```typescript
 * const currentDate = now()
 * ```
 */
export function now(): Date {
	return new Date();
}

/**
 * Returns today's date in ISO format (YYYY-MM-DD).
 * @returns A string representing today's date in ISO 8601 format
 * @example
 * ```typescript
 * today() // Returns "2025-10-05"
 * ```
 */
export function today(): string {
	return new Date().toISOString().split("T")[0];
}

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
export function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

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
export function subDays(date: Date, days: number): Date {
	return addDays(date, -days);
}

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
export function diffInDays(date1: Date, date2: Date): number {
	const ms = Math.abs(date1.getTime() - date2.getTime());
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

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
export function isPast(date: Date): boolean {
	return date.getTime() < Date.now();
}

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
export function isFuture(date: Date): boolean {
	return date.getTime() > Date.now();
}
