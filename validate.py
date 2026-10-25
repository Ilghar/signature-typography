"""Stdlib validator: tokens, accessibility hooks, no network/backend, credit hygiene."""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).parent
TOKENS = ["#f3f1f6", "#4a3a5c", "#c97a98", "#a394ae"]

def check():
    errs = []
    css = (ROOT / "src/signature.css").read_text(encoding="utf-8")
    js = (ROOT / "src/signature.js").read_text(encoding="utf-8")
    for t in TOKENS:
        if t not in css: errs.append(f"missing token {t}")
    if "prefers-reduced-motion" not in css or "prefers-reduced-motion" not in js: errs.append("reduced-motion fallback missing")
    for hook in ["compositionend", "aria-live", "aria-hidden", "Intl.Segmenter", "<label" if False else "label"]:
        if hook not in js: errs.append(f"missing hook {hook}")
    if re.search(r"\b(fetch|XMLHttpRequest|WebSocket|eval)\s*\(", js): errs.append("network/eval call in js")
    if "innerHTML = \"\"" not in js and "innerHTML" in js: errs.append("innerHTML used with content")
    for p in ROOT.rglob("*"):
        if p.suffix in {".js", ".css", ".html", ".md"} and "tests" not in p.parts:
            txt = p.read_text(encoding="utf-8")
            if re.search(r"\bGrok\b|\bAI\b", txt): errs.append(f"forbidden credit term in {p.name}")
    return errs

if __name__ == "__main__":
    e = check(); print("\n".join(e) or "OK"); sys.exit(1 if e else 0)
