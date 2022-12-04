import { Serializer } from "engine/serialize";

export const createComponent = <T extends Serializer.TypeInfo>(type: Serializer.Index<T>, index: number): Component<T> => Object.freeze(Object.seal(({
	index,
	bitmask: 1 << index,
	type
})));

export type ComponentHandle<T extends Component<Type>, Type extends Serializer.TypeInfo> = {
	view: DataView;
	component: T;
};

export type Component<T extends Serializer.TypeInfo = any> = {
	readonly index: number;
	readonly bitmask: number;
	readonly type: Serializer.Index<T>;
};