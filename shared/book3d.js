// Drag / swipe / buttons to rotate the 3D book. Gentle idle sway until the visitor interacts.
document.querySelectorAll("[data-book]").forEach((wrap) => {
  const book = wrap.querySelector(".book");
  const ctrl = document.querySelector(`[data-book-ctrl="${wrap.id}"]`);
  let angle = -22, tilt = 4, dragging = false, startX = 0, startA = 0, touched = false;
  const set = (a, t = tilt) => { angle = a; book.style.transform = `rotateX(${t}deg) rotateY(${a}deg)`; sync(); };
  const sync = () => {
    if (!ctrl) return;
    const n = ((angle % 360) + 360) % 360, showingBack = n > 90 && n < 270;
    ctrl.querySelector('[data-side="front"]').setAttribute("aria-pressed", !showingBack);
    ctrl.querySelector('[data-side="back"]').setAttribute("aria-pressed", showingBack);
  };
  set(angle);
  wrap.addEventListener("pointerdown", (e) => { dragging = true; touched = true; startX = e.clientX; startA = angle; wrap.classList.add("dragging"); wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener("pointermove", (e) => { if (dragging) set(startA + (e.clientX - startX) * 0.6); });
  const end = () => { if (!dragging) return; dragging = false; wrap.classList.remove("dragging");
    const snaps = [-22, 180 - 22]; const n = Math.round((angle - (-22)) / 180) * 180 + (-22); set(n); };
  wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end);
  wrap.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") set(angle - 180); if (e.key === "ArrowRight") set(angle + 180); });
  if (ctrl) {
    ctrl.querySelector('[data-side="front"]').onclick = () => { touched = true; set(Math.round((angle + 22) / 360) * 360 - 22); };
    ctrl.querySelector('[data-side="back"]').onclick = () => { touched = true; set(Math.round((angle + 22 - 180) / 360) * 360 + 180 - 22); };
  }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let t = 0; const sway = () => { if (!touched && !dragging) { t += 0.012; book.style.transition = "none"; book.style.transform = `rotateX(${tilt}deg) rotateY(${angle + Math.sin(t) * 10}deg)`; } else book.style.transition = ""; requestAnimationFrame(sway); };
    requestAnimationFrame(sway);
  }
});
// reveal-on-scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
if (location.search.includes("static")) document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
