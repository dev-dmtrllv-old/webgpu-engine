import { Component, Ecs } from "engine/ecs";
import { SpriteRenderer, SpriteRendererType } from "./SpriteRenderer";
import { Transform, TransformType } from "./Transform";

type Components = {
	Transform: Component<Transform>;
	SpriteRenderer: Component<SpriteRenderer>;
};

const components: Components = {
	Transform: null as any,
	SpriteRenderer: null as any
};

export const initializeComponents = (ecs: Ecs) =>
{
	components.Transform = ecs.registerComponent(TransformType);
	components.SpriteRenderer = ecs.registerComponent(SpriteRendererType);
};

export default components;