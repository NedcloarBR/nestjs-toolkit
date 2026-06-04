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

export type Awaitable<T> = T | PromiseLike<T>;

// Nullability
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Partial modifiers
export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Extraction
export type ValueOf<T> = T[keyof T];

export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;

export type Constructor<T = object> = new (...args: any[]) => T;

// DX / Readability
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type Dict<T = unknown> = Record<string, T>;
