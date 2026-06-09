(function () {
    "use strict";

    /* ── helpers ── */
    var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    function qs(sel, ctx) {
        return (ctx || document).querySelector(sel);
    }
    function qsa(sel, ctx) {
        return Array.from((ctx || document).querySelectorAll(sel));
    }
    function announce(el, msg) {
        if (el) el.textContent = msg;
    }

    /* ══════════════════════════════════════════
 1. STICKY NAV
══════════════════════════════════════════ */
    var stickyNav = qs("#stickyNav");
    var heroSec = qs("#hero");

    if (stickyNav && heroSec && "IntersectionObserver" in window) {
        new IntersectionObserver(
            function (entries) {
                stickyNav.classList.toggle(
                    "is-visible",
                    !entries[0].isIntersecting,
                );
            },
            { threshold: 0 },
        ).observe(heroSec);
    }

    window.addEventListener(
        "scroll",
        function () {
            if (window.scrollY > 100) {
                stickyNav.classList.add("is-visible");
            } else {
                stickyNav.classList.remove("is-visible");
            }
        },
        { passive: true },
    );

    /* ══════════════════════════════════════════
 2. HERO HORIZONTAL SLIDER
    Wraps the 3-column vertical-scroll panels
    Auto-play every 6 s, pause on hover/focus
    Arrow keys, prev/next buttons, dot tabs
    Touch/swipe on mobile
══════════════════════════════════════════ */
    var hTrack = qs("#heroHTrack");
    var heroPrevBtn = qs("#heroPrev");
    var heroNextBtn = qs("#heroNext");
    var heroDots = qsa(".hero__slider-dot");
    var heroStatus = qs("#heroSliderStatus");
    var heroSlides = hTrack ? qsa(".hero__slide", hTrack) : [];
    var heroTotal = heroSlides.length;
    var heroIdx = 0;
    var heroAutoTimer;

    function heroGo(idx) {
        heroIdx = ((idx % heroTotal) + heroTotal) % heroTotal;

        // update transform
        hTrack.style.transform = "translateX(-" + heroIdx * 100 + "%)";

        // aria-hidden on non-active slides
        heroSlides.forEach(function (s, i) {
            s.setAttribute("aria-hidden", i !== heroIdx ? "true" : "false");
        });

        // update dots
        heroDots.forEach(function (d, i) {
            var active = i === heroIdx;
            d.classList.toggle("hero__slider-dot--active", active);
            d.setAttribute("aria-selected", active ? "true" : "false");
        });

        // update prev/next disabled state
        heroPrevBtn.setAttribute(
            "aria-disabled",
            heroIdx === 0 ? "true" : "false",
        );
        heroNextBtn.setAttribute(
            "aria-disabled",
            heroIdx === heroTotal - 1 ? "true" : "false",
        );

        announce(
            heroStatus,
            "Gallery slide " + (heroIdx + 1) + " of " + heroTotal,
        );
    }

    function heroStep(dir) {
        var next = heroIdx + dir;
        if (next < 0 || next >= heroTotal) return;
        heroGo(next);
    }

    function heroStartAuto() {
        if (prefersReducedMotion) return;
        heroAutoTimer = setInterval(function () {
            heroGo((heroIdx + 1) % heroTotal);
        }, 6000);
    }
    function heroStopAuto() {
        clearInterval(heroAutoTimer);
    }

    if (hTrack && heroTotal > 1) {
        heroGo(0);
        heroStartAuto();

        heroPrevBtn.addEventListener("click", function () {
            if (this.getAttribute("aria-disabled") === "true") return;
            heroStopAuto();
            heroStep(-1);
            heroStartAuto();
        });
        heroNextBtn.addEventListener("click", function () {
            if (this.getAttribute("aria-disabled") === "true") return;
            heroStopAuto();
            heroStep(1);
            heroStartAuto();
        });

        heroDots.forEach(function (d) {
            d.addEventListener("click", function () {
                heroStopAuto();
                heroGo(+this.dataset.idx);
                heroStartAuto();
            });
        });

        // Keyboard (arrow keys on the slider region)
        qs("#heroSlider").addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") {
                heroStopAuto();
                heroStep(-1);
                heroStartAuto();
            }
            if (e.key === "ArrowRight") {
                heroStopAuto();
                heroStep(1);
                heroStartAuto();
            }
        });

        // Pause on hover / focus-within
        var heroSliderEl = qs("#heroSlider");
        heroSliderEl.addEventListener("mouseenter", heroStopAuto);
        heroSliderEl.addEventListener("focusin", heroStopAuto);
        heroSliderEl.addEventListener("mouseleave", heroStartAuto);
        heroSliderEl.addEventListener("focusout", function (e) {
            if (!heroSliderEl.contains(e.relatedTarget)) heroStartAuto();
        });

        // Touch / swipe
        var heroTouchX = 0;
        hTrack.addEventListener(
            "touchstart",
            function (e) {
                heroTouchX = e.touches[0].clientX;
                heroStopAuto();
            },
            { passive: true },
        );
        hTrack.addEventListener(
            "touchend",
            function (e) {
                var diff = heroTouchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) heroStep(diff > 0 ? 1 : -1);
                heroStartAuto();
            },
            { passive: true },
        );
    }

    /* ══════════════════════════════════════════
 3. SCHOOL TYPES – mobile carousel
══════════════════════════════════════════ */
    var scTrack = qs("#schoolCarouselTrack");
    var scDots = qsa(".school-types__dot");
    var scStatus = qs("#schoolCarouselStatus");
    var scCards = scTrack ? qsa(".school-types__card", scTrack) : [];
    var scTotal = scCards.length;
    var scIdx = 0;

    function scGo(idx) {
        scIdx = idx;
        var vp = scTrack ? scTrack.parentElement : null;
        var cardW = vp ? vp.offsetWidth : window.innerWidth;
        scTrack.style.transform = "translateX(-" + scIdx * cardW + "px)";

        scDots.forEach(function (d, i) {
            var active = i === scIdx;
            d.setAttribute("aria-selected", active ? "true" : "false");
        });
        announce(
            scStatus,
            "Showing school type " + (scIdx + 1) + " of " + scTotal,
        );
    }

    if (scTrack && scTotal > 0) {
        scGo(0);

        scDots.forEach(function (d) {
            d.addEventListener("click", function () {
                scGo(+this.dataset.idx);
            });
        });

        // swipe
        var scTouchX = 0;
        scTrack.addEventListener(
            "touchstart",
            function (e) {
                scTouchX = e.touches[0].clientX;
            },
            { passive: true },
        );
        scTrack.addEventListener(
            "touchend",
            function (e) {
                var diff = scTouchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0 && scIdx < scTotal - 1) scGo(scIdx + 1);
                    if (diff < 0 && scIdx > 0) scGo(scIdx - 1);
                }
            },
            { passive: true },
        );

        // recalculate on resize
        var scResizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(scResizeTimer);
            scResizeTimer = setTimeout(function () {
                scGo(scIdx);
            }, 120);
        });
    }

    /* ══════════════════════════════════════════
 4. EXHIBITION SLIDER
    3 cards on ≥1024 px, 2 on tablet, 1 on mobile
    Auto-play, pause on hover/focus, swipe
══════════════════════════════════════════ */
    var eTrack = qs("#exhibTrack");
    var ePrev = qs("#exhibPrev");
    var eNext = qs("#exhibNext");
    var eStatus = qs("#exhibStatus");
    var eCards = eTrack ? qsa(".exhibition__card", eTrack) : [];
    var eTotal = eCards.length;
    var eIdx = 0;
    var eAutoTimer;

    function eCalcVisible() {
        var vw = window.innerWidth;
        if (vw <= 768) return 1;
        if (vw <= 1200) return 2;
        return 4;
    }

    function eGetCardWidth() {
        if (!eCards[0]) return 0;
        return eCards[0].offsetWidth + 16; // 16px gap
    }

    function eGo(idx) {
        var vis = eCalcVisible();
        var maxIdx = Math.max(0, eTotal - vis);
        eIdx = Math.max(0, Math.min(maxIdx, idx));

        eTrack.style.transform =
            "translateX(-" + eIdx * eGetCardWidth() + "px)";

        ePrev.setAttribute("aria-disabled", eIdx === 0 ? "true" : "false");
        eNext.setAttribute(
            "aria-disabled",
            eIdx >= maxIdx ? "true" : "false",
        );

        announce(
            eStatus,
            "Showing highlights " +
            (eIdx + 1) +
            " to " +
            Math.min(eIdx + vis, eTotal) +
            " of " +
            eTotal,
        );
    }

    function eStep(dir) {
        var vis = eCalcVisible();
        var maxIdx = Math.max(0, eTotal - vis);
        var next = eIdx + dir;
        if (dir > 0 && eIdx >= maxIdx) next = 0;
        if (dir < 0 && eIdx <= 0) next = maxIdx;
        eGo(next);
    }

    function eStartAuto() {
        if (prefersReducedMotion) return;
        eAutoTimer = setInterval(function () {
            eStep(1);
        }, 4000);
    }
    function eStopAuto() {
        clearInterval(eAutoTimer);
    }

    if (eTrack && eTotal > 0) {
        eGo(0);
        eStartAuto();

        ePrev.addEventListener("click", function () {
            if (this.getAttribute("aria-disabled") === "true") return;
            eStopAuto();
            eStep(-1);
            eStartAuto();
        });
        eNext.addEventListener("click", function () {
            if (this.getAttribute("aria-disabled") === "true") return;
            eStopAuto();
            eStep(1);
            eStartAuto();
        });

        // Arrow key nav on individual cards
        eTrack.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") {
                eStopAuto();
                eStep(-1);
                eStartAuto();
            }
            if (e.key === "ArrowRight") {
                eStopAuto();
                eStep(1);
                eStartAuto();
            }
        });

        // Pause on hover / focus
        var exhibEl = qs("#exhibSection");
        exhibEl.addEventListener("mouseenter", eStopAuto);
        exhibEl.addEventListener("focusin", eStopAuto);
        exhibEl.addEventListener("mouseleave", eStartAuto);
        exhibEl.addEventListener("focusout", function (e) {
            if (!exhibEl.contains(e.relatedTarget)) eStartAuto();
        });

        // Swipe
        var eTouchX = 0;
        eTrack.addEventListener(
            "touchstart",
            function (e) {
                eTouchX = e.touches[0].clientX;
                eStopAuto();
            },
            { passive: true },
        );
        eTrack.addEventListener(
            "touchend",
            function (e) {
                var diff = eTouchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) eStep(diff > 0 ? 1 : -1);
                eStartAuto();
            },
            { passive: true },
        );

        // Recalc on resize
        var eResizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(eResizeTimer);
            eResizeTimer = setTimeout(function () {
                eGo(eIdx);
            }, 120);
        });
    }
})();