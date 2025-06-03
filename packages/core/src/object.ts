// deno-lint-ignore-file no-explicit-any
type ObjectDiffType = "unchanged" | "added" | "removed" | "modified";

export interface ObjectDiffEntry {
    type: ObjectDiffType;
    path: string[];
    oldValue?: unknown;
    newValue?: unknown;
}

/**
 * Options for object diffing.
 */
export interface ObjectDiffOptions {
    /** Whether to include unchanged properties in the output. Defaults to false. */
    includeUnchanged?: boolean;
    /** Custom comparison function for values. Defaults to strict equality (===). */
    compareFn?: (a: unknown, b: unknown) => boolean;
}

/**
 * Calculates the differences between two objects.
 *
 * @param oldObj The original object
 * @param newObj The modified object
 * @param options Options for diffing
 * @returns An array of ObjectDiffEntry objects representing the changes
 */
export function diffObjects(
    oldObj: Record<string, any>,
    newObj: Record<string, any>,
    options: ObjectDiffOptions = {},
): ObjectDiffEntry[] {
    const { includeUnchanged = false, compareFn } = options;
    const result: ObjectDiffEntry[] = [];

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
        const oldValue = oldObj[key];
        const newValue = newObj[key];

        const inOld = key in oldObj;
        const inNew = key in newObj;

        if (inOld && inNew) {
            if (
                typeof oldValue === "object" && oldValue !== null &&
                typeof newValue === "object" && newValue !== null &&
                !Array.isArray(oldValue) && !Array.isArray(newValue)
            ) {
                // Recursively diff nested objects
                const nestedDiffs = diffObjects(oldValue, newValue, options);
                result.push(...nestedDiffs.map((diff) => ({
                    ...diff,
                    path: [key, ...diff.path],
                })));
            } else {
                const equal = compareFn ? compareFn(oldValue, newValue) : oldValue === newValue;
                if (!equal || includeUnchanged) {
                    result.push({
                        type: equal ? "unchanged" : "modified",
                        path: [key],
                        oldValue,
                        newValue,
                    });
                }
            }
        } else if (inOld) {
            result.push({
                type: "removed",
                path: [key],
                oldValue,
            });
        } else {
            result.push({
                type: "added",
                path: [key],
                newValue,
            });
        }
    }

    return result;
}

/**
 * Formats object differences as a string.
 *
 * @param diffs Array of ObjectDiffEntry objects
 * @returns A formatted string representation of the differences
 */
export function formatObjectDiff(diffs: ObjectDiffEntry[]): string {
    return diffs.map((diff) => {
        const path = diff.path.join(".");
        switch (diff.type) {
            case "added":
                return `+ ${path}: ${JSON.stringify(diff.newValue)}`;
            case "removed":
                return `- ${path}: ${JSON.stringify(diff.oldValue)}`;
            case "modified":
                return `~ ${path}: ${JSON.stringify(diff.oldValue)} → ${JSON.stringify(diff.newValue)}`;
            case "unchanged":
                return `  ${path}: ${JSON.stringify(diff.oldValue)}`;
        }
    }).join("\n");
}
