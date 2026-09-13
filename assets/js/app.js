/* =========================================================
   FTC Handbook — site behavior
   - settings (theme / accent / font / density / background)
   - table of contents + scrollspy
   - glossary auto-tagging + definition popover
   - site search (client-side, fetches the other pages once)
   - dropdown helpers, copy buttons, filter bars, mobile nav
   No dependencies. Works on any static host.
   ========================================================= */
(function () {
  "use strict";

  const PAGES = window.SITE_PAGES || [
    { file: "index.html", title: "Home" },
    { file: "season.html", title: "Season & Strategy" },
    { file: "design.html", title: "Design & Mechanisms" },
    { file: "onshape.html", title: "Onshape" },
    { file: "manufacturing.html", title: "Materials & Manufacturing" },
    { file: "electronics.html", title: "Electronics" },
    { file: "code.html", title: "Code" },
    { file: "judging.html", title: "Judging & Portfolio" },
    { file: "missions.html", title: "Missions" },
    { file: "history.html", title: "Past Games" },
    { file: "resources.html", title: "Resources" },
    { file: "glossary.html", title: "Glossary" }
  ];

  /* ---------- settings ---------- */
  const SETTINGS_KEY = "ftc-handbook-settings";
  const DEFAULTS = { theme: "midnight", accent: "rose", font: "grotesk", density: "comfortable", bg: "grid" };
  const OPTIONS = {
    theme: [
      ["midnight", "Midnight", "#0d0e12"], ["graphite", "Graphite", "#1b1d20"], ["ocean", "Ocean", "#0a1220"],
      ["paper", "Paper", "#f6f4ef"], ["daylight", "Daylight", "#f4f6fa"], ["contrast", "High contrast", "#000"]
    ],
    accent: [
      ["rose", "Rose", "#d59be6"], ["sky", "Sky", "#7cc7ff"], ["mint", "Mint", "#6fe0b6"],
      ["amber", "Amber", "#ffb454"], ["lime", "Lime", "#c6e35a"], ["coral", "Coral", "#ff8f7a"]
    ],
    font: [
      ["grotesk", "Grotesk"], ["inter", "Inter"], ["legible", "Hyperlegible"], ["serif", "Serif body"], ["mono", "Mono"], ["system", "System"]
    ],
    density: [["compact", "Compact"], ["comfortable", "Comfortable"], ["spacious", "Spacious"]],
    bg: [["grid", "Grid"], ["dots", "Dots"], ["blueprint", "Blueprint"], ["glow", "Glow"], ["plain", "Plain"]]
  };
  function loadSettings() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function applySettings(s) {
    const root = document.documentElement;
    for (const k of Object.keys(DEFAULTS)) root.setAttribute("data-" + k, s[k]);
  }
  // A fresh visitor gets a random (curated) look each visit until they save one.
  const LOOKS = [
    { theme: "midnight", accent: "rose", bg: "grid" }, { theme: "midnight", accent: "sky", bg: "dots" }, { theme: "midnight", accent: "mint", bg: "glow" },
    { theme: "graphite", accent: "amber", bg: "blueprint" }, { theme: "graphite", accent: "lime", bg: "plain" }, { theme: "ocean", accent: "mint", bg: "grid" },
    { theme: "ocean", accent: "amber", bg: "glow" }, { theme: "ocean", accent: "coral", bg: "dots" }, { theme: "paper", accent: "rose", bg: "dots" },
    { theme: "paper", accent: "mint", bg: "plain" }, { theme: "daylight", accent: "sky", bg: "grid" }, { theme: "daylight", accent: "coral", bg: "glow" }
  ];
  const hasSaved = (() => { try { return !!localStorage.getItem(SETTINGS_KEY); } catch (e) { return false; } })();
  let settings = loadSettings();
  if (!hasSaved) {
    const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
    settings = Object.assign({}, DEFAULTS, look);
  }
  applySettings(settings);
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* private mode */ }
  }

  function buildSettingsPanel() {
    const fab = el("button", { class: "fab", type: "button", "aria-label": "Display settings", title: "Display settings" });
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    const backdrop = el("div", { class: "panel-backdrop" });
    const panel = el("div", { class: "settings", role: "dialog", "aria-label": "Display settings" });
    const groups = [
      ["theme", "Color profile"], ["accent", "Accent"], ["font", "Font profile"], ["density", "Density"], ["bg", "Background"]
    ];
    panel.innerHTML = '<h3>Display <button type="button" class="close" aria-label="Close" style="border:0;background:none;color:inherit;font-size:20px;cursor:pointer">&times;</button></h3>';
    for (const [key, label] of groups) {
      const g = el("div", { class: "group" });
      g.innerHTML = '<span class="label">' + label + "</span>";
      const opts = el("div", { class: "opts" + (key === "accent" ? " swatches" : "") });
      for (const o of OPTIONS[key]) {
        const b = el("button", { type: "button", "data-key": key, "data-val": o[0], "aria-pressed": String(settings[key] === o[0]), title: o[1] });
        if (o[2]) b.appendChild(el("span", { class: "sw", style: "background:" + o[2] }));
        if (key !== "accent") b.appendChild(document.createTextNode(o[1]));
        b.addEventListener("click", () => {
          settings[key] = o[0]; applySettings(settings); saveSettings();
          opts.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        });
        opts.appendChild(b);
      }
      g.appendChild(opts); panel.appendChild(g);
    }
    const foot = el("div", { class: "foot" });
    foot.innerHTML = "<span>Saved on this device</span>";
    const reset = el("button", { type: "button" }, "Reset");
    reset.addEventListener("click", () => {
      settings = Object.assign({}, DEFAULTS); applySettings(settings); saveSettings();
      panel.querySelectorAll(".opts button").forEach(x => x.setAttribute("aria-pressed", String(settings[x.dataset.key] === x.dataset.val)));
    });
    foot.appendChild(reset); panel.appendChild(foot);
    const toggle = (open) => { panel.classList.toggle("open", open); backdrop.classList.toggle("open", open); };
    fab.addEventListener("click", () => toggle(!panel.classList.contains("open")));
    backdrop.addEventListener("click", () => toggle(false));
    panel.querySelector(".close").addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
    document.body.append(backdrop, panel, fab);
    if (!hasSaved) {
      const tip = el("div", { class: "theme-tip", role: "status" });
      tip.innerHTML = '<button class="close" type="button" aria-label="Dismiss">&times;</button><span class="eyebrow">New look every visit</span><p>You got a random color profile this time. Pick your own and it sticks on this device.</p><div class="row"></div>';
      const row = tip.querySelector(".row");
      const cust = el("button", { class: "btn primary", type: "button" }, "Customize");
      const keep = el("button", { class: "btn", type: "button" }, "Keep this one");
      const shuffle = el("button", { class: "btn", type: "button" }, "Shuffle");
      cust.addEventListener("click", () => { tip.remove(); toggle(true); });
      keep.addEventListener("click", () => { saveSettings(); tip.remove(); });
      shuffle.addEventListener("click", () => { const look = LOOKS[Math.floor(Math.random() * LOOKS.length)]; settings = Object.assign({}, DEFAULTS, look); applySettings(settings); panel.querySelectorAll(".opts button").forEach(x => x.setAttribute("aria-pressed", String(settings[x.dataset.key] === x.dataset.val))); });
      tip.querySelector(".close").addEventListener("click", () => tip.remove());
      row.append(cust, shuffle, keep);
      document.body.appendChild(tip);
      // any change made in the panel counts as customizing: save + remove the tip
      panel.addEventListener("click", (e) => { if (e.target.closest(".opts button")) tip.remove(); });
    }
  }

  /* ---------- helpers ---------- */
  function el(tag, attrs, text) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function slug(s) { return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60); }
  function currentFile() { const p = location.pathname.split("/").pop(); return p === "" ? "index.html" : p; }

  /* ---------- header nav ---------- */
  function buildNav() {
    const nav = document.querySelector(".main-nav");
    if (!nav) return;
    if (!nav.children.length) {
      for (const p of PAGES) {
        if (p.file === "glossary.html") continue;
        const a = el("a", { href: p.file }, p.title);
        nav.appendChild(a);
      }
    }
    const cur = currentFile();
    nav.querySelectorAll("a").forEach(a => { if (a.getAttribute("href") === cur) a.setAttribute("aria-current", "page"); });
    const btn = document.querySelector(".menu-btn");
    if (btn) btn.addEventListener("click", () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
  }

  /* ---------- overflow hints (nav arrow, wide tables) ---------- */
  function overflowHints() {
    const nav = document.querySelector(".main-nav");
    if (nav && nav.parentElement.classList.contains("main-nav-wrap")) {
      const wrap = nav.parentElement;
      const check = () => wrap.classList.toggle("can-scroll", nav.scrollWidth - nav.clientWidth - nav.scrollLeft > 8);
      nav.addEventListener("scroll", check, { passive: true }); window.addEventListener("resize", check); check();
      wrap.addEventListener("click", (e) => { if (e.target === wrap) nav.scrollBy({ left: 200, behavior: "smooth" }); });
    }
    document.querySelectorAll(".tbl").forEach(t => {
      const check = () => t.classList.toggle("can-scroll", t.scrollWidth - t.clientWidth - t.scrollLeft > 8);
      t.addEventListener("scroll", check, { passive: true }); window.addEventListener("resize", check); check();
    });
  }

  /* ---------- headings: ids + TOC + scrollspy ---------- */
  function buildToc() {
    const content = document.querySelector(".content");
    const side = document.querySelector(".sidebar");
    if (!content) return;
    const heads = [...content.querySelectorAll("h2, h3")].filter(h => !h.closest("details.more") && !h.closest(".card") && !h.closest(".mission") && !h.hasAttribute("data-no-toc"));
    const used = new Set();
    for (const h of content.querySelectorAll("h2, h3, h4")) {
      if (!h.id) {
        let id = slug(h.textContent); let i = 2;
        while (used.has(id) || document.getElementById(id)) id = slug(h.textContent) + "-" + i++;
        h.id = id;
      }
      used.add(h.id);
    }
    if (!side) return;
    const wrap = el("details", { class: "tocwrap", open: "" });
    wrap.innerHTML = "<summary>On this page</summary>";
    const body = el("div", { class: "toc-body" });
    const title = el("div", { class: "label toc-title" }, "On this page");
    const list = el("ul", { class: "toc" });
    for (const h of heads) {
      const li = el("li", { class: h.tagName === "H3" ? "lvl3" : "lvl2" });
      const a = el("a", { href: "#" + h.id }, h.textContent.replace(/^\d+(\.\d+)*\s*/, ""));
      li.appendChild(a); list.appendChild(li);
    }
    const tools = el("div", { class: "toc-tools" });
    const ex = el("button", { type: "button" }, "Expand all");
    const co = el("button", { type: "button" }, "Collapse all");
    ex.addEventListener("click", () => content.querySelectorAll("details.more").forEach(d => d.open = true));
    co.addEventListener("click", () => content.querySelectorAll("details.more").forEach(d => d.open = false));
    tools.append(ex, co);
    body.append(title, list, tools); wrap.appendChild(body); side.appendChild(wrap);
    const mq = window.matchMedia("(max-width: 980px)");
    const syncOpen = () => { wrap.open = !mq.matches; };
    syncOpen(); mq.addEventListener("change", syncOpen);

    // scrollspy
    const links = new Map([...list.querySelectorAll("a")].map(a => [a.getAttribute("href").slice(1), a]));
    let active = null;
    const setActive = (id) => {
      if (active === id) return; active = id;
      links.forEach((a, k) => a.classList.toggle("active", k === id));
      const a = links.get(id); if (a && side.scrollHeight > side.clientHeight) { const r = a.getBoundingClientRect(), s = side.getBoundingClientRect(); if (r.top < s.top || r.bottom > s.bottom) a.scrollIntoView({ block: "nearest" }); }
    };
    const onScroll = () => {
      let best = null; const line = 110;
      for (const h of heads) { if (h.getBoundingClientRect().top <= line) best = h; else break; }
      if (best) setActive(best.id); else if (heads[0]) setActive(heads[0].id);
    };
    document.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------- open <details> that contain the hash target ---------- */
  function openHashTarget() {
    if (!location.hash) return;
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    let p = t.parentElement;
    while (p) { if (p.tagName === "DETAILS") p.open = true; p = p.parentElement; }
    if (t.tagName === "DETAILS") t.open = true;
    setTimeout(() => t.scrollIntoView({ block: "start" }), 30);
  }

  /* ---------- copy buttons on <pre> ---------- */
  function copyButtons() {
    document.querySelectorAll("pre").forEach(pre => {
      const b = el("button", { class: "copy-btn", type: "button" }, "Copy");
      b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(pre.querySelector("code")?.innerText || pre.innerText); b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1200); }
        catch (e) { b.textContent = "Select + copy"; }
      });
      pre.appendChild(b);
    });
  }

  /* ---------- filter bars: [data-filterbar] with button.chip[data-filter] + input[type=search]; targets [data-tags] ---------- */
  function filterBars() {
    document.querySelectorAll("[data-filterbar]").forEach(bar => {
      const targetSel = bar.getAttribute("data-filterbar");
      const items = [...document.querySelectorAll(targetSel)];
      const chips = [...bar.querySelectorAll("button.chip")];
      const input = bar.querySelector("input[type=search]");
      let tag = "all";
      const apply = () => {
        const q = (input?.value || "").trim().toLowerCase();
        for (const it of items) {
          const tags = (it.getAttribute("data-tags") || "").toLowerCase();
          const okTag = tag === "all" || tags.split(/\s+/).includes(tag);
          const okQ = !q || it.textContent.toLowerCase().includes(q);
          it.setAttribute("data-hidden", String(!(okTag && okQ)));
        }
        const count = bar.querySelector("[data-count]");
        if (count) count.textContent = items.filter(i => i.getAttribute("data-hidden") !== "true").length + " / " + items.length;
      };
      chips.forEach(c => c.addEventListener("click", () => { tag = c.getAttribute("data-filter"); chips.forEach(x => x.setAttribute("aria-pressed", String(x === c))); apply(); }));
      input?.addEventListener("input", apply);
      apply();
    });
  }

  /* ---------- glossary ---------- */
  const GLOSS = window.GLOSSARY || {};
  const glossKeys = Object.keys(GLOSS);
  // alias map: lowercased alias -> key
  const aliasMap = new Map();
  for (const k of glossKeys) {
    const g = GLOSS[k];
    const names = [g.term, ...(g.aliases || [])];
    for (const n of names) aliasMap.set(n.toLowerCase(), k);
  }
  const aliasList = [...aliasMap.keys()].sort((a, b) => b.length - a.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // real check: which original-case names are ALL CAPS
  const capsNames = new Set();
  for (const k of glossKeys) for (const n of [GLOSS[k].term, ...(GLOSS[k].aliases || [])]) if (n.length >= 2 && n === n.toUpperCase() && /[A-Z]/.test(n)) capsNames.add(n);
  const caseOk = (found) => { const upper = found.toUpperCase(); if (!capsNames.has(upper)) return true; return found === upper; };
  const termRe = aliasList.length ? new RegExp("(?<![\\w-])(" + aliasList.map(esc).join("|") + ")(?![\\w-])", "gi") : null;

  function autoTagTerms() {
    if (!termRe) return;
    const root = document.querySelector(".content") || document.querySelector("main");
    if (!root || root.hasAttribute("data-no-terms")) return;
    const SKIP = new Set(["A", "CODE", "PRE", "KBD", "DFN", "H1", "H2", "H3", "H4", "BUTTON", "SCRIPT", "STYLE", "SVG", "INPUT", "SELECT", "TEXTAREA", "LABEL", "SUMMARY", "TH"]);
    // tag first occurrence of each term per section (h2 section or details block)
    const sections = [...root.querySelectorAll(":scope > section")];
    if (!sections.length) sections.push(root);
    for (const sec of sections) {
      if (sec.hasAttribute("data-no-terms") || sec.classList.contains("no-terms")) continue;
      const seen = new Set();
      const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          let p = n.parentElement;
          while (p && p !== sec) { if (SKIP.has(p.tagName.toUpperCase()) || p.namespaceURI === "http://www.w3.org/2000/svg" || p.classList.contains("no-terms") || p.hasAttribute("data-no-terms")) return NodeFilter.FILTER_REJECT; p = p.parentElement; }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
      for (const node of nodes) {
        const text = node.nodeValue; termRe.lastIndex = 0;
        let m, last = 0, frag = null;
        while ((m = termRe.exec(text))) {
          const key = aliasMap.get(m[1].toLowerCase());
          if (!key || seen.has(key)) continue;
          // all-caps names (FIRST, PID, COTS) must match case exactly, so "the first week" is left alone
          if (!caseOk(m[1])) continue;
          // skip if the term is the glossary entry's own heading context
          seen.add(key);
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const d = el("dfn", { class: "term", "data-term": key, tabindex: "0", role: "button", "aria-label": "Definition: " + GLOSS[key].term }, m[1]);
          frag.appendChild(d); last = m.index + m[1].length;
        }
        if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
      }
    }
    // explicit <dfn data-term> written by authors
    root.querySelectorAll("dfn[data-term]:not(.term)").forEach(d => { d.classList.add("term"); d.tabIndex = 0; d.setAttribute("role", "button"); });
  }

  function buildPopover() {
    const pop = el("div", { class: "popover", role: "dialog", "aria-label": "Definition" });
    pop.innerHTML = '<button class="close" type="button" aria-label="Close">&times;</button><span class="eyebrow">Definition</span><h4></h4><p></p><div class="also"></div>';
    document.body.appendChild(pop);
    let anchor = null;
    const show = (d) => {
      const key = d.getAttribute("data-term"); const g = GLOSS[key]; if (!g) return;
      anchor = d;
      pop.querySelector("h4").textContent = g.term;
      pop.querySelector("p").textContent = g.def;
      const also = pop.querySelector(".also"); also.innerHTML = "";
      if (g.see && g.see.length) {
        also.appendChild(document.createTextNode("See also: "));
        g.see.forEach(k => { if (GLOSS[k]) { const a = el("a", { href: "glossary.html#" + k }, GLOSS[k].term); also.appendChild(a); } });
      }
      if (g.link) { const a = el("a", { href: g.link }, "More →"); also.appendChild(a); }
      pop.classList.add("open");
      position(d);
    };
    const position = (d) => {
      const r = d.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = Math.min(Math.max(12, r.left), window.innerWidth - pw - 12);
      let top = r.bottom + 10;
      if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 10);
      pop.style.left = left + "px"; pop.style.top = top + "px";
    };
    const hide = () => { pop.classList.remove("open"); if (anchor) anchor.focus({ preventScroll: true }); anchor = null; };
    document.addEventListener("click", (e) => {
      const d = e.target.closest("dfn.term, .term[data-term]");
      if (d) { e.preventDefault(); if (anchor === d && pop.classList.contains("open")) hide(); else show(d); return; }
      if (!e.target.closest(".popover")) pop.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      const d = e.target.closest && e.target.closest("dfn.term");
      if (d && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(d); }
      if (e.key === "Escape" && pop.classList.contains("open")) hide();
    });
    pop.querySelector(".close").addEventListener("click", hide);
    window.addEventListener("resize", () => { if (anchor && pop.classList.contains("open")) position(anchor); });
    document.addEventListener("scroll", () => { if (anchor && pop.classList.contains("open")) position(anchor); }, { passive: true });
  }

  /* ---------- search ---------- */
  let searchIndex = null;
  async function buildSearchIndex() {
    if (searchIndex) return searchIndex;
    try { const c = sessionStorage.getItem("ftc-search-index"); if (c) { searchIndex = JSON.parse(c); return searchIndex; } } catch (e) {}
    const idx = [];
    const parser = new DOMParser();
    await Promise.all(PAGES.map(async p => {
      try {
        const html = p.file === currentFile() ? document.documentElement.outerHTML : await (await fetch(p.file)).text();
        const doc = parser.parseFromString(html, "text/html");
        const content = doc.querySelector(".content") || doc.querySelector("main") || doc.body;
        // assign ids the same way buildToc does so links line up
        const used = new Set();
        content.querySelectorAll("h2, h3, h4").forEach(h => {
          if (!h.id) { let id = slug(h.textContent); let i = 2; while (used.has(id)) id = slug(h.textContent) + "-" + i++; h.id = id; }
          used.add(h.id);
        });
        const heads = [...content.querySelectorAll("h2, h3, h4")];
        heads.forEach((h, i) => {
          const parts = []; let n = h.nextElementSibling;
          while (n && !/^H[234]$/.test(n.tagName) && parts.join(" ").length < 600) { parts.push(n.textContent.replace(/\s+/g, " ").trim()); n = n.nextElementSibling; }
          idx.push({ page: p.title, file: p.file, id: h.id, title: h.textContent.replace(/\s+/g, " ").trim(), text: parts.join(" ").slice(0, 600) });
        });
        // cards, missions, details summaries
        content.querySelectorAll(".card h3, .card h4, .mission h3, .mission h4, details.more > summary").forEach(x => {
          const box = x.closest(".card, .mission, details"); if (!box) return;
          if (!box.id) { const h = x.closest("section")?.querySelector("h2"); box.id = (h ? (h.id + "-") : "") + slug(x.textContent); }
          idx.push({ page: p.title, file: p.file, id: box.id, title: x.textContent.replace(/\s+/g, " ").trim(), text: box.textContent.replace(/\s+/g, " ").trim().slice(0, 500) });
        });
      } catch (e) { /* offline or file:// — skip page */ }
    }));
    for (const k of glossKeys) idx.push({ page: "Glossary", file: "glossary.html", id: k, title: GLOSS[k].term, text: GLOSS[k].def });
    // de-duplicate entries that point at the same place (a card title indexed as both heading and card)
    const seenKeys = new Set();
    searchIndex = idx.filter(it => { const key = it.file + "#" + it.id; if (seenKeys.has(key)) return false; seenKeys.add(key); return true; });
    try { sessionStorage.setItem("ftc-search-index", JSON.stringify(idx)); } catch (e) {}
    return idx;
  }
  function score(item, q) {
    const t = item.title.toLowerCase(), b = item.text.toLowerCase();
    let s = 0;
    for (const w of q) {
      if (!w) continue;
      if (t === w) s += 50; else if (t.startsWith(w)) s += 25; else if (t.includes(w)) s += 14;
      if (b.includes(w)) s += 4;
      if (!t.includes(w) && !b.includes(w)) return 0;
    }
    if (item.page === "Glossary") s += 3;
    return s;
  }
  function buildSearch() {
    const wrap = el("div", { class: "search-wrap", role: "dialog", "aria-label": "Search" });
    wrap.innerHTML = '<div class="search-box"><input type="search" placeholder="Search the handbook…" aria-label="Search" autocomplete="off"><div class="search-results"><div class="empty">Type to search every page and the glossary.</div></div><div class="search-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div></div>';
    document.body.appendChild(wrap);
    const input = wrap.querySelector("input"), results = wrap.querySelector(".search-results");
    let sel = 0, current = [];
    const open = () => { wrap.classList.add("open"); input.value = ""; render([]); input.focus(); buildSearchIndex().then(() => { if (input.value) run(); }); };
    const close = () => wrap.classList.remove("open");
    const render = (items) => {
      current = items; sel = 0; results.innerHTML = "";
      if (!items.length) { results.innerHTML = '<div class="empty">' + (input.value ? "No matches. Try a shorter word." : "Type to search every page and the glossary.") + "</div>"; return; }
      items.forEach((it, i) => {
        const a = el("a", { href: it.file + "#" + it.id, class: i === 0 ? "sel" : "" });
        a.innerHTML = '<span class="where">' + it.page + "</span>" + escapeHtml(it.title) + '<span class="snip">' + escapeHtml(it.text.slice(0, 140)) + "</span>";
        a.addEventListener("click", close);
        results.appendChild(a);
      });
    };
    const run = async () => {
      const idx = await buildSearchIndex();
      const q = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!q.length) { render([]); return; }
      const scored = idx.map(it => ({ it, s: score(it, q) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 14).map(x => x.it);
      render(scored);
    };
    input.addEventListener("input", run);
    input.addEventListener("keydown", (e) => {
      const links = results.querySelectorAll("a");
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(links.length - 1, sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); }
      else if (e.key === "Enter") { e.preventDefault(); if (links[sel]) { location.href = links[sel].href; close(); } return; }
      else return;
      links.forEach((l, i) => l.classList.toggle("sel", i === sel)); links[sel]?.scrollIntoView({ block: "nearest" });
    });
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
    document.querySelectorAll("[data-open-search]").forEach(b => b.addEventListener("click", open));
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* ---------- section numbers ---------- */
  function numberSections() {
    const secs = document.querySelectorAll(".content > section > h2");
    secs.forEach((h, i) => { if (!h.querySelector(".num") && !h.hasAttribute("data-no-num")) { const n = el("span", { class: "num" }, String(i + 1).padStart(2, "0")); h.prepend(n); } });
  }

  /* ---------- footer year ---------- */
  function footerYear() { document.querySelectorAll("[data-year]").forEach(x => x.textContent = new Date().getFullYear()); }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    buildNav();
    buildToc();
    numberSections();
    autoTagTerms();
    buildPopover();
    buildSearch();
    buildSettingsPanel();
    copyButtons();
    filterBars();
    overflowHints();
    footerYear();
    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
    if (window.SIMS && typeof window.SIMS.init === "function") window.SIMS.init();
  });
})();
