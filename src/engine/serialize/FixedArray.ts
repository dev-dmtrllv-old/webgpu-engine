export class FixedArray<T, Size extends number>
{
	private data_: T[];

	public readonly capacity: Size;

	private length_: number = 0;
	private lastIndex_: number = 0;

	public get length() { return this.length_; };

	public get data(): ReadonlyArray<T> { return [...this.data_]; }

	public constructor(capacity: Size, ...data: T[])
	{
		this.data_ = new Array<T>(capacity);
		this.capacity = capacity;
		data.forEach(d => this.push(d));
	}

	public push(...items: T[])
	{
		for (let i = 0, l = items.length; i < l; i++)
		{
			this.data_[this.lastIndex_++] = items[i];
		}
		this.length_ += items.length;
		return this.length_;
	}

	public pop(): T
	{
		const r = this.data_[--this.lastIndex_];
		this.length_--;
		return r;
	}

	public set(index: number, item: T)
	{
		const set = this.data_[index] === undefined;
		this.length_ += +set;
		this.data_[index] = item;
	}

	public at(index: number): T | undefined
	{
		return this.data_[index];
	}

	public forEach(callback: (item: T, index: number, array: this) => any)
	{
		for (let i = 0, l = this.length_; i < l; i++)
			callback(this.data_[i], i, this);
	}

	public async asyncForEach(callback: (item: T, index: number, array: this) => any)
	{
		for (let i = 0, l = this.length_; i < l; i++)
			await callback(this.data_[i], i, this);
	}

	public map<Out>(callback: (item: T, index: number, array: this) => Out): FixedArray<Out, Size>
	{
		const out = new FixedArray<Out, Size>(this.capacity);

		for (let i = 0, l = this.length_; i < l; i++)
			out.set(i, callback(this.data_[i], i, this));

		return out;
	}
	
	public async asyncMap<Out>(callback: (item: T, index: number, array: this) => Out): Promise<FixedArray<Out, Size>>
	{
		const out = new FixedArray<Out, Size>(this.capacity);

		for (let i = 0, l = this.length_; i < l; i++)
			await out.set(i, callback(this.data_[i], i, this));

		return out;
	}
}