import { Serializer } from "./serialize";

export type Vector2 = { x: number, y: number };

export const Vector2Type = Serializer.createType<Vector2>({
	x: "f32",
	y: "f32"
});