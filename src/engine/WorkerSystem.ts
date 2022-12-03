import { align } from "utils/math";
import { Engine, Message } from "./Engine";
import { FixedArray } from "./serialize";

class EngineWorker
{
	public readonly nativeWorker = new Worker(new URL("./Worker.ts", import.meta.url));
	public readonly index: number;

	public constructor(index: number)
	{
		this.index = index;
	}
}

export class WorkerSystem<WorkersCount extends number>
{
	public static readonly create = async <WorkersCount extends number>(workersCount: WorkersCount, messages: string[]) =>
	{
		const system = new WorkerSystem<WorkersCount>(workersCount, messages);
		await system.initialize(messages);
		return system;
	}

	public readonly getBufferIndex = (worker: EngineWorker, msg: Message<any, any>) => (worker.index * this.messageCount) + msg.index;

	public readonly workersCount: WorkersCount;
	public readonly messageCount: number;

	private readonly workers_: FixedArray<EngineWorker, WorkersCount>;
	private readonly messageBuffer_: SharedArrayBuffer;
	private readonly intMessageBuffer_: Int32Array;

	public get workers(): ReadonlyArray<EngineWorker> { return [...this.workers_.data] }

	private constructor(workersCount: WorkersCount, messages: string[])
	{
		this.messageCount = messages.length;
		const alignedMessageBufferByteSize = align(messages.length * workersCount * Uint32Array.BYTES_PER_ELEMENT, Uint32Array.BYTES_PER_ELEMENT);
		this.workersCount = workersCount;
		this.workers_ = new FixedArray<EngineWorker, WorkersCount>(workersCount);
		this.messageBuffer_ = new SharedArrayBuffer(alignedMessageBufferByteSize);
		this.intMessageBuffer_ = new Int32Array(this.messageBuffer_, 0, alignedMessageBufferByteSize / Uint32Array.BYTES_PER_ELEMENT);

		for (let i = 0; i < workersCount; i++)
			this.workers_.set(i, new EngineWorker(i));
	}

	private readonly initialize = async (messages: string[]) =>
	{
		const results = await Promise.all(this.workers_.map((worker, index) => 
		{
			worker.nativeWorker.postMessage({
				message: Engine.INITIALIZE_INDEX,
				data: {
					index,
					messageBuffer: this.messageBuffer_,
					messages,
					workersCount: this.workersCount,
					messageCount: this.messageCount,
				}
			});
			return this.waitForWorker(worker.index * this.messageCount, 0);
		}).data);

		if(results.find(r => r !== "ok"))
			throw new Error("Failed to initialize workers!");
	}

	public readonly emitMessage = <Args>(message: Message<any, Args>, data: Args, timeout?: number) =>
	{
		return Promise.all(this.workers.map((worker) => this.sendMessage(worker, message, data, timeout)));
	}

	public readonly sendMessage = <Args>(worker: EngineWorker, message: Message<any, Args>, data: Args, timeout?: number) => 
	{
		worker.nativeWorker.postMessage({ message: message.index, data });
		return this.waitForWorker(this.getBufferIndex(worker, message), 0, timeout);
	}

	private readonly waitForWorker = async (index: number, expectedValue: number, timeout?: number) =>
	{
		try
		{
			console.log("wait on index", index);
			const { async, value } = Atomics.waitAsync(this.intMessageBuffer_!, index, expectedValue as any, timeout);
			if (async)
				return await value;
			return value;
		}
		catch (e)
		{
			console.warn("Atomic failed with:", { index, expectedValue, timeout });
			throw e;
		}
	}
}