import { assertEquals } from "@std/assert";
import { formatForHTML } from "../src/html.ts";
import { sequentialDiff } from "@differ/core";

Deno.test("formatForHTML - basic add/delete/same", () => {
    const oldLines: string[] = ["line 1", "line 2", "line 4"];
    const newLines: string[] = ["line 1", "line 3", "line 4"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff, { contextLines: 1 });
    assertEquals(result.includes("diff-line diff-delete"), true);
    assertEquals(result.includes("diff-line diff-add"), true);
    assertEquals(result.includes("diff-line diff-same"), true);
    assertEquals(result.includes("line-number left"), true);
    assertEquals(result.includes("line-number right"), true);
});

Deno.test("formatForHTML - contextLines > 0 (omitted lines)", () => {
    const oldLines: string[] = ["a", "b", "c", "d", "e", "g", "h"];
    const newLines: string[] = ["a", "b", "d", "e", "f", "g", "h"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff, { contextLines: 1 });
    assertEquals(result.includes("omitted"), true);
    assertEquals(result.includes("diff-line diff-delete"), true);
    assertEquals(result.includes("diff-line diff-add"), true);
});

Deno.test("formatForHTML - all lines same", () => {
    const oldLines: string[] = ["x", "y"];
    const newLines: string[] = ["x", "y"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff, { contextLines: 1 });
    assertEquals(result, "");
});

Deno.test("formatForHTML - all lines added", () => {
    const oldLines: string[] = [];
    const newLines: string[] = ["a", "b"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff);
    assertEquals(result.includes("diff-line diff-add"), true);
    assertEquals(result.includes("diff-line diff-delete"), false);
});

Deno.test("formatForHTML - all lines deleted", () => {
    const oldLines: string[] = ["a", "b"];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff);
    assertEquals(result.includes("diff-line diff-delete"), true);
    assertEquals(result.includes("diff-line diff-add"), false);
});

Deno.test("formatForHTML - empty diff", () => {
    const oldLines: string[] = [];
    const newLines: string[] = [];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff);
    assertEquals(result, "");
});

Deno.test("formatForHTML - custom class names", () => {
    const oldLines: string[] = ["A", "foo"];
    const newLines: string[] = ["A", "bar"];
    const diff = sequentialDiff(oldLines, newLines, { includeEntryNumbering: true });
    const result = formatForHTML(diff, { contextLines: 1, classes: { add: "my-add", delete: "my-del", same: "my-same" } });
    assertEquals(result.includes("my-add"), true);
    assertEquals(result.includes("my-del"), true);
    assertEquals(result.includes("my-same"), true);
});
