import { assert } from "utils";
import { AssetManager } from "./AssetManager";
import { ConfigManager } from "./ConfigManager";
import { SceneManager } from "./SceneManager";
import { SubSystem, SubSystemType } from "./SubSystem";

export class Engine<T extends { [key: string]: SubSystemType }>
{
	private static engine_: Engine<any> | null = null;

	private static readonly requiredSystems: { [K in keyof RequiredSubSystems]: SubSystemType<RequiredSubSystems[K]> } = {
		assetManager: AssetManager,
		configManager: ConfigManager,
		sceneManager: SceneManager
	};

	public static readonly get = <T extends { [key: string]: SubSystemType }>(): Engine<T> =>
	{
		assert(() => Engine.engine_ !== null, "Engine is not initialized yet!");
		return this.engine_!;
	}

	public static readonly initialize = async <T extends { [key: string]: SubSystemType } = {}>(...args: EngineInitArgs<T>) =>
	{
		assert(() => Engine.engine_ === null, "Engine is already initialized!");

		const [config, systems]: ParsedInitArgs<T> = args.length === 2 ? args : [args[0], {}] as any;

		Engine.engine_ = new Engine<T>();
		await Engine.engine_.initialize(config, systems);

		return this.engine_;
	}

	public static readonly terminate = async () =>
	{
		assert(() => Engine.engine_ !== null, "Engine is not initialized!");
		await Engine.engine_!.terminate();
	}

	private readonly subSystems_: { [K in keyof RequiredSubSystems]: RequiredSubSystems[K] } & { [K in keyof T]: InstanceType<T[K]> } = {} as any;
	private readonly initializationOrder_: string[] = [];

	private readonly initialize = async (config: EngineSubSystemsConfig<T>, subSystems: T) =>
	{
		assert(() => Object.keys(this.subSystems_).length === 0, "Engine is already initialized!");

		const systems = { ...Engine.requiredSystems, ...subSystems };

		const classConfigMap = new Map<SubSystemType, [any, string]>();

		for (const key in systems)
			classConfigMap.set(systems[key], [config[key] || {}, key]);

		const initializedSystems: SubSystemType[] = [];

		const initializeSubSystem = async (Class: SubSystemType) =>
		{
			if (initializedSystems.includes(Class))
				return;

			const subSystemInfo = classConfigMap.get(Class);
			if (!subSystemInfo)
				throw new Error();

			const [config, name] = subSystemInfo;

			const dependencies = SubSystem.getDependencies(Class);

			for (const dep of dependencies)
				initializeSubSystem(dep);

			if (initializedSystems.includes(Class))
				return;

			const system = new Class(this);
			await SubSystem.initialize(system, config);

			initializedSystems.push(Class);
			this.initializationOrder_.push(name);
			(this.subSystems_ as any)[name] = system;
		};

		for (const key in systems)
			await initializeSubSystem(systems[key]);
	}

	private readonly terminate = () =>
	{
		let name;
		while(name = this.initializationOrder_.pop())
		{
			const subSystem = this.subSystems_[name];
			assert(() => subSystem, `Could not get subsystem for ${name}!`);
			SubSystem.terminate(subSystem);
		}
	}
}

type EngineSubSystemsConfig<T extends { [key: string]: SubSystemType }> = RequiredSubSystemConfig & { [K in keyof T]: SubSystemConfig<InstanceType<T[K]>>; };

type RequiredSubSystems = {
	configManager: ConfigManager;
	assetManager: AssetManager;
	sceneManager: SceneManager;
};

type RequiredSubSystemConfig = {
	[K in keyof RequiredSubSystems]?: SubSystemConfig<RequiredSubSystems[K]>;
};

type SubSystemConfig<T> = T extends SubSystem<infer Config> ? Config : {};

type EngineInitArgs<T extends { [key: string]: SubSystemType }> = [keyof T] extends [never] ? [RequiredSubSystemConfig] : [RequiredSubSystemConfig & { [K in keyof T]: SubSystemConfig<InstanceType<T[K]>> }, T];

type ParsedInitArgs<T extends { [key: string]: SubSystemType }> = [RequiredSubSystemConfig & { [K in keyof T]: SubSystemConfig<InstanceType<T[K]>> }, T];