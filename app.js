/* =========================================================
   Shootalyze: site behaviour
   Real pipeline output, no placeholder data in here.
   ========================================================= */

const WAITLIST_URL = "https://forms.gle/WAUrEAFMLEEAnkxa8";

const DEMO = {
  video: "assets/video/demo.mp4",
  metrics: [
    { name: "Release angle",  value: 57,   suffix: "°", score: "excellent" },
    { name: "Elbow angle",    value: 175,  suffix: "°", score: "excellent" },
    { name: "Knee angle",     value: 170,  suffix: "°", score: "excellent" },
    { name: "Entry angle",    value: 61,   suffix: "°", score: "good" },
    { name: "Release height", value: 2.21, suffix: " m", score: "good", decimals: 2 }
  ],
  feedback: `1. Shot mechanics

The elbow reaches full extension at release (175°), showing clean follow-through. The legs are fully extended at 170°, meaning the ball is released at the peak of power generation. Release height remains solid at 2.21 m.

2. Ball trajectory

The 57° release angle creates a very steep 61° entry angle. This produces a soft drop but limits side-to-side margin for error.

3. Outcome

The shot was made, driven by clean mechanics, good timing, and touch.

4. Overall assessment

Mechanically sound shot with good sequencing, but the arc is higher than ideal for consistent range.

Key cue: keep the timing and flatten the arc slightly.`
};

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- Waitlist links ---------- */
$$(".waitlist-link").forEach(a => { a.href = WAITLIST_URL; });

/* ---------- Count up ---------- */
function countUp(node, target, { suffix = "", decimals = 0, duration = 1200 } = {}) {
  if (prefersReduced) {
    node.textContent = target.toFixed(decimals) + suffix;
    return;
  }
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = (target * eased).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Hero load ---------- */
function initHero() {
  requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
    setTimeout(() => {
      $$(".hstat-num").forEach(el => {
        countUp(el, parseFloat(el.dataset.count), {
          suffix: el.dataset.suffix || "",
          decimals: parseInt(el.dataset.decimals || "0", 10)
        });
      });
    }, 450);
  });
}

/* ---------- Header + scroll progress ---------- */
function initScrollChrome() {
  const header = $("#siteHeader");
  const bar = $("#scrollProgress");
  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // scaleX, not width: transform stays on the GPU, width relayouts each frame
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initNavMenu() {
  const header = $("#siteHeader");
  const toggle = $("#navToggle");
  const nav = $("#primaryNav");
  if (!header || !toggle || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!header.classList.contains("nav-open")));

  // Close after picking a destination, otherwise the panel covers it
  $$("a", nav).forEach(a => a.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (header.classList.contains("nav-open") && !header.contains(e.target)) setOpen(false);
  });

  // Resizing past the breakpoint would otherwise leave the panel stranded open
  window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = $$("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in"));
    // The metric rows start at opacity 0 and are only revealed by
    // animateMetrics, which normally fires from the observer below. Without
    // this call they would stay invisible for the whole session.
    animateMetrics();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
      if (e.target.querySelector("#metricList")) animateMetrics();
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  items.forEach(i => io.observe(i));
}

/* ---------- Demo section ---------- */
function renderDemo() {
  const video = $("#demoVideo");
  if (video) video.src = DEMO.video;

  const list = $("#metricList");
  list.innerHTML = "";
  DEMO.metrics.forEach(m => {
    const row = document.createElement("div");
    row.className = "metric-row";
    row.innerHTML = `
      <span class="metric-name">${m.name}</span>
      <span class="metric-right">
        <span class="metric-value" data-target="${m.value}" data-suffix="${m.suffix}" data-decimals="${m.decimals || 0}">0${m.suffix}</span>
        <span class="metric-chip ${m.score}">${m.score}</span>
      </span>`;
    list.appendChild(row);
  });

  $("#feedbackText").textContent = DEMO.feedback;

  const toggle = $("#toggleFeedback");
  const feedback = $("#feedbackText");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "feedbackText");

  toggle.addEventListener("click", () => {
    const open = feedback.classList.toggle("open");
    // Measured rather than assumed: the old CSS capped the open state at a
    // hardcoded 1400px, which would clip a longer coaching note.
    feedback.style.maxHeight = open ? `${feedback.scrollHeight}px` : "";
    toggle.textContent = open ? "Collapse note" : "Read the full note";
    toggle.setAttribute("aria-expanded", String(open));
  });
}

let metricsDone = false;
function animateMetrics() {
  if (metricsDone) return;
  metricsDone = true;
  $$(".metric-row").forEach((row, i) => {
    setTimeout(() => {
      row.classList.add("in");
      const v = row.querySelector(".metric-value");
      countUp(v, parseFloat(v.dataset.target), {
        suffix: v.dataset.suffix,
        decimals: parseInt(v.dataset.decimals, 10),
        duration: 900
      });
    }, prefersReduced ? 0 : i * 60);
  });
}

/* ---------- How it works: scroll-linked steps ---------- */
function initHowSteps() {
  const steps = $$(".how-step");
  const stages = $$(".how-stage");
  if (!steps.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target.dataset.step;
      steps.forEach(s => s.classList.toggle("is-active", s === e.target));
      stages.forEach(s => s.classList.toggle("is-on", s.dataset.stage === n));
    });
  }, { threshold: 0.6, rootMargin: "-20% 0px -20% 0px" });

  steps.forEach(s => io.observe(s));
}

/* ---------- FAQ accordion ---------- */
function initAccordion() {
  const items = $$(".acc-item");

  items.forEach((item, i) => {
    const q = item.querySelector(".acc-q");
    const panel = item.querySelector(".acc-a");
    if (!panel.id) panel.id = `acc-panel-${i + 1}`;
    q.setAttribute("aria-expanded", "false");
    q.setAttribute("aria-controls", panel.id);

    q.addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      // One panel open at a time. The height itself is animated by
      // grid-template-rows in CSS, so nothing here measures the content.
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".acc-q").setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ---------- Subtle pointer tilt on cards ---------- */
function initTilt() {
  if (prefersReduced || window.matchMedia("(pointer: coarse)").matches) return;

  $$("[data-tilt]").forEach((card) => {
    let tx = 0, ty = 0, cx = 0, cy = 0, targetLift = 0, lift = 0, raf = null;

    function frame() {
      // Chase the pointer instead of snapping to it. Binding a transform
      // straight to cursor position reads as artificial because it carries no
      // momentum; easing toward the target each frame gives it weight.
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      lift += (targetLift - lift) * 0.12;

      card.style.transform =
        `perspective(900px) rotateX(${(-cy * 4).toFixed(3)}deg) ` +
        `rotateY(${(cx * 4).toFixed(3)}deg) translateY(${lift.toFixed(2)}px)`;

      const settled =
        Math.abs(tx - cx) < 0.0005 &&
        Math.abs(ty - cy) < 0.0005 &&
        Math.abs(targetLift - lift) < 0.02;

      if (!settled) {
        raf = requestAnimationFrame(frame);
        return;
      }
      raf = null;
      // Hand the element back to the stylesheet once it has come to rest
      if (targetLift === 0) card.style.transform = "";
    }

    const run = () => { if (raf === null) raf = requestAnimationFrame(frame); };

    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      targetLift = -3;
      run();
    });

    card.addEventListener("pointerleave", () => {
      tx = 0; ty = 0; targetLift = 0;
      run();
    });
  });
}

/* ---------- Hero parallax on the scope ---------- */
function initScopeParallax() {
  const scope = $("#heroScope");
  if (!scope || prefersReduced || window.matchMedia("(pointer: coarse)").matches) return;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  function frame() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    scope.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    const settled = Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05;
    raf = settled ? null : requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", (e) => {
    // The .scope CSS transition used to smooth this, which meant every mouse
    // move retargeted a 500ms ease and the frame trailed the cursor. The
    // transition is gone; this lerp does the smoothing per frame instead.
    tx = (e.clientX / window.innerWidth - 0.5) * 8;
    ty = (e.clientY / window.innerHeight - 0.5) * 8;
    if (raf === null) raf = requestAnimationFrame(frame);
  }, { passive: true });
}

/* ---------- Boot ---------- */
renderDemo();
initHero();
initScrollChrome();
initNavMenu();
initReveal();
initHowSteps();
initAccordion();
initTilt();
initScopeParallax();
