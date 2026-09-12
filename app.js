/* =========================================================
   Shootalyze: site behaviour
   Real pipeline output, no placeholder data in here.
   ========================================================= */

const WAITLIST_URL = "https://forms.gle/WAUrEAFMLEEAnkxa8";

/* Measured output for one real shot. The values are never edited.
   The verdict shown beside each one is NOT stored here: it is derived from
   TARGETS below. Authored labels are what let this page contradict itself,
   with 57° tagged "excellent" while the coach note in the same object called
   the arc higher than ideal. */
const DEMO = {
  video: "assets/video/demo.mp4",
  metrics: [
    { id: "release", name: "Release angle",  value: 57,   suffix: "°" },
    { id: "elbow",   name: "Elbow angle",    value: 175,  suffix: "°" },
    { id: "knee",    name: "Knee angle",     value: 170,  suffix: "°" },
    { id: "entry",   name: "Entry angle",    value: 61,   suffix: "°" },
    { id: "height",  name: "Release height", value: 2.21, suffix: " m", decimals: 2 }
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

/* Target ranges. One source of truth for every verdict on the page.
   Release angle: the free-throw optimum sits near 52° at a 7ft release and
   moves with player height, roughly 48.7° at 7'0" up to 52.2° at 5'4". Jump
   shots sit in the same band and flatten with distance, about 52-55° close in
   and 48-50° further out. 48-54° spans free-throw through mid-range.
   Entry angle: 45° leaves the largest effective opening at the rim, and the
   penalty for error grows sharply above it, so 43-47° with 2° either side.
   Elbow and knee: near-full extension through release, so 160° and up.
   Release height: no single target, higher is simply better, so no verdict. */
const TARGETS = {
  release: { min: 48,  max: 54, label: "target 48-54°" },
  entry:   { min: 43,  max: 47, label: "target 43-47°" },
  elbow:   { min: 160,          label: "target 160°+" },
  knee:    { min: 160,          label: "target 160°+" },
  height:  {                    label: "higher is better" }
};

function grade(id, value) {
  const t = TARGETS[id];
  if (!t || (t.min === undefined && t.max === undefined)) return null;
  if (t.min !== undefined && value < t.min) return { cls: "low", text: "low" };
  if (t.max !== undefined && value > t.max) return { cls: "high", text: "high" };
  return { cls: "on-target", text: "on target" };
}

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
/* ---------- Demo video ----------
   A 3 second silent loop that starts on its own reads as a live demo. Leaving
   a poster to be clicked made the panel look like a broken player. The file is
   half the page weight though, so the source is not attached until the panel
   is near the viewport: someone who bounces at the hero never downloads it. */
function initDemoVideo() {
  const video = $("#demoVideo");
  if (!video) return;

  if (prefersReduced) {
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
  }

  let attached = false;
  function attach() {
    if (attached) return;
    attached = true;
    video.src = DEMO.video;
    if (prefersReduced) return;          // controls are still there to press
    const started = video.play();
    if (started && typeof started.catch === "function") started.catch(() => {});
  }

  if (!("IntersectionObserver" in window)) { attach(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { attach(); io.disconnect(); }
  }, { rootMargin: "300px 0px" });
  io.observe(video);
}

function renderDemo() {

  const list = $("#metricList");
  list.innerHTML = "";
  DEMO.metrics.forEach(m => {
    const t = TARGETS[m.id];
    const g = grade(m.id, m.value);
    const row = document.createElement("div");
    row.className = "metric-row";
    row.innerHTML = `
      <span class="metric-label">
        <span class="metric-name">${m.name}</span>
        ${t && t.label ? `<span class="metric-target">${t.label}</span>` : ""}
      </span>
      <span class="metric-right">
        <span class="metric-value" data-target="${m.value}" data-suffix="${m.suffix}" data-decimals="${m.decimals || 0}">0${m.suffix}</span>
        ${g ? `<span class="metric-chip ${g.cls}">${g.text}</span>` : ""}
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
      // Returning to rest is faster than following the pointer. Exits should
      // outpace entrances, and at 0.12 the card took most of a second to
      // fully unwind, which reads as lag rather than weight.
      const k = targetLift === 0 ? 0.2 : 0.12;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      lift += (targetLift - lift) * k;

      card.style.transform =
        `perspective(900px) rotateX(${(-cy * 4).toFixed(3)}deg) ` +
        `rotateY(${(cx * 4).toFixed(3)}deg) translateY(${lift.toFixed(2)}px)`;

      // 0.002 of a half-width is 0.008deg of rotation, well below anything
      // visible, so there is no point burning frames converging past it
      const settled =
        Math.abs(tx - cx) < 0.002 &&
        Math.abs(ty - cy) < 0.002 &&
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
initDemoVideo();
initHero();
initScrollChrome();
initNavMenu();
initReveal();
initAccordion();
initTilt();
initScopeParallax();
