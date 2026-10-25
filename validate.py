"""Stdlib validator. Each check parses the real source structure instead of looking for loose substrings."""
import json, pathlib, re, sys

LIGHT = {"canvas": "#f3f1f6", "plum": "#4a3a5c", "rose": "#c97a98", "mauve": "#a394ae",
         "surface": "#fffcfe", "line": "#e4dde8", "muted": "#7a688c"}
DARK = {"canvas": "#4a434c", "surface": "#5a535c", "plum": "#f4eef3", "muted": "#cbbdce",
        "mauve": "#9a8a9c", "rose": "#e8a8bc", "line": "#4a424c"}

def block(css, selector):
    m = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", css)
    return m.group(1) if m else None

def props(body):
    return dict(re.findall(r"--sig-([a-z]+)\s*:\s*([^;]+);", body or ""))

def check(root=None):
    root = pathlib.Path(root or pathlib.Path(__file__).parent)
    errs = []
    css = (root / "src/signature.css").read_text(encoding="utf-8")
    js = (root / "src/signature.js").read_text(encoding="utf-8")

    light = props(block(css, ".sig"))
    for k, v in LIGHT.items():
        if light.get(k, "").strip().lower() != v: errs.append(f"light token --sig-{k} != {v}")
    dark = props(block(css, ".dark .sig, .sig.sig--dark"))
    for k, v in DARK.items():
        if dark.get(k, "").strip().lower() != v: errs.append(f"dark token --sig-{k} != {v}")
    if not re.search(r"@media\s*\(prefers-color-scheme:\s*dark\)", css): errs.append("no prefers-color-scheme rule")
    sysdark = props(block(css, ".sig:not(.sig--light)"))
    for k, v in DARK.items():
        if sysdark.get(k, "").strip().lower() != v: errs.append(f"system-dark token --sig-{k} != {v}")
    rm = re.search(r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^{]*\{([^}]*)\}", css)
    if not rm or "animation: none" not in rm.group(1): errs.append("reduced-motion rule does not disable animation")
    if "prefersReducedMotion()" not in js: errs.append("JS does not consult reduced-motion")

    if not re.search(r"label\.htmlFor\s*=\s*input\.id", js): errs.append("label not associated with input")
    if not re.search(r'setAttribute\("aria-live",\s*"polite"\)', js): errs.append("no polite live region")
    if not re.search(r'svg\.setAttribute\("aria-hidden",\s*"true"\)', js): errs.append("decorative SVG not aria-hidden")
    if not re.search(r'addEventListener\("compositionend"', js): errs.append("no IME compositionend handling")
    if re.search(r"\b(fetch|XMLHttpRequest|WebSocket|eval|Function)\s*\(", js): errs.append("network/eval call in js")
    for m in re.finditer(r"\.innerHTML\s*=\s*([^;]+);", js):
        if m.group(1).strip() != '""': errs.append("innerHTML assigned non-empty content")
    if re.search(r"opts\.\w+\s*\|\|", js): errs.append("option uses || instead of ??")
    if re.search(r"input\.maxLength\s*=", js): errs.append("maxLength via UTF-16 attribute, not graphemes")
    if "sig__glyph--unmapped" not in css or not re.search(r"function isMapped\(", js): errs.append("unmapped-glyph fallback missing")
    if not re.search(r"function exportSVG\(", js): errs.append("SVG export missing")
    if not (root / "site/index.html").exists(): errs.append("site/index.html missing")
    else:
        site = (root / "site/index.html").read_text(encoding="utf-8")
        if 'aria-pressed' not in site or 'localStorage' not in site: errs.append("site theme toggle not accessible/persisted")

    st = json.loads((root / "handoff/STATE.json").read_text(encoding="utf-8"))
    if st.get("visibility") != "private" or st.get("creator") != "ilghar.studio": errs.append("STATE.json visibility/creator wrong")
    if "font strokes" not in (root / "README.md").read_text(encoding="utf-8"): errs.append("README honesty note missing")
    for p in root.rglob("*"):
        if p.is_file() and p.suffix in {".js", ".css", ".html", ".md", ".json"} and "tests" not in p.parts:
            if re.search(r"\bGrok\b|\bAI\b", p.read_text(encoding="utf-8")): errs.append(f"forbidden credit term in {p.name}")
    return errs

if __name__ == "__main__":
    e = check(); print("\n".join(e) or "OK"); sys.exit(1 if e else 0)
