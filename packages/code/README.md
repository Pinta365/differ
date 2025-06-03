# @differ/code (WIP)

> **Work in Progress:**\
> This library is under active development. Expect breaking changes and improvements. Contributions and feedback are welcome!

## Part of the differ Suite

This package is part of the [differ suite](https://github.com/Pinta365/differ) — a collection of tools and libraries for calculating and visualizing
differences between code, sequences, and objects. It is under active development, with more features planned.

## Overview

`@differ/code` provides functions for calculating and formatting diffs specifically for code. It supports output for both terminal and web display,
making it easy to visualize code changes in different environments.

## Features

- Line-by-line code diff calculation
- Formatting of diffs with ANSI color codes and line numbering for terminal output
- Formatting of diffs as HTML for web display

Here is an simple example [jsfiddle](https://jsfiddle.net/pinta365/xcv0r65n/) to try it out live in your browser.

## Usage Example

```js
import { diffCode } from "@differ/code";

const codeBefore = `function calculate(a, b) {
  let sum = a + b;
  let product = a * b;
  let difference = a - b;
  
  // Intermediate results
  console.log('Sum:', sum);
  console.log('Product:', product);
  
  // Final calculation
  let result = (sum + product) / difference;
  return result;
}`;

const codeAfter = `function calculate(a, b) {
  let sum = a + b;
  let product = a * b;
  let difference = a - b;
  
  // Intermediate results
  console.log('Sum:', sum);
  console.log('Product:', product);
  
  // Validate input
  if (difference === 0) throw new Error('Division by zero');
  let result = (sum + product) / difference;
  return result;
}`;

// Generate the code diff
const changes = diffCode(codeBefore, codeAfter); // Defaults to terminal formatting.

console.log(changes); // Terminal diff output with ansi colouring.
//Outputs:
//10    -   // Final calculation
//   10 +   // Validate input
//   11 +   if (difference === 0) throw new Error('Division by zero');
```

### Example Outputs

#### Terminal Output

`diffCode(codeBefore, codeAfter, "terminal", { contextLines: 1 });`

![Terminal diff output](https://cdn.pinta.land/differ/differtermformat.png)

#### JSON Output

`diffCode(codeBefore, codeAfter, "json", { contextLines: 1 });`

```json
{
    "options": { "contextLines": 1, "showLineNumbers": true },
    "diff": [
        { "type": "omitted", "count": 8 },
        { "type": "unchanged", "lineNumbers": { "old": 9, "new": 9 }, "content": "  " },
        { "type": "removed", "lineNumbers": { "old": 10 }, "content": "  // Final calculation" },
        { "type": "added", "lineNumbers": { "new": 10 }, "content": "  // Validate input" },
        { "type": "added", "lineNumbers": { "new": 11 }, "content": "  if (difference === 0) throw new Error('Division by zero');" },
        { "type": "unchanged", "lineNumbers": { "old": 11, "new": 12 }, "content": "  let result = (sum + product) / difference;" },
        { "type": "omitted", "count": 2 }
    ]
}
```

#### HTML Output

```html
<div class="diff-omitted">
    <span class="diff-omitted-content">... 8 lines omitted ...</span>
</div>
<div class="diff-line diff-same">
    <span class="line-number left"> 9</span>
    <span class="line-number right"> 9</span>
    <span class="diff-prefix"> </span>
    <span class="diff-content"> </span>
</div>
<div class="diff-line diff-delete">
    <span class="line-number left">10</span>
    <span class="line-number right"></span>
    <span class="diff-prefix">-</span>
    <span class="diff-content"> // Final calculation</span>
</div>
<div class="diff-line diff-add">
    <span class="line-number left"></span>
    <span class="line-number right">10</span>
    <span class="diff-prefix">+</span>
    <span class="diff-content"> // Validate input</span>
</div>
<div class="diff-line diff-add">
    <span class="line-number left"></span>
    <span class="line-number right">11</span>
    <span class="diff-prefix">+</span>
    <span class="diff-content"> if (difference === 0) throw new Error(&#039;Division by zero&#039;);</span>
</div>
<div class="diff-line diff-same">
    <span class="line-number left">11</span>
    <span class="line-number right">12</span>
    <span class="diff-prefix"> </span>
    <span class="diff-content"> let result = (sum + product) / difference;</span>
</div>
<div class="diff-omitted">
    <span class="diff-omitted-content">... 2 lines omitted ...</span>
</div>
```

## Output Formats

- **json**: Machine-readable diff for further processing.
- **terminal**: Human-friendly, colorized output for CLI tools.
- **html**: Rich, styled output for web display.

## Formatter Options

You can control the output of `diffCode` using the fourth argument, which is an options object. The available options depend on the selected format:

### Terminal Formatter (`"terminal"`)

```js
diffCode(before, after, "terminal", {
    useColours: true, // Use ANSI color codes (default: true)
    contextLines: 2, // Number of unchanged lines to show around changes (default: 0)
});
```

| Option       | Type    | Default | Description                                  |
| ------------ | ------- | ------- | -------------------------------------------- |
| useColours   | boolean | true    | Use ANSI color codes in the output           |
| contextLines | number  | 0       | Number of unchanged lines to show as context |

---

### HTML Formatter (`"html"`)

```js
diffCode(before, after, "html", {
    contextLines: 2, // Number of unchanged lines to show around changes (default: 0)
    showLineNumbers: true, // Show line numbers (default: true)
    classes: { // Custom CSS class names for elements (all optional)
        add: "my-add-class",
        delete: "my-delete-class",
        // ... see below for all keys
    },
});
```

| Option          | Type    | Default | Description                                                                                                                         |
| --------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| contextLines    | number  | 0       | Number of unchanged lines to show as context                                                                                        |
| showLineNumbers | boolean | true    | Show line numbers                                                                                                                   |
| classes         | object  | —       | Custom CSS class names for elements:<br> `container`, `line`, `add`, `delete`, `same`, `omitted`, `lineNumber`, `prefix`, `content` |

---

### JSON Formatter (`"json"`)

```js
diffCode(before, after, "json", {
    contextLines: 3, // Number of unchanged lines to show around changes (default: 3)
    showLineNumbers: false, // Include line numbers in the output (default: true)
});
```

| Option          | Type    | Default | Description                                  |
| --------------- | ------- | ------- | -------------------------------------------- |
| contextLines    | number  | 3       | Number of unchanged lines to show as context |
| showLineNumbers | boolean | true    | Include line numbers in the output           |

---

**Tip:**\
If you omit the options argument, sensible defaults are used for each format.

## Contributing

This project is in early development. Please open issues or pull requests for feedback and contributions!

## License

MIT
