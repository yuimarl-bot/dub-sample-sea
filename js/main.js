/* DUB 海のイメージ版: 控えめな動き
 * - スクロールで、文字がふわっと浮かび、写真が上から幕を開くように現れる
 * - 写真は、スクロールに合わせてほんの少しだけ動く(パララックス)
 * - JSが使えない環境・「動きを減らす」設定では、何も隠さず、動かさない
 */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    return;
  }

  var root = document.documentElement;
  var textSelector = [
    "main > section:not(.hero) .eyebrow",
    "main > section:not(.hero) .section-title",
    "main > section:not(.hero) .section-lead",
    "main > section:not(.hero) .section-note",
    ".concept__body",
    ".points li",
    ".menu__item",
    ".info__row",
    ".map-frame",
    ".reserve__rule",
    ".reserve__lead",
    ".reserve__tel",
    ".reserve .cta-note",
    ".site-footer__inner > *"
  ].join(",");

  var texts = Array.prototype.slice.call(document.querySelectorAll(textSelector));
  var frames = Array.prototype.slice.call(document.querySelectorAll(".wipe, .wave"));
  var parallax = Array.prototype.slice.call(document.querySelectorAll(".parallax"));

  // 同じ親の中では、少しずつ時間差を付ける(最大0.5秒)
  texts.forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.classList.add("reveal");
    el.style.setProperty("--d", Math.min(i, 5) * 0.1 + "s");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -48px 0px" }
  );

  texts.concat(frames).forEach(function (el) {
    observer.observe(el);
  });

  // パララックス: 画面の中央からのずれに応じて、写真を上下に最大 ±16px 動かす
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) {
        return;
      }
      var offset = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty("--py", (-offset * 16).toFixed(1) + "px");
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  root.classList.add("js-anim");
})();