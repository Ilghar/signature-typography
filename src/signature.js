/* Signature typography — ilghar.studio. Vanilla JS, no dependencies, no backend.
   Usage: mountSignature(element, { text: "ilghar.studio" }) */
(function (global) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var TOKENS = { canvas: "#f3f1f6", plum: "#4a3a5c", rose: "#c97a98", mauve: "#a394ae" };

  function graphemes(str) {
    if (global.Intl && Intl.Segmenter) {
      return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), function (s) { return s.segment; });
    }
    return Array.from(str);
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function mountSignature(root, opts) {
    opts = opts || {};
    var maxLen = opts.maxLength || 40;
    var perGlyphMs = opts.perGlyphMs || 140;
    root.classList.add("sig");
    root.innerHTML = "";

    var label = document.createElement("label");
    label.className = "sig__label";
    label.textContent = opts.label || "Write a signature";
    var input = document.createElement("input");
    input.className = "sig__input";
    input.type = "text";
    input.maxLength = maxLen;
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
    root.appendChild(replay); root.appendChild(live);

    var composing = false, timer = null;

    function render(animate) {
      var value = input.value;
      var parts = graphemes(value).slice(0, maxLen);
      while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
      var rtl = /[\u0590-\u08FF\uFB1D-\uFEFC]/.test(value);
      textEl.setAttribute("direction", rtl ? "rtl" : "ltr");
      parts.forEach(function (g, i) {
        var t = document.createElementNS(NS, "tspan");
        t.textContent = g;
        t.setAttribute("class", "sig__glyph" + (animate && !prefersReducedMotion() ? " is-drawing" : ""));
        t.style.animationDelay = (i * perGlyphMs) + "ms";
        textEl.appendChild(t);
      });
      clearTimeout(timer);
      timer = setTimeout(function () { live.textContent = value ? "Signature: " + value : ""; }, 400);
    }

    input.addEventListener("compositionstart", function () { composing = true; });
    input.addEventListener("compositionend", function () { composing = false; render(true); });
    input.addEventListener("input", function () { if (!composing) render(true); });
    replay.addEventListener("click", function () { render(true); });

    input.value = opts.text || "";
    render(true);
    return { input: input, svg: svg, render: render, tokens: TOKENS };
  }

  global.mountSignature = mountSignature;
  if (typeof module !== "undefined") module.exports = { mountSignature: mountSignature, graphemes: graphemes };
})(typeof window !== "undefined" ? window : globalThis);
