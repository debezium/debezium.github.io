/* ==========================================================================
   Debezium documentation bar behaviour
   --------------------------------------------------------------------------
   Theme toggle, drop-down menus and the mobile drawer for the bar rendered by
   partials/dbz-navbar.hbs. No dependencies - deliberately not jQuery, even
   though the bundle loads it, so this file stays a straight port of
   assets/javascript/dbz.js and the two behave identically.

   The theme is applied by the inline script in partials/head-styles.hbs,
   before first paint. This file only handles the toggle afterwards.

   Both halves of debezium.io are served from one origin, so the `dbz-theme`
   key read and written here is the same storage entry the Jekyll side uses.
   Choosing a theme in the documentation changes it on the site too, and the
   reverse, with nothing to keep in sync.
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

    // Keep the browser UI (the address bar on mobile) in step with the page.
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

    // A theme chosen in another tab - including a tab on the main site, which
    // writes the same key - should not leave this page on the old one.
    window.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === 'dark' || event.newValue === 'light') {
        applyTheme(event.newValue);
      }
    });
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

  /* --------------------------------------------------------- mobile drawer */

  function initDrawer() {
    var toggle = document.querySelector('[data-dbz-drawer-toggle]');
    var drawer = document.querySelector('[data-dbz-drawer]');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // Matches the bundle's own html.is-clipped--* convention rather than
      // introducing a second way of locking the page.
      document.documentElement.classList.toggle('is-clipped--dbz-drawer', open);
    });

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
        toggle.setAttribute('aria-label', 'Open menu');
        document.documentElement.classList.remove('is-clipped--dbz-drawer');
      }
    });
  }

  /* ------------------------------------------------------------------ init */

  function init() {
    initThemeToggle();
    initDropdowns();
    initDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
