import { assert } from "utils";
import {  WorkerMessageSystem } from "./WorkerMessageSystem";
import { WorkerSystem } from "./WorkerSystem";

export const enum EngineStatus
{
	Initializing,
	Initialized
};

export class Engine<WorkersCount extends number = 4>
{
	public static readonly MESSAGES = {
		TEST: WorkerMessageSystem.registerMessage<{ test: string }>("test"),
	};

	private static instance_: Engine<any> | null = null;

	public static get instance()
	{
		assert(() => Engine.instance_, "Engine is not initialized yet!");
		return Engine.instance_;
	}

	public static readonly initialize = async <Workers extends number>(workers: Workers) =>
	{
		assert(() => !Engine.instance_, "Engine is already initialized!");
		Engine.instance_ = new Engine<Workers>(workers);
		await Engine.instance_.initialize();
		return Engine.instance_;
	}

	public readonly workersCount: WorkersCount;

	private status_: EngineStatus = EngineStatus.Initializing;
	private workerSystem_: WorkerSystem<WorkersCount> | null = null;

	private get workerSystem(): WorkerSystem<WorkersCount>
	{
		if (!this.workerSystem_)
			throw new Error("WorkerSystem is not initialized yet!");
		return this.workerSystem_;
	}

	private constructor(workersCount: WorkersCount)
	{
		this.workersCount = workersCount;
	}

	private readonly initialize = async (): Promise<boolean> =>
	{
		console.log("Initialize");

		switch (this.status_)
		{
			case EngineStatus.Initialized:
				throw new Error("Engine is already initialized!");
		}

		const messages = WorkerMessageSystem.getRegisteredMessages();

		const ws = this.workerSystem_ = await WorkerSystem.create(this.workersCount, messages);

		console.log(await ws.emitMessage(Engine.MESSAGES.TEST, { test: "hihi" }));

		this.status_ = EngineStatus.Initialized;
		return true;
	}
}

type WorkerWaitInfo = "ok" | "not-equal" | "timed-out";