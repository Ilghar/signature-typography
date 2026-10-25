const assert = require("assert");
const { sanitize, clampGraphemes, direction, exportSVG } = require("../src/signature.js");
// bidi overrides / isolates / marks / BOM stripped; ZWNJ/ZWJ kept
assert.strictEqual(sanitize("a\u202Eb\u2066c\u2069\u200F\uFEFFd"), "abcd");
assert.strictEqual(sanitize("می\u200Cخواهم"), "می\u200Cخواهم");
assert.strictEqual(sanitize("👩\u200D🎨"), "👩\u200D🎨");
assert.strictEqual(sanitize(undefined), "");
assert.ok(!exportSVG("x\u202Ey").includes("\u202E"));
// maxLength in graphemes
assert.strictEqual(clampGraphemes("👩🏽‍🎨👩🏽‍🎨👩🏽‍🎨", 2), "👩🏽‍🎨👩🏽‍🎨");
assert.strictEqual(clampGraphemes("abc", 5), "abc");
// direction: supported RTL only
assert.strictEqual(direction("ایلقار"), "rtl");
assert.strictEqual(direction("שלום"), "ltr");
assert.strictEqual(direction("abc"), "ltr");
assert.ok(exportSVG("שלום").includes('direction="ltr"'));
console.log("input OK");
