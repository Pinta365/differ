/**
 * Represents a diff entry for a Map.
 * @template K The type of the map keys.
 * @template V The type of the map values.
 * @property {"added" | "removed" | "modified" | "unchanged"} type - The type of change.
 * @property {K} key - The key that was added, removed, modified, or unchanged.
 * @property {V} [value] - The value for added, removed, or unchanged entries.
 * @property {V} [oldValue] - The old value for modified entries.
 * @property {V} [newValue] - The new value for modified entries.
 */
export type MapDiffEntry<K, V> =
    | { type: "added"; key: K; value: V }
    | { type: "removed"; key: K; value: V }
    | { type: "modified"; key: K; oldValue: V; newValue: V }
    | { type: "unchanged"; key: K; value: V };

/**
 * Computes the difference between two maps.
 *
 * @template K The type of the map keys.
 * @template V The type of the map values.
 * @param {Map<K, V>} oldMap - The original map.
 * @param {Map<K, V>} newMap - The new map to compare against.
 * @param {boolean} [showUnchanged=false] - Whether to include unchanged entries in the result.
 * @param {(a: V, b: V) => boolean} [compareFn=(a, b) => a === b] - Optional custom comparison function for values.
 * @returns {MapDiffEntry<K, V>[]} An array of diff entries indicating added, removed, modified, and (optionally) unchanged entries.
 *
 * @example
 * const a = new Map([["x", 1], ["y", 2]]);
 * const b = new Map([["y", 2], ["z", 3]]);
 * diffMaps(a, b);
 * // => [{type: 'removed', key: 'x', value: 1}, {type: 'added', key: 'z', value: 3}, {type: 'unchanged', key: 'y', value: 2}]
 */
export function diffMaps<K, V>(
    oldMap: Map<K, V>,
    newMap: Map<K, V>,
    showUnchanged = false,
    compareFn: (a: V, b: V) => boolean = (a, b) => a === b,
): MapDiffEntry<K, V>[] {
    const result: MapDiffEntry<K, V>[] = [];
    for (const [key, oldValue] of oldMap) {
        if (!newMap.has(key)) result.push({ type: "removed", key, value: oldValue });
        else {
            const newValue = newMap.get(key)!;
            if (!compareFn(oldValue, newValue)) result.push({ type: "modified", key, oldValue, newValue });
            else if (showUnchanged) result.push({ type: "unchanged", key, value: oldValue });
        }
    }
    for (const [key, newValue] of newMap) {
        if (!oldMap.has(key)) result.push({ type: "added", key, value: newValue });
    }
    return result;
}
