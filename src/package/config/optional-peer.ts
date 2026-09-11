import { createRequire } from "node:module";
import { MissingOptionalPeerError } from "./errors/index.js";

// Resolved through require, not import(), so the optional peers stay off the
// module-load path: a consumer that never calls the config helpers never pays
// for — nor needs — @nestjs/config, class-validator or class-transformer.
const requirePeer = createRequire(import.meta.url);

export function loadPeer<T>(pkg: string, feature: string): T {
	try {
		return requirePeer(pkg) as T;
	} catch (cause) {
		throw new MissingOptionalPeerError(pkg, feature, cause);
	}
}
