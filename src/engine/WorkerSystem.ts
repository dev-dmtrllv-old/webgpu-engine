import { align } from "utils/math";
import { Message } from "./EngineMessage";
import { FixedArray } from "./serialize";

class EngineWorker
{
	public readonly nativeWorker = new Worker(new URL("./Worker.ts", import.meta.url));
	public readonly index: number;
	public readonly messageBuffer: SharedArrayBuffer;
	public readonly intMessageBuffer: Int32Array;

	public constructor(index: number, messagesCount: number)
	{
		this.index = index;

		const alignedMessageBufferByteSize = align(messagesCount * Uint32Array.BYTES_PER_ELEMENT, Uint32Array.BYTES_PER_ELEMENT);
		this.messageBuffer = new SharedArrayBuffer(alignedMessageBufferByteSize);
		this.intMessageBuffer = new Int32Array(this.messageBuffer, 0, alignedMessageBufferByteSize / Uint32Array.BYTES_PER_ELEMENT);
	}
}

export class WorkerSystem<WorkersCount extends number>
{
	public static readonly create = async <WorkersCount extends number>(workersCount: WorkersCount, messages: readonly string[]) =>
	{
		const system = new WorkerSystem<WorkersCount>(workersCount, messages);
		await system.initialize(messages);
		return system;
	}

	public readonly getBufferIndex = (worker: EngineWorker, msg: Message<any, any>) => (worker.index * (this.messageCount + 1)) + msg.index;

	public readonly workersCount: WorkersCount;
	public readonly messageCount: number;

	private readonly workers_: FixedArray<EngineWorker, WorkersCount>;

	public get workers(): ReadonlyArray<EngineWorker> { return [...this.workers_.data] }

	private constructor(workersCount: WorkersCount, messages: readonly string[])
	{
		this.messageCount = messages.length;
		
		this.workersCount = workersCount;
		this.workers_ = new FixedArray<EngineWorker, WorkersCount>(workersCount);
		

		for (let i = 0; i < workersCount; i++)
			this.workers_.set(i, new EngineWorker(i, this.messageCount));
	}

	private readonly initialize = async (messages: readonly string[]) =>
	{
		const results = await Promise.all(this.workers_.map((worker, index) => 
		{
			console.log(`Initializing worker ${index}...`);
			worker.nativeWorker.postMessage({
				message: 0,
				data: {
					index,
					messageBuffer: worker.messageBuffer,
					messages,
					workersCount: this.workersCount,
					messageCount: this.messageCount,
				}
			});
			return this.waitForWorker(worker, Message.WORKER_INITIALIZE_MESSAGE, 0);
		}).data);

		const index = results.findIndex(r => r !== "ok");
		
		if (index >= 0)
			throw new Error("Failed to initialize workers!");
	}

	public readonly emitMessage = <Args>(message: Message<any, Args>, data: Args, timeout?: number) =>
	{
		return Promise.all(this.workers.map((worker) => this.sendMessage(worker, message, data, timeout)));
	}

	public readonly sendMessage = async <Args>(worker: EngineWorker, message: Message<any, Args>, data: Args, timeout?: number) => 
	{
		const promise = this.waitForWorker(worker, message, 0, timeout);
		worker.nativeWorker.postMessage({ message: message.index, data });
		return [await promise, Atomics.load(worker.intMessageBuffer, message.index)];
	}

	private readonly waitForWorker = async (worker: EngineWorker, message: Message<any, any>, expectedValue: number, timeout?: number) =>
	{
		try
		{
			// console.log("wait for ", message.index);
			const { async, value } = Atomics.waitAsync(worker.intMessageBuffer, message.index, expectedValue as any, timeout);
			if (async)
				return await value;
			return value;
		}
		catch (e)
		{
			console.warn("Atomic failed with:", { worker, message });
			throw e;
		}
	}
}