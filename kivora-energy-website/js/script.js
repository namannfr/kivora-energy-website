/* =====================================================================================
   KIVORA ENERGY — WEBSITE SCRIPT (plain JavaScript, no libraries)

   SITE CONFIGURATION
   Everything below must be confirmed by Kivora before the site is published.
   Leave a value as "" to keep it hidden. Nothing here has been invented.
   ===================================================================================== */
var SITE_CONFIG = {
  // Set to false before going live: hides the yellow "SETUP" reminders on the page.
  showSetupNotes: true,

  // Legal entity details — add only once the company registration is confirmed.
  legalName: "",          // e.g. "Kivora Energy Limited"
  companyNumber: "",      // Companies House number
  registeredOffice: "",   // registered office address
  jurisdiction: "",       // e.g. "Registered in England and Wales"

  // Public contact details — none supplied yet.
  contactEmail: "",
  phone: "",
  officeLocation: "",     // e.g. "London, United Kingdom" (only if confirmed)
  linkedinUrl: "",

  // Legal pages. While empty, the footer links open a short "being prepared" notice.
  privacyUrl: "",
  termsUrl: "",
  cookiesUrl: "",

  // CONTACT FORM INTEGRATION POINT
  // An HTTPS endpoint that accepts a JSON POST (a form service or your own API).
  // Until this is set, the form validates input but tells visitors clearly that nothing was sent.
  formEndpoint: ""
};

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reducedMotion = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var scrollToId = function (id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  };
  var C = SITE_CONFIG;

  /* ---------------------------------------------------------------- configuration */
  function applyConfig() {
    if (!C.showSetupNotes) document.documentElement.classList.add("no-setup");
    $("#year").textContent = new Date().getFullYear();
    if (C.legalName) $("#legal-name").textContent = C.legalName;
    var reg = [C.jurisdiction, C.companyNumber && "Company no. " + C.companyNumber, C.registeredOffice].filter(Boolean).join(" · ");
    if (reg) { $("#company-reg").textContent = reg; $("#company-reg").hidden = false; }
    if (C.legalName) $("#setup-legal").hidden = true;

    var anyDetail = false;
    ["contactEmail", "phone", "officeLocation", "linkedinUrl"].forEach(function (key) {
      var val = C[key];
      $$('[data-config="' + key + '"]').forEach(function (el) { el.textContent = val; });
      $$('[data-config-href="' + key + '"]').forEach(function (el) { if (val) el.href = val; });
      $$('[data-config-row="' + key + '"]').forEach(function (el) { el.hidden = !val; });
      if (val && key !== "linkedinUrl") anyDetail = true;
    });
    $("#contact-details").hidden = !anyDetail;
    $("#setup-contact").hidden = anyDetail;

    $$("[data-legal]").forEach(function (a) {
      var url = C[a.getAttribute("data-legal")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.classList.remove("fl"); }
    });

    // The founder's UK role runs to the present: stretch its timeline bar to today.
    $$(".g-bar[data-present]").forEach(function (bar) {
      var start = 2012, end = Math.max(new Date().getFullYear() + 1, 2027);
      var from = Number(bar.getAttribute("data-from"));
      var to = Math.min(new Date().getFullYear() + 0.6, end);
      var span = end - start;
      bar.style.left = ((from - start) / span) * 100 + "%";
      bar.style.width = ((to - from) / span) * 100 + "%";
    });
  }

  /* ---------------------------------------------------------------- header + menu */
  function initHeader() {
    var header = $("#site-header");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var btn = $("#menu-btn"), menu = $("#mobile-nav");
    var setOpen = function (open) {
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      $(".menu-ico-open", btn).hidden = open;
      $(".menu-ico-close", btn).hidden = !open;
      $(".menu-label", btn).textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
    };
    btn.addEventListener("click", function () { setOpen(menu.hidden); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); btn.focus(); }
    });
    var mq = window.matchMedia("(min-width:1280px)");
    var onMq = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);
  }

  /* ---------------------------------------------------------------- active nav link */
  function initActiveNav() {
    var ids = ["home", "problem", "solutions", "how-it-works", "technology", "difference", "model", "about", "founder", "roadmap", "outlook", "faq", "contact"];
    var parent = { problem: "home", difference: "technology", model: "technology", outlook: "roadmap", faq: "roadmap" };
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var links = $$("[data-nav]");
    var current = null;
    var update = function () {
      var line = window.innerHeight * 0.32, cur = ids[0];
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s.id; });
      cur = parent[cur] || cur;
      if (cur === current) return;
      current = cur;
      links.forEach(function (a) {
        if (a.getAttribute("data-nav") === cur) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------------------------------------------------------- generic tab keyboard support */
  function keyNav(e, index, count, vertical) {
    var next = null;
    var fwd = vertical ? ["ArrowDown", "ArrowRight"] : ["ArrowRight"];
    var back = vertical ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft"];
    if (fwd.indexOf(e.key) > -1) next = vertical ? Math.min(index + 1, count - 1) : (index + 1) % count;
    if (back.indexOf(e.key) > -1) next = vertical ? Math.max(index - 1, 0) : (index - 1 + count) % count;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = count - 1;
    return next;
  }

  /* ---------------------------------------------------------------- solution cards */
  function initSolutionToggles() {
    $$("[data-toggle-more]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
        $("span", btn).textContent = open ? "Show less" : "How it would work";
      });
    });
  }

  /* ---------------------------------------------------------------- customer segment tabs */
  function initSegments() {
    var tabs = $$("#segments [role=tab]");
    var select = function (i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var n = keyNav(e, i, tabs.length, false);
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
  }

  /* ---------------------------------------------------------------- how it works */
  function initHowItWorks() {
    var modeBtns = $$("[data-mode]");
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var mode = b.getAttribute("data-mode");
        modeBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        $$("[data-journey]").forEach(function (j) { j.hidden = j.getAttribute("data-journey") !== mode; });
        selectStep($('[data-journey="' + mode + '"]'), 0);
      });
    });

    function selectStep(journey, i, focus) {
      var btns = $$(".step-btn", journey);
      btns.forEach(function (b, j) {
        var on = i === j;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        b.classList.toggle("is-done", j < i);
        document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) btns[i].focus();
    }

    $$("[data-journey]").forEach(function (journey) {
      var btns = $$(".step-btn", journey);
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { selectStep(journey, i); });
        b.addEventListener("keydown", function (e) {
          var n = keyNav(e, i, btns.length, true);
          if (n !== null) { e.preventDefault(); selectStep(journey, n, true); }
        });
      });
      $$("[data-step-go]", journey).forEach(function (b) {
        b.addEventListener("click", function () {
          var n = Number(b.getAttribute("data-step-go"));
          if (n >= 0 && n < btns.length) selectStep(journey, n);
        });
      });
    });
  }

  /* ---------------------------------------------------------------- technology layers */
  function initLayers() {
    var layers = $$(".layer"), widgets = $$("[data-w]"), reset = $("#layers-reset");
    var apply = function (active) {
      layers.forEach(function (l) { l.setAttribute("aria-pressed", String(l === active)); });
      var ids = active ? active.getAttribute("data-widgets").split(" ") : null;
      widgets.forEach(function (w) {
        var on = ids && ids.indexOf(w.getAttribute("data-w")) > -1;
        w.classList.toggle("hi", !!(ids && on));
        w.classList.toggle("dim", !!(ids && !on));
      });
      reset.hidden = !active;
    };
    layers.forEach(function (l) {
      l.addEventListener("click", function () { apply(l.getAttribute("aria-pressed") === "true" ? null : l); });
    });
    reset.addEventListener("click", function () { apply(null); });
  }

  /* ---------------------------------------------------------------- FAQ */
  function initFaq() {
    $$(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var open = q.getAttribute("aria-expanded") !== "true";
        q.setAttribute("aria-expanded", String(open));
        document.getElementById(q.getAttribute("aria-controls")).classList.toggle("open", open);
      });
    });
  }

  /* ---------------------------------------------------------------- chart tooltips */
  function initCharts() {
    $$("[data-chart]").forEach(function (fig) {
      var tip = $(".tip", fig), svg = $("svg", fig);
      var W = Number(fig.getAttribute("data-vbw")), H = Number(fig.getAttribute("data-vbh"));
      var show = function (g) {
        var r = svg.getBoundingClientRect(), fr = fig.getBoundingClientRect();
        var x = r.left - fr.left + Number(g.getAttribute("data-tip-x")) * (r.width / W);
        var y = r.top - fr.top + Number(g.getAttribute("data-tip-y")) * (r.height / H) - 8;
        tip.innerHTML = "";
        var a = document.createElement("div"); a.textContent = g.getAttribute("data-tip-label") + " · forecast";
        var b = document.createElement("b"); b.textContent = g.getAttribute("data-tip-value");
        tip.appendChild(a); tip.appendChild(b);
        tip.style.left = x + "px"; tip.style.top = y + "px";
        tip.hidden = false;
      };
      var hide = function () { tip.hidden = true; };
      $$(".c-bar-g", fig).forEach(function (g) {
        g.addEventListener("mouseenter", function () { show(g); });
        g.addEventListener("focus", function () { show(g); });
        g.addEventListener("blur", hide);
      });
      fig.addEventListener("mouseleave", hide);
    });
  }

  /* ---------------------------------------------------------------- legal modal */
  function initLegal() {
    var modal = $("#legal-modal"), title = $("#modal-h"), close = $("#modal-close"), lastFocus = null;
    var hide = function () { modal.hidden = true; if (lastFocus) lastFocus.focus(); };
    $$("[data-legal]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (C[a.getAttribute("data-legal")]) return; // real URL configured: follow the link
        e.preventDefault();
        lastFocus = a;
        title.textContent = a.textContent;
        modal.hidden = false;
        close.focus();
      });
    });
    close.addEventListener("click", hide);
    modal.addEventListener("click", function (e) { if (e.target === modal) hide(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) hide(); });
  }

  /* ---------------------------------------------------------------- contact form */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FREE_MAIL = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "live.com"];
  var FIELDS = ["name", "org", "email", "type", "message", "consent"];

  function initForm() {
    var form = $("#contact-form");
    var el = {
      name: $("#cf-name"), org: $("#cf-org"), email: $("#cf-email"), type: $("#cf-type"),
      message: $("#cf-message"), consent: $("#cf-consent")
    };
    var status = $("#form-status"), submitBtn = $("#cf-submit"), touched = {}, attempted = false;

    var values = function () {
      return {
        name: el.name.value, org: el.org.value, email: el.email.value, type: el.type.value || "",
        message: el.message.value, consent: el.consent.checked
      };
    };
    var individual = function (type) { return !type || type === "rider" || type === "other"; };

    function validate(v) {
      var e = {};
      if (!v.name.trim()) e.name = "Enter your name.";
      else if (v.name.trim().length < 2) e.name = "Your name needs at least 2 characters.";
      if (!individual(v.type) && !v.org.trim()) e.org = "Enter your organisation, or choose “Rider services interest” if you are enquiring as an individual.";
      if (!v.email.trim()) e.email = "Enter an email address so Kivora can reply.";
      else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter an email address in the format name@company.com.";
      if (!v.type) e.type = "Choose the enquiry type that fits best.";
      if (!v.message.trim()) e.message = "Tell us a little about your enquiry.";
      else if (v.message.trim().length < 20) e.message = "Add a little more detail (at least 20 characters).";
      else if (v.message.length > 2000) e.message = "Keep your message under 2,000 characters.";
      if (!v.consent) e.consent = "Confirm that Kivora may use these details to reply.";
      return e;
    }

    function render(errors) {
      FIELDS.forEach(function (k) {
        var msg = (touched[k] || attempted) ? errors[k] : null;
        var box = $("#cf-" + (k === "org" ? "org" : k) + "-err");
        box.textContent = msg || "";
        box.hidden = !msg;
        el[k].setAttribute("aria-invalid", msg ? "true" : "false");
      });
      var v = values();
      $("#cf-org-opt").hidden = !individual(v.type);
      var domain = (v.email.split("@")[1] || "").toLowerCase();
      $("#cf-email-hint").hidden = !(FREE_MAIL.indexOf(domain) > -1 && !individual(v.type)) || !!errors.email && (touched.email || attempted);
      $("#cf-count").textContent = v.message.length + " / 2000";
      el.message.placeholder = v.type === "fleet"
        ? "For example: number of vehicles, delivery areas in Lagos, and what you spend on fuel and maintenance today."
        : "How can Kivora help?";
    }

    function setStatus(kind, html) {
      status.innerHTML = html ? '<div class="status status--' + kind + '">' + html + "</div>" : "";
    }

    FIELDS.forEach(function (k) {
      var evt = k === "type" || k === "consent" ? "change" : "input";
      el[k].addEventListener(evt, function () { render(validate(values())); setStatus(); });
      el[k].addEventListener("blur", function () { touched[k] = true; render(validate(values())); });
    });

    var escapeHtml = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attempted = true;
      var v = values(), errors = validate(v), count = Object.keys(errors).length;
      render(errors);
      if (count) {
        setStatus("err", '<b class="form-summary">Please fix ' + (count === 1 ? "1 field" : count + " fields") + " before sending.</b>");
        var first = FIELDS.filter(function (k) { return errors[k]; })[0];
        el[first].focus();
        return;
      }

      /* ---- INTEGRATION POINT ------------------------------------------------------
         Set SITE_CONFIG.formEndpoint to an HTTPS endpoint that accepts JSON. Payload:
         { name, organisation, email, enquiryType, message, consent, submittedAt, source }
         Success is shown to the visitor only when the endpoint returns a 2xx status.
         ---------------------------------------------------------------------------- */
      if (!C.formEndpoint) {
        setStatus("info",
          "<b>Your details look complete, but this form is not connected yet.</b>" +
          "<span>Your enquiry has not been sent. " +
          (C.contactEmail
            ? 'Please email <span class="mono">' + escapeHtml(C.contactEmail) + "</span> instead.</span>"
            : "Online enquiries will open once Kivora's contact channel is confirmed.</span>") +
          (C.showSetupNotes ? '<span class="setup" data-setup-note>Set SITE_CONFIG.formEndpoint (and contactEmail) in js/script.js to enable sending.</span>' : ""));
        return;
      }

      submitBtn.disabled = true;
      var label = submitBtn.firstChild.nodeValue;
      submitBtn.firstChild.nodeValue = "Sending… ";
      fetch(C.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: v.name.trim(), organisation: v.org.trim(), email: v.email.trim(), enquiryType: v.type,
          message: v.message.trim(), consent: v.consent, submittedAt: new Date().toISOString(), source: "kivora-website"
        })
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus("ok", "<b>Enquiry sent</b><span>Thank you. Your enquiry has been sent and the Kivora team will reply by email.</span>");
        form.reset(); touched = {}; attempted = false; render({});
      }).catch(function () {
        setStatus("err", "<b>Your enquiry could not be sent.</b><span>Please try again in a few minutes" +
          (C.contactEmail ? ", or email " + escapeHtml(C.contactEmail) + "." : ".") + "</span>");
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.firstChild.nodeValue = label;
      });
    });

    render({});

    // Public helper used by every "Discuss…" / "Register…" / "Explore…" button.
    return function preselect(type, focus) {
      if (type) el.type.value = type;
      render(validate(values()));
      setStatus();
      $$("[data-route]").forEach(function (r) { r.setAttribute("aria-pressed", String(r.getAttribute("data-route") === type)); });
      if (focus) setTimeout(function () { el.name.focus({ preventScroll: true }); }, reducedMotion() ? 0 : 650);
    };
  }

  function initCtas(preselect) {
    $$("[data-enquiry]").forEach(function (b) {
      b.addEventListener("click", function () {
        var menu = $("#mobile-nav");
        if (!menu.hidden) $("#menu-btn").click();
        preselect(b.getAttribute("data-enquiry"), true);
        scrollToId("contact");
      });
    });
    $$("[data-route]").forEach(function (r) {
      r.addEventListener("click", function () { preselect(r.getAttribute("data-route"), true); });
    });
  }

  /* ---------------------------------------------------------------- entrance motion */
  function initReveal() {
    if (reducedMotion() || !("IntersectionObserver" in window)) return;
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove("pending"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add("pending"); io.observe(el); }
    });
  }

  /* ---------------------------------------------------------------- start */
  function start() {
    applyConfig();
    initHeader();
    initActiveNav();
    initSolutionToggles();
    initSegments();
    initHowItWorks();
    initLayers();
    initFaq();
    initCharts();
    initLegal();
    initCtas(initForm());
    initReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
