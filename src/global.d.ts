declare module "*.wgsl" {
	const data: string;
	export default data;
}

declare type Class<Type = any, Args extends any[] = any, StaticProps extends {} = {}> = (new (...args: Args) => Type) & StaticProps;

declare type Primitives = number | string | boolean;

declare type ImmutableTypes = Primitives | {} | [];

declare type ImmutablePrimitive<T extends number | string | boolean> = Readonly<T>;

declare type Immutable<T extends ImmutableTypes> = T extends Array<infer T> ? ReadonlyArray<T> : T extends {} ? { readonly [K in keyof T]: T[K] extends ImmutableTypes ? Immutable<T[K]> : T[K]; } : T extends Primitives ? ImmutablePrimitive<T> : never;

type A = {
	a: number;
	b: {
		test: number;
	};
	c: Array<string>;
};

type B = Immutable<A>;