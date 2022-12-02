import { FixedArray, Serializer } from "engine/serialize";

import { Engine } from "engine/Engine";

// Define the types which you want to serialze
type Test = {
	a: number;
	b: number;
	c: FixedArray<number, 2>;
};

// Create the serialzers for each type with property layout
const test = Serializer.createType<Test>({
	a: "u32",
	b: "u32",
	c: ["u32", 2]
}, "Test");

type WithChild = {
	test: Test,
	noice: boolean
};

const withChild = Serializer.createType<WithChild>({
	test: test,
	noice: "bool"
});
console.clear();
const engine = Engine.initialize(1);
