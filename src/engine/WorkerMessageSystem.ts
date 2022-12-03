const ARGS = Symbol("MESSAGE_ARGS");

export type Message<Msg extends string, Args> = {
	index: number;
	message: Msg;
	[ARGS]: Args;
};

export namespace WorkerMessageSystem
{
	const registeredMessages_: { [key: string]: Message<any, any> } = {};

	const registeredMessageStrings_: string[] = [];

	export const INITIALIZE_INDEX = 0;
	let registeredCounter_: number = 1; // zero is reserved for the initialization message

	export const registerMessage = <Args = any, Msg extends string = string>(message: Msg): Message<Msg, Args> =>
	{
		if (registeredMessages_[message])
			throw new Error(`Message ${message} is already registered with index ${registeredMessages_[message].index}!`);
		registeredMessages_[message] = {
			index: registeredCounter_++,
			message,
			[ARGS]: {}
		};
		registeredMessageStrings_.push(message);
		return registeredMessages_[message];
	}

	export const getRegisteredMessages = (): string[] => [...registeredMessageStrings_];
}