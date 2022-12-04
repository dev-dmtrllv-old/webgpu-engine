import { Vector2, Vector2Type } from "engine/Vector";
import { Serializer } from "../serialize";

export type Transform = {
	position: Vector2;
	rotation: Vector2;
	scale: Vector2
};

export const TransformType = Serializer.createType<Transform>({
	position: Vector2Type,
	rotation: Vector2Type,
	scale: Vector2Type
});