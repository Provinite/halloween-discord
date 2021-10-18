/**
 * Create a type-safety identity function that takes in the specified type.
 * Useful for narrowing strings to enums
 * @example
 * ```typescript
 * const colName = stringButActually<keyof RecordType>();
 * const idColName = colName("id"); // generates a compile-time error if "id" is not a keyof RecordType
 * ```
 */
export function stringButActually<T extends string>(): (str: T) => T;
/**
 * Type-safety identity function for narrowing strings to a more specific type
 * @example
 * ```typescript
 * // generates a compile-time error if "id" is not a keyof RecordType
 * const idColName = stringButActually<keyof RecordType>("id");
 * ```
 * @param str The string to narrow
 */
export function stringButActually<T extends string>(str: T): T;
/**
 * Implementation, see overloads.
 */
export function stringButActually<T extends string>(
  ...args: [T] | []
): T | ((str: T) => T) {
  if (args.length === 0) {
    return stringButActually;
  } else {
    return args[0];
  }
}
