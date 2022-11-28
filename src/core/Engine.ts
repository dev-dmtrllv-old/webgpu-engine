import { assert } from "utils";
import { AssetManager } from "./AssetManager";
import { ConfigManager } from "./ConfigManager";
import { SceneManager } from "./SceneManager";
import { SubSystem, SubSystemType } from "./SubSystem";

export class Engine
{
	private static engine_: Engine| null = null

	public static get instance(): Engine
	{
		assert(() => Engine.engine_ !== null, "Engine is not initialized yet!");
		return this.engine_!;
	}

	public static readonly initialize = <T extends { [key: string]: SubSystemType } = {}>(...args: EngineInitArgs<T>) =>
	{
		assert(() => Engine.engine_ === null, "Engine is already initialized!");
		console.log(...args);
		return this.engine_;
	}

	private constructor()
	{

	}
}

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