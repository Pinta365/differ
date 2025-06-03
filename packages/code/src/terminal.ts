import { AnsiColour } from "@differ/code";
import type { DiffEntry } from "@differ/core";

/**
 * Options for formatting diff output in a terminal.
 */
export interface FormatForTerminalOptions {
    /** Whether to use ANSI colour codes in the output. Defaults to true. */
    useColours?: boolean;
    /** This option control the number of unchanged lines to show around the changed lines in the diff output.
     *  A value of 0 would show only the changed lines, while a larger value would show more context.
     */
    contextLines?: number;
}

/**
 * Formats diff entries into a string with ANSI colour codes (optional) for terminal display.
 * Added lines are green, removed lines are red, and unchanged lines are grey.
 *
 * @param {DiffEntry<string>} diffEntries An array of DiffEntry objects.
 * @param {FormatForTerminalOptions} options Formatting options.
 * @returns {string} A string representation of the diff with ANSI colour codes.
 */
export function formatForTerminal(diffEntries: DiffEntry<string>[], options: FormatForTerminalOptions = {}): string {
    const {
        useColours = true,
        contextLines = 0,
    } = options;

    let maxLineNumber = 0;
    for (const entry of diffEntries) {
        maxLineNumber = Math.max(maxLineNumber, entry.leftLine || 0, entry.rightLine || 0);
    }
    const paddingWidth = Math.max(2, String(maxLineNumber).length);
    const emptyPadding = " ".repeat(paddingWidth);

    if (contextLines === 0) {
        const formattedLines: string[] = [];
        let previousEntryType: string | null = null;

        for (let i = 0; i < diffEntries.length; i++) {
            const entry = diffEntries[i];

            if (entry.type !== "same") {
                formattedLines.push(formatLine(entry, paddingWidth, useColours));
                previousEntryType = entry.type;
            } else if (previousEntryType !== null) {
                let nextChangeType: string | null = null;
                for (let j = i + 1; j < diffEntries.length; j++) {
                    if (diffEntries[j].type !== "same") {
                        nextChangeType = diffEntries[j].type;
                        break;
                    }
                }

                if (nextChangeType === null || nextChangeType !== previousEntryType) {
                    formattedLines.push(`${emptyPadding} ${emptyPadding}    `);
                }
                previousEntryType = null;
            }
        }
        return formattedLines.join("\n");
    } else {
        const changeIndexes: number[] = [];
        diffEntries.forEach((entry, index) => {
            if (entry.type !== "same") changeIndexes.push(index);
        });

        if (changeIndexes.length === 0) return "";

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

        const formattedLines: string[] = [];
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
                const lineText = skippedLines === 1 ? "line" : "lines";
                formattedLines.push(
                    `${emptyPadding} ${emptyPadding}    ... ${skippedLines} ${lineText} omitted ...`,
                );
            }

            for (let i = currentStart; i <= currentEnd; i++) {
                formattedLines.push(formatLine(diffEntries[i], paddingWidth, useColours));
            }

            previousEnd = currentEnd;
        }

        if (previousEnd < diffEntries.length - 1) {
            const skippedLines = diffEntries.length - 1 - previousEnd;
            const lineText = skippedLines === 1 ? "line" : "lines";
            formattedLines.push(
                `${emptyPadding} ${emptyPadding}    ... ${skippedLines} ${lineText} omitted ...`,
            );
        }

        return formattedLines.join("\n");
    }
}

/**
 * Helper function to format a single diff line.
 * @param {DiffEntry<string>} entry The DiffEntry object to format.
 * @param {number} paddingWidth The padding width for line numbers.
 * @param {boolean} useColours Whether to use ANSI colour codes.
 * @returns {string} A string representing the formatted diff line.
 */
function formatLine(entry: DiffEntry<string>, paddingWidth: number, useColours: boolean): string {
    const origLine = entry.leftLine ? entry.leftLine.toString().padStart(paddingWidth, " ") : " ".repeat(paddingWidth);
    const rightLine = entry.rightLine ? entry.rightLine.toString().padStart(paddingWidth, " ") : " ".repeat(paddingWidth);

    let prefix = " ";
    let colour = "";
    let reset = "";

    if (useColours) {
        colour = entry.type === "delete" ? AnsiColour.Red : entry.type === "add" ? AnsiColour.Green : AnsiColour.Grey;
        reset = AnsiColour.Reset;
        prefix = entry.type === "delete" ? "-" : entry.type === "add" ? "+" : " ";
    } else {
        prefix = entry.type === "delete" ? "-" : entry.type === "add" ? "+" : " ";
    }

    return `${origLine} ${rightLine} ${colour}${prefix} ${entry.content}${reset}`;
}
