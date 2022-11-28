import { FixedArray } from "./FixedArray";

export namespace Serializer
{
	type Type<T, K extends keyof T> = T[K] extends FixedArray<infer Type, infer Size> ? ArrayType<Type extends number ? PrimitiveType : Class<Type>, Size> : PrimitiveType | Class<T[K]>;

	type ArrayType<T, Size extends number> = [T, Size];

	export type ClassLayout<T> = {
		[K in keyof T]?: Type<T, K>;
	};

	export type Prop = {
		name: string;
		offset: number;
		size: number;
		type: Type<any, any>;
		parser: Parser;
		serializer: Serializer;
	};

	type PrimitiveType = keyof typeof primitiveSizes;

	type SerializeClass<T = any> = Class<T, any, {
		[SIZE]: number;
		[LAYOUT]: Prop[];
		[PARSER]: Parser;
		[SERIALIZER]: Serializer;
	}>;

	const LAYOUT = Symbol();
	const SIZE = Symbol();
	const PARSER = Symbol();
	const SERIALIZER = Symbol();

	const primitiveSizes = {
		u8: 1,
		i8: 1,
		u16: 2,
		i16: 2,
		u32: 4,
		i32: 4,
		f32: 4,
		f64: 8,
		bool: 1
	};

	type Parser = (view: DataView, offset: number) => any;

	type Serializer<Value = any> = (view: DataView, offset: number, value: Value) => any;

	const primitiveParsers: { [K in keyof typeof primitiveSizes]: Parser } = {
		u8: (view, offset) => view.getUint8(offset),
		i8: (view, offset) => view.getInt8(offset),
		u16: (view, offset) => view.getUint16(offset),
		i16: (view, offset) => view.getInt16(offset),
		u32: (view, offset) => view.getUint32(offset),
		i32: (view, offset) => view.getInt32(offset),
		f32: (view, offset) => view.getFloat32(offset),
		f64: (view, offset) => view.getFloat64(offset),
		bool: (view, offset) => Boolean(view.getUint8(offset)),
	};

	const primitiveSerializers: { [K in keyof typeof primitiveSizes]: Serializer } = {
		u8: (view, offset, value) => view.setUint8(offset, value),
		i8: (view, offset, value) => view.setInt8(offset, value),
		u16: (view, offset, value) => view.setUint16(offset, value),
		i16: (view, offset, value) => view.setInt16(offset, value),
		u32: (view, offset, value) => view.setUint32(offset, value),
		i32: (view, offset, value) => view.setInt32(offset, value),
		f32: (view, offset, value) => view.setFloat32(offset, value),
		f64: (view, offset, value) => view.setFloat64(offset, value),
		bool: (view, offset, value) => view.setUint8(offset, value),
	};

	const getPrimitiveSize = (key: PrimitiveType): number => primitiveSizes[key];
	const getClassSize = (Class: SerializeClass): number => Class[SIZE] || 0;

	const getTypeSize = (type: any): number =>
	{
		switch (typeof type)
		{
			case "string":
				return getPrimitiveSize(type as PrimitiveType);
			case "function":
				return getClassSize(type);
			default:
				if (Array.isArray(type))
				{
					const [itemType, size] = type;
					return getTypeSize(itemType) * size;
				}
				throw new Error(`Could not get size for `, type);
		}
	};

	const createClassParser = (type: Class, layout: Prop[]): Parser => (view, classOffset) =>
	{
		const obj = new type();
		layout.forEach(({ name, offset, parser }) => 
		{
			obj[name] = parser(view, classOffset + offset);
		});
		return obj;
	};
	
	const createClassSerializer = (layout: Prop[]): Serializer => (view, classOffset, data) =>
	{
		layout.forEach(({ name, offset, serializer }) => 
		{
			serializer(view, classOffset + offset, data[name]);
		});
	};

	const getArrayParser = ([type, size]: ArrayType<Class | PrimitiveType, any>): Parser =>
	{
		const itemSize = getTypeSize(type);
		const parser = getParser(type);

		switch (typeof type)
		{
			case "string":
			case "function":
				return (view, offset) => 
				{
					const arr = new FixedArray(size);
					for (let i = 0; i < size; i++)
						arr.set(i, parser(view, offset + (i * itemSize)));
					return arr;
				};
			default:
				throw new Error(`Could not get parser for `, type);
		}
	};

	const getPrimitiveParser = (type: PrimitiveType) => primitiveParsers[type];
	const getClassParser = (type: SerializeClass) => type[PARSER];

	const getParser = (type: any): Parser =>
	{
		switch (typeof type)
		{
			case "string":
				return getPrimitiveParser(type as PrimitiveType);
			case "function":
				return getClassParser(type);
			default:
				if (Array.isArray(type))
					return getArrayParser(type as ArrayType<any, any>);
				throw new Error(`Could not get size for `, type);
		}
	};

	const getArraySerializer = ([type, size]: ArrayType<Class | PrimitiveType, any>): Serializer =>
	{
		const itemSize = getTypeSize(type);
		const serializer = getSerializer(type);

		switch (typeof type)
		{
			case "string":
			case "function":
				return (view, offset, value) => 
				{
					const arr = value as FixedArray<any, any>;
					for (let i = 0; i < size; i++)
						serializer(view, offset + (i * itemSize), arr.at(i));
				};
			default:
				throw new Error(`Could not get parser for `, type);
		}
	}

	const getPrimitiveSerializer = (type: PrimitiveType) => primitiveSerializers[type];
	const getClassSerializer = (type: SerializeClass) => type[SERIALIZER];

	const getSerializer = (type: any): Serializer =>
	{
		switch (typeof type)
		{
			case "string":
				return getPrimitiveSerializer(type as PrimitiveType);
			case "function":
				return getClassSerializer(type);
			default:
				if (Array.isArray(type))
					return getArraySerializer(type as ArrayType<any, any>);
				throw new Error(`Could not get size for `, type);
		}
	}

	const createSerializeInfo = <T>(layout: ClassLayout<T>) => 
	{
		const orderedLayout: Prop[] = [];

		let totalSize = 0;

		for (const key in layout)
		{
			const type = layout[key];
			const size = getTypeSize(type);

			orderedLayout.push({
				name: key as string,
				offset: totalSize,
				size,
				type,
				parser: getParser(type),
				serializer: getSerializer(type),
			});

			totalSize += size;
		}

		return {
			layout: orderedLayout,
			size: totalSize
		};
	};

	export const register = <T>(layout: ClassLayout<T>): ClassDecorator => (ctor: any) => 
	{
		const info = createSerializeInfo(layout);
		ctor[LAYOUT] = info.layout;
		ctor[SIZE] = info.size;
		ctor[PARSER] = createClassParser(ctor, info.layout);
		ctor[SERIALIZER] = createClassSerializer(info.layout);
	};

	export const serialize = <T>(obj: T, buffer: ArrayBuffer, offset: number = 0) =>
	{
		const Class = obj.constructor as SerializeClass<T>;
		const size = getClassSize(Class);
		const view = new DataView(buffer, offset, size);
		const serializer = getClassSerializer(Class);
		serializer(view, 0, obj);
	}

	export const parse = <T>(obj: Class<T>, buffer: ArrayBuffer, offset: number = 0) =>
	{
		const Class = obj as SerializeClass;
		const size = getClassSize(Class);
		const view = new DataView(buffer, offset, size);
		const parser = getClassParser(Class);
		return parser(view, 0);
	}

	export const createLayout = <T>(layout: ClassLayout<T>): ClassLayout<T> => layout;

	export const getSize = <T>(Class: Class<T, any, any>): number => Class[SIZE] || 0;

	export const getLayout = <T>(Class: Class<T, any, any>): Serializer.Prop[] => Class[LAYOUT];
}
