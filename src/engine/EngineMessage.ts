
const ARGS = Symbol("MESSAGE_ARGS");

export type Message<Msg extends string, Args> = {
	index: number;
	message: Msg;
	[ARGS]: Args;
};

export type WorkerInitializeData = {
	index: number;
	messageBuffer: SharedArrayBuffer;
	messages: string[];
	workersCount: number;
	messageCount: number;
};

export namespace Message
{
	export const getRegisteredMessages = (): ReadonlyArray<string> => registeredMessageStrings_.slice(1, registeredMessageStrings_.length);

	export const register = <Args = any, Msg extends string = string>(message: Msg): Message<Msg, Args> =>
	{
		if (registeredMessages_[message])
			throw new Error(`Message ${message} is already registered with index ${registeredMessages_[message].index}!`);

		registeredMessages_[message] = {
			index: registeredMessageCounter_++,
			message,
			[ARGS]: {}
		};

		registeredMessageStrings_.push(message);
		
		return registeredMessages_[message];
	}

	const registeredMessages_: { [key: string]: Message<any, any> } = {};

	export const INITIALIZE_INDEX = 0;
	let registeredMessageCounter_: number = 1; // zero is reserved for the initialization message

	export const WORKER_INITIALIZE_MESSAGE: Message<"WORKER_INITIALIZE_MESSAGE", WorkerInitializeData> = {
		index: INITIALIZE_INDEX,
		message: "WORKER_INITIALIZE_MESSAGE",
		[ARGS]: {} as any
	};

	const registeredMessageStrings_: string[] = [WORKER_INITIALIZE_MESSAGE.message];
};

export namespace EngineMessages
{
	export const TEST = Message.register<{ test: number }>("test");
};