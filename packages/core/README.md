# @differ/core (WIP)

> **Work in Progress:**\
> This library is under active development. Expect breaking changes and improvements. Contributions and feedback are welcome!

## Part of the differ Suite

This package is part of the [differ suite](https://github.com/Pinta365/differ) — a collection of tools and libraries for calculating and visualizing
differences between code, sequences, and objects. It is under active development, with more features planned.

## Overview

`@differ/core` provides foundational algorithms and utilities for calculating differences between sequences and objects. It is designed to be a
low-level library for use in higher-level diffing and formatting tools.

## Features

- Longest Common Subsequence (LCS) calculation for arrays
- Array diffing with detailed change tracking
- Object diffing with nested property support
- Map diffing with added, removed, modified, and unchanged entries
- Set diffing with added, removed, and unchanged elements
- Character-level diffing for strings
- Customizable comparison functions

## Usage Examples

### LCS (Longest Common Subsequence)

```js
import { lcs } from "@differ/core";

const a = ["A", "B", "C", "D"];
const b = ["A", "X", "C", "D"];
const dp = lcs(a, b);
// dp is a 2D array representing the LCS lengths
```

### Array Diff

```js
import { sequentialDiff } from "@differ/core";

const before = ["A", "B", "C"];
const after = ["A", "X", "C"];
const diff = sequentialDiff(before, after);
//Outputs:
//[
//  { type: "same", content: "A" },
//  { type: "delete", content: "B" },
//  { type: "add", content: "X" },
//  { type: "same", content: "C" }
//]
```

### Object Diff

```js
import { diffObjects, formatObjectDiff } from "@differ/core";

const oldObj = { a: 1, b: 2 };
const newObj = { a: 1, b: 3, c: 4 };
const diffs = diffObjects(oldObj, newObj);
console.log(formatObjectDiff(diffs));
//Outputs:
//~ b: 2 → 3
//+ c: 4
```

### Map Diff

```js
import { diffMaps } from "@differ/core";

const oldMap = new Map([
    ["x", 1],
    ["y", 2],
]);
const newMap = new Map([
    ["y", 2],
    ["z", 3],
]);
const mapDiff = diffMaps(oldMap, newMap);
// Outputs:
//[
//  { type: "removed", key: "x", value: 1 },
//  { type: "added", key: "z", value: 3 }
//]
```

### Set Diff

```js
import { diffSets } from "@differ/core";

const oldSet = new Set([1, 2, 3]);
const newSet = new Set([2, 3, 4]);
const setDiff = diffSets(oldSet, newSet);
//Outputs:
//[
//  { type: "removed", value: 1 },
//  { type: "added", value: 4 }
//]
```

### Character Diff

```js
import { characterDiff } from "@differ/core";

const before = "kitten";
const after = "sitting";
const charDiff = characterDiff(before, after);
//Outputs:
//[
//  { type: "delete", content: "k" },
//  { type: "add", content: "s" },
//  { type: "same", content: "itt" },
//  { type: "delete", content: "e" },
//  { type: "add", content: "i" },
//  { type: "same", content: "n" },
//  { type: "add", content: "g" }
//]
```

## API

- `lcs(a, b, compareFn?)`: Returns a 2D array for LCS calculation.
- `sequentialDiff(left, right, options?)`: Returns an array of diff entries for two arrays.
- `characterDiff(left, right)`: Returns an array of character-level diff entries for two strings.
- `diffObjects(oldObj, newObj, options?)`: Returns an array of object diff entries.
- `formatObjectDiff(diffs)`: Formats object diffs as a string.
- `diffMaps(oldMap, newMap, showUnchanged?, compareFn?)`: Returns an array of map diff entries.
- `diffSets(oldSet, newSet, showUnchanged?)`: Returns an array of set diff entries.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
