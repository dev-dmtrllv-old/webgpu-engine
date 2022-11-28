export class AssertException extends Error
{
	public readonly condition: string;

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
export const assert = (condition: AssertCondition, message?: string) =>
{
	if (!condition())
		throw new AssertException(condition, message);
}

export type AssertCondition = () => any;