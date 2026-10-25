/* LayoutSee 官网 · 交互脚本
   零依赖；prefers-reduced-motion 时全部降级为静态。 */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 吸顶导航阴影 ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Hero 字母/字符网格背景 + 轻视差 ---------- */
  var grids = [];

  function buildGrid(el) {
    var word = el.dataset.letters || "LAYOUTSEE";
    var small = el.classList.contains("grid-sm");
    el.innerHTML = "";
    var cw = small ? 64 : 122;
    var ch = small ? 44 : 86;
    var cols = Math.ceil(el.clientWidth / cw) + 2;
    var rows = Math.ceil(el.clientHeight / ch) + 1;
    var frag = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      var offset = r % 2 ? cw / 2 : 0;
      for (var c = 0; c < cols; c++) {
        var s = document.createElement("span");
        s.textContent = word[(r * 3 + c) % word.length];
        s.style.left = (c * cw - offset) + "px";
        s.style.top = (r * ch) + "px";
        s.style.fontSize = small ? "21px" : "clamp(30px, 3.4vw, 42px)";
        if (!reduced) {
          s.style.animationDelay = (Math.random() * 6).toFixed(2) + "s";
          s.style.animationDuration = (4.5 + Math.random() * 4).toFixed(2) + "s";
        }
        frag.appendChild(s);
      }
    }
    el.appendChild(frag);
  }

  document.querySelectorAll(".letter-grid").forEach(function (el) {
    buildGrid(el);
    grids.push(el);
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { grids.forEach(buildGrid); }, 180);
  });

  /* 滚动视差（rAF 节流） */
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking || reduced || !grids.length) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.4) {
        grids.forEach(function (g) { g.style.transform = "translateY(" + y * 0.1 + "px)"; });
      }
      ticking = false;
    });
  }, { passive: true });

  /* ---------- 滚动显现 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero 幕布交互（复刻 MIMO：黑圆随鼠标，圆内反白，底部停靠） ---------- */
  var hero = document.querySelector(".hero");
  if (hero && !reduced) {
    var curtain = hero.querySelector(".curtain-layer");
    var dockBtn = hero.querySelector(".hero-dock-btn");
    var cur = { x: 0, y: 0, r: 0 };
    var tgt = { x: 0, y: 0, r: 0 };
    var baseR = 220, raf = null, docked = false, heroW = 0, heroH = 0, showBtn = false;

    function measureCurtain() {
      heroW = hero.offsetWidth;
      heroH = hero.offsetHeight;
      baseR = Math.max(170, Math.min(270, Math.min(heroW, heroH) * 0.26));
    }

    function curtainFrame() {
      cur.x += (tgt.x - cur.x) * 0.16;
      cur.y += (tgt.y - cur.y) * 0.16;
      cur.r += (tgt.r - cur.r) * 0.11;
      // 直接写 clip-path 内联值，兼容不支持 CSS 变量参与 clip-path 的内核
      if (curtain) {
        var clip = "circle(" + Math.max(0, cur.r).toFixed(1) + "px at " +
          cur.x.toFixed(1) + "px " + cur.y.toFixed(1) + "px)";
        curtain.style.clipPath = clip;
        curtain.style.webkitClipPath = clip;
      }
      var btnShould = docked && cur.r > baseR * 0.55;
      if (btnShould !== showBtn) {
        showBtn = btnShould;
        if (dockBtn) dockBtn.classList.toggle("show", showBtn);
      }
      var settled = Math.abs(tgt.x - cur.x) < 0.5 &&
        Math.abs(tgt.y - cur.y) < 0.5 && Math.abs(tgt.r - cur.r) < 0.5;
      raf = settled ? null : requestAnimationFrame(curtainFrame);
    }

    function kickCurtain() {
      if (!raf) raf = requestAnimationFrame(curtainFrame);
    }

    function setDocked(v) { docked = v; }

    hero.addEventListener("mouseenter", function () {
      measureCurtain();
      kickCurtain();
    });
    hero.addEventListener("mousemove", function (e) {
      if (!heroW) measureCurtain();
      var x = e.pageX - hero.offsetLeft;
      var y = e.pageY - hero.offsetTop;
      setDocked(y > heroH - 110);
      if (docked) {
        tgt.x = heroW / 2;
        tgt.y = heroH;
        tgt.r = baseR * 1.15;
      } else {
        tgt.x = x;
        tgt.y = y;
        tgt.r = baseR;
      }
      kickCurtain();
    });
    hero.addEventListener("mouseleave", function () {
      setDocked(true);
      kickCurtain();
    });
    hero.addEventListener("touchstart", function () {
      setDocked(false);
      tgt.r = 0;
      kickCurtain();
    }, { passive: true });
    window.addEventListener("resize", measureCurtain, { passive: true });
  }

  /* ---------- 打字机轮播词（下载页） ---------- */
  document.querySelectorAll(".type-word").forEach(function (el) {
    var words;
    try { words = JSON.parse(el.dataset.words || "[]"); } catch (e) { words = []; }
    if (!words.length) return;
    if (reduced) { el.textContent = words[0]; return; }

    var enEl = document.querySelector(el.dataset.en || null);
    var i = 0, pos = 0, deleting = false;
    var TYPE = 175, ERASE = 105, HOLD = 2000, GAP = 420;

    (function tick() {
      var w = words[i];
      pos += deleting ? -1 : 1;
      el.textContent = w.slice(0, pos);
      if (enEl) enEl.textContent = (el.dataset.enWords ? safeParse(el.dataset.enWords)[i] : "") || "";
      var next = deleting ? ERASE : TYPE;
      if (!deleting && pos === w.length) { deleting = true; next = HOLD; }
      else if (deleting && pos === 0) { deleting = false; i = (i + 1) % words.length; next = GAP; }
      setTimeout(tick, next);
    })();
  });

  function safeParse(s) { try { return JSON.parse(s) || []; } catch (e) { return []; } }

  /* ---------- 版本同步：GitHub latest release，失败静默回退硬编码 ---------- */
  var REPO = "IQQcode/LayoutSee";

  function applyRelease(tag, date) {
    var ver = tag.replace(/^v/, "");
    document.querySelectorAll("[data-release-tag]").forEach(function (el) { el.textContent = tag; });
    if (date) {
      document.querySelectorAll("[data-release-date]").forEach(function (el) { el.textContent = date; });
    }
    document.querySelectorAll("a[data-dmg]").forEach(function (a) {
      a.href = "https://github.com/" + REPO + "/releases/download/" + tag +
        "/LayoutSee-" + ver + "-" + a.dataset.dmg + ".dmg";
    });
  }

  if (window.fetch) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 6000) : null;
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json();
    }).then(function (d) {
      if (d && d.tag_name) {
        applyRelease(d.tag_name, (d.published_at || "").slice(0, 10));
      }
    }).catch(function () { /* 保持硬编码版本 */ })
      .finally(function () { if (timer) clearTimeout(timer); });
  }
})();
