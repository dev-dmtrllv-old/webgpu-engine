import { Serializer } from "core/serialize";
import { assert } from "utils";
import { Ecs } from "./Ecs";

class ArchBuffer
{
	public readonly buffer: ArrayBuffer;
	public readonly capacity: number;
	public readonly itemSize: number;
	public readonly bytes: number;
	private index_: number = 0;

	public constructor(itemSize: number, capacity: number = 1024)
	{
		this.capacity = capacity;
		this.itemSize = itemSize;
		this.bytes = this.capacity * this.itemSize;
		this.buffer = new ArrayBuffer(itemSize * capacity);
	}

	public readonly alloc = (): [number, boolean] => 
	{
		const offset = this.index_++ * this.itemSize;
		return [offset, this.index_ * this.itemSize >= this.bytes];
	}

	public readonly getLast = (): number =>
	{
		const i = this.index_ - 1;
		return i * this.itemSize;
	}

}

class ArchPool
{
	public readonly itemSize: number;
	public readonly buffers: ArchBuffer[];
	private index_: number = 0;

	public constructor(itemSize: number)
	{
		this.itemSize = itemSize;
		this.buffers = [new ArchBuffer(itemSize)];
	}

	private pushBuffer = () =>
	{
		this.buffers.push(new ArchBuffer(this.itemSize));
		this.index_++;
	}

	public readonly popBuffer = () =>
	{
		this.buffers.pop();
		this.index_--;
	}

	public readonly getLast = (): [number, number] =>
	{
		const offset = this.buffers[this.index_].getLast();

		if (offset < 0)
		{
			if (this.index_ == 0)
				return [-1, -1];
			return [this.index_ - 1, this.buffers[this.index_ - 1].getLast()];
		}

		return [this.index_, offset];
	}

	public readonly alloc = (): [number, number] =>
	{
		const [offset, isLast] = this.buffers[this.index_].alloc();
		if (isLast)
			this.pushBuffer();
		return [this.index_, offset];
	}

	public readonly getRaw = (bufferIndex: number, offset: number): Uint8Array => new Uint8Array(this.buffers[bufferIndex].buffer, offset, this.itemSize);
}

export class Arch
{
	private static arches: Arch[][] = [];

	private static getArch = (bitMask: number, level: number, size: number) =>
	{
		const levelArches = this.arches[level];
		if (levelArches)
		{
			let found = levelArches.find(a => a.bitMask === bitMask);
			if (!found)
			{
				found = new Arch(bitMask, level, size);
				levelArches.push(found);
			}
			return found;
		}
		else
		{
			const arch = new Arch(bitMask, level, size);
			this.arches[level] = [arch];
			return arch;
		}
	}

	public readonly bitMask: number;
	public readonly level: number;
	private readonly pool_: ArchPool;
	private readonly prev_: Map<number, Arch> = new Map();
	private readonly next_: Map<number, Arch> = new Map();
	private readonly size_: number;

	private readonly layout: Map<number, [number, number, Serializer.Prop[]]> = new Map();

	public constructor(bitMask: number, level: number, itemSize: number)
	{
		this.bitMask = bitMask;
		this.level = level;
		this.size_ = itemSize;
		this.pool_ = new ArchPool(itemSize);

		let test = 1;
		let index = 0;
		let offset = 0;

		while (test <= bitMask)
		{
			if ((test & bitMask) === test)
			{
				const s = Serializer.getSize(Ecs.getComponent(index));
				const o = offset;
				this.layout.set(index, [o, s, Ecs.getComponentLayout(index)]);
				offset += s;
			}

			test = 1 << ++index;
		}

		if (!Arch.arches[level])
			Arch.arches[level] = [this];
		else
			Arch.arches[level].push(this);
	}

	public readonly alloc = (): [number, number] =>
	{
		return this.pool_.alloc();
	}

	public readonly getNext = (type: Ecs.ComponentClass) =>
	{
		const bitMask = Ecs.getComponentBitmask(type);
		let next = this.next_.get(bitMask);
		if (!next)
		{
			const archBitMask = bitMask | this.bitMask;
			const nextLevel = this.level + 1;
			const size = this.size_ + Ecs.getComponentSize(type);
			next = Arch.getArch(archBitMask, nextLevel, size);
			this.next_.set(bitMask, next);
			next.prev_.set(this.bitMask, this);
		}
		return next;
	}

	public readonly free = (bufferIndex: number, offset: number) =>
	{
		const [lastBufferIndex, lastOffset] = this.pool_.getLast();
		assert(() => lastBufferIndex > -1 && lastOffset > -1, ":(");
		this.pool_.getRaw(bufferIndex, offset).set(this.pool_.getRaw(lastBufferIndex, lastOffset));
		if (lastOffset === 0)
			this.pool_.popBuffer();
	}

	public readonly allocFrom = (arch: Arch, bufferIndex: number, offset: number): [number, number] =>
	{
		const fromLayout = arch.layout;

		const srcBuf = arch.pool_.getRaw(bufferIndex, offset);
		const [dstBufIndex, dstOffset] = this.alloc();
		const dstBuf = this.pool_.getRaw(dstBufIndex, dstOffset);

		this.layout.forEach((dst, componentIndex) => 
		{
			const src = fromLayout.get(componentIndex);
			if (src)
			{
				const srcOffset = src[0];
				const size = src[1];
				dstBuf.set(srcBuf.slice(srcOffset, srcOffset + size), dst[0]);
			}
		});

		arch.free(bufferIndex, offset);

		return [dstBufIndex, dstOffset];
	}

	public readonly getComponent = <T>(bufferIndex: number, offset: number, Class: Class<T>) =>
	{
		const [componentOffset] = this.layout.get(Ecs.getComponentIndex(Class))!;
		return Serializer.parse(Class, this.pool_.buffers[bufferIndex].buffer, offset + componentOffset);
	}

	public readonly flushComponent = <T>(bufferIndex: number, offset: number, component: T) =>
	{
		const [componentOffset] = this.layout.get(Ecs.getComponentIndex((component as any).constructor))!;
		Serializer.serialize(component, this.pool_.buffers[bufferIndex].buffer, offset + componentOffset);
	}
}