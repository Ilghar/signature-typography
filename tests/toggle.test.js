// Runs the demo page's theme-toggle script against a tiny fake DOM and checks
// that the button exposes its state: aria-pressed plus a label naming the theme.
const assert = require("assert");
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts.find((s) => s.includes("theme-toggle"));
function run(saved, systemDark) {
  const cls = new Set(), attrs = {}; let onClick;
  const btn = { setAttribute: (k, v) => (attrs[k] = String(v)), getAttribute: (k) => attrs[k],
    addEventListener: (_, f) => (onClick = f), set textContent(v) { attrs.text = v }, get textContent() { return attrs.text } };
  const document = { documentElement: { classList: { add: (...c) => c.forEach((x) => cls.add(x)), remove: (...c) => c.forEach((x) => cls.delete(x)), contains: (c) => cls.has(c) } },
    getElementById: () => btn };
  const localStorage = { getItem: () => saved, setItem: () => {} };
  const matchMedia = () => ({ matches: systemDark, addEventListener() {} });
  new Function("document", "localStorage", "matchMedia", code)(document, localStorage, matchMedia);
  return { attrs, click: () => onClick() };
}
const light = run(null, false);
assert.strictEqual(light.attrs["aria-pressed"], "false", "initial light theme not exposed");
assert.match(light.attrs["aria-label"], /dark theme off/i);
light.click();
assert.strictEqual(light.attrs["aria-pressed"], "true", "click to dark not exposed");
assert.match(light.attrs["aria-label"], /dark theme on/i);
const sys = run(null, true);
assert.strictEqual(sys.attrs["aria-pressed"], "true", "system dark not exposed");
assert.strictEqual(run("light", true).attrs["aria-pressed"], "false", "saved light ignored");
