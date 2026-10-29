# Everything FTC handbook — notes for Claude

Static site (plain HTML/CSS/JS, no build step) that replaced the team's multi-tab
"FTC Everything Doc". Public repo **https://github.com/ElMagoCT/ftc-handbook**
(`main`), live on GitHub Pages at **https://elmagoct.github.io/ftc-handbook/**
(pushes to `main` publish). The user approved making it public on 2026-09-13.

- Pages in the repo root are the source of truth. Shared header/footer live in
  `tools/page-template.html`; run `python3 tools/reshell.py` after editing it.
- `assets/js/glossary.js` = clickable terms (auto-tagged, first occurrence per
  section; all-caps terms must match case). `assets/js/sims.js` = interactive SVG
  diagrams. `assets/js/app.js` = nav, outline, popover, search, settings.
- Preview: `python3 -m http.server 8790` (search and the Missions page fetch other
  pages, so `file://` will not work).
- Facts were checked against the 2026–27 Competition Manual V1 in Sept 2026. Each
  kickoff: update `season.html`, `history.html`, and re-check the rules sections in
  `design.html`, `electronics.html`, `judging.html`.
- Style: no paragraphs (cards, bullets, tables, `<details class="more">`), Micah's
  voice but professional, real numbers, cite rule numbers with season.
