/* Signature typography — ilghar.studio. Vanilla JS, no dependencies, no backend.
   Usage: mountSignature(element, { text: "ilghar.studio" }) */
(function (global) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var TOKENS = { canvas: "#f9fafb", plum: "#473448", rose: "#856a8e", mauve: "#a6a1a7" };

  function graphemes(str) {
    if (global.Intl && Intl.Segmenter) {
      return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), function (s) { return s.segment; });
    }
    return Array.from(str);
  }

  // Mapped repertoire: Latin (incl. accents), digits, common punctuation, Persian/Arabic, ZWNJ/ZWJ, space.
  var MAPPED = /^[\u0020-\u007E\u00A0-\u024F\u0300-\u036F\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u2013\u2014\u2018-\u201D\u2026]+$/;
  function isMapped(g) { return MAPPED.test(g); }

  // Bidi embeddings/overrides/isolates, LRM/RLM/ALM and BOM/ZWNBSP are stripped: they can reorder
  // or hide what is displayed versus what is stored. ZWNJ/ZWJ are kept (needed for Persian/emoji).
  var STRIP = /[\u202A-\u202E\u2066-\u2069\u200E\u200F\u061C\uFEFF]/g;
  // Characters XML 1.0 forbids (C0 controls except tab/LF/CR, DEL, U+FFFE/U+FFFF) would make the export malformed.
  var CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]/g;
  function sanitize(str) { return String(str ?? "").replace(STRIP, "").replace(CONTROL, ""); }

  // A negative, NaN or non-numeric max is not a limit (slice(0, -1) would silently drop the last grapheme).
  function clampGraphemes(str, max) {
    if (typeof max !== "number" || !(max >= 0)) return str;
    return graphemes(str).slice(0, max).join("");
  }

  // RTL only for scripts this component supports (Persian/Arabic); everything else uses the default LTR.
  var SUPPORTED_RTL = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFC]/;
  function direction(str) { return SUPPORTED_RTL.test(str) ? "rtl" : "ltr"; }

  var DARK = { canvas: "#2a272d", plum: "#d4d2d2", rose: "#fcb4c4", mauve: "#a6a1a7" };

  function escapeXml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" }[c];
    });
  }

  // Standalone SVG of the finished (fully drawn) signature. Pure: no DOM needed.
  function exportSVG(text, opts) {
    opts = opts ?? {};
    text = sanitize(text);
    var t = opts.dark ? DARK : TOKENS;
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">' +
      '<title>' + escapeXml(text) + ' — signature, ilghar.studio</title>' +
      '<rect width="800" height="200" fill="' + t.canvas + '"/>' +
      '<text x="400" y="128" text-anchor="middle" direction="' + direction(text) + '" font-family="Jost, sans-serif" font-weight="300" font-size="88" fill="' + t.plum + '" stroke="' + t.rose + '" stroke-width="1.2">' + escapeXml(text) + '</text>' +
      '<line x1="80" x2="720" y1="160" y2="160" stroke="' + t.mauve + '" stroke-dasharray="2 6"/>' +
      '</svg>\n';
  }

  function isDark(root) {
    // Same precedence as the CSS: explicit { dark } option, then a .light/.dark ancestor, then the system.
    if (root.classList.contains("sig--light")) return false;
    if (root.classList.contains("sig--dark")) return true;
    if (root.closest && root.closest(".light")) return false;
    if (root.closest && root.closest(".dark")) return true;
    return !!(global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function mountSignature(root, opts) {
    opts = opts ?? {};
    var maxLen = opts.maxLength ?? 40;
    var perGlyphMs = opts.perGlyphMs ?? 140;
    root.classList.add("sig");
    root.innerHTML = "";

    var label = document.createElement("label");
    label.className = "sig__label";
    label.textContent = opts.label ?? "Write a signature";
    var input = document.createElement("input");
    input.className = "sig__input";
    input.type = "text";
    // maxLength is enforced in graphemes in render(), not UTF-16 units via the attribute.
    input.autocomplete = "off";
    input.spellcheck = false;
    input.id = "sig-" + Math.random().toString(36).slice(2, 8);
    label.htmlFor = input.id;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "sig__svg");
    svg.setAttribute("viewBox", "0 0 800 200");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var textEl = document.createElementNS(NS, "text");
    textEl.setAttribute("x", "400"); textEl.setAttribute("y", "128");
    textEl.setAttribute("text-anchor", "middle");
    textEl.setAttribute("class", "sig__text");
    svg.appendChild(textEl);
    var line = document.createElementNS(NS, "line");
    line.setAttribute("x1", "80"); line.setAttribute("x2", "720");
    line.setAttribute("y1", "160"); line.setAttribute("y2", "160");
    line.setAttribute("class", "sig__rule");
    svg.appendChild(line);

    var live = document.createElement("p");
    live.className = "sig__live";
    live.setAttribute("aria-live", "polite");

    var replay = document.createElement("button");
    replay.type = "button";
    replay.className = "sig__replay";
    replay.textContent = "Replay";

    root.appendChild(label); root.appendChild(input); root.appendChild(svg);
    var save = document.createElement("button");
    save.type = "button";
    save.className = "sig__replay sig__save";
    save.textContent = "Download SVG";
    save.addEventListener("click", function () {
      var blob = new Blob([exportSVG(input.value, { dark: isDark(root) })], { type: "image/svg+xml" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "signature.svg";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    if (opts.dark === true) root.classList.add("sig--dark");
    if (opts.dark === false) root.classList.add("sig--light");

    var actions = document.createElement("div");
    actions.className = "sig__actions";
    actions.appendChild(replay); actions.appendChild(save);
    root.appendChild(actions); root.appendChild(live);

    var composing = false, timer = null;

    function render(animate) {
      var clean = clampGraphemes(sanitize(input.value), maxLen);
      if (clean !== input.value) input.value = clean;
      var value = clean;
      var parts = graphemes(value);
      while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
      textEl.setAttribute("direction", direction(value));
      var unmapped = 0;
      parts.forEach(function (g, i) {
        var t = document.createElementNS(NS, "tspan");
        t.textContent = g; // original character is always preserved
        var mapped = isMapped(g);
        if (!mapped) unmapped++;
        t.setAttribute("class", "sig__glyph" + (mapped ? "" : " sig__glyph--unmapped") + (animate && !prefersReducedMotion() ? " is-drawing" : ""));
        t.style.animationDelay = (i * perGlyphMs) + "ms";
        textEl.appendChild(t);
      });
      clearTimeout(timer);
      root.setAttribute("data-unmapped", String(unmapped));
      timer = setTimeout(function () { live.textContent = value ? "Signature: " + value + (unmapped ? " (" + unmapped + " character" + (unmapped > 1 ? "s" : "") + " shown in fallback style)" : "") : ""; }, 400);
    }

    input.addEventListener("compositionstart", function () { composing = true; });
    input.addEventListener("compositionend", function () { composing = false; render(true); });
    input.addEventListener("input", function () { if (!composing) render(true); });
    replay.addEventListener("click", function () { render(true); });

    input.value = opts.text ?? "";
    render(true);
    return { input: input, svg: svg, render: render, tokens: TOKENS, exportSVG: function () { return exportSVG(input.value, { dark: isDark(root) }); } };
  }

  global.mountSignature = mountSignature;
  if (typeof module !== "undefined") module.exports = { mountSignature: mountSignature, graphemes: graphemes, isMapped: isMapped, exportSVG: exportSVG, sanitize: sanitize, clampGraphemes: clampGraphemes, direction: direction, isDark: isDark, TOKENS: TOKENS, DARK: DARK };
})(typeof window !== "undefined" ? window : globalThis);
