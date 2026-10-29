// Shared on every page. Load in <head> so the saved theme applies before the page paints.
//  1. Light/dark switch: dark is the default, the choice is remembered on this browser.
//  2. Posts: blog/posts.json lists published posts and gets pushed. blog/posts.local.json lists drafts and
//     stays on this computer (.gitignore), as do the draft post folders. postsReady loads whichever exist.
//     A posts.local.json entry replaces the posts.json entry with the same slug. "soon": true shows a
//     "Coming soon" card with no link. Anything marked data-post="slug" is removed unless that post is
//     listed and not "soon". postIsLive(posts, slug) answers the same question for page scripts.
//  3. Email signup (Kit): a strip above the footer on every page, and a card at the end of each post.
//     Nothing shows until KIT_FORM holds the Kit form id (the number in the form's embed code).
(function () {
  const KEY = "site-theme", root = document.documentElement;
  let theme = "dark";
  try { theme = localStorage.getItem(KEY) || theme; } catch (e) {}
  root.dataset.theme = theme;

  const root_ = new URL("../", document.currentScript.src);
  const get = (f) => fetch(new URL("blog/" + f, root_)).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  window.postsReady = Promise.all([get("posts.json"), get("posts.local.json")])
    .then(([pub, drafts]) => [...pub.filter((p) => !drafts.some((d) => d.slug === p.slug)), ...drafts.map((p) => ({ ...p, draft: true }))]
      .sort((a, b) => b.n.localeCompare(a.n)));
  window.postIsLive = (posts, slug) => posts.some((p) => p.slug === slug && !p.soon);
  // alt text for the illustrations, used by cards that pages build in script
  const ALT = {
    "girl-carrier": "A girls flag football player carrying the ball and cutting upfield, her orange flags flying",
    "girl-defender": "A girls flag football defender in a ready stance, seen from behind",
    "girl-kicker": "A girls flag football player punting the ball",
    "girl-passer": "A girls flag football quarterback holding the ball, ready to pass",
    "girl-quarterback": "A girls flag football quarterback with the ball, looking downfield",
    "girl-runner": "A girls flag football player running without the ball, one arm out",
    "girl-scorer": "A smiling girls flag football player running with the ball",
    "player-legal": "Player wearing all required equipment",
  };
  window.altFor = (file) => {
    const name = file.replace(/^.*\//, "").replace(/\.\w+$/, "");
    const sig = name.match(/^sig-(\d+)$/);
    return ALT[name] || (sig ? `Referee signal ${+sig[1]}` : "");
  };
  const hideMissing = (posts) => document.querySelectorAll("[data-post]").forEach((el) => { if (!window.postIsLive(posts, el.dataset.post)) el.remove(); });

  const icon = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
    + '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  const KIT_FORM = "10114185";
  const SIGNUP = {
    k: "Field Notes by email",
    h: "New rule cards and videos, in your inbox.",
    p: "One short email when something new is out. No spam, unsubscribe any time.",
  };
  const signupCSS = `
.su { border: 1px solid var(--line); border-radius: 22px; padding: 26px 28px; background: linear-gradient(150deg, var(--bg2), var(--bg3)); display:grid; grid-template-columns: 1fr minmax(0, 420px); gap: 18px 30px; align-items: center; font-family: Inter, system-ui, sans-serif; }
.su .k { font: 700 12px Inter; letter-spacing: .18em; text-transform: uppercase; color: var(--orange); }
.su h3 { font: 900 clamp(26px, 3vw, 34px)/.95 "Barlow Condensed"; text-transform: uppercase; margin: 8px 0 6px; color: var(--txt); }
.su p { color: var(--muted); font-size: 14px; margin: 0; line-height: 1.5; }
.su form { display:flex; gap: 10px; }
.su input { flex: 1; min-width: 0; padding: 14px 18px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg); color: var(--txt); font: 400 15px Inter; }
.su input:focus { outline: 2px solid var(--orange); outline-offset: 1px; }
.su button { padding: 14px 22px; border: 0; border-radius: 999px; background: var(--orange); color: #fff; font: 700 15px Inter; cursor: pointer; white-space: nowrap; }
.su button:disabled { opacity: .6; cursor: default; }
.su .msg { grid-column: 2; font-size: 14px; color: var(--muted); margin: -6px 0 0 18px; min-height: 1em; }
.su-strip { max-width: 1240px; margin: 0 auto; padding: 60px 24px; box-sizing: border-box; }
.su-post { margin: 40px 0 28px; }
.su-post .su { grid-template-columns: 1fr; }
.su-post .su .msg { grid-column: 1; }
@media (max-width: 720px) {
  .su { grid-template-columns: 1fr; padding: 22px; }
  .su .msg { grid-column: 1; }
  .su form { flex-direction: column; }
}`;
  const signup = (cls) => {
    const box = document.createElement("div");
    box.className = cls;
    box.innerHTML = `<div class="su"><div><div class="k">${SIGNUP.k}</div><h3>${SIGNUP.h}</h3><p>${SIGNUP.p}</p></div>
      <form action="https://app.kit.com/forms/${KIT_FORM}/subscriptions" method="post" target="_blank">
        <input type="email" name="email_address" required placeholder="Your email" aria-label="Your email" autocomplete="email">
        <button type="submit">Subscribe</button></form><div class="msg" aria-live="polite"></div></div>`;
    const form = box.querySelector("form"), msg = box.querySelector(".msg"), btn = box.querySelector("button");
    // send it in the background; if that fails, the form posts to Kit in a new tab instead
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      btn.disabled = true;
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then((r) => r.json())
        .then((d) => {
          if (d.status !== "success") throw new Error();
          form.remove();
          msg.textContent = "Almost done. Check your inbox to confirm.";
        })
        .catch(() => form.submit());
    });
    return box;
  };
  const addSignup = () => {
    if (!KIT_FORM) return;
    const style = document.createElement("style");
    style.textContent = signupCSS;
    document.head.append(style);
    const post = document.querySelector("#art .bookbox");
    if (post) post.after(signup("su-post"));
    const foot = document.querySelector("body > footer");
    if (foot) foot.before(signup("su-strip"));
  };

  addEventListener("DOMContentLoaded", () => {
    window.postsReady.then(hideMissing);
    addSignup();
    const cta = document.querySelector("nav .wrap > .btn.sm");
    if (!cta) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tbtn";
    b.innerHTML = icon;
    const label = () => b.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    label();
    b.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      root.dataset.theme = theme;
      try { localStorage.setItem(KEY, theme); } catch (e) {}
      label();
    });
    const end = document.createElement("div");
    end.className = "nav-end";
    cta.replaceWith(end);
    end.append(b, cta);
  });
})();
