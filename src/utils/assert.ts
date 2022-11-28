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
export const assert = <T extends AssertCondition>(condition: T, message?: string): condition is any =>
{
	if (!condition())
		throw new AssertException(condition, message);
	return true;
}

export type AssertCondition = () => any;