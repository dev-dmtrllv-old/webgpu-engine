import { assert } from "utils";
import { WorkerSystem } from "./WorkerSystem";

export const enum EngineStatus
{
	Initializing,
	Initialized
};

const ARGS = Symbol("MESSAGE_ARGS");

export type Message<Msg extends string, Args> = {
	index: number;
	message: Msg;
	[ARGS]: Args;
};

export class Engine<WorkersCount extends number = 4>
{
	public static readonly registerMessage = <Args = any, Msg extends string = string>(message: Msg): Message<Msg, Args> =>
	{
		if (this.registeredMessages_[message])
			throw new Error(`Message ${message} is already registered with index ${this.registeredMessages_[message].index}!`);
			this.registeredMessages_[message] = {
			index: this.registeredCounter_++,
			message,
			[ARGS]: {}
		};
		this.registeredMessageStrings_.push(message);
		return this.registeredMessages_[message];
	}

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
	
	private static readonly getRegisteredMessages = (): string[] => 
	{
		const [,...messages] = this.registeredMessageStrings_;
		return messages;
	}

	private static readonly registeredMessages_: { [key: string]: Message<any, any> } = {};

	private static readonly registeredMessageStrings_: string[] = ["ENGINE_WORKERS_INITIALIZE"];

	public static readonly INITIALIZE_INDEX = 0;
	private static registeredCounter_: number = 1; // zero is reserved for the initialization message

	public static readonly MESSAGES = {
		TEST: Engine.registerMessage<{ test: string }>("test"),
	};

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

		const messages = Engine.getRegisteredMessages();

		const ws = this.workerSystem_ = await WorkerSystem.create(this.workersCount, messages);

		console.log(await ws.emitMessage(Engine.MESSAGES.TEST, { test: "hihi" }));

		this.status_ = EngineStatus.Initialized;
		return true;
	}
}

type WorkerWaitInfo = "ok" | "not-equal" | "timed-out";