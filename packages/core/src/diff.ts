// deno-lint-ignore-file no-explicit-any
import { lcs } from "@differ/core";

/**
 * Represents a diff entry, indicating a change between two sequences.
 * @template T The type of the content being compared.
 */
export interface DiffEntry<T> {
    /** The type of change: 'same', 'add', or 'delete'. */
    type: "same" | "add" | "delete";
    /** The original line number (present for 'same' and 'delete' entries). */
    leftLine?: number;
    /** The new line number (present for 'same' and 'add' entries). */
    rightLine?: number;
    /** The content of the diff entry. */
    content: T;
}

export interface DiffOptions {
    /** Optional function to do advanced comparisons of elements. Defaults to strict equality (===). */
    compareFn?: (a: any, b: any) => boolean;
    /** Whether to include numbering in the diff entries. Defaults to false. */
    includeEntryNumbering?: boolean;
}
/**
 * Calculates the sequential diff between two arrays, comparing elements at the same position.
 *
 * @template T The type of elements in the arrays.
 * @param left The first array.
 * @param right The second array.
 * @param options Options for diffing.
 * @returns An array of DiffEntry objects representing the sequential differences between the arrays.
 */
export function sequentialDiff<T>(left: T[], right: T[], options: DiffOptions = {}): DiffEntry<T>[] {
    const { compareFn, includeEntryNumbering = false } = options;
    const dp = lcs(left, right, compareFn);
    let leftIndex = left.length;
    let rightIndex = right.length;
    const result: DiffEntry<T>[] = [];
    let leftLine = leftIndex;
    let rightLine = rightIndex;

    while (leftIndex > 0 || rightIndex > 0) {
        const equal = leftIndex > 0 && rightIndex > 0 &&
            (compareFn ? compareFn(left[leftIndex - 1], right[rightIndex - 1]) : left[leftIndex - 1] === right[rightIndex - 1]);

        if (leftIndex > 0 && rightIndex > 0 && equal) {
            result.push({ type: "same", content: left[leftIndex - 1], ...(includeEntryNumbering && { leftLine, rightLine }) });
            leftIndex--;
            rightIndex--;
            if (includeEntryNumbering) {
                leftLine--;
                rightLine--;
            }
        } else if (rightIndex > 0 && (leftIndex === 0 || dp[leftIndex][rightIndex - 1] >= dp[leftIndex - 1][rightIndex])) {
            result.push({ type: "add", content: right[rightIndex - 1], ...(includeEntryNumbering && { rightLine }) });
            rightIndex--;
            if (includeEntryNumbering) rightLine--;
        } else if (leftIndex > 0) {
            result.push({ type: "delete", content: left[leftIndex - 1], ...(includeEntryNumbering && { leftLine }) });
            leftIndex--;
            if (includeEntryNumbering) leftLine--;
        }
    }

    return result.reverse();
}
