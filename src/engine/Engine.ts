import { assert } from "utils";
import { initializeComponents } from "./components";
import { Ecs } from "./ecs";
import { EngineMessages, Message } from "./EngineMessage";
import { RenderSystem } from "./RenderSystem";
import { SceneManager } from "./SceneManager";
import { SubSystem, SubSystemType } from "./SubSystem";
import { WorkerSystem } from "./WorkerSystem";

export const enum EngineStatus
{
	Initializing,
	Initialized
};

export class Engine<WorkersCount extends number = any>
{
	private static instance_: Engine<any> | null = null;

	public static get instance()
	{
		assert(() => Engine.instance_, "Engine is not initialized yet!");
		return Engine.instance_;
	}

	public static readonly initialize = async <Workers extends number>(workers: Workers): Promise<Readonly<Engine>> =>
	{
		assert(() => !Engine.instance_, "Engine is already initialized!");
		Engine.instance_ = new Engine<Workers>();
		await Engine.instance_.initialize(workers);
		return Object.freeze(Object.seal(Engine.instance_));
	}

	private readonly ecs_ = new Ecs();

	private status_: EngineStatus = EngineStatus.Initializing;
	private workerSystem_: WorkerSystem<WorkersCount> | null = null;

	private get workerSystem(): WorkerSystem<WorkersCount>
	{
		if (!this.workerSystem_)
			throw new Error("WorkerSystem is not initialized yet!");
		return this.workerSystem_;
	}

	private readonly subSystems_: SubSystem[] = [];

	private constructor()
	{
		const subSystems: SubSystemType<any>[] = [
			RenderSystem,
			SceneManager
		];

		subSystems.forEach(s => this.registerSubSystem(s));
	}

	private readonly registerSubSystem = <T extends SubSystem>(type: SubSystemType<T>) =>
	{
		const Class = type as Class<T, any, { index_: number }>;
		assert(() => Class.index_ === -1, `SubSystem ${type.name} is already registered!`);
		const subSystem = new type(this) as T;
		Class.index_ = this.subSystems_.push(subSystem) - 1;
		return subSystem;
	}

	private readonly initialize = async (workersCount: WorkersCount): Promise<boolean> =>
	{
		console.log("Initialize");

		switch (this.status_)
		{
			case EngineStatus.Initialized:
				throw new Error("Engine is already initialized!");
		}

		initializeComponents(this.ecs_);

		for(let i = 0, l = this.subSystems_.length; i <l;i++ )
			await this.subSystems_[i].initialize();

		const messages = Message.getRegisteredMessages();

		const ws = this.workerSystem_ = await WorkerSystem.create(workersCount, messages);
		console.log("Workers initialized!");
		const results = await ws.emitMessage(EngineMessages.TEST, { test: 1 });

		console.table(results);

		this.status_ = EngineStatus.Initialized;
		return true;
	}

	public readonly getSubSystem = <T extends SubSystem>(type: SubSystemType<T>): T =>
	{
		const Class = type as Class<T, any, { index_: number }>;
		assert(() => Class.index_ !== -1, `SubSystem ${type.name} is not registered!`);
		return this.subSystems_[Class.index_] as T;
	}
}