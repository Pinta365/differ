import type { DiffEntry } from "@differ/core";

/**
 * Options for formatting diff output as JSON.
 *
 * @property {number} [contextLines] - Number of unchanged lines to show around changed lines in the diff output. Default: 3.
 * @property {boolean} [showLineNumbers] - Whether to include line numbers in the output. Default: true.
 */
export interface FormatForJSONOptions {
    contextLines?: number;
    showLineNumbers?: boolean;
}

/**
 * Formats diff entries into a JSON string for further processing or display.
 *
 * @param {DiffEntry<string>[]} diffEntries - An array of DiffEntry objects representing the diff.
 * @param {FormatForJSONOptions} [options] - Formatting options.
 * @returns {string} A JSON string representing the diff, including options and the diff array.
 *
 * The output object has the following structure:
 * {
 *   options: { contextLines: number, showLineNumbers: boolean },
 *   diff: Array<...>
 * }
 *
 * Each entry in the diff array is either:
 *   - { type: "unchanged" | "added" | "removed" | "omitted", lineNumbers?: { old?: number, new?: number }, content?: string, count?: number }
 */
export function formatForJSON(
    diffEntries: DiffEntry<string>[],
    options: FormatForJSONOptions = {},
): string {
    const { contextLines = 3, showLineNumbers = true } = options;

    const diff = [];

    if (contextLines === 0) {
        for (const entry of diffEntries) {
            if (entry.type !== "same") {
                diff.push(createChangeEntry(entry, showLineNumbers));
            }
        }
        return JSON.stringify(
            { options: { contextLines, showLineNumbers }, diff },
            null,
            2,
        );
    }

    const changeIndexes: number[] = [];
    diffEntries.forEach((entry, index) => {
        if (entry.type !== "same") changeIndexes.push(index);
    });

    if (changeIndexes.length === 0) {
        for (const entry of diffEntries) {
            diff.push(createSameEntry(entry, showLineNumbers));
        }
        return JSON.stringify(
            { options: { contextLines, showLineNumbers }, diff },
            null,
            2,
        );
    }

    const ranges: Array<{ start: number; end: number }> = [];
    for (const index of changeIndexes) {
        ranges.push({
            start: Math.max(0, index - contextLines),
            end: Math.min(diffEntries.length - 1, index + contextLines),
        });
    }
    ranges.sort((a, b) => a.start - b.start);

    const mergedRanges: Array<{ start: number; end: number }> = [];
    let currentRange = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
        const nextRange = ranges[i];
        if (nextRange.start <= currentRange.end + 1) {
            currentRange.end = Math.max(currentRange.end, nextRange.end);
        } else {
            mergedRanges.push(currentRange);
            currentRange = nextRange;
        }
    }
    mergedRanges.push(currentRange);

    let previousEnd = -1;
    for (const range of mergedRanges) {
        const currentStart = range.start;
        const currentEnd = range.end;
        let skippedLines = 0;
        if (previousEnd === -1) {
            skippedLines = currentStart;
        } else if (currentStart > previousEnd + 1) {
            skippedLines = currentStart - previousEnd - 1;
        }
        if (skippedLines > 0) {
            diff.push({ type: "omitted", count: skippedLines });
        }
        for (let i = currentStart; i <= currentEnd; i++) {
            const entry = diffEntries[i];
            if (entry.type === "same") {
                diff.push(createSameEntry(entry, showLineNumbers));
            } else {
                diff.push(createChangeEntry(entry, showLineNumbers));
            }
        }
        previousEnd = currentEnd;
    }
    if (previousEnd < diffEntries.length - 1) {
        const skippedLines = diffEntries.length - 1 - previousEnd;
        if (skippedLines > 0) {
            diff.push({ type: "omitted", count: skippedLines });
        }
    }

    return JSON.stringify(
        { options: { contextLines, showLineNumbers }, diff },
        null,
        2,
    );
}

// Internal helper to create an unchanged entry for JSON output.
function createSameEntry(entry: DiffEntry<string>, showLineNumbers: boolean) {
    return {
        type: "unchanged",
        lineNumbers: showLineNumbers
            ? {
                old: entry.leftLine,
                new: entry.rightLine,
            }
            : undefined,
        content: entry.content,
    };
}

// Internal helper to create a changed entry for JSON output.
function createChangeEntry(entry: DiffEntry<string>, showLineNumbers: boolean) {
    return {
        type: entry.type === "add" ? "added" : "removed",
        lineNumbers: showLineNumbers
            ? {
                old: entry.type === "add" ? undefined : entry.leftLine,
                new: entry.type === "delete" ? undefined : entry.rightLine,
            }
            : undefined,
        content: entry.content,
    };
}
