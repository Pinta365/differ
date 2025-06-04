import { lcs } from "../src/lcs.ts";
import { assertEquals } from "@std/assert";

Deno.test("lcs basic", () => {
    const a = [1, 2, 3, 4];
    const b = [2, 4, 3, 1];
    const dp = lcs(a, b);
    assertEquals(dp[a.length][b.length], 2);
});

Deno.test("lcs empty arrays", () => {
    assertEquals(lcs([], []), [[0]]);
});

Deno.test("lcs with custom compareFn", () => {
    const a = ["a", "b", "c"];
    const b = ["A", "B", "C"];
    const dp = lcs(a, b, (x, y) => x.toLowerCase() === y.toLowerCase());
    assertEquals(dp[a.length][b.length], 3);
});
