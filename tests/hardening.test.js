const assert = require("assert");
const { exportSVG, sanitize, clampGraphemes, isDark } = require("../src/signature.js");
// XML 1.0 forbids C0 controls (except tab/LF/CR), U+FFFE and U+FFFF: export must stay well-formed.
const ctl = exportSVG("a\u0001b\u000Bc\u001Fd\uFFFEe\uFFFF");
assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.test(ctl), "export contains XML-invalid characters");
assert.strictEqual(sanitize("a\u0000b\u007F"), "ab");
// maxLength: negative / NaN / non-numeric must not drop or wipe text
assert.strictEqual(clampGraphemes("abc", -1), "abc");
assert.strictEqual(clampGraphemes("abc", NaN), "abc");
assert.strictEqual(clampGraphemes("abc", "x"), "abc");
assert.strictEqual(clampGraphemes("abc", 0), "");
assert.strictEqual(clampGraphemes("abcdef", 2.7), "ab");
// Explicit { dark } option wins over ancestors, matching the CSS
function fakeRoot(cls, ancestor) {
  return { classList: { contains: (c) => cls === c }, closest: (sel) => (sel === "." + ancestor ? {} : null) };
}
assert.strictEqual(isDark(fakeRoot("sig--light", "dark")), false);
assert.strictEqual(isDark(fakeRoot("sig--dark", "light")), true);
assert.strictEqual(isDark(fakeRoot("", "dark")), true);
assert.strictEqual(isDark(fakeRoot("", "light")), false);
console.log("hardening OK");
