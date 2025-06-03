/**
 * Represents a diff entry for a Set.
 * @template T The type of the set elements.
 * @property {"added" | "removed" | "unchanged"} type - The type of change.
 * @property {T} value - The value that was added, removed, or unchanged.
 */
export type SetDiffEntry<T> = { type: "added" | "removed" | "unchanged", value: T };

/**
 * Computes the difference between two sets.
 *
 * @template T The type of the set elements.
 * @param {Set<T>} oldSet - The original set.
 * @param {Set<T>} newSet - The new set to compare against.
 * @param {boolean} [showUnchanged=false] - Whether to include unchanged elements in the result.
 * @returns {SetDiffEntry<T>[]} An array of diff entries indicating added, removed, and (optionally) unchanged elements.
 *
 * @example
 * const a = new Set([1, 2, 3]);
 * const b = new Set([2, 3, 4]);
 * diffSets(a, b);
 * // => [{type: "removed", value: 1}, {type: "added", value: 4}]
 */
export function diffSets<T>(oldSet: Set<T>, newSet: Set<T>, showUnchanged = false): SetDiffEntry<T>[] {
  const result: SetDiffEntry<T>[] = [];
  for (const value of oldSet) {
    if (!newSet.has(value)) result.push({ type: "removed", value });
    else if (showUnchanged) result.push({ type: "unchanged", value });
  }
  for (const value of newSet) {
    if (!oldSet.has(value)) result.push({ type: "added", value });
  }
  return result;
} 