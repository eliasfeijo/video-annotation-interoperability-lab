/** Small shared helper: normalize a single value or array. */
export function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}