import type { DiffEntry } from "@differ/core";

export interface FormatForHTMLOptions {
    /**
     * CSS class names for customization.
     *
     * @property {string} [container] - Class name for the container element.
     * @property {string} [line] - Class name for each line element.
     * @property {string} [add] - Class name for added lines.
     * @property {string} [delete] - Class name for deleted lines.
     * @property {string} [same] - Class name for unchanged lines.
     * @property {string} [omitted] - Class name for omitted lines.
     * @property {string} [lineNumber] - Class name for line number elements.
     * @property {string} [prefix] - Class name for the prefix element (e.g., '+', '-', ' ').
     * @property {string} [content] - Class name for the content element.
     */
    classes?: {
        container?: string;
        line?: string;
        add?: string;
        delete?: string;
        same?: string;
        omitted?: string;
        lineNumber?: string;
        prefix?: string;
        content?: string;
    };
    /** This option control the number of unchanged lines to show around the changed lines in the diff output.
     *  A value of 0 would show only the changed lines, while a larger value would show more context.
     */
    contextLines?: number;
    /** Whether to show line numbers (default: true) */
    showLineNumbers?: boolean;
}

/**
 * Escapes HTML special characters in a string.
 *
 * @param {string} unsafe - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Formats an array of DiffEntry objects as an HTML string.
 *
 * @param {DiffEntry<string>} diffEntries - The array of DiffEntry objects.
 * @param {FormatForHTMLOptions} [options] - Options for formatting.
 * @returns {string} The formatted HTML string.
 */
export function formatForHTML(diffEntries: DiffEntry<string>[], options: FormatForHTMLOptions = {}): string {
    const {
        classes = {},
        contextLines = 0,
        showLineNumbers = true,
    } = options;

    let maxLineNumber = 0;
    for (const entry of diffEntries) {
        maxLineNumber = Math.max(maxLineNumber, entry.leftLine || 0, entry.rightLine || 0);
    }

    //Default class names for css
    const classNames = {
        container: classes.container || "diff-container",
        line: classes.line || "diff-line",
        add: classes.add || "diff-add",
        delete: classes.delete || "diff-delete",
        same: classes.same || "diff-same",
        omitted: classes.omitted || "diff-omitted",
        lineNumber: classes.lineNumber || "line-number",
        prefix: classes.prefix || "diff-prefix",
        content: classes.content || "diff-content",
    };

    const paddingWidth = Math.max(2, String(maxLineNumber).length);
    const emptyPadding = " ".repeat(paddingWidth);

    const formatLine = (entry: DiffEntry<string>) => {
        const lineTypeClass = entry.type === "add" ? classNames.add : entry.type === "delete" ? classNames.delete : classNames.same;

        const lineClasses = [classNames.line, lineTypeClass].filter(Boolean).join(" ");

        const leftLine = entry.leftLine?.toString().padStart(paddingWidth, " ") || "";
        const rightLine = entry.rightLine?.toString().padStart(paddingWidth, " ") || "";
        const prefix = entry.type === "add" ? "+" : entry.type === "delete" ? "-" : " ";

        return `<div class="${lineClasses}">
  ${
            showLineNumbers
                ? `<span class="${classNames.lineNumber} left">${escapeHtml(leftLine)}</span>
  <span class="${classNames.lineNumber} right">${escapeHtml(rightLine)}</span>`
                : ""
        }
  <span class="${classNames.prefix}">${prefix}</span>
  <span class="${classNames.content}">${escapeHtml(entry.content)}</span>
</div>`;
    };

    const createOmittedLine = (skippedLines: number, lineText: string) =>
        `<div class="${classNames.omitted}">
  <span class="${classNames.omitted}-content">${escapeHtml(`... ${skippedLines} ${lineText} omitted ...`)}</span>
</div>`;

    if (contextLines === 0) {
        const formattedLines: string[] = [];
        let previousEntryType: string | null = null;

        for (let i = 0; i < diffEntries.length; i++) {
            const entry = diffEntries[i];

            if (entry.type !== "same") {
                formattedLines.push(formatLine(entry));
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
                formattedLines.push(createOmittedLine(skippedLines, lineText));
            }

            for (let i = currentStart; i <= currentEnd; i++) {
                formattedLines.push(formatLine(diffEntries[i]));
            }

            previousEnd = currentEnd;
        }

        if (previousEnd < diffEntries.length - 1) {
            const skippedLines = diffEntries.length - 1 - previousEnd;
            const lineText = skippedLines === 1 ? "line" : "lines";
            formattedLines.push(createOmittedLine(skippedLines, lineText));
        }

        return formattedLines.join("\n");
    }
}
