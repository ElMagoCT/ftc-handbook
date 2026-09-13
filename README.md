# Everything FTC — Broncobots handbook

**Live site: https://elmagoct.github.io/ftc-handbook/**

A static, collaborative handbook for FIRST Tech Challenge teams: season strategy, mechanism design, Onshape, materials and manufacturing, electronics, code, judging, missions, past games, and a clickable glossary.

Rebuilt in September 2026 from the team's "FTC Everything Doc" (a multi-tab Google Doc), brought up to the 2026–27 Competition Manual, and reorganized so it is not tied to any one season's game.

## Pages

| File | What it covers |
|---|---|
| `index.html` | Home: what FTC is, the numbers, how a season runs, house rules |
| `season.html` | Calendar, kickoff game analysis, cycle time, strategy archetypes, scouting, drive team, event day |
| `design.html` | Design principles, mechanism catalog (drivetrains, intakes, claws, arms, slides, launchers, gearing), build tips, frequent problems, robot rules |
| `onshape.html` | Onshape grouped for reference: sketching, creating, modifying, structuring, assemblies, collaboration, sheet metal, drawings, DFM |
| `manufacturing.html` | Build systems, materials, 3D printing and tolerances, sheet metal and water jet, other processes, sourcing |
| `electronics.html` | Control system, motors, servos, sensors, power, wiring rules, ESD |
| `code.html` | SDK setup, OpModes, TeleOp, PID and feedforward, localization, path following, vision, code structure |
| `judging.html` | Current awards, points-based advancement, portfolio rules and layout, Initial Interview, outreach, documentation plan |
| `missions.html` | Every hands-on mission from every page, collected client-side |
| `history.html` | Every FTC game since 2005 and the mechanism patterns that repeat |
| `resources.html` | All links, sorted, plus how to contribute |
| `glossary.html` | Searchable list of every term, rendered from `assets/js/glossary.js` |

## How it works

- Plain HTML/CSS/JS. **No build step.** Edit a page, refresh the browser.
- `assets/css/style.css` — design system. Color profiles, accents, font profiles, density, and backgrounds are `data-*` attributes on `<html>`, set by the settings panel (gear button) and saved in `localStorage`.
- `assets/js/app.js` — navigation, on-page outline with scrollspy, glossary auto-tagging and definition popover, site search (fetches the other pages once), dropdown expand/collapse, copy buttons, filter bars.
- `assets/js/glossary.js` — the glossary. Any key here becomes a clickable term on every page (first occurrence per section). Add a term and it is live everywhere.
- `assets/js/sims.js` — interactive SVG diagrams, mounted with `<figure class="sim" data-sim="name"></figure>`.
- `assets/img/mech/` — mechanism photos carried over from the original doc. Replace with your own robot photos when you can.

Search and the Missions page fetch other pages, so they need a web server rather than `file://`. Locally:

```bash
python3 -m http.server 8790
```

then open http://localhost:8790.

## Contributing

See the [Contributing section on the Resources page](resources.html#contributing) for snippets (card, dropdown, callout, mission, glossary term, diagram) and the style rules. Short version: branch, edit the page, open a pull request, keep it in bullets with real numbers.

## Keeping it current

Rule numbers and season facts were checked against the 2026–27 Competition Manual (V1) and FIRST's season calendar in September 2026. Each kickoff:

1. Update `season.html` (calendar, current game name) and `history.html` (new row).
2. Re-check `design.html#rules`, `electronics.html` (motor/servo counts, approved lists, wire gauges), and `judging.html` (award list, portfolio rules, advancement points) against the new manual and Team Update 00.
3. Bump the "checked" chips in the heroes.

## Hosting

Published with GitHub Pages from the `main` branch root; every push to `main` goes live within a minute or two. `netlify.toml` is also included (`publish = "."`, no build command) in case the site ever moves.

Not affiliated with *FIRST*. When this site and the Competition Manual disagree, the manual wins.
