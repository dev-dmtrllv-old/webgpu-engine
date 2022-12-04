import { Vector2, Vector2Type } from "engine/Vector";
import { Serializer } from "../serialize";

export type SpriteRenderer = {
	scale: Vector2;
	spriteIndex: number;
};

export const SpriteRendererType = Serializer.createType<SpriteRenderer>({
	scale: Vector2Type,
	spriteIndex: "u32"
}, "SpriteRenderer");