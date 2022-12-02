import { assert } from "utils";
import { FixedArray, Serializer } from "./serialize";

export class Engine<WorkersCount extends number = 4>
{
	private static instance_: Engine<any> | null = null;

	public static get instance()
	{
		assert(() => Engine.instance_, "Engine is not initialized yet!");
		return Engine.instance_;
	}

	public static readonly initialize = <Workers extends number>(workers: Workers) =>
	{
		assert(() => !Engine.instance_, "Engine is already initialized!");
		Engine.instance_ = new Engine<Workers>(workers);
		return Engine.instance_;
	}

	private readonly workers: FixedArray<Worker, WorkersCount>;

	private constructor(workersCount: WorkersCount)
	{
		this.workers = new FixedArray<Worker, WorkersCount>(workersCount);

		for(let i = 0; i < workersCount; i++)
		{
			this.workers.set(i, new Worker(new URL("./Worker.ts", import.meta.url)));
			this.workers.at(i)!.onmessage = (e) => {
				for(let i = 0; i < 1024; i++)
				{
					const type = Serializer.getSerializable({ INDEX: 0 } as any);
					console.log(type.parse(e.data.data, i * type.size));
				}
			}
			this.workers.at(i)?.postMessage({ message: "serialize-layouts", layouts: Serializer.getRegisteredLayouts() });
		}
	}
}