(function(){
  "use strict";

  var STORAGE_KEY = "tecnosmalt-lang";
  var html = document.documentElement;
  var toggle = document.getElementById("lang-toggle");
  var opts = toggle ? toggle.querySelectorAll(".lang-opt") : [];

  function applyLang(lang){
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang);
    document.querySelectorAll("[data-it][data-en]").forEach(function(el){
      var val = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-it");
      if (val !== null) el.textContent = val;
    });
    opts.forEach(function(o){
      o.classList.toggle("active", o.getAttribute("data-val") === lang);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch(e){}
  }

  function getPreferredLang(){
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "it" || stored === "en") return stored;
    } catch(e){}
    return "it";
  }

  if (toggle){
    toggle.addEventListener("click", function(){
      var current = html.getAttribute("data-lang");
      applyLang(current === "it" ? "en" : "it");
    });
  }

  applyLang(getPreferredLang());

  var THEME_KEY = "tecnosmalt-theme";
  var themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme){
    html.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
  }

  function getPreferredTheme(){
    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch(e){}
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }

  applyTheme(getPreferredTheme());

  if (themeToggle){
    themeToggle.addEventListener("click", function(){
      var current = html.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var burger = document.getElementById("burger");
  var nav = document.getElementById("main-nav");
  if (burger && nav){
    burger.addEventListener("click", function(){
      var isOpen = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ nav.classList.remove("open"); });
    });
  }

  var track = document.getElementById("carousel-track");
  var prevBtn = document.getElementById("carousel-prev");
  var nextBtn = document.getElementById("carousel-next");
  var dotsWrap = document.getElementById("carousel-dots");
  if (track && prevBtn && nextBtn && dotsWrap){
    var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel-slide"));
    var dots = slides.map(function(_, i){
      var dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Foto " + (i + 1) + " di " + slides.length);
      dot.addEventListener("click", function(){ goTo(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function currentIndex(){
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 2) return 0;
      if (track.scrollLeft >= maxScroll - 2) return slides.length - 1;
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      slides.forEach(function(slide, i){
        var slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        var dist = Math.abs(slideCenter - center);
        if (dist < bestDist){ bestDist = dist; best = i; }
      });
      return best;
    }

    function goTo(i){
      i = Math.max(0, Math.min(slides.length - 1, i));
      var slide = slides[i];
      track.scrollTo({
        left: slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2,
        behavior: "smooth"
      });
    }

    function updateDots(){
      var idx = currentIndex();
      dots.forEach(function(dot, i){
        dot.classList.toggle("active", i === idx);
      });
    }

    prevBtn.addEventListener("click", function(){ goTo(currentIndex() - 1); });
    nextBtn.addEventListener("click", function(){ goTo(currentIndex() + 1); });

    track.addEventListener("keydown", function(e){
      if (e.key === "ArrowLeft"){ e.preventDefault(); goTo(currentIndex() - 1); }
      if (e.key === "ArrowRight"){ e.preventDefault(); goTo(currentIndex() + 1); }
    });

    var scrollTimer = null;
    track.addEventListener("scroll", function(){
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 80);
    }, { passive: true });

    updateDots();

    // Play the video slide only while it is in view
    var video = track.querySelector("video");
    if (video && "IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            var p = video.play();
            if (p && p.catch) p.catch(function(){});
          } else {
            video.pause();
          }
        });
      }, { root: track, threshold: 0.5 }).observe(video);
    }

    // Auto-scroll: advance every few seconds, wrap at the end.
    // Paused on hover / touch / focus, while off-screen, and for reduced motion.
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion){
      var AUTO_DELAY = 2500;
      var autoTimer = null;
      var hovering = false;
      var inView = true;

      function stopAuto(){
        if (autoTimer){ clearInterval(autoTimer); autoTimer = null; }
      }
      function startAuto(){
        stopAuto();
        if (hovering || !inView || document.hidden) return;
        autoTimer = setInterval(function(){
          var idx = currentIndex();
          goTo(idx >= slides.length - 1 ? 0 : idx + 1);
        }, AUTO_DELAY);
      }

      var carousel = document.getElementById("gallery-carousel");
      ["mouseenter", "touchstart", "focusin", "pointerdown"].forEach(function(ev){
        carousel.addEventListener(ev, function(){ hovering = true; stopAuto(); }, { passive: true });
      });
      ["mouseleave", "touchend", "focusout"].forEach(function(ev){
        carousel.addEventListener(ev, function(){ hovering = false; startAuto(); }, { passive: true });
      });

      document.addEventListener("visibilitychange", function(){
        if (document.hidden) stopAuto(); else startAuto();
      });

      if ("IntersectionObserver" in window){
        new IntersectionObserver(function(entries){
          inView = entries[0].isIntersecting;
          if (inView) startAuto(); else stopAuto();
        }, { threshold: 0.2 }).observe(carousel);
      }

      startAuto();
    }
  }

  var intakeForm = document.getElementById("intake-form");
  if (intakeForm){
    var formNote = document.getElementById("form-note");
    var submitBtn = intakeForm.querySelector(".form-submit");

    var setNote = function(lang, it, en){
      if (!formNote) return;
      formNote.textContent = lang === "en" ? en : it;
    };

    intakeForm.addEventListener("submit", function(e){
      e.preventDefault();
      var lang = html.getAttribute("data-lang") || "it";
      var name = intakeForm.querySelector("#f-name").value.trim();
      var company = intakeForm.querySelector("#f-company").value.trim();
      var email = intakeForm.querySelector("#f-email").value.trim();
      var phone = intakeForm.querySelector("#f-phone").value.trim();
      var message = intakeForm.querySelector("#f-message").value.trim();

      if (submitBtn) submitBtn.disabled = true;
      setNote(lang, "Invio in corso…", "Sending…");

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, company: company, email: email, phone: phone, message: message, lang: lang })
      })
        .then(function(res){
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then(function(){
          intakeForm.reset();
          setNote(lang, "Richiesta inviata con successo. Ti risponderemo al più presto.", "Request sent successfully. We'll get back to you shortly.");
        })
        .catch(function(){
          setNote(lang, "Invio non riuscito. Riprova o scrivici a info@tecnosmalt.it.", "Sending failed. Please try again or email us at info@tecnosmalt.it.");
        })
        .finally(function(){
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
