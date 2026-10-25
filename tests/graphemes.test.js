const assert = require("assert");
const { graphemes } = require("../src/signature.js");
assert.deepStrictEqual(graphemes("ab"), ["a", "b"]);
assert.strictEqual(graphemes("👩🏽‍🎨x").length, 2);
assert.strictEqual(graphemes("می‌خواهم").join(""), "می‌خواهم"); // ZWNJ preserved
console.log("graphemes OK");
const { isMapped } = require("../src/signature.js");
for (const g of ["a", "é", "Z", "7", ".", " ", "م", "ی", "\u200C", "—"]) assert.ok(isMapped(g), "should map " + g);
for (const g of ["漢", "😀", "👩🏽‍🎨", "Ω", "א"]) assert.ok(!isMapped(g), "should be unmapped " + g);
console.log("isMapped OK");
