import pathlib, re, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
STUDIO_DARK = {"canvas": "#4a434c", "surface": "#5a535c", "ink": "#f4eef3", "muted": "#cbbdce", "subtle": "#cbbdce", "accent": "#e8a8bc", "line": "#cbbdce"}
class Dark(unittest.TestCase):
    def test_dark_block_has_all_studio_tokens(self):
        css = (ROOT / "src/signature.css").read_text(encoding="utf-8")
        m = re.search(r"\.dark \.sig, \.sig\.sig--dark \{([^}]*)\}", css)
        self.assertIsNotNone(m)
        for v in STUDIO_DARK.values(): self.assertIn(v, m.group(1))
    def test_dark_uses_only_confirmed_palette(self):
        css = (ROOT / "src/signature.css").read_text(encoding="utf-8")
        js = (ROOT / "src/signature.js").read_text(encoding="utf-8")
        for bad in ("#9a8a9c", "#2c262f", "#4a424c"):
            self.assertNotIn(bad, css); self.assertNotIn(bad, js)
    def test_dark_divider_visible(self):
        line = STUDIO_DARK["line"]; self.assertNotEqual(line.lower(), STUDIO_DARK["canvas"])
    def test_divider_keeps_its_width_when_the_svg_scales(self):
        # measured: the 1px dashed rule rendered at 1.29:1 against the dark canvas once the SVG was scaled down
        css = (ROOT / "src/signature.css").read_text(encoding="utf-8")
        rule = re.search(r"\.sig__rule \{([^}]*)\}", css).group(1)
        self.assertIn("vector-effect: non-scaling-stroke", rule)
if __name__ == "__main__": unittest.main()
