import { Ecs } from "ecs/Ecs";
import { Serializer } from "serialize";
import { Vector2 } from "types";

@Ecs.component()
@Serializer.register(Transform.layout)
export class Transform
{
	public static readonly layout = Serializer.createLayout<Transform>({
		position: Vector2,
		rotation: Vector2,
		scale: Vector2,
		isStatic: "bool"
	});

	public position: Vector2 = new Vector2();
	public rotation: Vector2 = new Vector2();
	public scale: Vector2 = new Vector2();
	public isStatic: boolean = false;
}