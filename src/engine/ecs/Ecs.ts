import { Serializer } from "engine/serialize";
import { Component, createComponent } from "./Component";
import { ISystemHandler, System } from "./System";

export class Ecs
{
	private readonly registeredTypes_: Map<Serializer.Index<any>, number> = new Map();
	private readonly components: Component<any>[] = [];

	public constructor()
	{

	}

	public readonly getComponent = <T extends Serializer.TypeInfo>(serializableType: Serializer.Index<T>): Component<T> =>
	{
		if(!this.registeredTypes_.has(serializableType))
		{
			const index = this.components.length;
			const component = createComponent(serializableType, index);
			this.components.push(component);
			this.registeredTypes_.set(serializableType, index);
		}
		return this.components[this.registeredTypes_.get(serializableType)!];
	}

	public readonly registerSystem = <T extends Component[]>(components: T, handler: ISystemHandler<T>) =>
	{
		
	}
}