import { Arch } from "./Arch";
import { Component } from "./Component";
import { Ecs } from "./Ecs";

export class System<T extends Component[]>
{
	public readonly ecs: Ecs;
	public readonly components: T;
	public readonly handler: ISystemHandler<T>

	public constructor(ecs: Ecs, components: T, handler: ISystemHandler<T>)
	{
		this.ecs = ecs;
		this.components = components;
		this.handler = handler;
	}

	public readonly run = () =>
	{
		
	}
}

export interface ISystemHandler<T extends Component[]>
{
	(arch: Arch<T>[]): void;
}