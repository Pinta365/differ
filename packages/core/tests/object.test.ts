import { assertEquals } from "@std/assert";
import { diffObjects, formatObjectDiff } from "../src/object.ts";
import type { ObjectDiffEntry } from "../src/object.ts";

Deno.test("diffObjects - basic functionality", () => {
    const oldObj = {
        name: "John",
        age: 30,
        address: {
            city: "New York",
            zip: "10001",
        },
    };

    const newObj = {
        name: "John",
        age: 31,
        address: {
            city: "Boston",
            zip: "10001",
        },
        email: "john@example.com",
    };

    const result = diffObjects(oldObj, newObj);

    assertEquals(result.length, 3);
    assertEquals(result[0], {
        type: "modified",
        path: ["age"],
        oldValue: 30,
        newValue: 31,
    });
    assertEquals(result[1], {
        type: "modified",
        path: ["address", "city"],
        oldValue: "New York",
        newValue: "Boston",
    });
    assertEquals(result[2], {
        type: "added",
        path: ["email"],
        newValue: "john@example.com",
    });
});

Deno.test("diffObjects - with includeUnchanged", () => {
    const oldObj = { a: 1, b: 2 };
    const newObj = { a: 1, b: 3 };

    const result = diffObjects(oldObj, newObj, { includeUnchanged: true });

    assertEquals(result.length, 2);
    assertEquals(result[0], {
        type: "unchanged",
        path: ["a"],
        oldValue: 1,
        newValue: 1,
    });
    assertEquals(result[1], {
        type: "modified",
        path: ["b"],
        oldValue: 2,
        newValue: 3,
    });
});

Deno.test("diffObjects - custom comparison function", () => {
    const oldObj = { a: { id: 1, value: "x" } };
    const newObj = { a: { id: 1, value: "y" } };

    const result = diffObjects(oldObj, newObj, {
        // deno-lint-ignore no-explicit-any
        compareFn: (a: any, b: any) => a.id === b.id,
    });

    assertEquals(result.length, 0);
});

Deno.test("formatObjectDiff - basic formatting", () => {
    const diffs: ObjectDiffEntry[] = [
        {
            type: "added",
            path: ["email"],
            newValue: "john@example.com",
        },
        {
            type: "removed",
            path: ["phone"],
            oldValue: "123-456-7890",
        },
        {
            type: "modified",
            path: ["age"],
            oldValue: 30,
            newValue: 31,
        },
    ];

    const result = formatObjectDiff(diffs);
    const expected = [
        '+ email: "john@example.com"',
        '- phone: "123-456-7890"',
        "~ age: 30 → 31",
    ].join("\n");

    assertEquals(result, expected);
});
