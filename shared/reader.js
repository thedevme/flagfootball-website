// Blog post / Magazine switch for Field Notes posts. Posts open as a plain blog post;
// the switch flips to the magazine layout, and the choice carries to other posts for this visit.
// Load in <head> so the view applies before the page paints.
(function () {
  const KEY = "fn-view", root = document.documentElement;
  let view = "read";
  try { view = sessionStorage.getItem(KEY) || view; } catch (e) {}
  if (/[?&]magazine\b/.test(location.search)) view = "magazine";
  root.classList.toggle("read", view === "read");

  const icons = {
    magazine: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 7.5h13M8 7.5v6"/></svg>',
    read: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4h10M3 7h10M3 10h10M3 13h6"/></svg>',
  };

  function set(v) {
    // keep the reader on the same section when the layout changes under them
    const anchor = [...document.querySelectorAll(".sec, .ymc, .bookbox")].find((el) => el.getBoundingClientRect().bottom > 80);
    const offset = anchor && anchor.getBoundingClientRect().top;
    view = v;
    root.classList.toggle("read", v === "read");
    try { sessionStorage.setItem(KEY, v); } catch (e) {}
    if (anchor && scrollY > 200) scrollTo({ top: anchor.getBoundingClientRect().top + scrollY - offset, behavior: "instant" });
    document.querySelectorAll(".rmode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
  }

  addEventListener("DOMContentLoaded", () => {
    const byline = document.querySelector(".byline");
    if (!byline) return;
    const sw = document.createElement("div");
    sw.className = "rmode";
    sw.setAttribute("role", "group");
    sw.setAttribute("aria-label", "How to show this post");
    sw.innerHTML = ["read", "magazine"].map((v) =>
      `<button type="button" data-v="${v}" aria-pressed="${v === view}">${icons[v]}${v === "read" ? "Blog post" : "Magazine"}</button>`).join("");
    sw.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && b.dataset.v !== view) set(b.dataset.v); });
    byline.after(sw);
  });
})();
