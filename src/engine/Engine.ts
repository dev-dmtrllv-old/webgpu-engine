import { assert } from "utils";
import { Ecs } from "./ecs";
import { EngineMessages, Message } from "./EngineMessage";
import { SubSystem } from "./SubSystem";
import { WorkerSystem } from "./WorkerSystem";

export const enum EngineStatus
{
	Initializing,
	Initialized
};

export class Engine<WorkersCount extends number = number>
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

	public readonly ecs = new Ecs();

	private status_: EngineStatus = EngineStatus.Initializing;
	private workerSystem_: WorkerSystem<WorkersCount> | null = null;

	private get workerSystem(): WorkerSystem<WorkersCount>
	{
		if (!this.workerSystem_)
			throw new Error("WorkerSystem is not initialized yet!");
		return this.workerSystem_;
	}

	private readonly subSystems_: SubSystem[] = [];

	private constructor() { }

	private readonly initialize = async (workersCount: WorkersCount): Promise<boolean> =>
	{
		console.log("Initialize");

		switch (this.status_)
		{
			case EngineStatus.Initialized:
				throw new Error("Engine is already initialized!");
		}
		
		const messages = Message.getRegisteredMessages();

		const ws = this.workerSystem_ = await WorkerSystem.create(workersCount, messages);
		console.log("Workers initialized!");
		const results = await ws.emitMessage(EngineMessages.TEST, { test: 1 });

		console.table(results);

		this.status_ = EngineStatus.Initialized;
		return true;
	}
}