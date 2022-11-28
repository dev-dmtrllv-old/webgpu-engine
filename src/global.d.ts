declare module "*.wgsl" {
	const data: string;
	export default data;
}

declare type Class<Type = any, Args extends any[] = any, StaticProps extends {} = {}> = (new (...args: Args) => Type) & StaticProps;
