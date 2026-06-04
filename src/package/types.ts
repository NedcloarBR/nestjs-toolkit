/** biome-ignore-all lint/suspicious/noExplicitAny: Necessary for mixin types */

export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;

export type Mixin<TAdded = object> = (
	base: AbstractConstructor,
) => AbstractConstructor<TAdded>;

export type MixinReturn<
	TBase extends AbstractConstructor,
	TAdded,
> = abstract new (...args: any[]) => InstanceType<TBase> & TAdded;

export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

export type ExtractAdded<T extends ((base: AbstractConstructor) => AbstractConstructor)[]> =
	UnionToIntersection<
		{
			[K in keyof T]: T[K] extends (
				base: AbstractConstructor,
			) => abstract new (...args: any[]) => infer I
				? I
				: never;
		}[number & keyof T]
	>;

export type MixinType<T> = T extends (
	base: AbstractConstructor,
) => AbstractConstructor<infer I>
	? I
	: never;
