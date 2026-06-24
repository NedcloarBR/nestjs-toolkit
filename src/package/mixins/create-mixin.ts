// biome-ignore-all lint/suspicious/noExplicitAny: mixin pattern requires any to compose arbitrary constructors
import type { AbstractConstructor } from "../types";

export const MIXIN_FACTORY = Symbol.for(
	"@nedcloarbr/nestjs-toolkit/mixin-factory",
);

export function isMixin(
	value: unknown,
): value is (base: AbstractConstructor) => AbstractConstructor {
	return typeof value === "function" && (value as any)[MIXIN_FACTORY] === true;
}

// Rebind TypeORM metadata from the mixin class onto `Mixed` so columns/indices
// declared on the mixin are resolved through the entity's prototype chain.
function rebindOrmMetadata(MixinClass: any, Mixed: any): void {
	const storage = (globalThis as any).typeormMetadataArgsStorage;
	if (!storage) return;

	for (const key of Object.keys(storage)) {
		const entries = storage[key];
		if (!Array.isArray(entries)) continue;

		const rebound: any[] = [];
		for (const entry of entries) {
			if (entry && entry.target === MixinClass) {
				rebound.push({ ...entry, target: Mixed });
			}
		}
		if (rebound.length) entries.push(...rebound);
	}
}

export function CreateMixin<TAdded>(
	MixinClass: abstract new (...args: any[]) => TAdded,
): (base: AbstractConstructor) => AbstractConstructor<TAdded> {
	const factory = (Base: any) => {
		abstract class Mixed extends Base {
			constructor(...args: any[]) {
				super(...args);
				const mixin = new (MixinClass as any)();
				for (const key of Object.getOwnPropertyNames(mixin)) {
					if (!Object.hasOwn(this, key)) {
						(this as any)[key] = (mixin as any)[key];
					}
				}
			}
		}

		for (const key of Object.getOwnPropertyNames(MixinClass.prototype)) {
			if (key === "constructor") continue;
			const descriptor = Object.getOwnPropertyDescriptor(
				MixinClass.prototype,
				key,
			);
			if (descriptor) Object.defineProperty(Mixed.prototype, key, descriptor);
		}

		rebindOrmMetadata(MixinClass, Mixed);

		return Mixed as any;
	};

	(factory as any)[MIXIN_FACTORY] = true;
	return factory;
}
