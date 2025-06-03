import { assertEquals } from "@std/assert";
import { characterDiff } from "../mod.ts";

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
