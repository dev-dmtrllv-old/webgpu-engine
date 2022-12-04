import { Arch } from "./Arch";
import { Component } from "./Component";

export class System<T extends Component[]>
{
	public readonly components: T;
	public readonly handler: ISystemHandler<T>

	public constructor(components: T, handler: ISystemHandler<T>)
	{
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