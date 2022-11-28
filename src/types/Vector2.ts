import { Serializer } from "serialize";

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