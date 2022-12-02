export class FixedArray<T, Size extends number>
{
	private data_: T[];

	public readonly capacity: Size;

	private length_: number = 0;
	public get length() { return this.length_; };
	private lastIndex_: number = 0;

	public constructor(capacity: Size, ...data: T[])
	{
		this.data_ = new Array<T>(capacity);
		this.capacity = capacity;
		data.forEach(d => this.push(d));
	}

	public push(...items: T[])
	{
		for(let i = 0, l = items.length; i< l; i++)
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
		const set = this.data_[index] !== undefined;
		this.length_ += +set;
		this.data_[index] = item;
	}

	public at(index: number): T | undefined
	{
		return this.data_[index];
	}
}