import { Ecs } from "ecs/Ecs";
import { Serializer } from "core/serialize";
import { Vector2 } from "core/types";

@Ecs.component()
@Serializer.register(SpriteRenderer.layout)
export class SpriteRenderer
{
	public static readonly layout = Serializer.createLayout<SpriteRenderer>({
		sprite: "u32",
		scale: Vector2,
	});

	public sprite: number = 0;
	public scale: Vector2 = new Vector2();
}
