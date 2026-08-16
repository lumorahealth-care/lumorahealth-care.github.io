/* ============================================================
   Lumora Health: Waitlist landing page interactions
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  siteNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        animateCounter(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (progress === 1 ? "+" : "");
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Tabs ---------- */
  const tabs = document.querySelectorAll(".form-tab");
  const panels = {
    patient: document.getElementById("panel-patient"),
    doctor: document.getElementById("panel-doctor"),
  };

  function selectTab(name) {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    Object.entries(panels).forEach(([key, panel]) => {
      const active = key === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab.dataset.tab)));

  // CTA buttons that jump to the waitlist can pre-select a tab
  document.querySelectorAll("[data-select-tab]").forEach((link) => {
    link.addEventListener("click", () => selectTab(link.dataset.selectTab));
  });

  /* ---------- Multi-step forms ---------- */
  document.querySelectorAll("#patientForm, #doctorForm").forEach(initMultiStepForm);

  function initMultiStepForm(form) {
    const steps = Array.from(form.querySelectorAll(".form-step"));
    const progressFill = form.querySelector(".progress-fill");
    const currentStepEl = form.querySelector(".current-step");
    const totalStepsEl = form.querySelector(".total-steps");
    const btnBack = form.querySelector(".btn-back");
    const btnNext = form.querySelector(".btn-next");
    const btnSubmit = form.querySelector(".btn-submit");

    let current = 0;
    totalStepsEl.textContent = steps.length;

    function render() {
      steps.forEach((step, i) => step.classList.toggle("is-active", i === current));
      currentStepEl.textContent = current + 1;
      progressFill.style.width = ((current + 1) / steps.length) * 100 + "%";
      btnBack.hidden = current === 0;
      const last = current === steps.length - 1;
      btnNext.hidden = last;
      btnSubmit.hidden = !last;
    }

    function validateStep(step) {
      let valid = true;
      let firstInvalid = null;

      // Text inputs, selects, textareas, consent checkboxes marked required
      step.querySelectorAll("input[required], select[required], textarea[required]").forEach((input) => {
        const field = input.closest(".field");
        let ok;
        if (input.type === "checkbox") {
          ok = input.checked;
          setFieldError(field, ok ? "" : "Please tick this box to continue.");
        } else if (input.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          setFieldError(field, ok ? "" : "Please enter a valid email address.");
        } else {
          ok = input.value.trim() !== "";
          setFieldError(field, ok ? "" : "This field is required.");
        }
        if (!ok) {
          valid = false;
          firstInvalid = firstInvalid || input;
        }
      });

      // Chip groups (checkbox/radio sets) marked required
      step.querySelectorAll('.chip-group[data-required="true"]').forEach((group) => {
        const field = group.closest(".field");
        const ok = group.querySelectorAll("input:checked").length > 0;
        setFieldError(field, ok ? "" : "Please select at least one option.");
        if (!ok) {
          valid = false;
          firstInvalid = firstInvalid || group;
        }
      });

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstInvalid.focus) firstInvalid.focus({ preventScroll: true });
      }
      return valid;
    }

    function setFieldError(field, message) {
      if (!field) return;
      const errorEl = field.querySelector(".field-error");
      field.classList.toggle("has-error", Boolean(message));
      if (errorEl) errorEl.textContent = message;
    }

    // Clear errors as the user fixes them
    form.addEventListener("input", (e) => {
      const field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) {
        setFieldError(field, "");
      }
    });

    btnNext.addEventListener("click", () => {
      if (!validateStep(steps[current])) return;
      current = Math.min(current + 1, steps.length - 1);
      render();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    btnBack.addEventListener("click", () => {
      current = Math.max(current - 1, 0);
      render();
    });

    // Validate the last step, then let the browser POST natively to the
    // form's action URL, which navigates to the endpoint's confirmation page.
    form.addEventListener("submit", (e) => {
      if (!validateStep(steps[current])) {
        e.preventDefault();
        return;
      }
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Submitting…";
    });

    render();
  }

  /* ---------- Doctor form: country code & licence from country ---------- */
  const phoneCode = document.getElementById("d-phone-code");
  const phoneOtherWrap = document.getElementById("d-phone-other-wrap");
  const phoneOther = document.getElementById("d-phone-other");
  const licenceCouncil = document.getElementById("d-licence-council");
  const licenceCouncilDisplay = document.getElementById("d-licence-council-display");
  const licenceOtherWrap = document.getElementById("d-licence-other-wrap");
  const licenceOther = document.getElementById("d-licence-other");
  const practiceCountry = document.getElementById("d-country");

  const practiceToDialCode = {
    Nigeria: "+234",
    Ghana: "+233",
    Kenya: "+254",
    Ethiopia: "+251",
    Uganda: "+256",
    Tanzania: "+255",
    Cameroon: "+237",
    Senegal: "+221",
    Rwanda: "+250",
    "South Africa": "+27",
  };

  const practiceToLicenceCouncil = {
    Nigeria: "MDCN (Nigeria)",
    Ghana: "MDC (Ghana)",
    Kenya: "KMPDC (Kenya)",
    Ethiopia: "FMHACA / EMA (Ethiopia)",
    Uganda: "UMDPC (Uganda)",
    Tanzania: "Medical Council (Tanzania)",
    Cameroon: "Medical Council (Cameroon)",
    Senegal: "Ordre National des Médecins (Senegal)",
    Rwanda: "RHPC (Rwanda)",
    "South Africa": "HPCSA (South Africa)",
  };

  function toggleOtherField(selectEl, wrapEl, inputEl, makeRequired) {
    if (!selectEl || !wrapEl || !inputEl) return;
    const show = selectEl.value === "other";
    wrapEl.hidden = !show;
    if (makeRequired) {
      inputEl.required = show;
      if (!show) {
        inputEl.value = "";
        const field = inputEl.closest(".field");
        if (field) field.classList.remove("has-error");
      }
    } else if (!show) {
      inputEl.value = "";
    }
  }

  function syncLicenceCouncilFromCountry() {
    if (!practiceCountry || !licenceCouncil || !licenceCouncilDisplay) return;

    const country = practiceCountry.value;
    const mapped = practiceToLicenceCouncil[country];

    if (!country) {
      licenceCouncil.value = "";
      licenceCouncil.required = false;
      licenceCouncilDisplay.textContent = "Select a country of practice first";
      licenceCouncilDisplay.classList.add("is-placeholder");
      if (licenceOtherWrap && licenceOther) {
        licenceOtherWrap.hidden = true;
        licenceOther.required = false;
        licenceOther.value = "";
      }
      return;
    }

    if (country === "other" || !mapped) {
      licenceCouncil.value = licenceOther ? licenceOther.value.trim() : "";
      licenceCouncil.required = false;
      licenceCouncilDisplay.textContent = "Enter your issuing council below";
      licenceCouncilDisplay.classList.add("is-placeholder");
      if (licenceOtherWrap && licenceOther) {
        licenceOtherWrap.hidden = false;
        licenceOther.required = true;
      }
      return;
    }

    licenceCouncil.value = mapped;
    licenceCouncil.required = true;
    licenceCouncilDisplay.textContent = mapped;
    licenceCouncilDisplay.classList.remove("is-placeholder");
    if (licenceOtherWrap && licenceOther) {
      licenceOtherWrap.hidden = true;
      licenceOther.required = false;
      licenceOther.value = "";
    }
  }

  if (phoneCode) {
    phoneCode.addEventListener("change", () => {
      toggleOtherField(phoneCode, phoneOtherWrap, phoneOther, false);
    });
  }

  if (licenceOther && licenceCouncil) {
    licenceOther.addEventListener("input", () => {
      if (practiceCountry && practiceCountry.value === "other") {
        licenceCouncil.value = licenceOther.value.trim();
      }
    });
  }

  if (practiceCountry) {
    practiceCountry.addEventListener("change", () => {
      const code = practiceToDialCode[practiceCountry.value];
      if (code && phoneCode && phoneCode.value !== "other") {
        phoneCode.value = code;
      }
      syncLicenceCouncilFromCountry();
    });
    syncLicenceCouncilFromCountry();
  }
})();
