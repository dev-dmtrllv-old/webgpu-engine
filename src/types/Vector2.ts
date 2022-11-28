import { FixedArray, Serializer } from "serialize";

@Serializer.register(Vector2.layout)
export class Vector2
{
	public static readonly layout = Serializer.createLayout<Vector2>({
		x: "f32",
		y: "f32"
	});

	public x: number = 0;
	public y: number = 0;

	public constructor(x: number = 0, y: number = 0)
	{
		this.x = x;
		this.y = y;
	}
}

@Serializer.register(Test.layout)
class Test
{
	public static readonly layout = Serializer.createLayout<Test>({
		a: "i8",
		b: "u16",
		c: ["f32", 4],
		d: [Vector2, 8]
	});

	public a: number = 0;
	public b: number = 0;
	public c: FixedArray<number, 4> = new FixedArray(4);
	public d: FixedArray<Vector2, 8> = new FixedArray(8);
}


const vectorSize = Serializer.getSize(Vector2);
const buffer = new ArrayBuffer(1024 * vectorSize); // make a buffer for 1024 Vector2s



for(let i = 0; i < 1024; i++)
{
	const v = new Vector2(i, i);
	Serializer.serialize(v, buffer, vectorSize * i);
}

console.log(buffer);

for(let i = 0; i < 1024; i++)
{
	const v = Serializer.parse(Vector2, buffer, vectorSize * i);
	console.log(v);
}