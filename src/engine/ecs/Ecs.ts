import { Serializer } from "engine/serialize";
import { Arch } from "./Arch";
import { Component, createComponent } from "./Component";
import { Entity } from "./Entity";
import { ISystemHandler, System } from "./System";

export class Ecs
{
	private readonly registeredTypes_: Map<Serializer.Index<any>, number> = new Map();
	private readonly components: Component<any>[] = [];

	private readonly archLevels: Arch<any>[][] = [];

	public get rootArch(): Arch<[]> { return this.archLevels[0][0]; }

	public constructor()
	{
		this.addArch(0, 0, []);
	}

	private readonly addArch = <T extends Component<any>[]>(bitMask: number, level: number, components: T) =>
	{
		const arch = new Arch<T>(this, bitMask, level, components);
		if (!this.archLevels[level])
			this.archLevels[level] = [arch];
		else
			this.archLevels[level].push(arch);
		return arch;
	}

	public readonly registerComponent = <T extends Serializer.TypeInfo>(serializableType: Serializer.Index<T>): Component<T> =>
	{
		if (this.registeredTypes_.has(serializableType))
			throw new Error(`Serializable type is already registered as component!`);

		const index = this.components.length;
		const component = createComponent(serializableType, index);
		this.components.push(component);
		this.registeredTypes_.set(serializableType, index);
		return this.components[this.registeredTypes_.get(serializableType)!];
	}

	// public readonly getComponent = <T extends Serializer.TypeInfo>(serializableType: Serializer.Index<T>): Component<T> =>
	// {
	// 	if (!this.registeredTypes_.has(serializableType))
	// 		throw new Error(`Serializable type is not registered as component!`);
	// 	return this.components[this.registeredTypes_.get(serializableType)!];
	// }

	public readonly registerSystem = <T extends Component[]>(components: T, handler: ISystemHandler<T>): System<T> =>
	{
		return new System(this, components, handler);
	}

	public readonly addEntity = (): Entity => new Entity(this.rootArch, this.rootArch.pool.alloc());

	public readonly addComponent = (e: Entity, component: Component) =>
	{
		let arch: Arch<any> = e.arch.next[component.index];

		if (!arch)
		{
			const level = e.arch.level + 1;
			const bitMask = e.arch.bitMask | component.bitmask;

			if(!this.archLevels[level])
				for(let i = this.archLevels.length; i < level + 1; i++)
					this.archLevels[i] = [];

			const index = this.archLevels[level].findIndex(arch => arch.bitMask === bitMask);
			arch = index < 0 ? this.addArch(bitMask, level, [...e.arch.components, component]) : this.archLevels[level]![index]!;
			e.arch.next[component.index] = arch;
		}

		// copy from e.arch to arch 
		e.arch = arch;
		console.log(e.bufferIndex, e.getRaw())
	}
}