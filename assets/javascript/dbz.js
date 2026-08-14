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

  /* ----------------------------------------------------------------- boot */

  function init() {
    initThemeToggle();
    initStickyNav();
    initDropdowns();
    initDrawer();
    initMarquees();
    initTabs();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();