/* Cinematic dual-frame player for RTL Hebrew TV-mode */
(function () {
  const frameA = document.getElementById("frameA");
  const frameB = document.getElementById("frameB");
  const titleEl = document.getElementById("meta-title");
  const descEl = document.getElementById("meta-desc");
  const stepEl = document.getElementById("meta-ctx");
  const emptyEl = document.getElementById("empty");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnToggle = document.getElementById("btn-toggle");
  const loopInput = document.getElementById("chk-loop");
  const controlsEl = document.querySelector(".controls");

  let images = [];
  let current = 0;
  let playing = true;
  let timer = null;
  let activeA = true; // which frame is visible

  const HEBREW_LABELS = {
    "01_login": "כניסה",
    "02_profile": "פרופיל",
    "02_profile_slider": "פרופיל — סליידר",
    "03_courses": "קורסים",
    "04_course_detail": "פרטי קורס",
    "04_course_nlp": "קורס NLP",
    "05_course_ai_continue": "קורס AI — המשך",
    "05_lesson": "שיעור",
    "06_grades": "ציונים",
    "07_tickets_history": "כרטיסים",
    "08_placement": "שיבוץ",
    "09_reviews": "ביקורות",
    "10_support": "תמיכה",
    "11_logged_out": "יציאה",
  };

  function setIdleControls(idle) {
    controlsEl.classList.toggle("idle", idle);
  }

  function updateMeta(meta) {
    titleEl.textContent = meta.title || "לכידה אחרונה";
    descEl.textContent =
      meta.description || "מציג את הממצאים האחרונים מתוך הריצה האחרונה.";
    const label = HEBREW_LABELS[meta.stepId] || meta.stepId || "שלב";
    stepEl.textContent = `שלב: ${label}`;
  }

  function crossfade(src, meta) {
    const showEl = activeA ? frameB : frameA;
    const hideEl = activeA ? frameA : frameB;
    showEl.src = src;
    updateMeta(meta || {});
    // prime incoming frame on the right (RTL feel), fade in
    showEl.classList.remove("hide");
    // ensure styles recompute
    void showEl.offsetWidth;
    showEl.classList.add("show");
    // fade out previous
    hideEl.classList.remove("show");
    hideEl.classList.add("hide");
    activeA = !activeA;
  }

  function show(index) {
    if (!images.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    current = (index + images.length) % images.length;
    const img = images[current];
    crossfade(img.src, img.meta);
  }

  function next() {
    show(current + 1);
  }
  function prev() {
    show(current - 1);
  }

  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    timer = setTimeout(() => {
      next();
      schedule();
    }, 3200);
  }

  async function load() {
    try {
      // Static local mode: read images from player/screenshots (no fetch, file:// friendly)
      images = [
        {
          src: `./screenshots/01_login.png`,
          meta: { title: "כניסה", stepId: "01_login" },
        },
        {
          src: `./screenshots/02_profile.png`,
          meta: { title: "פרופיל", stepId: "02_profile" },
        },
        {
          src: `./screenshots/02_profile_slider.png`,
          meta: { title: "פרופיל — סליידר", stepId: "02_profile_slider" },
        },
        {
          src: `./screenshots/03_courses.png`,
          meta: { title: "קורסים", stepId: "03_courses" },
        },
        {
          src: `./screenshots/04_course_detail.png`,
          meta: { title: "פרטי קורס", stepId: "04_course_detail" },
        },
        {
          src: `./screenshots/05_lesson.png`,
          meta: { title: "שיעור", stepId: "05_lesson" },
        },
        {
          src: `./screenshots/06_grades.png`,
          meta: { title: "ציונים", stepId: "06_grades" },
        },
        {
          src: `./screenshots/07_tickets_history.png`,
          meta: { title: "כרטיסים", stepId: "07_tickets_history" },
        },
        {
          src: `./screenshots/08_placement.png`,
          meta: { title: "שיבוץ", stepId: "08_placement" },
        },
        {
          src: `./screenshots/09_reviews.png`,
          meta: { title: "ביקורות", stepId: "09_reviews" },
        },
        {
          src: `./screenshots/10_support.png`,
          meta: { title: "תמיכה", stepId: "10_support" },
        },
        {
          src: `./screenshots/11_logged_out.png`,
          meta: { title: "יציאה", stepId: "11_logged_out" },
        },
      ];

      // initialize both frames with first image to avoid blank flash
      if (images.length) {
        const first = images[0];
        frameA.src = first.src;
        frameA.classList.add("show");
        frameB.src = first.src;
        frameB.classList.add("hide");
        updateMeta(first.meta || {});
      }

      schedule();
    } catch (err) {
      console.warn("Player load error", err);
      emptyEl.hidden = false;
    }
  }

  // controls
  btnPrev.addEventListener("click", () => {
    prev();
    setIdleControls(false);
  });
  btnNext.addEventListener("click", () => {
    next();
    setIdleControls(false);
  });
  btnToggle.addEventListener("click", () => {
    playing = !playing;
    btnToggle.textContent = playing ? "השהה" : "הפעל";
    if (playing) {
      schedule();
    } else {
      clearTimeout(timer);
    }
    setIdleControls(false);
  });
  loopInput.addEventListener("change", () => {
    /* reserved for future looping behavior */
  });

  // keyboard
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      next();
      setIdleControls(false);
    } else if (e.key === "ArrowLeft") {
      prev();
      setIdleControls(false);
    } else if (e.key === " ") {
      e.preventDefault();
      btnToggle.click();
    }
  });

  // idle fade on inactivity
  let idleT = null;
  function bump() {
    setIdleControls(false);
    clearTimeout(idleT);
    idleT = setTimeout(() => setIdleControls(true), 2000);
  }
  ["mousemove", "keydown", "click"].forEach((ev) =>
    window.addEventListener(ev, bump)
  );

  load();
})();
