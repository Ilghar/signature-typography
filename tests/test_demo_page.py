import pathlib, re, unittest
PAGE = (pathlib.Path(__file__).resolve().parent.parent / "index.html").read_text(encoding="utf-8")

class DemoPage(unittest.TestCase):
    def test_follows_system_dark_mode(self):
        self.assertIn("prefers-color-scheme: dark", PAGE)
        self.assertIn("#4a434c", PAGE)

    def test_has_theme_toggle(self):
        self.assertRegex(PAGE, r'<button[^>]*id="theme-toggle"[^>]*aria-label=')

    def test_credit_line_is_not_low_contrast_mauve(self):
        self.assertNotRegex(PAGE, r'color:\s*#a394ae')
