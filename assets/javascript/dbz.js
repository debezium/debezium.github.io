/* ==========================================================================
   Debezium site behaviour
   --------------------------------------------------------------------------
   Sticky header state, hierarchical navigation, mobile drawer and the
   dark/light theme toggle. No dependencies.

   The theme itself is applied by an inline script in the document head so the
   correct colours are painted before first paint; this file only handles the
   toggle afterwards.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'dbz-theme';

  /* ---------------------------------------------------------------- theme */

  function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);

    // Keep the browser UI (address bar on mobile) in step with the page.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#01123A' : '#FFFFFF');
    }

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-dbz-theme-toggle]'),
      function (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
        btn.setAttribute(
          'aria-label',
          theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        );
      }
    );
  }

  function initThemeToggle() {
    applyTheme(currentTheme());

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-dbz-theme-toggle]'),
      function (btn) {
        btn.addEventListener('click', function () {
          var next = currentTheme() === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch (e) {
            /* private browsing; the choice simply will not persist */
          }
        });
      }
    );

  }

  /* --------------------------------------------------------- sticky header */

  function initStickyNav() {
    var nav = document.querySelector('[data-dbz-nav]');
    if (!nav) return;

    var ticking = false;
    var update = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    };

    update();
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------ desktop dropdowns */

  function closeAllDropdowns(except) {
    Array.prototype.forEach.call(
      document.querySelectorAll('.dbz-dropdown[data-open="true"]'),
      function (d) {
        if (d === except) return;
        d.setAttribute('data-open', 'false');
        var trigger = d.querySelector('[data-dbz-dropdown-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    );
  }

  function initDropdowns() {
    var dropdowns = document.querySelectorAll('.dbz-dropdown');
    if (!dropdowns.length) return;

    Array.prototype.forEach.call(dropdowns, function (dropdown) {
      var trigger = dropdown.querySelector('[data-dbz-dropdown-trigger]');
      if (!trigger) return;

      trigger.addEventListener('click', function (event) {
        // Triggers that are also links still navigate on a plain click; only
        // the pure menu buttons open on click.
        if (trigger.tagName === 'A' && !trigger.hasAttribute('data-dbz-menu-only')) {
          return;
        }
        event.preventDefault();
        var open = dropdown.getAttribute('data-open') === 'true';
        closeAllDropdowns(dropdown);
        dropdown.setAttribute('data-open', open ? 'false' : 'true');
        trigger.setAttribute('aria-expanded', String(!open));
      });

      // Leaving the whole group with the keyboard closes it.
      dropdown.addEventListener('focusout', function (event) {
        if (!dropdown.contains(event.relatedTarget)) {
          dropdown.setAttribute('data-open', 'false');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest || !event.target.closest('.dbz-dropdown')) {
        closeAllDropdowns(null);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var open = document.querySelector('.dbz-dropdown[data-open="true"]');
      if (!open) return;
      closeAllDropdowns(null);
      var trigger = open.querySelector('[data-dbz-dropdown-trigger]');
      if (trigger) trigger.focus();
    });
  }

  /* ------------------------------------------------------- mobile drawer */

  function initDrawer() {
    var toggle = document.querySelector('[data-dbz-drawer-toggle]');
    var drawer = document.querySelector('[data-dbz-drawer]');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // A dbz- class rather than a Tailwind utility: class names referenced
      // only from JavaScript are purged by a compiled Tailwind build.
      document.body.classList.toggle('dbz-no-scroll', open);
    });

    // Nested sections inside the drawer.
    Array.prototype.forEach.call(
      drawer.querySelectorAll('[data-dbz-submenu-toggle]'),
      function (btn) {
        btn.addEventListener('click', function () {
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          if (!panel) return;
          var open = panel.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', String(open));
          var caret = btn.querySelector('.dbz-dropdown__caret');
          if (caret) caret.style.transform = open ? 'rotate(180deg)' : '';
        });
      }
    );

    // A resize into desktop territory should not leave the drawer latched open.
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('dbz-no-scroll');
      }
    });
  }

  /* --------------------------------------------------------------- marquee */

  /*
   * Marquees are configured with a velocity (pixels per second) rather than a
   * loop duration, because the rows hold very different numbers of items. The
   * animation always travels exactly half the track, so a fixed duration would
   * make a long row sweep past while a short one crawled. Measuring the track
   * and dividing gives every row the same apparent speed.
   */
  function sizeMarquee(marquee) {
    var group = marquee.querySelector('.dbz-marquee__group');
    if (!group) return;

    var speed = parseFloat(marquee.getAttribute('data-dbz-marquee-speed')) || 45;
    var distance = group.getBoundingClientRect().width;
    if (!distance) return;

    marquee.style.setProperty('--dbz-marquee-duration', (distance / speed).toFixed(2) + 's');
  }

  function initMarquees() {
    var marquees = document.querySelectorAll('.dbz-marquee[data-dbz-marquee-speed]');
    if (!marquees.length) return;

    // Nothing to pace when the animation is not running.
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var sizeAll = function () {
      Array.prototype.forEach.call(marquees, sizeMarquee);
    };

    sizeAll();

    // Late-loading webfonts and lazy images change item widths after first
    // layout, so measure again once everything has settled.
    window.addEventListener('load', sizeAll);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeAll).catch(function () {});
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(sizeAll, 200);
    });
  }

  /* -------------------------------------------------------------- tabs */

  /*
   * Generic tab group: [data-dbz-tabs] wrapping [data-dbz-tab] buttons and
   * [data-dbz-tabpanel] panels, paired in document order.
   *
   * Progressive enhancement. Without JavaScript every panel stays visible,
   * each under its own heading, so the content is all still reachable; this
   * hides the non-selected ones and wires up the switching.
   */
  function initTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-dbz-tabs]'), function (group) {
      var tabs = group.querySelectorAll('[data-dbz-tab]');
      var panels = group.querySelectorAll('[data-dbz-tabpanel]');
      if (!tabs.length || tabs.length !== panels.length) return;

      // The per-panel headings exist only for the no-JavaScript case.
      Array.prototype.forEach.call(group.querySelectorAll('.dbz-tabpanel__heading'), function (h) {
        h.hidden = true;
      });

      var select = function (index) {
        Array.prototype.forEach.call(tabs, function (tab, i) {
          var on = i === index;
          tab.setAttribute('aria-selected', String(on));
          tab.setAttribute('tabindex', on ? '0' : '-1');
          panels[i].hidden = !on;
        });
      };

      var initial = 0;
      Array.prototype.forEach.call(tabs, function (tab, i) {
        if (tab.getAttribute('aria-selected') === 'true') initial = i;
        tab.addEventListener('click', function () { select(i); });

        // Left/right arrows move between tabs, as expected of a tablist.
        tab.addEventListener('keydown', function (event) {
          var next = null;
          if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          if (next === null) return;
          event.preventDefault();
          select(next);
          tabs[next].focus();
        });
      });

      select(initial);
    });
  }

  /* ---------------------------------------------------------- back to top */

  /*
   * Replaces the vanilla-back-to-top library the old site used. Built here so
   * it uses the site's own markup and tokens, and so there is one less script
   * to load.
   *
   * The button is created rather than sitting in the markup: without
   * JavaScript it could not scroll anyway, and an element that does nothing is
   * worse than no element.
   */
  function initBackToTop() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'dbz-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" ' +
      'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(button);

    // Appears once roughly a screenful has gone by, so it never covers content
    // the reader can still see above them.
    var ticking = false;
    var update = function () {
      button.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
      ticking = false;
    };

    update();
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    button.addEventListener('click', function () {
      var reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

      // Scrolling alone leaves keyboard focus stranded at the bottom of the
      // page, so send it back to the top too.
      var first = document.querySelector('.dbz-nav a');
      if (first) first.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------- blog search */

  /*
   * Author facet and term search for the blog index.
   *
   * Works against /blog/search.json rather than the DOM, because the feed is
   * paginated ten posts at a time over 351 posts - a DOM filter would search
   * ten and report nothing for a post on page twelve.
   *
   * The index is fetched on first interaction, not on page load: most visitors
   * to /blog/ never search, and there is no reason to make them pay for it.
   *
   * Matching is AND across whitespace-separated terms, and results are ranked
   * rather than merely filtered. Ranking is the point, not a nicety: this blog
   * tags every release announcement with every connector it touched, so 174 of
   * the 183 posts tagged `oracle` are release notes. A flat filter for
   * "oracle" buries the six posts actually about Oracle among them, which is
   * why a title hit is worth far more than a tag hit.
   */
  function initBlogSearch() {
    var root = document.querySelector('[data-dbz-blog-search]');
    if (!root) return;

    var resultsEl = document.querySelector('[data-dbz-blog-results]');
    var defaultEl = document.querySelector('[data-dbz-blog-default]');
    var termsEl = root.querySelector('[data-dbz-blog-terms]');
    var statusEl = root.querySelector('[data-dbz-blog-status]');
    var facet = root.querySelector('[data-dbz-facet]');
    var facetToggle = root.querySelector('[data-dbz-facet-toggle]');
    var facetLabel = root.querySelector('[data-dbz-facet-label]');
    var facetSearch = root.querySelector('[data-dbz-facet-search]');
    var facetList = root.querySelector('[data-dbz-facet-list]');
    var facetCount = root.querySelector('[data-dbz-facet-count]');
    var facetClear = root.querySelector('[data-dbz-facet-clear]');
    if (!resultsEl || !defaultEl || !termsEl) return;

    var posts = null;         // the index, once fetched
    var loading = null;       // in-flight promise, so we fetch at most once
    var selected = {};        // author id -> true
    var facetEmpty = null;    // "no authors match" row, created with the list

    // Set on an author page, where the facet is not rendered at all. Results
    // are pinned to this author, and searching stays within their posts even
    // though the index it reads holds every post on the blog.
    var lockedAuthor = root.getAttribute('data-dbz-blog-author');

    // Only now is the UI worth showing.
    root.removeAttribute('hidden');

    function load() {
      if (loading) return loading;
      loading = fetch(root.getAttribute('data-dbz-blog-search') || '/blog/search.json')
        .then(function (r) {
          if (!r.ok) throw new Error('index ' + r.status);
          return r.json();
        })
        .then(function (data) {
          posts = data;
          buildAuthorList();
          return data;
        })
        .catch(function () {
          // Leave the paginated feed in place and say so, rather than showing
          // an empty result list that looks like "no posts match". The facet
          // needs its own message too - an empty dropdown reads as "this site
          // has no authors" rather than "the index did not load".
          posts = null;
          if (statusEl) statusEl.textContent = 'Search is unavailable right now.';
          facetMessage('Could not load the author list.');
        });
      return loading;
    }

    // A single non-interactive row, used for both the loading and failure
    // states so the dropdown is never just an empty box.
    function facetMessage(text) {
      if (!facetList) return;
      facetList.textContent = '';
      var note = document.createElement('p');
      note.className = 'px-2.5 py-3 text-sm text-dbz-muted';
      note.textContent = text;
      facetList.appendChild(note);
      facetEmpty = null;
    }

    /* ------------------------------------------------------------- facet */

    function buildAuthorList() {
      if (!facetList || !posts) return;

      var byId = {};
      posts.forEach(function (post) {
        (post.authors || []).forEach(function (id, i) {
          if (!byId[id]) {
            byId[id] = { id: id, name: (post.authorNames || [])[i] || id, count: 0 };
          }
          byId[id].count++;
        });
      });

      // Most prolific first. The distribution is very uneven - one author has
      // 153 posts and the tail is a single post each - so alphabetical would
      // bury the people a reader is most likely to want.
      var authors = Object.keys(byId).map(function (k) { return byId[k]; });
      authors.sort(function (a, b) {
        return b.count - a.count || a.name.localeCompare(b.name);
      });

      facetList.textContent = '';
      authors.forEach(function (author) {
        var row = document.createElement('label');
        row.className = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-dbz-surface-2';
        row.setAttribute('data-dbz-facet-row', author.name.toLowerCase() + ' ' + author.id);

        var box = document.createElement('input');
        box.type = 'checkbox';
        box.value = author.id;
        box.className = 'dbz-checkbox';
        box.checked = !!selected[author.id];
        box.addEventListener('change', function () {
          if (box.checked) selected[author.id] = true;
          else delete selected[author.id];
          syncFacet();
          apply();
        });

        var name = document.createElement('span');
        name.className = 'min-w-0 flex-1 truncate text-dbz-text';
        name.textContent = author.name;

        var count = document.createElement('span');
        count.className = 'shrink-0 text-xs text-dbz-muted';
        count.textContent = author.count;

        row.appendChild(box);
        row.appendChild(name);
        row.appendChild(count);
        facetList.appendChild(row);
      });

      // Shown by filterAuthorRows when the author search matches nothing.
      facetEmpty = document.createElement('p');
      facetEmpty.className = 'px-2.5 py-3 text-sm text-dbz-muted';
      facetEmpty.textContent = 'No authors match.';
      facetEmpty.style.display = 'none';
      facetList.appendChild(facetEmpty);

      // A query typed before the index arrived still has to be honoured.
      filterAuthorRows();
      syncFacet();
    }

    function selectedIds() {
      return Object.keys(selected);
    }

    function syncFacet() {
      var ids = selectedIds();
      if (facetLabel) {
        if (!ids.length) {
          facetLabel.textContent = 'All authors';
        } else if (ids.length === 1) {
          var row = facetList && facetList.querySelector('input[value="' + ids[0] + '"]');
          var label = row && row.parentNode.querySelector('span');
          facetLabel.textContent = label ? label.textContent : ids[0];
        } else {
          facetLabel.textContent = ids.length + ' authors';
        }
      }
      if (facetCount) {
        facetCount.textContent = ids.length ? ids.length + ' selected' : '';
      }
    }

    function filterAuthorRows() {
      if (!facetList || !facetSearch) return;
      var q = facetSearch.value.trim().toLowerCase();
      var shown = 0;

      Array.prototype.forEach.call(
        facetList.querySelectorAll('[data-dbz-facet-row]'),
        function (row) {
          var match = !q || row.getAttribute('data-dbz-facet-row').indexOf(q) !== -1;
          // Not the `hidden` attribute: these rows carry Tailwind's `flex`
          // class, and an author stylesheet's `display: flex` beats the user
          // agent's `[hidden] { display: none }`, so setting `hidden` on them
          // does nothing at all.
          row.style.display = match ? '' : 'none';
          if (match) shown++;
        }
      );

      if (facetEmpty) facetEmpty.style.display = shown ? 'none' : '';
    }

    function openFacet(open) {
      if (!facet || !facetToggle) return;
      facet.setAttribute('data-open', open ? 'true' : 'false');
      facetToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        if (!posts && !loading) facetMessage('Loading authors…');
        load().then(function () { if (facetSearch) facetSearch.focus(); });
      }
    }

    /* ------------------------------------------------------------ scoring */

    function score(post, terms) {
      var title = (post.title || '').toLowerCase();
      var tags = (post.tags || []).join(' ').toLowerCase();
      var names = (post.authorNames || []).join(' ').toLowerCase();
      var ids = (post.authors || []).join(' ').toLowerCase();
      var excerpt = (post.excerpt || '').toLowerCase();
      var total = 0;

      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var hit = 0;
        // Weights, highest first. A title hit is the strongest signal a post is
        // *about* something; a tag hit is the weakest, for the roll-call reason
        // in the comment above.
        if (title.indexOf(term) !== -1) hit += 10;
        if (names.indexOf(term) !== -1 || ids.indexOf(term) !== -1) hit += 6;
        if (excerpt.indexOf(term) !== -1) hit += 3;
        if (tags.indexOf(term) !== -1) hit += 1;
        // AND: every term has to land somewhere.
        if (!hit) return 0;
        total += hit;
      }
      return total;
    }

    /* ------------------------------------------------------------ results */

    function card(post) {
      var article = document.createElement('article');
      article.className = 'dbz-card rounded-xl border border-dbz-border bg-dbz-surface p-6 hover:border-dbz-brand/50 sm:p-7';

      var h2 = document.createElement('h2');
      h2.className = 'text-xl font-semibold leading-snug text-dbz-text sm:text-2xl';
      var link = document.createElement('a');
      link.className = 'transition-colors hover:text-dbz-brand';
      link.href = post.url;
      link.textContent = post.title;
      h2.appendChild(link);

      var meta = document.createElement('div');
      meta.className = 'mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-dbz-muted';
      (post.authorNames || []).forEach(function (name, i) {
        if (i) meta.appendChild(document.createTextNode(', '));
        var a = document.createElement('a');
        a.className = 'font-medium text-dbz-text transition-colors hover:text-dbz-brand';
        a.href = '/blog/author/' + (post.authors || [])[i] + '/';
        a.textContent = name;
        meta.appendChild(a);
      });
      var dot = document.createElement('span');
      dot.setAttribute('aria-hidden', 'true');
      dot.textContent = '·';
      meta.appendChild(dot);
      var time = document.createElement('time');
      time.dateTime = post.date;
      // Parsed as UTC so the displayed date cannot slip a day west of Greenwich.
      var d = new Date(post.date + 'T00:00:00Z');
      time.textContent = d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
      });
      meta.appendChild(time);

      var p = document.createElement('p');
      p.className = 'dbz-excerpt mt-4 text-sm leading-relaxed text-dbz-muted';
      p.textContent = post.excerpt || '';

      article.appendChild(h2);
      article.appendChild(meta);
      article.appendChild(p);
      return article;
    }

    function render(matches, active, total) {
      if (!active) {
        resultsEl.setAttribute('hidden', '');
        resultsEl.textContent = '';
        defaultEl.removeAttribute('hidden');
        if (statusEl) statusEl.textContent = '';
        return;
      }

      defaultEl.setAttribute('hidden', '');
      resultsEl.removeAttribute('hidden');
      resultsEl.textContent = '';

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'rounded-xl border border-dbz-border bg-dbz-surface p-8 text-center';
        var msg = document.createElement('p');
        msg.className = 'text-dbz-muted';
        msg.textContent = 'No posts match.';
        empty.appendChild(msg);
        resultsEl.appendChild(empty);
      } else {
        var list = document.createElement('div');
        list.className = 'space-y-6';
        matches.forEach(function (post) { list.appendChild(card(post)); });
        resultsEl.appendChild(list);
      }

      if (statusEl) {
        statusEl.textContent = matches.length + ' of ' + total +
          ' post' + (total === 1 ? '' : 's') + ' match';
      }
    }

    function apply() {
      var raw = termsEl.value.trim().toLowerCase();
      var terms = raw ? raw.split(/\s+/) : [];
      var chosen = lockedAuthor ? [lockedAuthor] : selectedIds();

      // On an author page the author constraint is not something the reader
      // switched on, so it must not by itself replace the server-rendered
      // list. Only a typed term counts as filtering there.
      var active = !!(terms.length || (!lockedAuthor && chosen.length));

      if (!active) { render([], false, 0); return; }
      if (!posts) { load().then(function () { if (posts) apply(); }); return; }

      // Narrow by author first, so the "n of m" count is against the posts the
      // reader is actually looking at - this author's, or the whole blog.
      var pool = posts;
      if (chosen.length) {
        pool = posts.filter(function (post) {
          return (post.authors || []).some(function (id) {
            return chosen.indexOf(id) !== -1;
          });
        });
      }

      var scored = [];
      pool.forEach(function (post) {
        var s = terms.length ? score(post, terms) : 1;
        if (s > 0) scored.push({ post: post, score: s });
      });

      // Index order is newest first, and Array.prototype.sort is stable in
      // every engine we target, so equal scores stay in date order.
      scored.sort(function (a, b) { return b.score - a.score; });
      render(scored.map(function (x) { return x.post; }), true, pool.length);
    }

    /* --------------------------------------------------------------- wire */

    var debounce;
    termsEl.addEventListener('input', function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(apply, 120);
    });
    termsEl.addEventListener('focus', load);
    termsEl.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { termsEl.value = ''; apply(); }
    });

    if (facetToggle) {
      facetToggle.addEventListener('click', function () {
        openFacet(facet.getAttribute('data-open') !== 'true');
      });
    }
    if (facetSearch) {
      facetSearch.addEventListener('input', filterAuthorRows);
      facetSearch.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { facetSearch.value = ''; filterAuthorRows(); }
      });
    }
    if (facetClear) {
      facetClear.addEventListener('click', function () {
        selected = {};
        if (facetList) {
          Array.prototype.forEach.call(
            facetList.querySelectorAll('input[type="checkbox"]'),
            function (box) { box.checked = false; }
          );
        }
        // Clears the author search text as well as the ticks. Leaving the box
        // filled would clear the selection but keep most of the list hidden,
        // so the panel would still look filtered right after being cleared.
        if (facetSearch) {
          facetSearch.value = '';
          filterAuthorRows();
          facetSearch.focus();
        }
        syncFacet();
        apply();
      });
    }

    // Clicking away closes the facet; Escape closes it and returns focus.
    document.addEventListener('click', function (event) {
      if (!facet) return;
      if (!facet.contains(event.target)) openFacet(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !facet) return;
      if (facet.getAttribute('data-open') === 'true') {
        openFacet(false);
        if (facetToggle) facetToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------- boot */

  function init() {
    initThemeToggle();
    initStickyNav();
    initDropdowns();
    initDrawer();
    initMarquees();
    initTabs();
    initBackToTop();
    initBlogSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();