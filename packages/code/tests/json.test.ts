// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "@std/assert";
import { formatForJSON } from "../src/json.ts";
import { sequentialDiff } from "@differ/core";

Deno.test("formatForJSON - basic add/delete/same", () => {
    const oldLines: string[] = ["line 1", "line 2", "line 4"];
    const newLines: string[] = ["line 1", "line 3", "line 4"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.some((e: any) => e.type === "removed"), true);
    assertEquals(parsed.diff.some((e: any) => e.type === "added"), true);
    assertEquals(parsed.diff.some((e: any) => e.type === "unchanged"), true);
});

Deno.test("formatForJSON - contextLines > 0 (omitted lines)", () => {
    const oldLines: string[] = ["a", "b", "c", "d", "e", "g", "h"];
    const newLines: string[] = ["a", "b", "d", "e", "f", "g", "h"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff, { contextLines: 1 });
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.some((e: any) => e.type === "omitted"), true);
    assertEquals(parsed.diff.some((e: any) => e.type === "removed"), true);
    assertEquals(parsed.diff.some((e: any) => e.type === "added"), true);
});

Deno.test("formatForJSON - all lines same", () => {
    const oldLines: string[] = ["x", "y"];
    const newLines: string[] = ["x", "y"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.every((e: any) => e.type === "unchanged"), true);
});

Deno.test("formatForJSON - all lines added", () => {
    const oldLines: string[] = [];
    const newLines: string[] = ["a", "b"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.every((e: any) => e.type === "added"), true);
});

Deno.test("formatForJSON - all lines deleted", () => {
    const oldLines: string[] = ["a", "b"];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.every((e: any) => e.type === "removed"), true);
});

Deno.test("formatForJSON - empty diff", () => {
    const oldLines: string[] = [];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.length, 0);
});

Deno.test("formatForJSON - showLineNumbers false", () => {
    const oldLines: string[] = ["foo"];
    const newLines: string[] = ["bar"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForJSON(diff, { showLineNumbers: false });
    const parsed = JSON.parse(result);
    assertEquals(parsed.diff.some((e: any) => e.lineNumbers === undefined), true);
});
