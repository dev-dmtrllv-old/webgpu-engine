
export const immutable = <T extends ImmutableTypes>(obj: T): Immutable<T> => Object.freeze(Object.seal(obj)) as Immutable<T>;