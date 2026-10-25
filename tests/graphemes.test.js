const assert = require("assert");
const { graphemes } = require("../src/signature.js");
assert.deepStrictEqual(graphemes("ab"), ["a", "b"]);
assert.strictEqual(graphemes("👩🏽‍🎨x").length, 2);
assert.strictEqual(graphemes("می‌خواهم").join(""), "می‌خواهم"); // ZWNJ preserved
console.log("graphemes OK");
