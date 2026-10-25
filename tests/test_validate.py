import pathlib, shutil, sys, tempfile, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import validate

class T(unittest.TestCase):
    def test_clean(self): self.assertEqual(validate.check(), [])

    def mutate(self, rel, old, new):
        d = pathlib.Path(tempfile.mkdtemp())
        for f in ["src/signature.js", "src/signature.css", "site/index.html", "handoff/STATE.json", "README.md"]:
            (d / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy(ROOT / f, d / f)
        p = d / rel; s = p.read_text(encoding="utf-8"); self.assertIn(old, s)
        p.write_text(s.replace(old, new, 1), encoding="utf-8")
        errs = validate.check(d); shutil.rmtree(d); return errs

    def test_detects_wrong_token(self):
        self.assertTrue(self.mutate("src/signature.css", "--sig-canvas: #f3f1f6", "--sig-canvas: #ffffff"))
    def test_detects_wrong_dark_token(self):
        self.assertTrue(self.mutate("src/signature.css", "--sig-canvas: #4a434c", "--sig-canvas: #000000"))
    def test_detects_or_option(self):
        self.assertTrue(self.mutate("src/signature.js", "opts.perGlyphMs ?? 140", "opts.perGlyphMs || 140"))
    def test_detects_innerhtml(self):
        self.assertTrue(self.mutate("src/signature.js", 'root.innerHTML = "";', 'root.innerHTML = opts.text;'))
    def test_detects_missing_label_link(self):
        self.assertTrue(self.mutate("src/signature.js", "label.htmlFor = input.id;", ""))
    def test_detects_network(self):
        self.assertTrue(self.mutate("src/signature.js", '"use strict";', '"use strict"; fetch("x");'))
    def test_detects_credit(self):
        self.assertTrue(self.mutate("README.md", "**Creator:** ilghar.studio", "**Creator:** Grok"))
    def test_detects_missing_honesty(self):
        self.assertTrue(self.mutate("README.md", "font strokes", "glyphs"))
if __name__ == "__main__": unittest.main()
