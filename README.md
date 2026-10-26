# Girls Flag Football, Illustrated: website

Static site for the book *Girls Flag Football, Illustrated* (2026–27 NFHS rules). Plain HTML, CSS and JS with no build step.

- `index.html`: the Book page (homepage)
- `watch/`: the YouTube page
- `blog/`: Field Notes, the blog
- `shared/`: shared styles and scripts
- `assets/`: images and chapter data

Run it locally:

```bash
python3 -m http.server 8766 --directory website
```

## Posts and drafts

Post cards on the Book page and Field Notes come from two files:

- `blog/posts.json`: published posts. This one gets pushed.
- `blog/posts.local.json`: drafts. Ignored by git, so it never leaves this computer.

A draft's folder (for example `blog/is-punting-legal-in-girls-flag-football/`) is also listed in `.gitignore`.
Links inside other pages that point at a post carry `data-post="its-slug"` and disappear when that post isn't in either file.

To publish a draft: move its entry from `posts.local.json` to `posts.json`, delete its folder line in `.gitignore`, and add it to `sitemap.xml`.

## Light and dark

Dark is the default. The switch in the nav (`shared/site.js`) sets `html[data-theme="light"]`, and `shared/theme.css` holds the cream colors.
