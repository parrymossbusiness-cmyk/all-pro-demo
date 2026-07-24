/* All Pro Plumbers — shared site behavior */
(function () {
  'use strict';

  /* ---------- Partial include (header/footer) ---------- */
  function loadPartial(el) {
    var src = el.getAttribute('data-include');
    if (!src) return Promise.resolve();
    return fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + src);
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function includePartials() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    return Promise.all(nodes.map(loadPartial));
  }

  /* ---------- Active nav link ---------- */
  function normalize(path) {
    path = path.replace(/index\.html$/, '');
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
  }

  function markActiveLinks() {
    var current = normalize(window.location.pathname);
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '/') return;
      if (normalize(href) === current) {
        a.classList.add('is-active');
        if (a.closest('.nav-links') || a.closest('.mobile-nav') || a.closest('.service-nav')) {
          a.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  /* ---------- Header scroll state ---------- */
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var threshold = 40;
    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var closeBtn = document.getElementById('mobileNavClose');
    var panel = document.getElementById('mobileNav');
    var backdrop = document.getElementById('navBackdrop');
    if (!toggle || !panel || !backdrop) return;

    function openMenu() {
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = panel.classList.contains('is-open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
      });
    }

    // Backdrop is a distinct element behind the panel (lower z-index) —
    // clicking it is a genuine "outside tap", never the links themselves.
    backdrop.addEventListener('click', closeMenu);

    // Links inside the panel: close the menu state but do NOT preventDefault,
    // so the browser's native navigation for the tap is never interrupted.
    panel.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && panel.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Footer year ---------- */
  function setFooterYear() {
    var el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    includePartials().then(function () {
      initHeaderScroll();
      initMobileNav();
      markActiveLinks();
      setFooterYear();
    });
    initFaq();
  });
})();
