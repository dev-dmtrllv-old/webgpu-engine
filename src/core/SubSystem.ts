import { assert } from "utils";
import { Engine } from "./Engine";

const DEPENDENCIES = Symbol();

export abstract class SubSystem<Config extends {} = {}>
{
	public static readonly dependencies = (types: SubSystemType[]): ClassDecorator => (ctor: any) =>
	{
		const Class: SubSystemClass = ctor;
		Class[DEPENDENCIES] = types;
	}

	public static readonly getDependencies = <T extends SubSystem>(type: SubSystemType<T>): SubSystemType[] =>
	{
		const Class: SubSystemClass = type as any;
		return Class[DEPENDENCIES] || [];
	}

	public static readonly initialize = async <T extends SubSystem>(system: T, config: T extends SubSystem<infer Config> ? Config : {}) =>
	{
		assert(() => !system.isInitialized_, "System is already initialized!");
		await system.initialize(config);
		system.isInitialized_ = true;
	}

	public static readonly terminate = async <T extends SubSystem>(system: T) =>
	{
		assert(() => system.isInitialized_, "System cannot terminate because it is not initialized!");
		await system.terminate();
		system.isInitialized_ = true;
	}

	public readonly engine: Engine<any>;

	private isInitialized_: boolean = false;

	public constructor(engine: Engine<any>)
	{
		this.engine = engine;
	}

	protected async initialize(config: Config) {}
	protected async terminate() {}
}

export type SubSystemType<T extends SubSystem = SubSystem> = Class<T>;
type SubSystemClass<T extends SubSystem = SubSystem> = Class<T, any, {
	[DEPENDENCIES]: SubSystemType[];
}>