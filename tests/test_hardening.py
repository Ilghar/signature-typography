import pathlib, re, shutil, sys, tempfile, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import validate

CSS = (ROOT / "src/signature.css").read_text(encoding="utf-8")


class Validator(unittest.TestCase):
    def test_detects_wrong_system_dark_token(self):
        d = pathlib.Path(tempfile.mkdtemp())
        try:
            for f in ["src/signature.js", "src/signature.css", "site/index.html", "handoff/STATE.json", "README.md"]:
                (d / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy(ROOT / f, d / f)
            p = d / "src/signature.css"; s = p.read_text(encoding="utf-8")
            old = ".sig:not(.sig--light) {\n    --sig-canvas: #4a434c"
            self.assertIn(old, s)
            p.write_text(s.replace(old, ".sig:not(.sig--light) {\n    --sig-canvas: #000000", 1), encoding="utf-8")
            self.assertTrue(validate.check(d))
        finally:
            shutil.rmtree(d)


class ExplicitTheme(unittest.TestCase):
    def test_explicit_light_beats_dark_ancestor(self):
        self.assertRegex(CSS, r"\.dark \.sig\.sig--light[^{]*\{[^}]*--sig-canvas: #f3f1f6")
    def test_explicit_dark_beats_light_ancestor(self):
        self.assertRegex(CSS, r"\.light \.sig\.sig--dark[^{]*\{[^}]*--sig-canvas: #4a434c")


if __name__ == "__main__":
    unittest.main()
