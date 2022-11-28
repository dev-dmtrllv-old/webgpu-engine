import { assert } from "utils";
import { Arch } from "./Arch";
import { Ecs } from "./Ecs";

export class Entity
{
	private arch_: Arch;
	private bufferIndex_: number;
	private index_: number;

	public constructor(arch: Arch, bufferIndex: number, index: number)
	{
		this.arch_ = arch;
		this.bufferIndex_ = bufferIndex;
		this.index_ = index;
	}

	public readonly addComponent = <T>(Class: Class<T>) =>
	{
		const nextArch = this.arch_.getNext(Class as Ecs.ComponentClass);
		const [bi, i] = nextArch.allocFrom(this.arch_, this.bufferIndex_, this.index_);
		this.arch_ = nextArch;
		this.bufferIndex_ = bi;
		this.index_ = i;
	}

	public readonly getComponent = <T>(Class: Class<T>): T => this.arch_.getComponent(this.bufferIndex_, this.index_, Class);

	public readonly flushComponent = <T>(component: T) => this.arch_.flushComponent(this.bufferIndex_, this.index_, component);
}