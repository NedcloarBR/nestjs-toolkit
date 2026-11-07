import { randomUUID } from "node:crypto";
import type { InjectionToken, OnApplicationShutdown } from "@nestjs/common";
import type { CommandMutex, MutexProvider, Release } from "./mutex.js";
import { connectRedis, type RedisDriver } from "./peers.js";
import {
	closeRedisClient,
	type RedisCommand,
	toRedisCommand,
} from "./redis-command.js";

// Only the run that took the lock may extend or drop it: a run whose lock
// expired must not touch the one another run holds now.
const RENEW =
	'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("pexpire", KEYS[1], ARGV[2]) else return 0 end';
const RELEASE =
	'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';

export interface RedisMutexSettings {
	/** How long a lock outlives a process that died holding it, in milliseconds. */
	ttl?: number;
	/** Put before each command name in the key. */
	prefix?: string;
}

export interface RedisMutexOptions extends RedisMutexSettings {
	/** The token of a Redis client the application already provides, from any library. */
	client?: InjectionToken;
	/** How that client sends a raw command, for a library the console does not recognize. */
	command?: (client: unknown) => RedisCommand;
	/** Or a URL to open a connection of the console's own, closed with the application. */
	url?: string;
	/** The library that opens it; the first installed of ioredis and redis when left out. */
	driver?: RedisDriver;
}

/**
 * Exclusive console runs through a Redis key: `SET NX PX`, renewed while the
 * command runs, so a crashed process frees the lock after `ttl`. It only sends
 * raw commands, so any client works — Redis, Valkey, or anything speaking it.
 */
export class RedisMutex implements CommandMutex, OnApplicationShutdown {
	private readonly timers = new Set<NodeJS.Timeout>();
	private readonly ttl: number;
	private readonly prefix: string;

	public constructor(
		private readonly send: RedisCommand,
		{ ttl = 30_000, prefix = "console:" }: RedisMutexSettings = {},
		private readonly close?: () => Promise<void>,
	) {
		this.ttl = ttl;
		this.prefix = prefix;
	}

	public async acquire(name: string): Promise<Release | null> {
		const key = `${this.prefix}${name}`;
		const token = randomUUID();
		const ttl = String(this.ttl);
		const taken = await this.send(["SET", key, token, "PX", ttl, "NX"]);
		if (taken !== "OK") return null;

		const timer = setInterval(
			() => {
				this.send(["EVAL", RENEW, "1", key, token, ttl]).catch(() => undefined);
			},
			Math.floor(this.ttl / 3),
		);
		timer.unref();
		this.timers.add(timer);

		return async (): Promise<void> => {
			clearInterval(timer);
			this.timers.delete(timer);
			await this.send(["EVAL", RELEASE, "1", key, token]);
		};
	}

	public async onApplicationShutdown(): Promise<void> {
		for (const timer of this.timers) clearInterval(timer);
		this.timers.clear();
		await this.close?.();
	}
}

/** `ConsoleModule.forRoot({ mutex: redisMutex({ client }) })`: exclusive commands locked in Redis. */
export function redisMutex(options: RedisMutexOptions): MutexProvider {
	const {
		client,
		command = toRedisCommand,
		url,
		driver,
		...settings
	} = options;
	if (client !== undefined) {
		return {
			useFactory: (redis: unknown) => new RedisMutex(command(redis), settings),
			inject: [client],
		};
	}
	if (!url) throw new Error("redisMutex() needs a client token or a url");
	return {
		useFactory: async () => {
			const redis = await connectRedis(url, driver);
			return new RedisMutex(toRedisCommand(redis), settings, () =>
				closeRedisClient(redis),
			);
		},
	};
}
