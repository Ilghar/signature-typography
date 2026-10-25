# Signature typography

An animated signature you can actually type into. As you write, each letter is traced in rose and then filled in plum on the ilghar.studio canvas, as if it were being drawn by hand.

**Creator:** ilghar.studio

## What it does
- **A real text field.** Typing, pasting, backspace, mobile keyboards and IME composition (Persian, CJK) all work. The animation follows the field and never replaces it.
- **Grapheme-aware.** Text is split with `Intl.Segmenter`, so emoji, combining marks and Persian ZWNJ are never broken apart.
- **RTL-aware.** Right-to-left text switches the SVG direction.
- **Accessible.** The input has a label, the SVG is `aria-hidden`, a polite live region announces the signature once typing settles, and focus rings are visible.
- **Reduced motion.** With `prefers-reduced-motion`, the signature appears instantly with no animation.
- **No backend and no dependencies.** Two files: `src/signature.js` and `src/signature.css`.

## How it works
input / paste / IME → grapheme split → SVG `<tspan>` per glyph → CSS stroke-dash "draw" then fill → live-region announcement

## Embed in a React site
Copy `src/signature.css` and `src/signature.js` into the site, then:
```jsx
import "./signature.css";
import "./signature.js"; // defines window.mountSignature
import { useEffect, useRef } from "react";
export function Signature() {
  const ref = useRef(null);
  useEffect(() => { window.mountSignature(ref.current, { text: "ilghar.studio" }); }, []);
  return <div ref={ref} />;
}
```
Options: `text`, `label`, `maxLength` (default 40), `perGlyphMs` (default 140).

## Run and check
- Demo: open `index.html`.
- `python3 validate.py` checks the palette tokens, the accessibility hooks, that there are no network calls, and the credit wording.
- `python3 -m unittest discover tests` and `node tests/graphemes.test.js` run the tests.

## Rights
Everything here is original code. Nothing is copied from the earlier `Signature-animation` repository, which has no license. Type is set in Jost (SIL OFL 1.1), loaded by the host site. No font files are bundled.

## Not built yet
- A hand-drawn SVG letter bank with real pen paths. It needs artwork that ilghar.studio owns.
- Variable pen pressure.
- Export to SVG or PNG.
- Automated browser tests for focus, paste and IME on real devices.
- Measuring layout shift.
