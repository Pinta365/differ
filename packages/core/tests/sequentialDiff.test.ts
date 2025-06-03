import { assertEquals } from "@std/assert";
import { sequentialDiff } from "../mod.ts";

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
