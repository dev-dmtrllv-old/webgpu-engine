import { FixedArray, Serializer } from "core/serialize";

// Define the types which you want to serialze
type Child = {
	a: number;
	b: number;
	c: FixedArray<number, 2>;
};

type Test = {
	childA: Child;
	childB: Child;
};

// Create the serialzers for each type with property layout
const child = Serializer.createType<Child>({
	a: "u32",
	b: "u32",
	c: ["u32", 2]
}, "Child");

const test = Serializer.createType<Test>({
	childA: child,
	childB: child
}, "Test");


// create a buffe which holds 5 `Test` objects
const buffer = Serializer.createBuffer(test, 5);

// fill the buffer
for (let i = 0; i < 5; i++)
{
	test.serialize(buffer, {
		childA: {
			a: i,
			b: i,
			c: new FixedArray(2, i, i)
		},
		childB: {
			a: 2 * i,
			b: 2 * i,
			c: new FixedArray(2, 2 * i, 2 * i)
		}
	}, i * test.size);
}

// parse the buffer
for (let i = 0; i < 5; i++)
{
	console.log(test.parse(buffer, i * test.size));
}