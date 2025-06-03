import { assertEquals } from "@std/assert";
import { diffCode, formatForHTML, formatForJSON, formatForTerminal } from "../mod.ts";
import type { DiffEntry } from "@differ/core";

Deno.test("diffCode - basic code diff", () => {
    const oldCode = `function hello() {
    console.log("Hello");
}`;
    const newCode = `function hello() {
    console.log("Hello World");
}`;

    const result = diffCode(oldCode, newCode);

    // Check that the result contains the content
    assertEquals(result.includes('console.log("Hello")'), true);
    assertEquals(result.includes('console.log("Hello World")'), true);
    // Check that it has proper line numbers
    assertEquals(result.includes("2 "), true);
    // Check that it has proper prefixes
    assertEquals(result.includes("- "), true);
    assertEquals(result.includes("+ "), true);
});

Deno.test("formatForTerminal - basic formatting", () => {
    const diff: DiffEntry<string>[] = [
        { type: "same", content: "function hello() {", leftLine: 1, rightLine: 1 },
        { type: "delete", content: '    console.log("Hello");', leftLine: 2 },
        { type: "add", content: '    console.log("Hello World");', rightLine: 2 },
        { type: "same", content: "}", leftLine: 3, rightLine: 3 },
    ];

    const result = formatForTerminal(diff);

    // Check that the result contains the content
    assertEquals(result.includes('console.log("Hello")'), true);
    assertEquals(result.includes('console.log("Hello World")'), true);
    // Check that it has proper line numbers
    assertEquals(result.includes("2 "), true);
    // Check that it has proper prefixes
    assertEquals(result.includes("- "), true);
    assertEquals(result.includes("+ "), true);
});

Deno.test("formatForHTML - basic formatting", () => {
    const diff: DiffEntry<string>[] = [
        { type: "same", content: "function hello() {", leftLine: 1, rightLine: 1 },
        { type: "delete", content: '  console.log("Hello");', leftLine: 2 },
        { type: "add", content: '  console.log("Hello World");', rightLine: 2 },
        { type: "same", content: "}", leftLine: 3, rightLine: 3 },
    ];

    const result = formatForHTML(diff);

    // Check that the result contains HTML tags with proper whitespace
    assertEquals(result.includes('<div class="diff-line diff-delete">'), true);
    // Check that the result contains the content with proper HTML entities
    assertEquals(result.includes("console.log(&quot;Hello&quot;);"), true);
    assertEquals(result.includes("console.log(&quot;Hello World&quot;);"), true);
    // Check that it has proper line numbers with whitespace
    assertEquals(result.includes('<span class="line-number left"> 2</span>'), true);
    // Check that it has proper classes
    assertEquals(result.includes('class="diff-line diff-add"'), true);
    assertEquals(result.includes('class="diff-line diff-delete"'), true);
});

Deno.test("formatForJSON - basic formatting", () => {
    const diff: DiffEntry<string>[] = [
        { type: "same", content: "function hello() {", leftLine: 1, rightLine: 1 },
        { type: "delete", content: '    console.log("Hello");', leftLine: 2 },
        { type: "add", content: '    console.log("Hello World");', rightLine: 2 },
        { type: "same", content: "}", leftLine: 3, rightLine: 3 },
    ];

    const result = formatForJSON(diff);
    const parsed = JSON.parse(result);

    // Check the structure
    assertEquals(parsed.options.contextLines, 3);
    assertEquals(parsed.options.showLineNumbers, true);

    // Check the diff entries
    assertEquals(parsed.diff.length, 4);

    // Check first entry (unchanged)
    assertEquals(parsed.diff[0].type, "unchanged");
    assertEquals(parsed.diff[0].content, "function hello() {");
    assertEquals(parsed.diff[0].lineNumbers.old, 1);
    assertEquals(parsed.diff[0].lineNumbers.new, 1);

    // Check second entry (removed)
    assertEquals(parsed.diff[1].type, "removed");
    assertEquals(parsed.diff[1].content, '    console.log("Hello");');
    assertEquals(parsed.diff[1].lineNumbers.old, 2);
    assertEquals(parsed.diff[1].lineNumbers.new, undefined);

    // Check third entry (added)
    assertEquals(parsed.diff[2].type, "added");
    assertEquals(parsed.diff[2].content, '    console.log("Hello World");');
    assertEquals(parsed.diff[2].lineNumbers.old, undefined);
    assertEquals(parsed.diff[2].lineNumbers.new, 2);

    // Check fourth entry (unchanged)
    assertEquals(parsed.diff[3].type, "unchanged");
    assertEquals(parsed.diff[3].content, "}");
    assertEquals(parsed.diff[3].lineNumbers.old, 3);
    assertEquals(parsed.diff[3].lineNumbers.new, 3);
});
