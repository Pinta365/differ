import { assertEquals } from "@std/assert";
import { diffSets } from "../mod.ts";

Deno.test("diffSets basic", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    const result = diffSets(a, b);
    const types = result.map((e) => e.type + e.value).sort();
    assertEquals(types.includes("removed1"), true);
    assertEquals(types.includes("added4"), true);
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
