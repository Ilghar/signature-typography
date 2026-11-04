import pathlib, re, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
STUDIO_DARK = {"canvas": "#473448", "surface": "#5a535c", "ink": "#f4eef3", "muted": "#cbbdce", "subtle": "#a6a1a7", "accent": "#e8a8bc", "line": "#4a424c"}
class Dark(unittest.TestCase):
    def test_dark_block_has_all_studio_tokens(self):
        css = (ROOT / "src/signature.css").read_text(encoding="utf-8")
        m = re.search(r"\.dark \.sig, \.sig\.sig--dark \{([^}]*)\}", css)
        self.assertIsNotNone(m)
        for v in STUDIO_DARK.values(): self.assertIn(v, m.group(1))
if __name__ == "__main__": unittest.main()
