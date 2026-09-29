/* ==========================================================================
   Mermaid diagram support
   --------------------------------------------------------------------------
   Renders [source,mermaid] AsciiDoc blocks and <pre class="mermaid">
   passthroughs as diagrams, themed to match the site's dark/light mode.

   The Mermaid library is loaded on demand: this script is tiny, and only
   fetches the heavy library when the page actually contains diagram markup.
   ========================================================================== */
(function () {
  'use strict';

  /* -------------------------------------------- source block conversion */

  // AsciiDoc [source,mermaid] blocks arrive as:
  //   <div class="listingblock"><div class="content">
  //     <pre class="CodeRay highlight"><code data-lang="mermaid">…</code></pre>
  //   </div></div>
  // Convert them to bare <pre class="mermaid"> so the Mermaid library finds
  // them. textContent decodes any HTML entities CodeRay may have emitted.
  Array.prototype.forEach.call(
    document.querySelectorAll('code[data-lang="mermaid"]'),
    function (code) {
      var pre = document.createElement('pre');
      pre.className = 'mermaid';
      pre.textContent = code.textContent;
      var block = code.closest('.listingblock') || code.closest('.literalblock') || code.parentNode;

      // Carry AsciiDoc role classes (e.g. [source.animated,mermaid]) through
      // to the replacement element so CSS can target them.
      if (block.classList) {
        Array.prototype.forEach.call(block.classList, function (cls) {
          if (cls !== 'listingblock' && cls !== 'literalblock') pre.classList.add(cls);
        });
      }

      block.parentNode.replaceChild(pre, block);
    }
  );

  var diagrams = document.querySelectorAll('pre.mermaid');
  if (!diagrams.length) return;

  Array.prototype.forEach.call(diagrams, function (pre) {
    pre.setAttribute('data-mermaid-source', pre.textContent);
    // Snapshot extra classes so they survive the re-render reset.
    var extra = [];
    Array.prototype.forEach.call(pre.classList, function (cls) {
      if (cls !== 'mermaid') extra.push(cls);
    });
    if (extra.length) pre.setAttribute('data-mermaid-classes', extra.join(' '));
  });

  /* -------------------------------------------------------- theme config */

  // Read a CSS custom property as an rgb() string. The design tokens store
  // channels as space-separated integers ("9  15  27"), which may contain
  // extra whitespace from the source formatting.
  function cssVar(name) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (/^\d/.test(raw)) return 'rgb(' + raw.split(/\s+/).join(', ') + ')';
    return raw;
  }

  // Parse a --dbz-* token into [r, g, b].
  function channels(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim().split(/\s+/).map(Number);
  }

  // Blend a foreground token over a background token at a given alpha,
  // returning an opaque rgb() colour. Used to create tinted node fills
  // that match the site's palette without being overwhelming.
  function blend(fgName, bgName, alpha) {
    var fg = channels(fgName);
    var bg = channels(bgName);
    return 'rgb(' +
      Math.round(fg[0] * alpha + bg[0] * (1 - alpha)) + ', ' +
      Math.round(fg[1] * alpha + bg[1] * (1 - alpha)) + ', ' +
      Math.round(fg[2] * alpha + bg[2] * (1 - alpha)) + ')';
  }

  function buildConfig() {
    return {
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background:           'transparent',
        // Primary → brand green tint
        primaryColor:         blend('--dbz-brand', '--dbz-bg', 0.18),
        primaryTextColor:     cssVar('--dbz-text'),
        primaryBorderColor:   cssVar('--dbz-brand'),
        // Secondary → accent blue/cyan tint
        secondaryColor:       blend('--dbz-accent', '--dbz-bg', 0.15),
        secondaryTextColor:   cssVar('--dbz-text'),
        secondaryBorderColor: cssVar('--dbz-accent'),
        // Tertiary → warn orange tint
        tertiaryColor:        blend('--dbz-warn', '--dbz-bg', 0.13),
        tertiaryTextColor:    cssVar('--dbz-text'),
        tertiaryBorderColor:  cssVar('--dbz-warn'),

        lineColor:            cssVar('--dbz-muted'),
        textColor:            cssVar('--dbz-text'),
        mainBkg:              blend('--dbz-brand', '--dbz-bg', 0.18),
        nodeBorder:           cssVar('--dbz-brand'),
        clusterBkg:           blend('--dbz-accent', '--dbz-bg', 0.08),
        clusterBorder:        cssVar('--dbz-border-strong'),
        titleColor:           cssVar('--dbz-text'),
        edgeLabelBackground:  cssVar('--dbz-bg'),

        // Notes
        noteBkgColor:         blend('--dbz-accent', '--dbz-bg', 0.12),
        noteTextColor:        cssVar('--dbz-text'),
        noteBorderColor:      cssVar('--dbz-accent'),

        // Sequence diagrams
        actorBkg:             blend('--dbz-brand', '--dbz-bg', 0.18),
        actorBorder:          cssVar('--dbz-brand'),
        actorTextColor:       cssVar('--dbz-text'),
        actorLineColor:       cssVar('--dbz-muted'),
        signalColor:          cssVar('--dbz-text'),
        signalTextColor:      cssVar('--dbz-text'),
        labelBoxBkgColor:     blend('--dbz-accent', '--dbz-bg', 0.12),
        labelBoxBorderColor:  cssVar('--dbz-accent'),
        labelTextColor:       cssVar('--dbz-text'),
        loopTextColor:        cssVar('--dbz-text'),
        activationBorderColor: cssVar('--dbz-brand'),
        activationBkgColor:   blend('--dbz-brand', '--dbz-bg', 0.25),
        sequenceNumberColor:  cssVar('--dbz-on-fill'),

        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
      }
    };
  }

  /* ---------------------------------------------------------- rendering */

  // Strip inline stroke-dash* styles from CSS-animated diagrams so the
  // stylesheet animation can take effect. Targets non-flowchart types
  // (state, sequence) where native Mermaid 12 animation is not available.
  function enableAnimations() {
    var animated = document.querySelectorAll('pre.animated[data-mermaid-source]');
    Array.prototype.forEach.call(animated, function (pre) {
      var edges = pre.querySelectorAll('.transition, .messageLine0, .messageLine1');
      Array.prototype.forEach.call(edges, function (edge) {
        edge.style.removeProperty('stroke-dasharray');
        edge.style.removeProperty('stroke-dashoffset');
      });
    });
  }

  function renderAll() {
    var els = document.querySelectorAll('[data-mermaid-source]');
    Array.prototype.forEach.call(els, function (el) {
      el.textContent = el.getAttribute('data-mermaid-source');
      el.removeAttribute('data-processed');
      el.removeAttribute('id');
      el.className = 'mermaid';
      var extra = el.getAttribute('data-mermaid-classes');
      if (extra) extra.split(' ').forEach(function (cls) { el.classList.add(cls); });
    });

    mermaid.initialize(buildConfig());
    var result = mermaid.run();
    if (result && typeof result.then === 'function') {
      result.then(enableAnimations).catch(function () {});
    } else {
      setTimeout(enableAnimations, 100);
    }
  }

  /* ---------------------------------------------------------- lazy load */

  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.min.js';
  script.onload = function () {
    renderAll();
    document.documentElement.addEventListener('dbz:theme-change', function () {
      setTimeout(renderAll, 50);
    });
  };
  document.head.appendChild(script);
})();