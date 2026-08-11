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

  var intakeForm = document.getElementById("intake-form");
  if (intakeForm){
    intakeForm.addEventListener("submit", function(e){
      e.preventDefault();
      var lang = html.getAttribute("data-lang") || "it";
      var name = intakeForm.querySelector("#f-name").value.trim();
      var company = intakeForm.querySelector("#f-company").value.trim();
      var email = intakeForm.querySelector("#f-email").value.trim();
      var phone = intakeForm.querySelector("#f-phone").value.trim();
      var message = intakeForm.querySelector("#f-message").value.trim();

      var subject = lang === "en"
        ? "Quote request — " + (company || name)
        : "Richiesta preventivo — " + (company || name);

      var bodyLines = lang === "en"
        ? ["Name: " + name, "Company: " + company, "Email: " + email, "Phone: " + phone, "", "Message:", message]
        : ["Nome: " + name, "Azienda: " + company, "Email: " + email, "Telefono: " + phone, "", "Messaggio:", message];

      var mailto = "mailto:tecnosmalt@pec.it"
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
    });
  }
})();
