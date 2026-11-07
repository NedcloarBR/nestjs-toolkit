import type { FactoryProvider } from "@nestjs/common";

/** Releases what `acquire` took. */
export type Release = () => Promise<void>;

/**
 * How exclusive commands keep to one run at a time. Without one, exclusive
 * commands only guard against themselves within a process.
 */
export interface CommandMutex {
	/** Answers null, at once, when another run holds the name. */
	acquire(name: string): Promise<Release | null>;
}

/** A mutex built by a factory, as the adapters' `typeOrmMutex()` and `redisMutex()` return. */
export type MutexProvider = Omit<FactoryProvider<CommandMutex>, "provide">;

export const CONSOLE_MUTEX = Symbol("CONSOLE_MUTEX");

/** The fallback: one process, one run. */
export class LocalMutex implements CommandMutex {
	private readonly held = new Set<string>();

	public async acquire(name: string): Promise<Release | null> {
		if (this.held.has(name)) return null;
		this.held.add(name);
		return async (): Promise<void> => {
			this.held.delete(name);
		};
	}
}
