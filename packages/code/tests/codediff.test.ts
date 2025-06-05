import { assertEquals } from "@std/assert";
import { diffCode } from "../mod.ts";

Deno.test("diffCode - basic code diff", () => {
    const oldCode = `function hello() {
    console.log("Hello");
}`;
    const newCode = `function hello() {
    console.log("Hello World");
}`;

    const result = diffCode(oldCode, newCode);

    assertEquals(result.includes('console.log("Hello")'), true);
    assertEquals(result.includes('console.log("Hello World")'), true);
    assertEquals(result.includes("2 "), true);
    assertEquals(result.includes("- "), true);
    assertEquals(result.includes("+ "), true);
});

Deno.test("diffCode - terminal formatting", () => {
    const oldCode = `function hello() {\n    console.log(\"Hello\");\n}`;
    const newCode = `function hello() {\n    console.log(\"Hello World\");\n}`;
    const result = diffCode(oldCode, newCode, "terminal");
    assertEquals(result.includes('console.log("Hello")'), true);
    assertEquals(result.includes('console.log("Hello World")'), true);
    assertEquals(result.includes("2 "), true);
    assertEquals(result.includes("- "), true);
    assertEquals(result.includes("+ "), true);
});

Deno.test("diffCode - HTML formatting", () => {
    const oldCode = `function hello() {\n  console.log(\"Hello\");\n}`;
    const newCode = `function hello() {\n  console.log(\"Hello World\");\n}`;
    const result = diffCode(oldCode, newCode, "html");
    assertEquals(result.includes('<div class="diff-line diff-delete">'), true);
    assertEquals(result.includes("console.log(&quot;Hello&quot;);"), true);
    assertEquals(result.includes("console.log(&quot;Hello World&quot;);"), true);
    assertEquals(result.includes('<span class="line-number left"> 2</span>'), true);
    assertEquals(result.includes('class="diff-line diff-add"'), true);
    assertEquals(result.includes('class="diff-line diff-delete"'), true);
});

Deno.test("diffCode - JSON formatting", () => {
    const oldCode = `function hello() {\n    console.log(\"Hello\");\n}`;
    const newCode = `function hello() {\n    console.log(\"Hello World\");\n}`;
    const result = diffCode(oldCode, newCode, "json");
    const parsed = JSON.parse(result);
    assertEquals(parsed.options.contextLines, 3);
    assertEquals(parsed.options.showLineNumbers, true);
    assertEquals(parsed.diff.length, 4);
    assertEquals(parsed.diff[0].type, "unchanged");
    assertEquals(parsed.diff[0].content, "function hello() {");
    assertEquals(parsed.diff[0].lineNumbers.old, 1);
    assertEquals(parsed.diff[0].lineNumbers.new, 1);
    assertEquals(parsed.diff[1].type, "removed");
    assertEquals(parsed.diff[1].content, '    console.log("Hello");');
    assertEquals(parsed.diff[1].lineNumbers.old, 2);
    assertEquals(parsed.diff[1].lineNumbers.new, undefined);
    assertEquals(parsed.diff[2].type, "added");
    assertEquals(parsed.diff[2].content, '    console.log("Hello World");');
    assertEquals(parsed.diff[2].lineNumbers.old, undefined);
    assertEquals(parsed.diff[2].lineNumbers.new, 2);
    assertEquals(parsed.diff[3].type, "unchanged");
    assertEquals(parsed.diff[3].content, "}");
    assertEquals(parsed.diff[3].lineNumbers.old, 3);
    assertEquals(parsed.diff[3].lineNumbers.new, 3);
});

Deno.test("diffCode - throws on unknown format", () => {
    const oldCode = `a`;
    const newCode = `b`;
    let threw = false;
    try {
        diffCode(oldCode, newCode, "invalid-format" as any);
    } catch (e) {
        threw = true;
        if (!(e instanceof Error) || !e.message.includes("Unknown format")) {
            throw new Error("Unexpected error thrown");
        }
    }
    if (!threw) {
        throw new Error("Expected diffCode to throw on unknown format");
    }
});
