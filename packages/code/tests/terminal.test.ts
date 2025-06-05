import { assertEquals } from "@std/assert";
import { formatForTerminal } from "../src/terminal.ts";
import { sequentialDiff } from "@differ/core";

Deno.test("formatForTerminal - basic add/delete/same", () => {
    const oldLines: string[] = ["line 1", "line 2", "line 4"];
    const newLines: string[] = ["line 1", "line 3", "line 4"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    assertEquals(result.includes("- line 2"), true);
    assertEquals(result.includes("+ line 3"), true);
});

Deno.test("formatForTerminal - useColours false (no ANSI)", () => {
    const oldLines: string[] = [];
    const newLines: string[] = ["added"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    // deno-lint-ignore no-control-regex
    assertEquals(/\x1b\[/.test(result), false);
    assertEquals(result.includes("+ added"), true);
});

Deno.test("formatForTerminal - contextLines > 0 (omitted lines)", () => {
    const oldLines: string[] = ["a", "b", "c", "d", "e", "g", "h"];
    const newLines: string[] = ["a", "b", "d", "e", "f", "g", "h"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { contextLines: 1, useColours: false });
    assertEquals(
        result,
        `         ... 1 line omitted ...\n 2  2   b\n 3    - c\n 4  3   d\n 5  4   e\n    5 + f\n 6  6   g\n         ... 1 line omitted ...`,
    );
});

Deno.test("formatForTerminal - all lines same", () => {
    const oldLines: string[] = ["x", "y"];
    const newLines: string[] = ["x", "y"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    assertEquals(result, "");
});

Deno.test("formatForTerminal - all lines added", () => {
    const oldLines: string[] = [];
    const newLines: string[] = ["a", "b"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    assertEquals(result.includes("+ a"), true);
    assertEquals(result.includes("+ b"), true);
});

Deno.test("formatForTerminal - all lines deleted", () => {
    const oldLines: string[] = ["a", "b"];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    assertEquals(result.includes("- a"), true);
    assertEquals(result.includes("- b"), true);
});

Deno.test("formatForTerminal - empty diff", () => {
    const oldLines: string[] = [];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { useColours: false });
    assertEquals(result, "");
});

Deno.test("formatForTerminal - single omitted line (singular)", () => {
    const oldLines: string[] = ["a", "b", "c", "d"];
    const newLines: string[] = ["a", "c", "d"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { contextLines: 1, useColours: false });
    assertEquals(result.includes("1 line omitted"), true);
});

Deno.test("formatForTerminal - no changes at all with contextLines > 0", () => {
    const oldLines: string[] = ["foo", "bar"];
    const newLines: string[] = ["foo", "bar"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    assertEquals(diff[0].type === "same" && diff[1].type === "same", true);
    assertEquals(diff[0].leftLine === 1 && diff[1].leftLine === 2, true);
    assertEquals(diff[0].content === "foo" && diff[1].content === "bar", true);
    const result = formatForTerminal(diff, { contextLines: 1, useColours: false });
    assertEquals(result, "");
});

Deno.test("formatForTerminal - alternating add/delete/same", () => {
    const oldLines: string[] = ["A", "B", "C", "D"];
    const newLines: string[] = ["A", "X", "C", "Y", "D"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForTerminal(diff, { contextLines: 1, useColours: false });
    assertEquals(result, ` 1  1   A\n 2    - B\n    2 + X\n 3  3   C\n    4 + Y\n 4  5   D`);
});
