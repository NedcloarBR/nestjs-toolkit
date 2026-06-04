// biome-ignore-all lint/suspicious/noExplicitAny: mixin pattern requires any to compose arbitrary constructors

import type { AbstractConstructor, ExtractAdded } from "../types";
import { MIXIN_FACTORY } from "./create-mixin";

export function ComposeMixins<
	const T extends ((base: AbstractConstructor) => AbstractConstructor)[],
>(
	...mixins: T
): (base: AbstractConstructor) => AbstractConstructor<ExtractAdded<T>> {
	const factory = (Base: any) =>
		mixins.reduce((cls, mixin) => mixin(cls), Base as any);

	(factory as any)[MIXIN_FACTORY] = true;
	return factory as any;
}
