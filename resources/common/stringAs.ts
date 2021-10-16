export function stringButActually<T extends string>(): (str: T) => T;
export function stringButActually<T extends string>(str: T): T;
export function stringButActually<T extends string>(
  ...args: [T] | []
): T | ((str: T) => T) {
  if (args.length === 0) {
    return stringButActually;
  } else {
    return args[0];
  }
}
