import type { BeforeApplicationShutdown } from "@nestjs/common";
import type { CommandMutex, MutexProvider, Release } from "./mutex.js";
import { dataSourceToken } from "./peers.js";

/** The parts of a TypeORM DataSource the mutex uses, typed here so typeorm stays an optional peer. */
export interface AdvisoryDataSource {
	createQueryRunner(): AdvisorySession;
}

export interface AdvisorySession {
	connect(): Promise<unknown>;
	query(sql: string, parameters?: unknown[]): Promise<unknown>;
	release(): Promise<void>;
}

export interface TypeOrmMutexOptions {
	/** The named data source of `TypeOrmModule.forRoot({ name })`; the default one when left out. */
	dataSource?: string;
	/** Put before each command name in the lock key. */
	prefix?: string;
}

function isLocked(rows: unknown): boolean {
	if (!Array.isArray(rows)) return false;
	const [row]: unknown[] = rows;
	return (
		typeof row === "object" &&
		row !== null &&
		"locked" in row &&
		row.locked === true
	);
}

/**
 * Exclusive console runs through PostgreSQL advisory locks: seen by every
 * process and machine using the database, and gone by themselves if the
 * process dies.
 *
 * Every lock of the process lives on one dedicated connection, held while any
 * of them is. A command that calls another holds two locks, and taking a
 * connection for each would leave a console's small pool without one for the
 * work itself.
 */
export class TypeOrmAdvisoryMutex
	implements CommandMutex, BeforeApplicationShutdown
{
	private session: Promise<AdvisorySession> | null = null;
	private readonly held = new Set<string>();

	public constructor(
		private readonly dataSource: AdvisoryDataSource,
		private readonly prefix = "console:",
	) {}

	public async acquire(name: string): Promise<Release | null> {
		const key = `${this.prefix}${name}`;
		if (this.held.has(key)) return null;
		this.held.add(key);

		try {
			const session = await this.connection();
			const rows = await session.query(
				"SELECT pg_try_advisory_lock(hashtext($1)) AS locked",
				[key],
			);
			if (!isLocked(rows)) {
				await this.forget(key);
				return null;
			}
			return async (): Promise<void> => {
				try {
					await session.query("SELECT pg_advisory_unlock(hashtext($1))", [key]);
				} finally {
					await this.forget(key);
				}
			};
		} catch (error) {
			await this.forget(key);
			throw error;
		}
	}

	public async beforeApplicationShutdown(): Promise<void> {
		this.held.clear();
		await this.close();
	}

	private connection(): Promise<AdvisorySession> {
		this.session ??= (async (): Promise<AdvisorySession> => {
			const session = this.dataSource.createQueryRunner();
			await session.connect();
			return session;
		})();
		return this.session;
	}

	private async forget(key: string): Promise<void> {
		this.held.delete(key);
		if (this.held.size === 0) await this.close();
	}

	private async close(): Promise<void> {
		const session = this.session;
		this.session = null;
		if (session) await (await session).release();
	}
}

/** `ConsoleModule.forRoot({ mutex: typeOrmMutex() })`: exclusive commands locked in PostgreSQL. */
export function typeOrmMutex(options: TypeOrmMutexOptions = {}): MutexProvider {
	return {
		useFactory: (dataSource: AdvisoryDataSource) =>
			new TypeOrmAdvisoryMutex(dataSource, options.prefix),
		inject: [dataSourceToken(options.dataSource)],
	};
}
