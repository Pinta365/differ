import { assertEquals } from "@std/assert";
import { characterDiff, diffMaps, diffSets, sequentialDiff } from "../mod.ts";

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

Deno.test("diffSets basic", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    const result = diffSets(a, b);
    // Should show 1 as removed, 4 as added
    const types = result.map((e) => e.type + e.value).sort();
    assertEquals(types.includes("removed1"), true);
    assertEquals(types.includes("added4"), true);
});

Deno.test("diffMaps basic", () => {
    const a = new Map([["x", 1], ["y", 2]]);
    const b = new Map([["y", 2], ["z", 3]]);
    const result = diffMaps(a, b);
    // Should show x as removed, z as added, y as unchanged
    const summary = result.map((e) => e.type + e.key).sort();
    assertEquals(summary.includes("removedx"), true);
    assertEquals(summary.includes("addedz"), true);
});

Deno.test("diffSets unchanged with showUnchanged", () => {
    const a = new Set([1, 2]);
    const b = new Set([1, 2]);
    const result = diffSets(a, b, true);
    const unchanged = result.filter((e) => e.type === "unchanged");
    assertEquals(unchanged.length, 2);
});

Deno.test("diffSets both empty", () => {
    const a = new Set();
    const b = new Set();
    const result = diffSets(a, b);
    assertEquals(result.length, 0);
});

Deno.test("diffMaps modified value", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([["x", 2]]);
    const result = diffMaps(a, b);
    const modified = result.find((e) => e.type === "modified");
    assertEquals(!!modified, true);
    if (modified && modified.type === "modified") {
        assertEquals(modified.key, "x");
        assertEquals(modified.oldValue, 1);
        assertEquals(modified.newValue, 2);
    }
});

Deno.test("diffMaps unchanged with showUnchanged", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([["x", 1]]);
    const result = diffMaps(a, b, true);
    const unchanged = result.filter((e) => e.type === "unchanged");
    assertEquals(unchanged.length, 1);
});

Deno.test("diffMaps both empty", () => {
    const a = new Map();
    const b = new Map();
    const result = diffMaps(a, b);
    assertEquals(result.length, 0);
});

Deno.test("diffMaps with custom compareFn (deep equality) - mixed", () => {
    const a = new Map([
        ["x", { v: 1 }],
        ["y", { v: 2 }],
    ]);
    const b = new Map([
        ["x", { v: 1 }],
        ["y", { v: 3 }],
    ]);
    const result = diffMaps(a, b, true, (a, b) => a.v === b.v);

    const unchanged = result.find((e) => e.type === "unchanged" && e.key === "x");
    const modified = result.find((e) => e.type === "modified" && e.key === "y");
    assertEquals(!!unchanged, true);
    assertEquals(!!modified, true);
    if (modified && modified.type === "modified") {
        assertEquals(modified.oldValue, { v: 2 });
        assertEquals(modified.newValue, { v: 3 });
    }
});
