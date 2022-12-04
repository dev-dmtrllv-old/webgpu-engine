import { Component, ComponentHandle } from "./Component";
import { Ecs } from "./Ecs";

export type ArchBufferIndex = [number, number];

export class ArchBuffer
{
	public readonly size: number;
	public readonly capacity: number;
	public readonly byteSize: number;

	public readonly buffer: SharedArrayBuffer;

	private lastIndex: number = 0;

	public constructor(size: number, capacity: number)
	{
		this.size = size;
		this.capacity = capacity;
		this.byteSize = size * capacity;
		this.buffer = new SharedArrayBuffer(this.byteSize);
	}

	public alloc(): number
	{
		return this.lastIndex++;
	}

	public free(index: number)
	{
		this.lastIndex--;
	}
}

export class ArchPool
{
	private readonly buffers_: ArchBuffer[] = [];

	private lastIndex_: number = -1;
	public readonly size: number;
	public readonly capacity: number;

	public constructor(size: number, capacity: number)
	{
		this.size = size;
		this.capacity = capacity;
		this.addBuffer();
	}

	private addBuffer()
	{
		this.lastIndex_++;
		this.buffers_.push(new ArchBuffer(this.size, this.capacity));
	}

	public alloc(): ArchBufferIndex
	{
		const bufferIndex = this.lastIndex_;
		const index = this.buffers_[bufferIndex].alloc();
		if(index >= 1024)
			this.addBuffer();
		return [bufferIndex, index];
	}

	public free([bufferIndex, index]: ArchBufferIndex)
	{
		
	}

	public readonly getRaw = ([bufferIndex, index]: ArchBufferIndex) => new Uint8Array(this.buffers_[bufferIndex].buffer, index * this.size, this.size);
}

export class Arch<T extends Component[]>
{
	public readonly ecs: Ecs;
	public readonly bitMask: number;
	public readonly level: number;
	public readonly components: T;

	public readonly next: Arch<any>[] = [];

	public readonly pool: ArchPool;

	public constructor(ecs: Ecs, bitMask: number, level: number, components: T)
	{
		this.ecs = ecs;
		this.bitMask = bitMask;
		this.level = level;
		this.components = components;

		const size = components.reduce((prev, c) => prev + c.type.type.size, 0);
		console.log(components, size);
		this.pool = new ArchPool(size, 1024);
	}

	public readonly getComponent = <T extends Component>(component: T): T extends Component<infer R> ? ComponentHandle<T, R> : never =>
	{

		return null as any;
	}
} 