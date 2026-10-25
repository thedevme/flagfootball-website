// Preview password screen (hash only, no plain password).
(function(){var st=document.createElement('style');st.textContent='html.locked body > *:not(#gate) { display:none !important; }\n#gate { position:fixed; inset:0; z-index:99999; display:grid; place-items:center; background:#0d0e10; color:#f4f1ec; font:500 16px Inter, system-ui, sans-serif; padding:24px; }\n#gate form { width:100%; max-width:380px; text-align:center; }\n#gate h1 { font:900 40px/.95 "Barlow Condensed", Impact, sans-serif; text-transform:uppercase; margin:0 0 6px; }\n#gate h1 b { color:#f26a1b; }\n#gate p { color:#9a9790; margin:0 0 22px; }\n#gate input { width:100%; padding:15px 18px; border-radius:999px; border:1px solid #2a2d32; background:#15171a; color:#f4f1ec; font:inherit; text-align:center; }\n#gate button { margin-top:12px; width:100%; padding:15px; border:0; border-radius:999px; background:#f26a1b; color:#fff; font:700 15px Inter, sans-serif; cursor:pointer; }\n#gate .err { color:#f26a1b; min-height:22px; margin-top:10px; font-size:14px; }';document.head.appendChild(st);})();

(function () {
  var H = "5cb047329e20192735d134784eaa28edf0f47ebd17befc13f0b0781756d0bd59";
  try { if (sessionStorage.getItem("gffi-ok") === H) return; } catch (e) {}
  document.documentElement.classList.add("locked");
  document.addEventListener("DOMContentLoaded", function () {
    var g = document.createElement("div"); g.id = "gate";
    g.innerHTML = '<form><h1>Girls Flag Football, <b>Illustrated</b></h1><p>Preview site. Enter the password to continue.</p><input type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" autofocus><button type="submit">View the page</button><div class="err" aria-live="polite"></div></form>';
    document.body.prepend(g);
    g.querySelector("form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var v = g.querySelector("input").value;
      var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
      var hex = Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      if (hex === H) { try { sessionStorage.setItem("gffi-ok", H); } catch (e) {} g.remove(); document.documentElement.classList.remove("locked"); window.dispatchEvent(new Event("resize")); }
      else g.querySelector(".err").textContent = "That password isn't right.";
    });
  });
})();
