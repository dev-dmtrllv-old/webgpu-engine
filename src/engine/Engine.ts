import { assert } from "utils";
import { FixedArray } from "./serialize";
import { Message, WorkerMessageSystem } from "./WorkerMessageSystem";

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

	private readonly workers_: FixedArray<Worker, WorkersCount>;
	private readonly eventBuffer_: SharedArrayBuffer;
	private readonly intEventBuffer_: Int32Array;

	private status_: EngineStatus = EngineStatus.Initializing;

	private constructor(workersCount: WorkersCount)
	{
		this.workers_ = new FixedArray<Worker, WorkersCount>(workersCount);
		this.eventBuffer_ = new SharedArrayBuffer(1024);
		this.intEventBuffer_ = new Int32Array(this.eventBuffer_);

		for (let i = 0; i < workersCount; i++)
			this.workers_.set(i, new Worker(new URL("./Worker.ts", import.meta.url)));
	}

	private readonly emitMessage = <Args>(message: Message<any, Args>, data: Args) =>
	{
		this.workers_.forEach((worker) => worker.postMessage({ message: message.index, data }));
	}

	private readonly sendMessage = <Args>(worker: Worker, message: Message<any, Args>, data: Args) => worker.postMessage({ message: message.index, data });

	private readonly waitForWorker = async (index: number, expectedValue: number, timeout?: number) =>
	{
		const { async, value } = Atomics.waitAsync(this.intEventBuffer_, index, expectedValue as any, timeout);
		if (async)
			return await value;
		return value;
	}

	private readonly initialize = async (): Promise<boolean> =>
	{
		console.log("Initialize");

		switch (this.status_)
		{
			case EngineStatus.Initialized:
				throw new Error("Engine is already initialized!");
		}

		this.workers_.forEach((worker, index) => worker.postMessage({
			message: WorkerMessageSystem.INITIALIZE_INDEX,
			data: {
				index,
				eventBuffer: this.eventBuffer_,
				messages: WorkerMessageSystem.getRegisteredMessages()				
			}
		}));

		const results = await Promise.all(this.workers_.map<Promise<WorkerWaitInfo>>((_, index) => this.waitForWorker(index, 0)).data);

		if(results.find(r => r !== "ok"))
			return false;
			
		this.emitMessage(Engine.MESSAGES.TEST, { test: "hihi" });

		this.status_ = EngineStatus.Initialized;
		return true;
	}
}

type WorkerWaitInfo = "ok" | "not-equal" | "timed-out";