import { assert } from "utils";
import { Engine } from "./Engine";
import { Message } from "./WorkerMessageSystem";

export type WorkerInitializeData = {
	index: number;
	eventBuffer: SharedArrayBuffer;
	messages: string[];
};

class EngineWorker
{
	private static instance_: EngineWorker | null = null;

	private static readonly initialize = (data: Partial<WorkerInitializeData>) =>
	{
		if (EngineWorker.instance_ !== null)
			throw new Error("EngineWorker is already initialized!");

		if (!data)
			throw new Error("Could not initialize web worker without data!");
		else if (data?.eventBuffer === undefined)
			throw new Error("Could not initialize web worker without event buffer!");
		else if (data?.index === undefined)
			throw new Error("Could not initialize web worker without index!");
		else if (data?.messages === undefined)
			throw new Error("Could not initialize web worker without messages!");

		const { index, eventBuffer, messages } = data;

		messages.forEach(msg => EngineWorker.registeredMessages_[msg] = EngineWorker.handlerCounter_++);

		const buffer = new Int32Array(eventBuffer);

		EngineWorker.instance_ = new EngineWorker(index, buffer);

		buffer[index] = 1;
		Atomics.notify(buffer, index);
	}

	private static readonly registeredMessages_: { [key: string]: number } = {};

	private static readonly messageHandlers_: ((data: any) => any)[] = [EngineWorker.initialize];

	private static handlerCounter_ = 1;

	private static readonly handleMessage = (e: MessageEvent<any>) =>
	{
		assert(() => e.data.message !== undefined, "Could not get message!");

		const handler = EngineWorker.messageHandlers_[e.data.message];
		if (!handler)
		{
			console.warn(`Could not find handler for message with index ${e.data.message}`);
			return;
		}
		handler(e.data.data || {});
	}

	public static readonly main = async (): Promise<void> =>
	{
		console.log("Worker entry");
		self.onmessage = EngineWorker.handleMessage;
	}

	private onMessage = <Args>(message: Message<any, Args>, callback: (data: Args) => any) =>
	{
		const index = EngineWorker.registeredMessages_[message.message];
		if (index === undefined)
			throw new Error(`Could not get index for message ${message}!`);
		EngineWorker.messageHandlers_[index] = callback;
	}

	private readonly index_: number;
	private readonly eventBuffer_: Int32Array;

	private constructor(index: number, eventBuffer: Int32Array)
	{
		this.index_ = index;
		this.eventBuffer_ = eventBuffer;

		this.onMessage(Engine.MESSAGES.TEST, ({ test }) => 
		{
			console.log("got test message with data:", test);
		});
	}
}

EngineWorker.main();