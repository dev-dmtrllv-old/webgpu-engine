import { Serializer } from "engine/serialize";

const INDEX = Symbol("INDEX");
const BITMASK = Symbol("BITMASK");

export const createComponent = <T extends Serializer.TypeInfo>(type: Serializer.Index<T>, index: number) => ({
	[INDEX]: index,
	[BITMASK]: 1 << index,
	type
});

export type Component<T extends Serializer.TypeInfo = any> = {
	[INDEX]: number;
	[BITMASK]: number;
	type: Serializer.Index<T>;
};