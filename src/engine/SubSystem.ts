import { Engine } from "./Engine";

export abstract class SubSystem
{
	private static index_: number;

	public static get index(): number
	{
		return this.index_;
	}

	public readonly engine: Engine;

	public constructor(engine: Engine)
	{
		this.engine = engine;
	}
}