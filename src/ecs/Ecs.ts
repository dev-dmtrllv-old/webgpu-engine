import { Serializer } from "serialize";
import { Arch } from "./Arch";
import { Entity } from "./Entity";

export namespace Ecs
{
	const BITMASK = Symbol();
	const BIT_INDEX = Symbol();
	
	export type ComponentClass = Class<any, any, {
		[BITMASK]: number;
		[BIT_INDEX]: number;
	}>;

	const components: ComponentClass[] = [];

	const entities: WeakRef<Entity>[] = [];

	const entityFinilizationRegistry = new FinalizationRegistry<number>((entityIndex) => 
	{
		delete entities[entityIndex];
	});

	export const getComponentBitmask = (Class: Class) => (Class as ComponentClass)[BITMASK] || 0;

	export const getComponentSize = (Class: Class) => Serializer.getSize(Class);

	export const component = (): ClassDecorator => (ctor: any) =>
	{
		const Class: ComponentClass = ctor;
		const index = components.push(Class) - 1;

		Class[BITMASK] = 1 << index;
		Class[BIT_INDEX] = index;
	};

	const rootArch = new Arch(0, 0, 0);

	export const addEntity = (): Entity =>
	{
		const [bufferIndex, index] = rootArch.alloc();
		const entity = new Entity(rootArch, bufferIndex, index);
		entityFinilizationRegistry.register(entity, entities.push(new WeakRef(entity)) - 1);
		return entity;
	};

	export const getComponentLayout = (index: number): Serializer.Prop[] =>
	{
		const Class = components[index];
		if (!Class)
			throw new Error();
		return Serializer.getLayout(Class);
	}

	export const getComponent = (index: number): ComponentClass =>
	{
		const Class = components[index];
		if (!Class)
			throw new Error();
		return Class;
	}

	export const getComponentIndex = <T>(Class: Class<T>) => (Class as ComponentClass)[BIT_INDEX] || 0;
}