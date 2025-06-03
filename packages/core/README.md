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
// diff is an array of { type, content, ... } entries
```

### Object Diff

```js
import { diffObjects, formatObjectDiff } from "@differ/core";

const oldObj = { a: 1, b: 2 };
const newObj = { a: 1, b: 3, c: 4 };
const diffs = diffObjects(oldObj, newObj);
console.log(formatObjectDiff(diffs));
```

## API

- `lcs(a, b, compareFn?)`: Returns a 2D array for LCS calculation.
- `sequentialDiff(left, right, options?)`: Returns an array of diff entries for two arrays.
- `diffObjects(oldObj, newObj, options?)`: Returns an array of object diff entries.
- `formatObjectDiff(diffs)`: Formats object diffs as a string.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
