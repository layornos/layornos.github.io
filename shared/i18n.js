// Language switching and shared behaviour for every proposal.
//   data-i18n="key"            -> textContent from the dictionary
//   data-i18n-attr="attr:key"  -> attribute from the dictionary (";"-separated)
//   data-set-lang="en|de"      -> button that switches language
//   data-link="github|..."     -> href from SITE.links
//   data-email                 -> shows the display form of the address
//   data-copy-email            -> button that copies the address
// Pages may define window.PAGE_T = { en: {...}, de: {...} } for extra keys,
// and can listen for the "langchange" event to re-render custom parts.
(function () {
  var S = window.SITE;
  var KEY = "sk-lang";

  function dict(lang) {
    var extra = (window.PAGE_T && window.PAGE_T[lang]) || {};
    return Object.assign({}, S.t[lang], extra);
  }

  function initialLang() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "de") return saved;
    } catch (e) {}
    return (navigator.language || "en").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  }

  function apply(lang) {
    var d = dict(lang);
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = d[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (d[p[1]] != null) el.setAttribute(p[0], d[p[1]]);
      });
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    window.LANG = lang;
    window.T = d;
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang, t: d } }));
  }

  function copyEmail(btn) {
    var label = btn.querySelector("[data-copy-label]") || btn;
    function done(key) {
      label.textContent = window.T[key];
      setTimeout(function () { label.textContent = window.T.copy; }, 1800);
    }
    function fallback() {
      var shown = document.querySelector("[data-email]");
      if (shown) {
        var r = document.createRange();
        r.selectNodeContents(shown);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
      done("copy_fail");
    }
    try {
      navigator.clipboard.writeText(S.email).then(function () { done("copied"); }, fallback);
    } catch (e) { fallback(); }
  }

  document.addEventListener("click", function (e) {
    var langBtn = e.target.closest("[data-set-lang]");
    if (langBtn) {
      var l = langBtn.getAttribute("data-set-lang");
      apply(l);
      try { localStorage.setItem(KEY, l); } catch (err) {}
    }
    var copyBtn = e.target.closest("[data-copy-email]");
    if (copyBtn) copyEmail(copyBtn);
  });

  document.querySelectorAll("[data-link]").forEach(function (a) {
    a.href = S.links[a.getAttribute("data-link")];
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = S.emailDisplay; });
  document.querySelectorAll("[data-name]").forEach(function (el) { el.textContent = S.name; });
  document.querySelectorAll("[data-handle]").forEach(function (el) { el.textContent = S.handle; });
  document.querySelectorAll("[data-stack]").forEach(function (ul) {
    S.stack.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
  });

  apply(initialLang());
})();
