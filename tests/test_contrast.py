"""WCAG 2.x contrast for both themes, using the studio tokens."""
import pathlib, re, unittest
def lum(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
LIGHT={"canvas":"#f3f1f6","surface":"#fffcfe","ink":"#4a3a5c","muted":"#7a688c","accent":"#c97a98","subtle":"#a394ae"}
DARK={"canvas":"#4a434c","surface":"#5a535c","ink":"#f4eef3","muted":"#cbbdce","accent":"#e8a8bc","subtle":"#cbbdce","accent_fg":"#4a434c"}
CSS = (pathlib.Path(__file__).resolve().parents[1] / "src/signature.css").read_text(encoding="utf-8")
class Contrast(unittest.TestCase):
    def test_body_text_aa(self):
        for t in (LIGHT,DARK):
            self.assertGreaterEqual(ratio(t["ink"],t["canvas"]),4.5)
            self.assertGreaterEqual(ratio(t["ink"],t["surface"]),4.5)
            self.assertGreaterEqual(ratio(t["muted"],t["canvas"]),3.0)
        self.assertGreaterEqual(ratio(DARK["subtle"],DARK["canvas"]),3.0)  # dark divider/rule visible
    def test_buttons_aa(self):
        self.assertGreaterEqual(ratio(LIGHT["canvas"],LIGHT["ink"]),4.5)   # light buttons
        self.assertGreaterEqual(ratio(DARK["accent_fg"],DARK["accent"]),4.5)  # dark buttons
class Usage(unittest.TestCase):
    def test_label_not_low_contrast(self):
        self.assertRegex(CSS, r"\.sig__label \{[^}]*color: var\(--sig-plum\)")
    def test_unmapped_fallback_large_text_3to1(self):
        self.assertRegex(CSS, r"\.sig__glyph--unmapped \{ fill: var\(--sig-muted\)")
        for t in (LIGHT, DARK): self.assertGreaterEqual(ratio(t["muted"], t["canvas"]), 3.0)
    def test_prefers_color_scheme(self):
        self.assertIn("prefers-color-scheme: dark", CSS)
if __name__=="__main__":
    unittest.main()
