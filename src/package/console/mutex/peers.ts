import type { InjectionToken } from "@nestjs/common";
import { MissingOptionalPeerError } from "../../config/errors/index.js";
import { loadPeer } from "../../config/optional-peer.js";

/** The parts of @nestjs/typeorm the adapter uses, typed here so the peer stays optional. */
interface NestTypeOrm {
	getDataSourceToken(dataSource?: string): InjectionToken;
}

type IoRedisConstructor = new (url: string, options?: object) => unknown;

interface NodeRedis {
	createClient(options: { url: string }): { connect(): Promise<unknown> };
}

/** The libraries `redisMutex({ url })` can open a connection with. */
export type RedisDriver = "ioredis" | "redis";

export function dataSourceToken(
	dataSource: string | undefined,
): InjectionToken {
	return loadPeer<NestTypeOrm>(
		"@nestjs/typeorm",
		"typeOrmMutex()",
	).getDataSourceToken(dataSource);
}

async function open(driver: RedisDriver, url: string): Promise<unknown> {
	if (driver === "ioredis") {
		const module = loadPeer<
			IoRedisConstructor & { default?: IoRedisConstructor }
		>("ioredis", "redisMutex({ url })");
		const Redis = module.default ?? module;
		return new Redis(url, { maxRetriesPerRequest: 1 });
	}
	const client = loadPeer<NodeRedis>(
		"redis",
		"redisMutex({ url })",
	).createClient({
		url,
	});
	await client.connect();
	return client;
}

/** A connection of the console's own, with the driver asked for, or the first one installed. */
export async function connectRedis(
	url: string,
	driver?: RedisDriver,
): Promise<unknown> {
	if (driver) return open(driver, url);
	try {
		return await open("ioredis", url);
	} catch (error) {
		if (!(error instanceof MissingOptionalPeerError)) throw error;
	}
	try {
		return await open("redis", url);
	} catch (error) {
		if (!(error instanceof MissingOptionalPeerError)) throw error;
		throw new MissingOptionalPeerError(
			"ioredis or redis",
			"redisMutex({ url })",
			error,
		);
	}
}
