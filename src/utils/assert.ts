export class AssertException extends Error
{
	public readonly condition: string = "";

	public constructor(condition: AssertCondition, message?: string)
	{
		super(message, { cause: `${condition.toString()} evaluated to false!` });
	}
}

/**
 * 
 * @param condition The condition which should evaluate to true in normal circumstances
 * @param message The message to throw 
 */
export const assert = <R extends any = any>(condition: AssertCondition<R>, message?: string): R | never =>
{
	if (!condition())
		throw new AssertException(condition, message);
	return true as any;
}

export type AssertCondition<R extends any = any> = () => R;