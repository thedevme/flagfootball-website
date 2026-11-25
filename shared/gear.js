/* Gear box for blog posts.
   Put <div id="gear" data-post="the-post-slug"></div> where the box should appear.
   Products live in /blog/gear.json. The box stays hidden until that file has your
   Amazon tracking ID and at least one product for the post, so it is safe to ship empty. */
(() => {
  const mount = document.getElementById("gear");
  if (!mount) return;

  const css = `
.gear{margin:36px 0;padding:26px;border:1px solid var(--line,#2a2d32);border-radius:14px;background:var(--bg2,#15171a)}
.gear .k{font:700 12px Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--orange,#f26a1b)}
.gear h3{font:900 30px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:8px 0 6px}
.gear .sub{margin:0 0 18px;font:400 14px/1.5 Inter,sans-serif;color:var(--muted,#9a9790)}
.gear ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.gear li{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--line,#2a2d32);border-radius:10px;background:var(--bg3,#1c1f23)}
.gear li img{width:100%;aspect-ratio:1/1;object-fit:contain;border-radius:6px;background:#fff}
.gear .name{font:700 15px/1.3 Inter,sans-serif}
.gear .why{font:400 13px/1.45 Inter,sans-serif;color:var(--muted,#9a9790);flex:1}
.gear a.buy{align-self:flex-start;padding:9px 16px;border-radius:999px;background:var(--orange,#f26a1b);color:#fff;font:700 13px Inter,sans-serif}
.gear .note{margin:16px 0 0;font:400 12px/1.5 Inter,sans-serif;color:var(--muted,#9a9790)}`;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // Only ever link to amazon.com, and always carry the tracking ID.
  const linkFor = (item, tag) => {
    let u;
    try {
      u = item.asin
        ? new URL(`https://www.amazon.com/dp/${encodeURIComponent(item.asin)}`)
        : new URL(item.url);
    } catch (_) { return null; }
    if (u.protocol !== "https:" || !/(^|\.)amazon\.com$/.test(u.hostname)) return null;
    u.searchParams.set("tag", tag);
    return u.toString();
  };

  fetch("/blog/gear.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((cfg) => {
      if (!cfg || !cfg.tag) return;
      const post = (cfg.posts || {})[mount.dataset.post] || {};
      const items = (post.items && post.items.length ? post.items : cfg.default || [])
        .map((i) => ({ i, href: linkFor(i, cfg.tag) }))
        .filter((x) => x.href && x.i.name);
      if (!items.length) return;

      const style = el("style"); style.textContent = css; document.head.append(style);
      const box = el("section", "gear reveal");
      box.append(el("div", "k", "Gear we recommend"));
      box.append(el("h3", null, post.heading || "Gear for this rule"));
      if (post.sub) box.append(el("p", "sub", post.sub));
      const list = el("ul");
      items.forEach(({ i, href }) => {
        const li = el("li");
        if (i.img && /^\/?assets\/|^https:\/\/m\.media-amazon\.com\//.test(i.img)) {
          const img = el("img"); img.src = i.img; img.alt = i.name; img.loading = "lazy"; li.append(img);
        }
        li.append(el("div", "name", i.name));
        if (i.why) li.append(el("div", "why", i.why));
        const a = el("a", "buy", "View on Amazon"); a.href = href; a.target = "_blank"; a.rel = "sponsored noopener";
        li.append(a); list.append(li);
      });
      box.append(list);
      box.append(el("p", "note", cfg.disclosure || "As an Amazon Associate I earn from qualifying purchases."));
      mount.replaceWith(box);
    })
    .catch(() => {});
})();
