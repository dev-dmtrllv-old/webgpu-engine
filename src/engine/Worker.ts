import { assert } from "utils";
import { Engine } from "./Engine";
import { EngineMessages, Message } from "./EngineMessage";

export type WorkerInitializeData = {
	index: number;
	messageBuffer: SharedArrayBuffer;
	messages: string[];
	workersCount: number;
	messageCount: number;
};

class EngineWorker
{
	private static instance_: EngineWorker | null = null;

	public static readonly getBufferIndex = (msg: Message<any, any>) => (this.index_ * (this.messageCount_ + 1)) + msg.index;

	private static readonly initialize = (data: Partial<WorkerInitializeData>) =>
	{
		if (this.instance_ !== null)
			throw new Error("EngineWorker is already initialized!");

		if (!data)
			throw new Error("Could not initialize web worker without data!");
		else if (data?.messageBuffer === undefined)
			throw new Error("Could not initialize web worker without message buffer!");
		else if (data?.index === undefined)
			throw new Error("Could not initialize web worker without index!");
		else if (data?.messages === undefined)
			throw new Error("Could not initialize web worker without messages!");
		else if (data?.workersCount === undefined)
			throw new Error("Could not initialize web worker without workersCount!");
		else if (data?.messageCount === undefined)
			throw new Error("Could not initialize web worker without messageCount!");

		const { index, messageBuffer, messages, workersCount, messageCount } = data;

		this.index_ = index;
		this.messageCount_ = messageCount;

		this.messageBuffer_ = new Int32Array(messageBuffer, 0, messageBuffer.byteLength / Int32Array.BYTES_PER_ELEMENT);
		// console.log(messages);
		messages.forEach(msg => this.registeredMessages_[msg] = this.handlerCounter_++);

		this.instance_ = new EngineWorker()

		Atomics.store(this.messageBuffer_, 0, 1);
		Atomics.notify(this.messageBuffer_, 0);
	}

	private static readonly registeredMessages_: { [key: string]: number } = {};
	private static readonly messageHandlers_: (MessageHandler<any>)[] = [this.initialize];

	private static messageCount_: number = 0;
	private static index_: number = 0;
	private static messageBuffer_: Int32Array = new Int32Array();
	private static handlerCounter_ = 1;

	private static readonly handleMessage = async (e: MessageEvent<any>) =>
	{
		const message = e.data.message;

		assert(() => message !== undefined, "Could not get message!");

		const handler = this.messageHandlers_[message];
		if (!handler)
		{
			console.warn(`Could not find handler for message with index ${message}`);
			return;
		}
		const result = await handler(e.data.data);
		if (typeof result === "number")
			Atomics.store(this.messageBuffer_, message, result);
		Atomics.notify(this.messageBuffer_, message);
	}

	public static readonly main = async (): Promise<void> =>
	{
		self.onmessage = this.handleMessage;
	}


	private constructor()
	{
		this.onMessage(EngineMessages.TEST, ({ test }) => 
		{
			return Math.round((Math.random() * 10) + 1 + test);
		});
	}

	private onMessage = <Args>(message: Message<any, Args>, callback: MessageHandler<Args>) =>
	{
		const index = EngineWorker.registeredMessages_[message.message];
		if (index === undefined)
			throw new Error(`Could not get index for message ${message.index}!`);
		EngineWorker.messageHandlers_[index] = callback;
	}

}

EngineWorker.main();

type MessageHandler<T> = (data: T) => number | any;