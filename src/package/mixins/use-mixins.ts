// biome-ignore-all lint/suspicious/noExplicitAny: mixin pattern requires any to compose arbitrary constructors

import type { AbstractConstructor, ExtractAdded } from "../types";
import { MIXIN_FACTORY } from "./create-mixin";

abstract class BaseEmptyClass {}

function isMixinFactory(fn: unknown): boolean {
	return typeof fn === "function" && (fn as any)[MIXIN_FACTORY] === true;
}

// Single mixin
export function UseMixins<TAdded>(
	mixin: (base: AbstractConstructor) => AbstractConstructor<TAdded>,
): abstract new (
	...args: any[]
) => TAdded;

// Single mixin + base class
export function UseMixins<TBase extends AbstractConstructor, TAdded>(
	mixin: (base: AbstractConstructor) => AbstractConstructor<TAdded>,
	Base: TBase,
): abstract new (
	...args: any[]
) => InstanceType<TBase> & TAdded;

// Multiple mixins as rest params
export function UseMixins<
	const T extends ((base: AbstractConstructor) => AbstractConstructor)[],
>(...mixins: T): abstract new (...args: any[]) => ExtractAdded<T>;

// Array of mixins
export function UseMixins<
	const T extends ((base: AbstractConstructor) => AbstractConstructor)[],
>(mixins: T): abstract new (...args: any[]) => ExtractAdded<T>;

// Array of mixins + base class
export function UseMixins<
	TBase extends AbstractConstructor,
	const T extends ((base: AbstractConstructor) => AbstractConstructor)[],
>(
	mixins: T,
	Base: TBase,
): abstract new (
	...args: any[]
) => InstanceType<TBase> & ExtractAdded<T>;

export function UseMixins(...args: any[]): AbstractConstructor {
	if (Array.isArray(args[0])) {
		const [mixins, Base] = args as [
			((base: any) => any)[],
			AbstractConstructor?,
		];
		return mixins.reduce(
			(cls, mixin) => mixin(cls),
			(Base ?? BaseEmptyClass) as AbstractConstructor,
		);
	}

	const last = args[args.length - 1];
	if (args.length > 1 && !isMixinFactory(last)) {
		const Base = last as AbstractConstructor;
		const mixins = args.slice(0, -1) as ((base: any) => any)[];
		return mixins.reduce((cls, mixin) => mixin(cls), Base);
	}

	return (args as ((base: any) => any)[]).reduce(
		(cls, mixin) => mixin(cls),
		BaseEmptyClass as AbstractConstructor,
	);
}
