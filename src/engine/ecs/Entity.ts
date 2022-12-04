import { Arch, ArchBufferIndex } from "./Arch";
import { Component, ComponentHandle } from "./Component";

export class Entity
{
	public arch: Arch<any>;
	public bufferIndex: ArchBufferIndex;

	public constructor(arch: Arch<any>, bufferIndex: ArchBufferIndex)
	{
		this.arch = arch;
		this.bufferIndex = bufferIndex;
	}

	public addComponent<T extends Component>(component: T)
	{
		this.arch.ecs.addComponent(this, component);
		return this.arch.getComponent(component);
	}

	public getComponent<T extends Component>(): T extends Component<infer R> ? ComponentHandle<T, R> : never
	{
		return null as any;
	}

	public getRaw()
	{
		return this.arch.pool.getRaw(this.bufferIndex);
	}
};