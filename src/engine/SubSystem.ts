import { Engine } from "./Engine";

export abstract class SubSystem
{
	private static index_: number = -1;

	public static get index(): number
	{
		return this.index_;
	}

	public readonly engine: Engine;

	public constructor(engine: Engine)
	{
		this.engine = engine;
	}

	public abstract initialize(): any;
	public abstract terminate(): any;
}

export type SubSystemType<T extends SubSystem> = new (engine: Engine) => T;