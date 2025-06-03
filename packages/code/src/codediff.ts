import { sequentialDiff } from "@differ/core";
import { formatForTerminal, type FormatForTerminalOptions } from "./terminal.ts";
import { formatForHTML, type FormatForHTMLOptions } from "./html.ts";
import { formatForJSON, type FormatForJSONOptions } from "./json.ts";

export type DiffFormat = "terminal" | "html" | "json";
export type FormatOptions = FormatForTerminalOptions | FormatForHTMLOptions | FormatForJSONOptions;
/**
 * Calculates the diff between two code snippets and formats the output.
 *
 * @param oldCode The original code snippet.
 * @param newCode The modified code snippet.
 * @param format The output format. "terminal", "html" or "json"
 * @returns A formatted string representing the changes between the code snippets.
 */
export function diffCode(
    oldCode: string,
    newCode: string,
    format: DiffFormat = "terminal",
    formatOptions?: FormatOptions,
): string {
    const oldLines = oldCode.split("\n");
    const newLines = newCode.split("\n");
    const changes = sequentialDiff(oldLines, newLines, {
        includeEntryNumbering: true,
    });

    switch (format) {
        case "terminal":
            return formatForTerminal(changes, formatOptions);
        case "html":
            return formatForHTML(changes, formatOptions);
        case "json":
            return formatForJSON(changes, formatOptions);
        default:
            throw new Error(`Unknown format: ${format}`);
    }
}
