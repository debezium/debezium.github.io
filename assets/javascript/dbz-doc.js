/* ==========================================================================
   Debezium long-form content behaviour
   --------------------------------------------------------------------------
   Progressive enhancement for Asciidoctor output: a table of contents built
   from the document's own headings, copy buttons on code blocks, and scroll
   containers around wide tables.

   All of it is additive. With JavaScript off the post still reads correctly;
   the rail simply stays empty and is hidden.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.querySelector('[data-dbz-doc]');
  if (!doc) return;

  /* ------------------------------------------------------ table of contents */

  function buildToc() {
    var rail = document.querySelector('[data-dbz-toc]');
    if (!rail) return;

    // Some documents set `:toc: macro` and Asciidoctor renders its own table
    // of contents into the body. Building the rail as well would show the same
    // list twice, so the document's own wins - it works without JavaScript.
    if (doc.querySelector('#toc')) {
      var own = rail.closest('[data-dbz-toc-container]');
      if (own) own.hidden = true;
      return;
    }

    // Asciidoctor gives every section heading an id, which is what the rail
    // links to. Headings without one are skipped rather than invented for,
    // so the links can never point at nothing.
    var headings = doc.querySelectorAll('h2[id], h3[id]');
    // A document may start at level 3 (foundation/faq uses "===" throughout
    // with no "==" parent). Indenting every entry then would be misleading, so
    // when there is no h2 at all the h3s are treated as the top level.
    var hasTopLevel = doc.querySelector('h2[id]') !== null;
    if (headings.length < 2) {
      var container = rail.closest('[data-dbz-toc-container]');
      if (container) container.hidden = true;
      return;
    }

    var list = document.createElement('nav');
    list.setAttribute('aria-label', 'On this page');

    Array.prototype.forEach.call(headings, function (h) {
      var link = document.createElement('a');
      link.className = 'dbz-toc__link';
      link.href = '#' + h.id;
      link.setAttribute('data-level', (hasTopLevel && h.tagName === 'H3') ? '3' : '2');
      // textContent, not innerHTML: heading markup may contain anchor links
      // and inline code that would break the rail's layout.
      link.textContent = (h.textContent || '').trim();
      list.appendChild(link);
    });

    rail.appendChild(list);
    highlightOnScroll(headings, list);
  }

  /*
   * Marks the heading currently in view. IntersectionObserver alone reports
   * only what is intersecting, so the last heading seen above the viewport is
   * tracked explicitly - otherwise nothing is highlighted while reading the
   * middle of a long section.
   */
  function highlightOnScroll(headings, list) {
    if (!('IntersectionObserver' in window)) return;

    var links = list.querySelectorAll('.dbz-toc__link');
    var visible = {};

    var setCurrent = function (id) {
      Array.prototype.forEach.call(links, function (l) {
        l.classList.toggle('is-current', l.getAttribute('href') === '#' + id);
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        var current = null;
        Array.prototype.forEach.call(headings, function (h) {
          if (visible[h.id]) { if (!current) current = h.id; }
          else if (h.getBoundingClientRect().top < 0) { current = h.id; }
        });

        if (current) setCurrent(current);
      },
      // Top margin clears the sticky header so a heading counts as "current"
      // once it settles under the bar rather than at the viewport edge.
      { rootMargin: '-6rem 0px -70% 0px', threshold: 0 }
    );

    Array.prototype.forEach.call(headings, function (h) { observer.observe(h); });
  }

  /* ------------------------------------------------------------ copy button */

  function addCopyButtons() {
    if (!navigator.clipboard) return;

    Array.prototype.forEach.call(doc.querySelectorAll('.listingblock pre, .literalblock pre'),
      function (pre) {
        var wrap = document.createElement('div');
        wrap.className = 'dbz-codewrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dbz-copy';
        btn.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');

        btn.addEventListener('click', function () {
          // innerText, not textContent: it respects the rendered line breaks
          // that CodeRay's span soup would otherwise collapse.
          navigator.clipboard.writeText(pre.innerText).then(function () {
            btn.textContent = 'Copied';
            btn.setAttribute('data-copied', 'true');
            window.setTimeout(function () {
              btn.textContent = 'Copy';
              btn.removeAttribute('data-copied');
            }, 2000);
          }).catch(function () {
            btn.textContent = 'Press Ctrl+C';
            window.setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
          });
        });

        wrap.appendChild(btn);
      });
  }

  /* ----------------------------------------------------------- wide tables */

  function wrapTables() {
    Array.prototype.forEach.call(doc.querySelectorAll('table.tableblock'), function (table) {
      if (table.parentNode.classList.contains('dbz-tablewrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'dbz-tablewrap';
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Table, scrollable');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* ---------------------------------------------------------------- roadmap */

  /*
   * The roadmap source writes each item as "[Component] description". Those
   * prefixes are the only structure in a list of sixty-odd entries, so they are
   * promoted to chips, collected into a filter, and the milestones matching the
   * current stable and development series are marked.
   *
   * Entirely additive: with JavaScript off the page is still a correct,
   * readable roadmap with the prefixes as plain text.
   */
  function initRoadmap() {
    var roadmap = document.querySelector('[data-dbz-roadmap]');
    if (!roadmap) return;

    var AREA = /^\s*\[([^\]]+)\]\s*/;
    var areas = {};

    Array.prototype.forEach.call(roadmap.querySelectorAll('li'), function (li) {
      // Asciidoctor wraps list item text in a <p> for some list styles.
      var host = li.querySelector(':scope > p') || li;
      var first = host.firstChild;
      if (!first || first.nodeType !== 3) return;

      var match = AREA.exec(first.nodeValue);
      if (!match) return;

      var area = match[1];
      first.nodeValue = first.nodeValue.slice(match[0].length);

      var chip = document.createElement('span');
      chip.className = 'dbz-chip';
      chip.textContent = area;
      host.insertBefore(chip, first);

      li.setAttribute('data-dbz-area', area);
      areas[area] = (areas[area] || 0) + 1;
    });

    markCurrentMilestones(roadmap);

    var names = Object.keys(areas).sort();
    if (names.length > 1) buildAreaFilter(roadmap, names, areas);
  }

  /* Flags the milestones for the series that are actually current. */
  function markCurrentMilestones(roadmap) {
    var stable = roadmap.getAttribute('data-dbz-stable');
    var dev = roadmap.getAttribute('data-dbz-dev');

    Array.prototype.forEach.call(roadmap.querySelectorAll('h2'), function (h) {
      var version = /^\s*(\d+\.\d+)/.exec(h.textContent || '');
      if (!version) return;

      var label = null;
      if (stable && version[1] === stable) label = 'current stable';
      else if (dev && version[1] === dev) label = 'in development';
      if (!label) return;

      var pill = document.createElement('span');
      pill.className = 'dbz-milestone-pill';
      pill.textContent = label;
      h.appendChild(pill);
      h.closest('.sect1').setAttribute('data-dbz-current', 'true');
    });
  }

  function buildAreaFilter(roadmap, names, counts) {
    var panel = document.querySelector('[data-dbz-roadmap-filter]');
    var host = document.querySelector('[data-dbz-roadmap-areas]');
    if (!panel || !host) return;

    var active = null;

    var apply = function () {
      Array.prototype.forEach.call(roadmap.querySelectorAll('li[data-dbz-area]'), function (li) {
        li.hidden = active !== null && li.getAttribute('data-dbz-area') !== active;
      });

      // A milestone whose every item is filtered out is hidden too, rather
      // than left as a heading with nothing under it.
      Array.prototype.forEach.call(roadmap.querySelectorAll('.sect1'), function (section) {
        var items = section.querySelectorAll('li[data-dbz-area]');
        if (!items.length) { section.hidden = active !== null; return; }
        var anyVisible = Array.prototype.some.call(items, function (li) { return !li.hidden; });
        section.hidden = !anyVisible;
      });

      Array.prototype.forEach.call(host.children, function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-area') === active));
      });
    };

    names.forEach(function (name) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dbz-chip dbz-chip--button';
      btn.setAttribute('data-area', name);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '';
      btn.appendChild(document.createTextNode(name));

      var count = document.createElement('span');
      count.className = 'dbz-chip__count';
      count.textContent = String(counts[name]);
      btn.appendChild(count);

      btn.addEventListener('click', function () {
        active = active === name ? null : name;
        apply();
      });

      host.appendChild(btn);
    });

    panel.hidden = false;
  }

  /* ----------------------------------------------------------- page filter */

  /*
   * Filters a long document down to the sections matching a query. Used on the
   * FAQ, where forty-odd questions are otherwise only findable by scrolling or
   * by the browser's own search - which finds the text but leaves everything
   * else in the way.
   *
   * Matching is on the section's whole text, so a question is found by words
   * in its answer as well as in its heading.
   */
  function initDocFilter() {
    var input = document.querySelector('[data-dbz-doc-filter]');
    if (!input) return;

    var counter = document.querySelector('[data-dbz-doc-filter-count]');
    // Asciidoctor wraps "==" sections in .sect1 and "===" in .sect2. A document
    // written entirely at level 3 has no .sect1 at all, so fall back rather
    // than rendering a filter box that silently does nothing.
    var sections = doc.querySelectorAll('.sect1');
    if (!sections.length) sections = doc.querySelectorAll('.sect2');
    if (!sections.length) return;

    // The document's own table of contents is filtered alongside the sections,
    // so it cannot end up listing something that is currently hidden.
    var tocLinks = doc.querySelectorAll('#toc a');

    var apply = function () {
      var query = input.value.trim().toLowerCase();
      var shown = 0;

      Array.prototype.forEach.call(sections, function (section) {
        var match = !query || (section.textContent || '').toLowerCase().indexOf(query) !== -1;
        section.hidden = !match;
        if (match) shown++;
      });

      Array.prototype.forEach.call(tocLinks, function (link) {
        var target = document.getElementById((link.getAttribute('href') || '').slice(1));
        var section = target ? target.closest('.sect1') : null;
        var item = link.closest('li');
        if (item) item.hidden = !!(section && section.hidden);
      });

      if (counter) {
        counter.textContent = query
          ? shown + ' of ' + sections.length + ' match "' + input.value.trim() + '"'
          : '';
      }
    };

    input.addEventListener('input', apply);

    // Escape clears, which is what a search field is expected to do.
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { input.value = ''; apply(); }
    });
  }

  function init() {
    wrapTables();
    addCopyButtons();
    buildToc();
    initRoadmap();
    initDocFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();