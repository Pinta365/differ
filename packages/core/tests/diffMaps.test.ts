import { assertEquals } from "@std/assert";
import { diffMaps } from "../mod.ts";

Deno.test("diffMaps basic", () => {
    const a = new Map([["x", 1], ["y", 2]]);
    const b = new Map([["y", 2], ["z", 3]]);
    const result = diffMaps(a, b);
    const summary = result.map((e) => e.type + e.key).sort();
    assertEquals(summary.includes("removedx"), true);
    assertEquals(summary.includes("addedz"), true);
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
