import { assertEquals } from "@std/assert";
import { characterDiff, sequentialDiff } from "../mod.ts";

Deno.test("sequentialDiff - basic functionality", () => {
    const left = ["a", "b", "c"];
    const right = ["a", "d", "c"];

    const result = sequentialDiff(left, right);

    assertEquals(result.length, 4);
    assertEquals(result[0], { type: "same", content: "a" });
    assertEquals(result[1], { type: "delete", content: "b" });
    assertEquals(result[2], { type: "add", content: "d" });
    assertEquals(result[3], { type: "same", content: "c" });
});

Deno.test("sequentialDiff - empty arrays", () => {
    const result = sequentialDiff([], []);
    assertEquals(result.length, 0);
});

Deno.test("sequentialDiff - with line numbers", () => {
    const left = ["a", "b"];
    const right = ["a", "c"];

    const result = sequentialDiff(left, right, { includeEntryNumbering: true });

    assertEquals(result.length, 3);
    assertEquals(result[0], { type: "same", content: "a", leftLine: 1, rightLine: 1 });
    assertEquals(result[1], { type: "delete", content: "b", leftLine: 2 });
    assertEquals(result[2], { type: "add", content: "c", rightLine: 2 });
});

Deno.test("sequentialDiff - custom comparison function", () => {
    const left = [{ id: 1, value: "a" }, { id: 2, value: "b" }];
    const right = [{ id: 1, value: "x" }, { id: 3, value: "c" }];

    const result = sequentialDiff(left, right, {
        compareFn: (a, b) => a.id === b.id,
    });

    assertEquals(result.length, 3);
    assertEquals(result[0], { type: "same", content: { id: 1, value: "a" } });
    assertEquals(result[1], { type: "delete", content: { id: 2, value: "b" } });
    assertEquals(result[2], { type: "add", content: { id: 3, value: "c" } });
});

Deno.test("characterDiff - basic functionality", () => {
    const left = "kitten";
    const right = "sitting";
    const result = characterDiff(left, right);
    assertEquals(result, [
        { type: "delete", content: "k" },
        { type: "add", content: "s" },
        { type: "same", content: "itt" },
        { type: "delete", content: "e" },
        { type: "add", content: "i" },
        { type: "same", content: "n" },
        { type: "add", content: "g" },
    ]);
});

Deno.test("characterDiff - empty strings", () => {
    assertEquals(characterDiff("", ""), []);
    assertEquals(characterDiff("abc", ""), [
        { type: "delete", content: "abc" },
    ]);
    assertEquals(characterDiff("", "abc"), [
        { type: "add", content: "abc" },
    ]);
});

Deno.test("characterDiff - all same", () => {
    assertEquals(characterDiff("hello", "hello"), [
        { type: "same", content: "hello" },
    ]);
});

Deno.test("characterDiff - complex case", () => {
    const left = "abcdef";
    const right = "azced";
    const result = characterDiff(left, right);
    assertEquals(result, [
        { type: "same", content: "a" },
        { type: "delete", content: "b" },
        { type: "add", content: "z" },
        { type: "same", content: "c" },
        { type: "delete", content: "d" },
        { type: "same", content: "e" },
        { type: "delete", content: "f" },
        { type: "add", content: "d" },
    ]);
});
