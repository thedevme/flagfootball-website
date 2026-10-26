// Shared on every page. Load in <head> so the saved theme applies before the page paints.
//  1. Light/dark switch: dark is the default, the choice is remembered on this browser.
//  2. Posts: blog/posts.json lists published posts and gets pushed. blog/posts.local.json lists drafts and
//     stays on this computer (.gitignore), as do the draft post folders. postsReady loads whichever exist.
//     A posts.local.json entry replaces the posts.json entry with the same slug. "soon": true shows a
//     "Coming soon" card with no link. Anything marked data-post="slug" is removed unless that post is
//     listed and not "soon". postIsLive(posts, slug) answers the same question for page scripts.
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

  addEventListener("DOMContentLoaded", () => {
    window.postsReady.then(hideMissing);
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
