/**
 * Typeguard for narrowing to `keyof obj`
 */
export function isKeyOf<T>(
  key: string | number | symbol,
  obj: T,
): key is keyof T {
  return key in obj;
}
