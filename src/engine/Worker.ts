import { FixedArray, Serializer } from "./serialize";

type Test = {
	a: number;
	b: number;
	c: FixedArray<number, 2>;
};

type WithChild = {
	test: Test,
	noice: boolean
};

class EngineWorker
{
	public static readonly main = async(): Promise<void> =>
	{
		console.log("EngineWorker.main() called!");
		self.onmessage = (e) =>
		{
			console.log(e.data.layouts)
			switch(e.data.message)
			{
				case "serialize-layouts":
					e.data.layouts.forEach((layout: any) => Serializer.createType(layout));
				
				const a = Serializer.getSerializable<Test>({ INDEX: 0 } as any);
				
				const buf = Serializer.createBuffer(a, 1024, true);
				
				for(let i = 0; i < 1024; i++)
				{
					a.serialize(buf, {
						a: i,
						b: i,
						c: new FixedArray(2, i, i)
					}, i * a.size);
				}

				self.postMessage({ message: "parse", data: buf });
			}
		}
	}
}

EngineWorker.main();