/* Exam Notes — shared behaviour (theme, tabs, TOC, Q&A filters, chart tooltips, print) */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme toggle (persisted per viewer) ---------- */
  function storedTheme() {
    try { return localStorage.getItem("examnotes-theme"); } catch (e) { return null; }
  }
  function saveTheme(t) {
    try { localStorage.setItem("examnotes-theme", t); } catch (e) { /* storage unavailable */ }
  }
  var initial = storedTheme();
  if (initial === "light" || initial === "dark") root.setAttribute("data-theme", initial);

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paintToggle() {
    var dark = currentTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", dark ? "Light theme" : "Dark theme");
      var label = btn.querySelector(".label");
      if (label) label.textContent = dark ? "Light" : "Dark";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    paintToggle();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        saveTheme(next);
        paintToggle();
      });
    });

    initTabs();
    initToc();
    initQa();
    initTooltips();
    initToTop();
    initPrint();
  });

  /* ---------- Semester tabs (home page) ---------- */
  function initTabs() {
    var tablist = document.querySelector("[role=tablist]");
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role=tab]"));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      var id = tab.getAttribute("data-hash");
      if (id && history.replaceState) history.replaceState(null, "", "#" + id);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });

    var hash = (location.hash || "").replace("#", "");
    var fromHash = tabs.filter(function (t) { return t.getAttribute("data-hash") === hash; })[0];
    select(fromHash || tabs[0], false);
  }

  /* ---------- Table of contents scroll-spy ---------- */
  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    // Targets in document order; the active one is the last whose top has passed the reading line.
    var targets = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var current = null;
    var ticking = false;

    function update() {
      ticking = false;
      var line = 140;
      var activeId = targets[0].id;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].offsetParent === null) continue; // hidden by a filter
        if (targets[i].getBoundingClientRect().top <= line) activeId = targets[i].id;
      }
      if (activeId === current) return;
      current = activeId;
      links.forEach(function (a) { a.classList.remove("active"); });
      if (map[activeId]) map[activeId].classList.add("active");
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Q&A: module filters + read / practice mode ---------- */
  function initQa() {
    var items = Array.prototype.slice.call(document.querySelectorAll("details.qa"));
    if (!items.length) return;
    var filterBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var modeBtn = document.querySelector("[data-mode-toggle]");
    var practice = false;

    function applyFilter(f) {
      items.forEach(function (d) {
        var show = f === "all" ||
          (f === "hot" && d.getAttribute("data-hot") === "1") ||
          (d.getAttribute("data-mod") || "").split(" ").indexOf(f) !== -1;
        d.hidden = !show;
      });
      document.querySelectorAll("[data-qa-group]").forEach(function (g) {
        var any = g.querySelectorAll("details.qa:not([hidden])").length > 0;
        g.hidden = !any;
      });
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === f ? "true" : "false"); });
    }
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); });
    });

    if (modeBtn) {
      modeBtn.addEventListener("click", function () {
        practice = !practice;
        items.forEach(function (d) { d.open = !practice; });
        modeBtn.textContent = practice ? "Show all answers" : "Practice mode: hide answers";
        modeBtn.setAttribute("aria-pressed", practice ? "true" : "false");
      });
    }
  }

  /* ---------- Chart tooltips (hover + keyboard focus) ---------- */
  function initTooltips() {
    var marks = document.querySelectorAll("[data-tip]");
    if (!marks.length) return;
    var tip = document.createElement("div");
    tip.className = "viz-tooltip";
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);

    function place(x, y) {
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8);
      var top = y + 16 + h > window.innerHeight ? y - h - 12 : y + 16;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
    function show(el, x, y) {
      tip.innerHTML = el.getAttribute("data-tip");
      tip.classList.add("show");
      place(x, y);
    }
    function hide() { tip.classList.remove("show"); }

    Array.prototype.forEach.call(marks, function (el) {
      el.addEventListener("mousemove", function (e) { show(el, e.clientX, e.clientY); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", function () {
        var r = el.getBoundingClientRect();
        show(el, r.left + Math.min(r.width / 2, 200), r.bottom - 10);
      });
      el.addEventListener("blur", hide);
    });
    window.addEventListener("scroll", hide, { passive: true });
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 900);
    }, { passive: true });
  }

  /* ---------- Print: open every answer first ---------- */
  function initPrint() {
    var openState = [];
    window.addEventListener("beforeprint", function () {
      openState = [];
      document.querySelectorAll("details").forEach(function (d) {
        openState.push([d, d.open, d.hidden]);
        d.open = true;
        if (d.classList.contains("qa")) d.hidden = false;
      });
      document.querySelectorAll("[data-qa-group]").forEach(function (g) { g.hidden = false; });
    });
    window.addEventListener("afterprint", function () {
      openState.forEach(function (s) { s[0].open = s[1]; s[0].hidden = s[2]; });
    });
    document.querySelectorAll("[data-print]").forEach(function (b) {
      b.addEventListener("click", function () { window.print(); });
    });
  }
})();
