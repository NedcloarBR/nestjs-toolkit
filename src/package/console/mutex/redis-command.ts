/** Sends one raw Redis command — `["SET", key, value, "NX"]` — and answers its reply. */
export type RedisCommand = (args: readonly string[]) => Promise<unknown>;

type Method = (...args: never[]) => unknown;

function hasMethod<K extends string>(
	value: unknown,
	name: K,
): value is Record<K, Method> {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as Record<string, unknown>)[name] === "function"
	);
}

/**
 * How a client sends a raw command, for the libraries that have one:
 * ioredis and iovalkey (`call`), valkey-glide (`customCommand`) and
 * node-redis (`sendCommand`). The order matters: ioredis also has a
 * `sendCommand`, which takes a Command object instead of words.
 */
export function toRedisCommand(client: unknown): RedisCommand {
	if (hasMethod(client, "call")) {
		const call = client.call as (...args: string[]) => Promise<unknown>;
		return ([command, ...args]) => call.call(client, command, ...args);
	}
	if (hasMethod(client, "customCommand")) {
		const custom = client.customCommand as (args: string[]) => Promise<unknown>;
		return (args) => custom.call(client, [...args]);
	}
	if (hasMethod(client, "sendCommand")) {
		const send = client.sendCommand as (args: string[]) => Promise<unknown>;
		return (args) => send.call(client, [...args]);
	}
	throw new Error(
		"redisMutex() does not know how this Redis client sends a command: pass `command: (client) => (args) => …`",
	);
}

/** Closes a client the console opened itself, whichever library it comes from. */
export async function closeRedisClient(client: unknown): Promise<void> {
	for (const name of ["close", "quit", "disconnect"] as const) {
		if (hasMethod(client, name)) {
			await (client[name] as () => unknown).call(client);
			return;
		}
	}
}
