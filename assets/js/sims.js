/* =========================================================
   FTC Handbook — interactive diagrams & simulations
   Usage in HTML:  <figure class="sim" data-sim="gear-ratio"></figure>
   Each builder renders an SVG "stage", optional controls, and
   readouts inside the figure. Animations pause when off-screen.
   Colors come from CSS variables so every theme works.
   ========================================================= */
(function () {
  "use strict";
  const SIMS = {};
  const NS = "http://www.w3.org/2000/svg";
  const $ = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs || {}) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const H = (tag, attrs, html) => { const n = document.createElement(tag); for (const k in attrs || {}) n.setAttribute(k, attrs[k]); if (html != null) n.innerHTML = html; return n; };
  const fmt = (n, d = 1) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;

  // ----- shared scaffolding -----
  function stage(fig, w, h, caption) {
    const st = H("div", { class: "stage" });
    const svg = $("svg", { viewBox: `0 0 ${w} ${h}`, class: "sim-svg", role: "img" });
    st.appendChild(svg); fig.appendChild(st);
    const controls = H("div", { class: "controls" }); fig.appendChild(controls);
    const readout = H("div", { class: "readout" }); fig.appendChild(readout);
    if (caption) fig.appendChild(H("figcaption", {}, caption));
    return { svg, controls, readout };
  }
  function slider(controls, label, min, max, step, val, onChange, unit = "") {
    const lab = H("label"); const b = H("b", {}, `${label}: ${val}${unit}`);
    const inp = H("input", { type: "range", min, max, step, value: val });
    inp.addEventListener("input", () => { b.textContent = `${label}: ${inp.value}${unit}`; onChange(parseFloat(inp.value)); });
    lab.append(b, inp); controls.appendChild(lab); return inp;
  }
  function select(controls, label, options, val, onChange) {
    const lab = H("label"); lab.appendChild(H("b", {}, label));
    const sel = H("select"); for (const [v, t] of options) { const o = H("option", { value: v }, t); if (String(v) === String(val)) o.selected = true; sel.appendChild(o); }
    sel.addEventListener("change", () => onChange(sel.value)); lab.appendChild(sel); controls.appendChild(lab); return sel;
  }
  function buttons(controls, list, active, onPick) {
    const wrap = H("div", { class: "btns" });
    const bs = list.map(([v, t]) => { const b = H("button", { type: "button", "aria-pressed": String(v === active) }, t); b.addEventListener("click", () => { bs.forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onPick(v); }); wrap.appendChild(b); return b; });
    controls.appendChild(wrap); return bs;
  }
  function readouts(readout, items) {
    readout.innerHTML = ""; const map = {};
    for (const [k, label] of items) { const d = H("div"); d.innerHTML = `<div class="k">${label}</div><div class="v">–</div>`; readout.appendChild(d); map[k] = d.querySelector(".v"); }
    return map;
  }
  // animation loop that pauses when the figure is off-screen
  function animate(fig, fn) {
    let running = false, last = 0, raf = 0;
    const tick = (t) => { if (!running) return; const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t; fn(dt, t / 1000); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); } }), { threshold: 0.05 });
    io.observe(fig);
  }
  function gearPath(cx, cy, teeth, module = 6) {
    // simple stylized involute-ish gear
    const pr = teeth * module / 2, ar = pr + module * 0.9, rr = pr - module * 1.1; let d = "";
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2, step = Math.PI * 2 / teeth;
      const pts = [[rr, a0], [rr, a0 + step * 0.25], [ar, a0 + step * 0.38], [ar, a0 + step * 0.62], [rr, a0 + step * 0.75], [rr, a0 + step]];
      pts.forEach(([r, a], j) => { d += (i === 0 && j === 0 ? "M" : "L") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1) + " "; });
    }
    return d + "Z";
  }
  function arrow(svg, x1, y1, x2, y2, cls, width = 2.5) {
    const g = $("g", { class: cls }, svg);
    $("line", { x1, y1, x2, y2, "stroke-width": width, "stroke-linecap": "round" }, g);
    const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    $("path", { d: `M${x2} ${y2} L${x2 - s * Math.cos(a - 0.5)} ${y2 - s * Math.sin(a - 0.5)} L${x2 - s * Math.cos(a + 0.5)} ${y2 - s * Math.sin(a + 0.5)} Z`, stroke: "none" }, g);
    return g;
  }

  /* ================= 1. Gear ratio ================= */
  SIMS["gear-ratio"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 260, "Drag the sliders. Output torque goes up by the same factor speed goes down (minus friction). The same math applies to sprockets and pulleys.");
    let tIn = 12, tOut = 36, rpmIn = 312, stall = 24.3, angle = 0;
    const gIn = $("path", { class: "fill-surface3 border", "stroke-width": 1.5 }, svg);
    const gOut = $("path", { class: "fill-soft acc", "stroke-width": 1.5 }, svg);
    const dotIn = $("circle", { r: 5, class: "fill-acc" }, svg), dotOut = $("circle", { r: 5, class: "fill-acc" }, svg);
    const labIn = $("text", { x: 0, y: 245, "text-anchor": "middle" }, svg), labOut = $("text", { x: 0, y: 245, "text-anchor": "middle" }, svg);
    const R = readouts(readout, [["ratio", "Ratio"], ["rpm", "Output speed"], ["torque", "Output torque"], ["dir", "Direction"]]);
    const m = 5;
    function layout() {
      const rIn = tIn * m / 2, rOut = tOut * m / 2, cx1 = 280 - (rIn + rOut) / 2 - 2, cx2 = cx1 + rIn + rOut + 2, cy = 125;
      gIn.setAttribute("d", gearPath(0, 0, tIn, m)); gOut.setAttribute("d", gearPath(0, 0, tOut, m));
      gIn.dataset.c = `${cx1},${cy},${rIn}`; gOut.dataset.c = `${cx2},${cy},${rOut}`;
      labIn.setAttribute("x", cx1); labIn.textContent = `input ${tIn}T`; labOut.setAttribute("x", cx2); labOut.textContent = `output ${tOut}T`;
      const ratio = tOut / tIn;
      R.ratio.textContent = fmt(ratio, 2) + " : 1"; R.rpm.textContent = fmt(rpmIn / ratio, 0) + " rpm"; R.torque.textContent = fmt(stall * ratio, 0) + " kg·cm"; R.dir.textContent = "reversed";
    }
    slider(controls, "Input teeth", 8, 40, 1, tIn, v => { tIn = v; layout(); });
    slider(controls, "Output teeth", 8, 80, 1, tOut, v => { tOut = v; layout(); });
    select(controls, "Motor (free rpm / stall kg·cm)", [["1150,7.9", "1150 rpm · 7.9"], ["435,18.7", "435 rpm · 18.7"], ["312,24.3", "312 rpm · 24.3"], ["223,38", "223 rpm · 38"], ["117,68.4", "117 rpm · 68.4"]], "312,24.3", v => { [rpmIn, stall] = v.split(",").map(Number); layout(); });
    layout();
    animate(fig, (dt) => {
      angle += dt * 1.2;
      const [x1, y1, r1] = gIn.dataset.c.split(",").map(Number), [x2, y2, r2] = gOut.dataset.c.split(",").map(Number);
      const a2 = -angle * (tIn / tOut) + Math.PI / tOut; // mesh offset
      gIn.setAttribute("transform", `translate(${x1} ${y1}) rotate(${deg(angle)})`);
      gOut.setAttribute("transform", `translate(${x2} ${y2}) rotate(${deg(a2)})`);
      dotIn.setAttribute("cx", x1 + (r1 - 12) * Math.cos(angle)); dotIn.setAttribute("cy", y1 + (r1 - 12) * Math.sin(angle));
      dotOut.setAttribute("cx", x2 + (r2 - 12) * Math.cos(a2)); dotOut.setAttribute("cy", y2 + (r2 - 12) * Math.sin(a2));
    });
  };

  /* ================= 2. Compound gear train calculator ================= */
  SIMS["gear-train"] = (fig) => {
    const { controls, readout } = stage(fig, 10, 10, "Each stage multiplies. Two 3:1 stages give 9:1. Efficiency is a rough guess: ~95% per gear or belt stage, ~90% per chain stage.");
    fig.querySelector(".stage").remove();
    const stages = [{ i: 1, o: 3, type: "gear" }, { i: 1, o: 1, type: "gear" }, { i: 1, o: 1, type: "gear" }];
    const R = readouts(readout, [["ratio", "Total ratio"], ["eff", "Efficiency"], ["out", "Output rpm @ 312 in"]]);
    const wrap = H("div", { class: "tbl dense" }); const tbl = H("table"); tbl.innerHTML = "<thead><tr><th>Stage</th><th>Input teeth</th><th>Output teeth</th><th>Type</th><th>Stage ratio</th></tr></thead>"; const tb = H("tbody"); tbl.appendChild(tb); wrap.appendChild(tbl); controls.appendChild(wrap);
    const calc = () => {
      let ratio = 1, eff = 1;
      stages.forEach((s, k) => { const r = s.o / s.i; ratio *= r; eff *= s.type === "chain" ? 0.9 : 0.95; tb.rows[k].cells[4].textContent = fmt(r, 2) + " : 1"; });
      R.ratio.textContent = fmt(ratio, 2) + " : 1"; R.eff.textContent = fmt(eff * 100, 0) + " %"; R.out.textContent = fmt(312 / ratio, 0) + " rpm";
    };
    stages.forEach((s, k) => {
      const tr = H("tr"); tr.innerHTML = `<td>${k + 1}</td><td></td><td></td><td></td><td></td>`;
      const i = H("input", { type: "number", min: 1, max: 200, value: s.i }), o = H("input", { type: "number", min: 1, max: 200, value: s.o });
      const t = H("select"); [["gear", "gear"], ["belt", "belt"], ["chain", "chain"]].forEach(([v, l]) => t.appendChild(H("option", { value: v }, l)));
      i.addEventListener("input", () => { s.i = +i.value || 1; calc(); }); o.addEventListener("input", () => { s.o = +o.value || 1; calc(); }); t.addEventListener("change", () => { s.type = t.value; calc(); });
      tr.cells[1].appendChild(i); tr.cells[2].appendChild(o); tr.cells[3].appendChild(t); tb.appendChild(tr);
    });
    calc();
  };

  /* ================= 3. Mecanum drive ================= */
  SIMS["mecanum"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 330, "Each roller sits at 45°, so a wheel pushes diagonally. Add the four diagonal pushes and you get the robot's motion. Pick a move to see which wheels spin which way.");
    const cx = 200, cy = 165, W = 120, L = 150;
    $("rect", { x: cx - W / 2, y: cy - L / 2, width: W, height: L, rx: 10, class: "fill-surface border", "stroke-width": 1.5 }, svg);
    $("path", { d: `M${cx} ${cy - L / 2 + 22} l-10 14 h20 z`, class: "fill-acc" }, svg); // front marker
    $("text", { x: cx, y: cy - L / 2 + 52, "text-anchor": "middle", class: "t-muted" }, svg).textContent = "front";
    const wheels = [[-1, -1, 1], [1, -1, -1], [-1, 1, -1], [1, 1, 1]]; // x sign, y sign, roller angle sign
    const wheelG = wheels.map(([sx, sy, ra]) => {
      const wx = cx + sx * (W / 2 + 14), wy = cy + sy * (L / 2 - 30);
      const g = $("g", {}, svg);
      $("rect", { x: wx - 12, y: wy - 26, width: 24, height: 52, rx: 5, class: "fill-surface3 border" }, g);
      for (let k = -2; k <= 2; k++) $("line", { x1: wx - 9, y1: wy + k * 10 - 5 * ra, x2: wx + 9, y2: wy + k * 10 + 5 * ra, class: "stroke", "stroke-width": 2, opacity: .7 }, g);
      const arr = $("g", { class: "fill-acc acc" }, g); // wheel spin arrow
      const force = $("g", { class: "fill-info info" }, g); // force vector
      return { wx, wy, sx, sy, ra, arr, force, g };
    });
    const netG = $("g", { class: "fill-ok ok" }, svg);
    const R = readouts(readout, [["fl", "Front-left"], ["fr", "Front-right"], ["bl", "Back-left"], ["br", "Back-right"]]);
    const moves = { forward: [1, 1, 1, 1], back: [-1, -1, -1, -1], right: [1, -1, -1, 1], left: [-1, 1, 1, -1], cw: [1, -1, 1, -1], ccw: [-1, 1, -1, 1], diagFR: [1, 0, 0, 1], diagFL: [0, 1, 1, 0] };
    const names = ["fl", "fr", "bl", "br"];
    let cur = "forward", phase = 0;
    // legend
    $("text", { x: 340, y: 60, class: "t-acc" }, svg).textContent = "wheel spin";
    $("text", { x: 340, y: 82 }, svg).textContent = "roller push (per wheel)"; svg.lastChild.classList.add("t-muted");
    $("text", { x: 340, y: 104 }, svg).textContent = "robot motion";
    arrow(svg, 320, 56, 335, 56, "fill-acc acc"); arrow(svg, 320, 78, 335, 78, "fill-info info"); arrow(svg, 320, 100, 335, 100, "fill-ok ok");
    const formula = $("text", { x: 340, y: 160, class: "t-muted" }, svg); formula.textContent = "fl = y + x + r";
    const f2 = $("text", { x: 340, y: 178, class: "t-muted" }, svg); f2.textContent = "fr = y − x − r";
    const f3 = $("text", { x: 340, y: 196, class: "t-muted" }, svg); f3.textContent = "bl = y − x + r";
    const f4 = $("text", { x: 340, y: 214, class: "t-muted" }, svg); f4.textContent = "br = y + x − r";
    $("text", { x: 340, y: 240, class: "t-muted" }, svg).textContent = "(y = forward, x = strafe, r = rotate)";
    function draw() {
      const p = moves[cur];
      let nx = 0, ny = 0;
      wheelG.forEach((w, i) => {
        w.arr.innerHTML = ""; w.force.innerHTML = "";
        const s = p[i]; R[names[i]].textContent = s > 0 ? "+ forward" : s < 0 ? "− reverse" : "0 stop";
        if (!s) return;
        arrow(w.arr, w.wx, w.wy + 20 * s, w.wx, w.wy - 20 * s, "", 3);
        // roller force: wheel force is along roller direction perpendicular... for a mecanum, force direction is 45° per roller orientation
        const fx = s * w.ra * 0.7071 * (w.sx < 0 ? 1 : 1), fy = -s * 0.7071;
        const dirx = w.ra * s, diry = -s; // simplified: (ra*s, -s) normalized
        const n = Math.hypot(dirx, diry);
        arrow(w.force, w.wx + w.sx * 22, w.wy, w.wx + w.sx * 22 + 34 * dirx / n, w.wy + 34 * diry / n, "", 2.5);
        nx += dirx / n; ny += diry / n;
      });
      netG.innerHTML = "";
      if (Math.hypot(nx, ny) > 0.1) arrow(netG, cx, cy, cx + nx * 30, cy + ny * 30, "", 4);
      else { // rotation
        const dir = cur === "cw" ? 1 : -1;
        const path = $("path", { d: `M ${cx - 30} ${cy} A 30 30 0 1 1 ${cx + 30} ${cy}`, "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, netG);
        if (dir < 0) path.setAttribute("transform", `scale(-1 1) translate(${-2 * cx} 0)`);
        $("path", { d: `M ${cx + 30 * dir} ${cy} l ${-8 * dir} -12 l 14 0 z`, stroke: "none", transform: dir < 0 ? `translate(${cx - 30 - (cx - 30)} 0)` : "" }, netG);
      }
    }
    buttons(controls, [["forward", "Forward"], ["back", "Back"], ["left", "Strafe left"], ["right", "Strafe right"], ["ccw", "Rotate ↺"], ["cw", "Rotate ↻"], ["diagFL", "Diagonal ↖"], ["diagFR", "Diagonal ↗"]], cur, v => { cur = v; draw(); });
    draw();
    animate(fig, (dt) => { phase += dt * 60; wheelG.forEach((w, i) => { const s = moves[cur][i]; w.g.querySelectorAll("line").forEach((ln, k) => { const off = ((phase * s + k * 10) % 50 + 50) % 50 - 25; ln.setAttribute("y1", w.wy + off - 5 * w.ra); ln.setAttribute("y2", w.wy + off + 5 * w.ra); }); }); });
  };

  /* ================= 4. Drivetrain path comparison ================= */
  SIMS["path-compare"] = (fig) => {
    const { svg, controls } = stage(fig, 560, 300, "Same target, three drivetrains. Tank has to turn, drive, and turn back. Holonomic drives translate and rotate at the same time, which is why they line up on a goal faster.");
    const lanes = [["Tank", 60], ["Mecanum", 160], ["Swerve", 260]];
    const bots = lanes.map(([name, y]) => {
      $("line", { x1: 40, y1: y, x2: 520, y2: y, class: "border", "stroke-dasharray": "4 6" }, svg);
      $("text", { x: 40, y: y - 34, class: "t-muted" }, svg).textContent = name;
      $("rect", { x: 470, y: y - 22, width: 40, height: 44, rx: 4, class: "fill-soft acc", "stroke-dasharray": "3 3" }, svg); // goal
      $("text", { x: 490, y: y + 36, "text-anchor": "middle", class: "t-acc" }, svg).textContent = "goal";
      const g = $("g", {}, svg);
      $("rect", { x: -18, y: -22, width: 36, height: 44, rx: 5, class: "fill-surface3 border", "stroke-width": 1.5 }, g);
      $("path", { d: "M0 -16 l-7 10 h14 z", class: "fill-acc" }, g);
      return { g, y, name };
    });
    const timeTxt = lanes.map(([, y]) => $("text", { x: 520, y: y - 34, "text-anchor": "end", class: "t-muted" }, svg));
    let t = 0, speed = 1;
    slider(controls, "Playback speed", 0.5, 2, 0.1, 1, v => speed = v, "×");
    const start = { x: 70, y: 0, a: 0 }; const goal = { x: 490, dy: 0 };
    function pose(kind, tt) {
      // kind-specific choreography; returns {x, dy, a, done}
      if (kind === "Tank") { // turn 40° (0.5s), drive (2.4s), turn back (0.5s) -> total 3.4
        const T1 = .5, T2 = 2.4, T3 = .5;
        if (tt < T1) return { x: 70, dy: 0, a: -40 * tt / T1 };
        if (tt < T1 + T2) { const k = (tt - T1) / T2; return { x: 70 + 420 * k, dy: -22 * Math.sin(k * Math.PI), a: -40 + 40 * Math.max(0, k - .6) / .4 * 0 - 0 }; }
        if (tt < T1 + T2 + T3) return { x: 490, dy: 0, a: -40 + 40 * (tt - T1 - T2) / T3 };
        return { x: 490, dy: 0, a: 0, done: T1 + T2 + T3 };
      }
      if (kind === "Mecanum") { const T = 2.6; const k = Math.min(1, tt / T); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; return { x: 70 + 420 * e, dy: -22 * Math.sin(k * Math.PI), a: 0, done: k >= 1 ? T : undefined }; }
      const T = 2.0; const k = Math.min(1, tt / T); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; return { x: 70 + 420 * e, dy: -22 * Math.sin(k * Math.PI), a: 0, done: k >= 1 ? T : undefined };
    }
    animate(fig, (dt) => {
      t += dt * speed; if (t > 4.6) t = 0;
      bots.forEach((b, i) => { const p = pose(b.name, t); b.g.setAttribute("transform", `translate(${p.x} ${b.y + p.dy}) rotate(${p.a})`); timeTxt[i].textContent = (p.done ? p.done : t).toFixed(1) + " s"; });
    });
  };

  /* ================= 5. Four-bar / virtual four-bar ================= */
  SIMS["fourbar"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 300, "A parallel four-bar keeps the end plate level as it swings. Change the top link length and watch the plate tilt. A virtual four-bar replaces the second link with a belt anchored to the base.");
    let theta = 40, topLen = 160, mode = "4bar", auto = true;
    const base = { x: 120, y: 230 }, L = 160, sep = 40;
    $("rect", { x: 40, y: 230, width: 120, height: 14, rx: 3, class: "fill-surface3 border" }, svg);
    $("text", { x: 100, y: 268, "text-anchor": "middle", class: "t-muted" }, svg).textContent = "base";
    const link1 = $("line", { class: "stroke", "stroke-width": 8, "stroke-linecap": "round" }, svg);
    const link2 = $("line", { class: "acc", "stroke-width": 6, "stroke-linecap": "round" }, svg);
    const plate = $("rect", { width: 70, height: 16, rx: 3, class: "fill-soft acc", "stroke-width": 1.5 }, svg);
    const beltG = $("g", { class: "info" }, svg);
    const pins = [0, 1, 2, 3].map(() => $("circle", { r: 5, class: "fill-surface border", "stroke-width": 1.5 }, svg));
    const plateAngleTxt = $("text", { x: 340, y: 60 }, svg);
    const R = readouts(readout, [["tilt", "Plate tilt"], ["reach", "Horizontal reach"], ["height", "Height"]]);
    function draw() {
      const th = rad(theta);
      const A = base, B = { x: base.x, y: base.y - sep }; // two base pivots (bottom, top)
      const C = { x: A.x + L * Math.cos(-th), y: A.y + L * Math.sin(-th) };
      let D, tilt = 0;
      if (mode === "4bar") {
        // top link of length topLen from B; plate length = sep; solve for D such that |BD| = topLen and |CD| = sep
        const dx = C.x - B.x, dy = C.y - B.y, d = Math.hypot(dx, dy);
        const a = (topLen * topLen - sep * sep + d * d) / (2 * d), h2 = topLen * topLen - a * a;
        const h = Math.sqrt(Math.max(0, h2));
        const mx = B.x + a * dx / d, my = B.y + a * dy / d;
        D = { x: mx - h * dy / d, y: my + h * dx / d };
        tilt = deg(Math.atan2(D.x - C.x, -(D.y - C.y))); // 0 when D is straight above C
        link2.setAttribute("x1", B.x); link2.setAttribute("y1", B.y); link2.setAttribute("x2", D.x); link2.setAttribute("y2", D.y); link2.style.display = "";
        beltG.innerHTML = "";
      } else {
        D = { x: C.x, y: C.y - sep }; tilt = 0; link2.style.display = "none";
        beltG.innerHTML = "";
        // belt: pulley at A (fixed to base) and pulley at C (fixed to plate)
        $("circle", { cx: A.x, cy: A.y, r: 18, fill: "none", "stroke-width": 3 }, beltG);
        $("circle", { cx: C.x, cy: C.y, r: 18, fill: "none", "stroke-width": 3 }, beltG);
        const nx = -(C.y - A.y) / L * 18, ny = (C.x - A.x) / L * 18;
        $("line", { x1: A.x + nx, y1: A.y + ny, x2: C.x + nx, y2: C.y + ny, "stroke-width": 3 }, beltG);
        $("line", { x1: A.x - nx, y1: A.y - ny, x2: C.x - nx, y2: C.y - ny, "stroke-width": 3 }, beltG);
        $("text", { x: A.x - 60, y: A.y + 40, class: "t-muted" }, beltG).textContent = "pulley fixed to base";
      }
      link1.setAttribute("x1", A.x); link1.setAttribute("y1", A.y); link1.setAttribute("x2", C.x); link1.setAttribute("y2", C.y);
      const pa = deg(Math.atan2(D.x - C.x, -(D.y - C.y)));
      plate.setAttribute("x", C.x - 10); plate.setAttribute("y", C.y - sep); plate.setAttribute("transform", `rotate(${pa} ${C.x} ${C.y})`);
      [A, B, C, D].forEach((p, i) => { pins[i].setAttribute("cx", p.x); pins[i].setAttribute("cy", p.y); });
      pins[1].style.display = mode === "4bar" ? "" : "none"; pins[3].style.display = mode === "4bar" ? "" : "none";
      R.tilt.textContent = fmt(tilt, 1) + "°"; R.reach.textContent = fmt((C.x - A.x) / L * 100, 0) + " %"; R.height.textContent = fmt((A.y - C.y) / L * 100, 0) + " %";
    }
    const angSl = slider(controls, "Arm angle", 0, 120, 1, theta, v => { theta = v; auto = false; draw(); }, "°");
    slider(controls, "Top link length (4-bar)", 120, 200, 1, topLen, v => { topLen = v; draw(); }, " (160 = parallel)");
    buttons(controls, [["4bar", "Four-bar"], ["v4b", "Virtual four-bar"]], mode, v => { mode = v; draw(); });
    const b = H("button", { type: "button" }, "Auto swing"); b.addEventListener("click", () => auto = !auto); controls.querySelector(".btns").appendChild(b);
    draw();
    animate(fig, (dt, t) => { if (!auto) return; theta = 60 + 55 * Math.sin(t * 1.2); angSl.value = theta; angSl.previousSibling.textContent = `Arm angle: ${Math.round(theta)}°`; draw(); });
  };

  /* ================= 6. Linear slide rigging ================= */
  SIMS["slides"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 300, "Cascade: every stage moves together, so the tip is fast but the string carries the full load at the tip. Continuous: stages extend one at a time, more lifting force, slower tip.");
    let mode = "cascade", ext = 0, auto = true;
    const stagesN = 3, baseY = 260, w = 34, h = 110;
    const groups = [], labels = [];
    for (let i = 0; i < stagesN; i++) { groups.push($("rect", { x: 130 - i * 3 + i * 6, width: w - i * 6, height: h, rx: 3, class: i === 0 ? "fill-surface3 border" : "fill-soft acc", "stroke-width": 1.5 }, svg)); }
    const tip = $("rect", { x: 118, width: 58, height: 10, rx: 2, class: "fill-acc" }, svg);
    const stringG = $("g", { class: "info", "stroke-width": 2 }, svg);
    const speedArrow = $("g", { class: "fill-ok ok" }, svg);
    const R = readouts(readout, [["tipv", "Tip speed"], ["force", "Lift force"], ["stage", "Stages moving"]]);
    // right side explanation table
    $("text", { x: 300, y: 60, class: "t-acc" }, svg).textContent = "Rule of thumb (n moving stages)";
    const l1 = $("text", { x: 300, y: 90 }, svg), l2 = $("text", { x: 300, y: 112 }, svg), l3 = $("text", { x: 300, y: 134 }, svg), l4 = $("text", { x: 300, y: 170, class: "t-muted" }, svg), l5 = $("text", { x: 300, y: 190, class: "t-muted" }, svg);
    function draw() {
      const n = stagesN - 1;
      let ys = [baseY - h];
      if (mode === "cascade") { for (let i = 1; i <= n; i++) ys.push(baseY - h - ext * (h - 20) * i / n); }
      else { for (let i = 1; i <= n; i++) { const local = Math.min(1, Math.max(0, ext * n - (i - 1))); ys.push(ys[i - 1] - local * (h - 20)); } }
      groups.forEach((g, i) => g.setAttribute("y", ys[i]));
      tip.setAttribute("y", ys[n] - 10);
      stringG.innerHTML = "";
      if (mode === "cascade") { // string from spool at base to top of stage 1, over pulley to tip
        $("line", { x1: 176, y1: baseY, x2: 176, y2: ys[1] + 6, fill: "none" }, stringG); $("circle", { cx: 172, cy: ys[1] + 6, r: 4, fill: "none" }, stringG);
        $("line", { x1: 168, y1: ys[1] + 6, x2: 168, y2: ys[n] }, stringG);
      } else { $("line", { x1: 176, y1: baseY, x2: 176, y2: ys[n] }, stringG); }
      $("circle", { cx: 176, cy: baseY + 8, r: 8, fill: "none", "stroke-width": 3 }, stringG); $("text", { x: 190, y: baseY + 12, class: "t-muted" }, stringG).textContent = "spool";
      const moving = mode === "cascade" ? n : (ext <= 0 || ext >= 1 ? 0 : 1);
      R.tipv.textContent = mode === "cascade" ? `${n}× string speed` : "1× string speed";
      R.force.textContent = mode === "cascade" ? `string force ÷ ${n}` : "full string force";
      R.stage.textContent = mode === "cascade" ? `all ${n}` : `${moving} at a time`;
      l1.textContent = mode === "cascade" ? "tip speed = n × spool speed" : "tip speed = spool speed";
      l2.textContent = mode === "cascade" ? "lift force = spool force ÷ n" : "lift force = spool force";
      l3.textContent = mode === "cascade" ? "string sees the full load" : "string sees the full load, stage by stage";
      l4.textContent = mode === "cascade" ? "Use when you need a fast lift and can gear down." : "Use when you need force and can accept a slower lift.";
      l5.textContent = "Either way: a tensioner and a limit switch.";
    }
    slider(controls, "Extension", 0, 100, 1, 0, v => { ext = v / 100; auto = false; draw(); }, " %");
    buttons(controls, [["cascade", "Cascade"], ["continuous", "Continuous"]], mode, v => { mode = v; draw(); });
    const b = H("button", { type: "button" }, "Auto"); b.addEventListener("click", () => auto = !auto); controls.querySelector(".btns").appendChild(b);
    draw();
    animate(fig, (dt, t) => { if (!auto) return; ext = (Math.sin(t * 0.9) + 1) / 2; const sl = controls.querySelector("input[type=range]"); sl.value = Math.round(ext * 100); sl.previousSibling.textContent = `Extension: ${Math.round(ext * 100)} %`; draw(); });
  };

  /* ================= 7. PID simulator ================= */
  SIMS["pid"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 260, "A simulated arm with friction and gravity trying to reach the target line. Raise P until it gets there, add D to calm the overshoot, and add a little feedforward (kG) to hold against gravity without needing I.");
    let kP = 0.02, kI = 0, kD = 0.001, kG = 0, target = 200, noise = false;
    const W = 560, Hh = 260, padL = 40, padB = 30;
    $("line", { x1: padL, y1: 20, x2: padL, y2: Hh - padB, class: "border" }, svg); $("line", { x1: padL, y1: Hh - padB, x2: W - 10, y2: Hh - padB, class: "border" }, svg);
    $("text", { x: padL + 4, y: 16, class: "t-muted" }, svg).textContent = "position (ticks)"; $("text", { x: W - 10, y: Hh - 12, "text-anchor": "end", class: "t-muted" }, svg).textContent = "time (3 s)";
    const tgt = $("line", { x1: padL, x2: W - 10, class: "acc", "stroke-dasharray": "5 5" }, svg);
    const curve = $("path", { fill: "none", class: "info", "stroke-width": 2.5 }, svg);
    const pwr = $("path", { fill: "none", class: "warn", "stroke-width": 1.5, opacity: .7 }, svg);
    $("text", { x: W - 12, y: 34, "text-anchor": "end", class: "t-acc" }, svg).textContent = "— target";
    $("text", { x: W - 12, y: 50, "text-anchor": "end" }, svg).textContent = "— position"; svg.lastChild.setAttribute("style", "fill:var(--accent-2)");
    $("text", { x: W - 12, y: 66, "text-anchor": "end" }, svg).textContent = "— motor power"; svg.lastChild.setAttribute("style", "fill:var(--warn)");
    const R = readouts(readout, [["settle", "Settling time"], ["over", "Overshoot"], ["ss", "Steady-state error"]]);
    const yOf = v => Hh - padB - v / 320 * (Hh - padB - 30);
    function sim() {
      const dt = 0.01, N = 300; let pos = 0, vel = 0, integ = 0, prevErr = target; let d = "", dp = ""; let maxPos = 0, settled = null, finalErr = 0;
      for (let i = 0; i <= N; i++) {
        const err = target - pos; integ += err * dt; const der = (err - prevErr) / dt; prevErr = err;
        let u = kP * err + kI * integ + kD * der + kG; if (noise) u += (Math.random() - .5) * 0.05; u = Math.max(-1, Math.min(1, u));
        const gravity = -0.35, friction = -vel * 3.0; // simple physics: acceleration in ticks/s²
        const acc = u * 1400 + gravity * 140 + friction; vel += acc * dt; pos += vel * dt; if (pos < 0) { pos = 0; vel = Math.max(0, vel); }
        maxPos = Math.max(maxPos, pos);
        if (settled == null && Math.abs(err) < target * 0.03) { let ok = true; settled = i * dt; }
        if (settled != null && Math.abs(target - pos) > target * 0.03) settled = null;
        const x = padL + i / N * (W - 10 - padL);
        d += (i ? "L" : "M") + x.toFixed(1) + " " + yOf(pos).toFixed(1) + " ";
        dp += (i ? "L" : "M") + x.toFixed(1) + " " + (Hh - padB - (u + 1) / 2 * 50).toFixed(1) + " ";
        if (i === N) finalErr = err;
      }
      curve.setAttribute("d", d); pwr.setAttribute("d", dp); tgt.setAttribute("y1", yOf(target)); tgt.setAttribute("y2", yOf(target));
      R.settle.textContent = settled != null ? fmt(settled, 2) + " s" : "never"; R.over.textContent = fmt(Math.max(0, (maxPos - target) / target * 100), 0) + " %"; R.ss.textContent = fmt(finalErr, 0) + " ticks";
    }
    slider(controls, "kP", 0, 0.08, 0.001, kP, v => { kP = v; sim(); });
    slider(controls, "kI", 0, 0.05, 0.001, kI, v => { kI = v; sim(); });
    slider(controls, "kD", 0, 0.006, 0.0001, kD, v => { kD = v; sim(); });
    slider(controls, "kG (feedforward)", 0, 0.3, 0.005, kG, v => { kG = v; sim(); });
    slider(controls, "Target", 50, 300, 10, target, v => { target = v; sim(); }, " ticks");
    buttons(controls, [["p", "P only"], ["pd", "P + D"], ["pdg", "P + D + kG"], ["bad", "Too much P"]], "", v => {
      const presets = { p: [0.02, 0, 0, 0], pd: [0.03, 0, 0.0025, 0], pdg: [0.03, 0, 0.0025, 0.035], bad: [0.08, 0, 0, 0] };
      [kP, kI, kD, kG] = presets[v]; const sl = controls.querySelectorAll("input[type=range]"); [kP, kI, kD, kG].forEach((val, i) => { sl[i].value = val; sl[i].previousSibling.textContent = sl[i].previousSibling.textContent.split(":")[0] + ": " + val; }); sim();
    });
    sim();
  };

  /* ================= 8. Motor picker ================= */
  const YJ = [ // goBILDA 5203 Yellow Jacket family: [ratio label, free rpm, stall kg·cm, ticks per rev]
    ["3.7:1", 1620, 5.4, 103.8], ["5.2:1", 1150, 7.9, 145.1], ["13.7:1", 435, 18.7, 384.5], ["19.2:1", 312, 24.3, 537.7], ["26.9:1", 223, 38.0, 751.8],
    ["50.9:1", 117, 68.4, 1425.1], ["71.2:1", 84, 93.6, 1993.6], ["99.5:1", 60, 133.2, 2786.2], ["139:1", 43, 185.5, 3895.9], ["188:1", 30, 250.0, 5281.1]
  ];
  SIMS["motor-picker"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 240, "goBILDA Yellow Jacket family (same motor, different gearbox). Power peaks at half of free speed, so size mechanisms to run near there, not near stall. Numbers from goBILDA spec sheets; verify before you buy.");
    let idx = 3, wheelIn = 3.78, extRatio = 1;
    const padL = 50, padB = 36, W = 560, Hh = 240;
    $("line", { x1: padL, y1: 20, x2: padL, y2: Hh - padB, class: "border" }, svg); $("line", { x1: padL, y1: Hh - padB, x2: W - 20, y2: Hh - padB, class: "border" }, svg);
    $("text", { x: W - 20, y: Hh - 14, "text-anchor": "end", class: "t-muted" }, svg).textContent = "speed →";
    $("text", { x: padL + 6, y: 16, class: "t-muted" }, svg).textContent = "torque (accent) · power (blue)";
    const tq = $("line", { class: "acc", "stroke-width": 3 }, svg); const pw = $("path", { fill: "none", class: "info", "stroke-width": 2.5 }, svg);
    const peak = $("circle", { r: 5, class: "fill-info" }, svg); const peakT = $("text", { class: "t-muted" }, svg);
    const R = readouts(readout, [["rpm", "Free speed"], ["stall", "Stall torque"], ["tpr", "Encoder ticks / rev"], ["wheel", "Wheel speed (ft/s)"], ["peak", "Peak power @"]]);
    function draw() {
      const [, rpm, stall, tpr] = YJ[idx];
      const x0 = padL, x1 = W - 20, y0 = Hh - padB, y1 = 30;
      tq.setAttribute("x1", x0); tq.setAttribute("y1", y1); tq.setAttribute("x2", x1); tq.setAttribute("y2", y0);
      let d = ""; for (let i = 0; i <= 40; i++) { const s = i / 40; const p = s * (1 - s) * 4; const x = x0 + s * (x1 - x0), y = y0 - p * (y0 - y1) * 0.85; d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " "; }
      pw.setAttribute("d", d); peak.setAttribute("cx", (x0 + x1) / 2); peak.setAttribute("cy", y0 - 0.85 * (y0 - y1)); peakT.setAttribute("x", (x0 + x1) / 2 + 10); peakT.setAttribute("y", y0 - 0.85 * (y0 - y1) - 8); peakT.textContent = `${fmt(rpm / 2 / extRatio, 0)} rpm, ${fmt(stall / 2 * extRatio, 1)} kg·cm`;
      const outRpm = rpm / extRatio;
      R.rpm.textContent = fmt(outRpm, 0) + " rpm"; R.stall.textContent = fmt(stall * extRatio, 1) + " kg·cm"; R.tpr.textContent = fmt(tpr, 1);
      R.wheel.textContent = fmt(outRpm / 60 * Math.PI * wheelIn / 12, 1) + " ft/s"; R.peak.textContent = fmt(outRpm / 2, 0) + " rpm";
    }
    select(controls, "Yellow Jacket ratio", YJ.map((m, i) => [i, `${m[0]} — ${m[1]} rpm`]), idx, v => { idx = +v; draw(); });
    slider(controls, "External ratio (after motor)", 1, 5, 0.1, 1, v => { extRatio = v; draw(); }, ":1");
    select(controls, "Wheel diameter", [["2.95", "75 mm (2.95 in)"], ["3.78", "96 mm (3.78 in)"], ["4.09", "104 mm (4.09 in)"], ["5.5", "5.5 in"]], "3.78", v => { wheelIn = +v; draw(); });
    draw();
  };

  /* ================= 9. Arm torque calculator ================= */
  SIMS["arm-torque"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 220, "Torque at the pivot = weight × horizontal distance. It is worst when the arm is level. Compare it to the motor's stall torque after your gear ratio: aim to use less than about 40% of stall so the motor is not cooking itself.");
    let len = 16, mass = 1.5, angle = 0, ratio = 2, motorStall = 38;
    const pivot = { x: 140, y: 150 };
    $("rect", { x: 100, y: 150, width: 80, height: 12, rx: 3, class: "fill-surface3 border" }, svg);
    const arm = $("line", { class: "stroke", "stroke-width": 8, "stroke-linecap": "round" }, svg);
    const load = $("circle", { r: 14, class: "fill-soft acc", "stroke-width": 2 }, svg);
    const gArrow = $("g", { class: "fill-bad bad" }, svg); const lever = $("line", { class: "info", "stroke-dasharray": "4 4" }, svg);
    const R = readouts(readout, [["t", "Torque at pivot"], ["m", "Torque at motor"], ["pct", "% of stall"], ["verdict", "Verdict"]]);
    function draw() {
      const px = 9; const a = rad(angle); const ex = pivot.x + len * px * Math.cos(a), ey = pivot.y - len * px * Math.sin(a);
      arm.setAttribute("x1", pivot.x); arm.setAttribute("y1", pivot.y); arm.setAttribute("x2", ex); arm.setAttribute("y2", ey); load.setAttribute("cx", ex); load.setAttribute("cy", ey);
      gArrow.innerHTML = ""; arrow(gArrow, ex, ey + 16, ex, ey + 50, "", 3);
      lever.setAttribute("x1", pivot.x); lever.setAttribute("y1", pivot.y + 30); lever.setAttribute("x2", ex); lever.setAttribute("y2", pivot.y + 30);
      const torque = mass * 9.81 * (len * 0.0254) * Math.cos(a); // N·m
      const kgcm = torque * 10.197; const atMotor = kgcm / ratio; const pct = atMotor / motorStall * 100;
      R.t.textContent = fmt(kgcm, 1) + " kg·cm"; R.m.textContent = fmt(atMotor, 1) + " kg·cm"; R.pct.textContent = fmt(pct, 0) + " %";
      R.verdict.textContent = pct < 40 ? "comfortable" : pct < 70 ? "hot under load" : pct < 100 ? "will stall when pushed" : "cannot lift";
      R.verdict.style.color = pct < 40 ? "var(--ok)" : pct < 70 ? "var(--warn)" : "var(--bad)";
    }
    slider(controls, "Arm length", 6, 30, 0.5, len, v => { len = v; draw(); }, " in");
    slider(controls, "Mass at end", 0.2, 4, 0.1, mass, v => { mass = v; draw(); }, " kg");
    slider(controls, "Arm angle", -30, 90, 1, angle, v => { angle = v; draw(); }, "°");
    slider(controls, "Gear ratio after motor", 1, 10, 0.5, ratio, v => { ratio = v; draw(); }, ":1");
    select(controls, "Motor stall torque", YJ.map(m => [m[2], `${m[0]} (${m[2]} kg·cm)`]), 38, v => { motorStall = +v; draw(); });
    draw();
  };

  /* ================= 10. Servo power rule ================= */
  SIMS["servo-power"] = (fig) => {
    const { controls, readout } = stage(fig, 10, 10, "The rule caps a servo's mechanical output power, computed from the manufacturer's stall torque and no-load speed at 6 V. Check the current Competition Manual for the exact limit and formula; this calculator uses the published formula so you can compare servos.");
    fig.querySelector(".stage").remove();
    let torque = 25, speed = 0.13, limit = 8;
    const R = readouts(readout, [["p", "Mechanical output power"], ["ok", "Against limit"]]);
    const calc = () => { const radps = (Math.PI / 3) / speed; const nm = torque / 10.197; const p = 0.25 * nm * radps; R.p.textContent = fmt(p, 2) + " W"; R.ok.textContent = p <= limit ? "under limit" : "OVER limit"; R.ok.style.color = p <= limit ? "var(--ok)" : "var(--bad)"; };
    slider(controls, "Stall torque @ 6V", 2, 60, 0.5, torque, v => { torque = v; calc(); }, " kg·cm");
    slider(controls, "Speed (sec / 60°) @ 6V", 0.04, 0.5, 0.01, speed, v => { speed = v; calc(); }, " s");
    slider(controls, "Rule limit", 4, 12, 0.5, limit, v => { limit = v; calc(); }, " W");
    const note = H("p", { class: "muted small", style: "margin-top:8px" }, "Formula: P = 0.25 × stall torque (N·m) × no-load speed (rad/s). 1 kg·cm = 0.098 N·m. 60° in <i>t</i> seconds = (π/3)/<i>t</i> rad/s.");
    fig.appendChild(note);
    calc();
  };

  /* ================= 11. 3D print tolerance ================= */
  SIMS["tolerance"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 220, "Printed holes come out small and printed pegs come out fat, so you design the gap in. Enclosed shapes get toleranced on every side, which is why a hole needs half the per-side offset you would use on an open edge.");
    let clearance = 0.01, shape = "hole";
    const R = readouts(readout, [["fit", "Fit"], ["cad", "Design offset"], ["use", "Use for"]]);
    const g = $("g", {}, svg);
    function draw() {
      g.innerHTML = "";
      const cx = 180, cy = 110, r = 55, gap = clearance * 900; // exaggerated
      if (shape === "hole") {
        $("rect", { x: cx - 110, y: cy - 80, width: 220, height: 160, rx: 8, class: "fill-surface3 border" }, g);
        $("circle", { cx, cy, r: r + gap, class: "fill-surface border", "stroke-width": 1.5 }, g);
        $("circle", { cx, cy, r, class: "fill-soft acc", "stroke-width": 1.5 }, g);
        $("text", { x: cx, y: cy + 4, "text-anchor": "middle" }, g).textContent = "shaft";
        $("text", { x: 330, y: 70, class: "t-muted" }, g).textContent = "hole in CAD = shaft Ø + 2 × offset";
        $("text", { x: 330, y: 92, class: "t-muted" }, g).textContent = "(offset applied all the way around)";
      } else {
        $("rect", { x: 70, y: 60, width: 220, height: 30, class: "fill-surface3 border" }, g); // rail
        $("rect", { x: 70, y: 130, width: 220, height: 30, class: "fill-surface3 border" }, g);
        $("rect", { x: 100, y: 90 + gap, width: 160, height: 40 - 2 * gap, rx: 4, class: "fill-soft acc", "stroke-width": 1.5 }, g);
        $("text", { x: 180, y: 114, "text-anchor": "middle" }, g).textContent = "slider";
        $("text", { x: 330, y: 70, class: "t-muted" }, g).textContent = "slot in CAD = part + 2 × offset";
        $("text", { x: 330, y: 92, class: "t-muted" }, g).textContent = "(two faces, both toleranced)";
      }
      $("text", { x: 330, y: 130, class: "t-acc" }, g).textContent = `offset per side ≈ ${fmt(clearance / 2, 3)} in (${fmt(clearance / 2 * 25.4, 2)} mm)`;
      $("text", { x: 330, y: 152, class: "t-muted" }, g).textContent = `total clearance ${fmt(clearance, 3)} in (${fmt(clearance * 25.4, 2)} mm)`;
      const fit = clearance <= 0.006 ? ["very tight (press)", "bearings, gears on hex, anything that must not move"] : clearance <= 0.012 ? ["tight (snug)", "shafts you want to spin without wobble, pins"] : ["loose (clearance)", "screws through holes, sliding parts, fast assembly"];
      R.fit.textContent = fit[0]; R.cad.textContent = "+" + fmt(clearance, 3) + " in total"; R.use.textContent = fit[1];
    }
    slider(controls, "Total clearance", 0.002, 0.03, 0.001, clearance, v => { clearance = v; draw(); }, " in");
    buttons(controls, [["hole", "Round hole"], ["slot", "Slot / sliding fit"]], shape, v => { shape = v; draw(); });
    buttons(controls, [["0.005", "Very tight"], ["0.01", "Tight"], ["0.02", "Loose"]], "", v => { clearance = +v; controls.querySelector("input[type=range]").value = v; controls.querySelector("input[type=range]").previousSibling.textContent = `Total clearance: ${v} in`; draw(); });
    draw();
  };

  /* ================= 12. Sizing cube ================= */
  SIMS["sizing-cube"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 280, "The robot starts inside the 18-inch cube, then can expand once the match starts (within the game's expansion rules). Slides that extend past the frame are legal after start; check the current manual for the horizontal expansion limit.");
    let ext = 0;
    // isometric-ish cube
    const ox = 150, oy = 210, s = 130, dx = 60, dy = -40;
    const cube = $("g", { class: "acc", fill: "none", "stroke-width": 1.5, "stroke-dasharray": "5 4" }, svg);
    const P = (x, y, z) => [ox + x * s + z * dx, oy - y * s + z * dy];
    const edges = [[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 1, 0]], [[1, 1, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 0]], [[0, 0, 1], [1, 0, 1]], [[1, 0, 1], [1, 1, 1]], [[1, 1, 1], [0, 1, 1]], [[0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[1, 1, 0], [1, 1, 1]], [[0, 1, 0], [0, 1, 1]]];
    edges.forEach(([a, b]) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); $("line", { x1, y1, x2, y2 }, cube); });
    $("text", { x: ox + s / 2, y: oy + 24, "text-anchor": "middle", class: "t-acc" }, svg).textContent = '18"';
    $("text", { x: ox - 26, y: oy - s / 2, "text-anchor": "middle", class: "t-acc" }, svg).textContent = '18"';
    // robot: base + slide
    const base = $("rect", { x: ox + 10, y: oy - 60, width: s - 20, height: 60, rx: 4, class: "fill-surface3 border" }, svg);
    const slide = $("rect", { width: 30, rx: 3, class: "fill-soft acc" }, svg);
    const arm = $("rect", { height: 14, rx: 3, class: "fill-acc" }, svg);
    const R = readouts(readout, [["h", "Robot height"], ["w", "Horizontal reach"], ["legal", "Start config"]]);
    function draw() {
      const sh = 60 + ext * 160; slide.setAttribute("x", ox + s - 50); slide.setAttribute("y", oy - sh); slide.setAttribute("height", sh - 8);
      const aw = 14 + ext * 120; arm.setAttribute("x", ox + s - 50 + 30 - aw); arm.setAttribute("y", oy - sh); arm.setAttribute("width", aw);
      const hIn = 18 * sh / s, reach = 18 * (aw - 30 + s - 20) / s;
      R.h.textContent = fmt(hIn, 1) + ' in'; R.w.textContent = fmt(Math.max(reach, 18 * (s - 20) / s), 1) + ' in wide';
      const ok = ext < 0.02; R.legal.textContent = ok ? "inside cube ✓" : "expanded (after start only)"; R.legal.style.color = ok ? "var(--ok)" : "var(--warn)";
    }
    slider(controls, "Expansion", 0, 100, 1, 0, v => { ext = v / 100; draw(); }, " %");
    draw();
  };

  /* ================= 13. Intake: touch it, own it ================= */
  SIMS["intake"] = (fig) => {
    const { svg, controls } = stage(fig, 560, 240, "Left: a spinning compliant wheel grabs the element the instant it touches and pulls it in. Right: a claw has to stop, line up, and close. Same element, very different cycle time.");
    let t = 0;
    // left: roller intake
    const L = 140, cy = 130;
    $("text", { x: L, y: 40, "text-anchor": "middle", class: "t-acc" }, svg).textContent = "active roller intake";
    $("rect", { x: L - 60, y: cy + 30, width: 120, height: 18, rx: 3, class: "fill-surface3 border" }, svg); // ramp/base
    const roller = $("g", {}, svg); $("circle", { cx: L - 40, cy: cy - 6, r: 26, class: "fill-soft acc", "stroke-width": 2 }, roller);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; $("line", { x1: L - 40 + 10 * Math.cos(a), y1: cy - 6 + 10 * Math.sin(a), x2: L - 40 + 24 * Math.cos(a), y2: cy - 6 + 24 * Math.sin(a), class: "acc", "stroke-width": 3 }, roller); }
    const piece1 = $("circle", { r: 16, class: "fill-warn" }, svg);
    // right: claw
    const Rx = 400;
    $("text", { x: Rx, y: 40, "text-anchor": "middle", class: "t-acc" }, svg).textContent = "claw";
    $("rect", { x: Rx - 60, y: cy + 30, width: 120, height: 18, rx: 3, class: "fill-surface3 border" }, svg);
    const clawG = $("g", {}, svg); const f1 = $("path", { class: "fill-surface border", "stroke-width": 1.5 }, clawG), f2 = $("path", { class: "fill-surface border", "stroke-width": 1.5 }, clawG);
    const piece2 = $("circle", { r: 16, class: "fill-warn" }, svg);
    const step1 = $("text", { x: L, y: 220, "text-anchor": "middle", class: "t-muted" }, svg), step2 = $("text", { x: Rx, y: 220, "text-anchor": "middle", class: "t-muted" }, svg);
    let speed = 1; slider(controls, "Playback speed", 0.5, 2, 0.1, 1, v => speed = v, "×");
    animate(fig, (dt, tt) => {
      t += dt * speed; const T = 4; const k = (t % T) / T;
      roller.setAttribute("transform", `rotate(${-t * 400} ${L - 40} ${cy - 6})`);
      // roller: piece approaches (0-.3), touches and is pulled in (.3-.55), gone (.55-1)
      let px, py, op = 1;
      if (k < .3) { px = L + 90 - (k / .3) * 70; py = cy + 14; step1.textContent = "drive at it"; }
      else if (k < .55) { const q = (k - .3) / .25; px = L + 20 - q * 70; py = cy + 14 - q * 20; step1.textContent = "touching = owned"; }
      else { px = L - 60; py = cy - 6; op = Math.max(0, 1 - (k - .55) / .2); step1.textContent = "in the robot"; }
      piece1.setAttribute("cx", px); piece1.setAttribute("cy", py); piece1.setAttribute("opacity", op);
      // claw: approach (0-.3), stop+align (.3-.5), close (.5-.65), lift (.65-.9)
      let cx2 = Rx, cy2 = cy + 14, open = 26, lift = 0;
      if (k < .3) { cx2 = Rx + 90 - (k / .3) * 90; step2.textContent = "drive at it"; }
      else if (k < .5) { cx2 = Rx + 4 * Math.sin((k - .3) * 40); step2.textContent = "stop, line up"; }
      else if (k < .65) { open = 26 - (k - .5) / .15 * 10; step2.textContent = "close"; }
      else if (k < .9) { open = 16; lift = (k - .65) / .25 * 60; step2.textContent = "lift"; }
      else { open = 16; lift = 60; step2.textContent = "finally moving"; }
      piece2.setAttribute("cx", cx2); piece2.setAttribute("cy", cy2 - lift);
      const fy = cy2 - lift; f1.setAttribute("d", `M${Rx - open} ${fy - 30} l-6 40 l10 6 l6 -40 z`); f2.setAttribute("d", `M${Rx + open} ${fy - 30} l6 40 l-10 6 l-6 -40 z`);
    });
  };

  /* ================= 14. Cycle time calculator ================= */
  SIMS["cycle-calc"] = (fig) => {
    const { controls, readout } = stage(fig, 10, 10, "Two minutes of TeleOp. Small cycle-time gains compound. This ignores defense and traffic, so treat it as an upper bound.");
    fig.querySelector(".stage").remove();
    let cycle = 8, pts = 3, auto = 20, endgame = 15, egTime = 20;
    const R = readouts(readout, [["cycles", "TeleOp cycles"], ["tele", "TeleOp points"], ["total", "Match total"], ["gain", "Gain if 1 s faster"]]);
    const calc = () => { const tele = 120 - egTime; const c = Math.floor(tele / cycle); const c2 = Math.floor(tele / Math.max(1, cycle - 1)); R.cycles.textContent = c; R.tele.textContent = c * pts; R.total.textContent = auto + c * pts + endgame; R.gain.textContent = "+" + (c2 - c) * pts + " pts"; };
    slider(controls, "Cycle time", 3, 30, 0.5, cycle, v => { cycle = v; calc(); }, " s");
    slider(controls, "Points per cycle", 1, 15, 1, pts, v => { pts = v; calc(); }, " pts");
    slider(controls, "Autonomous points", 0, 80, 1, auto, v => { auto = v; calc(); });
    slider(controls, "Endgame points", 0, 60, 1, endgame, v => { endgame = v; calc(); });
    slider(controls, "Time spent on endgame", 0, 40, 1, egTime, v => { egTime = v; calc(); }, " s");
    calc();
  };

  /* ================= 15. Odometry (dead wheels) ================= */
  SIMS["odometry"] = (fig) => {
    const { svg, controls, readout } = stage(fig, 560, 300, "Two parallel dead wheels plus one perpendicular wheel. Their encoder deltas give forward, strafe, and heading change every loop; add those up and you have a field position. Drive the robot and watch the tracked pose follow.");
    let x = 120, y = 150, h = 0, vx = 0, vy = 0, w = 0, mode = "auto", keys = {};
    $("rect", { x: 20, y: 20, width: 520, height: 260, rx: 6, class: "fill-surface border" }, svg);
    for (let i = 1; i < 12; i++) { $("line", { x1: 20 + i * 520 / 12, y1: 20, x2: 20 + i * 520 / 12, y2: 280, class: "border", opacity: .5 }, svg); }
    for (let i = 1; i < 6; i++) { $("line", { x1: 20, y1: 20 + i * 260 / 6, x2: 540, y2: 20 + i * 260 / 6, class: "border", opacity: .5 }, svg); }
    const trail = $("path", { fill: "none", class: "info", "stroke-width": 2, opacity: .8 }, svg);
    const bot = $("g", {}, svg);
    $("rect", { x: -22, y: -22, width: 44, height: 44, rx: 5, class: "fill-surface3 border", "stroke-width": 1.5 }, bot);
    $("path", { d: "M0 -14 l-7 10 h14 z", class: "fill-acc" }, bot);
    // pods: two parallel (left/right), one perpendicular (back)
    $("rect", { x: -20, y: -8, width: 5, height: 16, class: "fill-acc" }, bot); $("rect", { x: 15, y: -8, width: 5, height: 16, class: "fill-acc" }, bot); $("rect", { x: -8, y: 14, width: 16, height: 5, class: "fill-acc" }, bot);
    const R = readouts(readout, [["x", "x (in)"], ["y", "y (in)"], ["h", "heading"], ["L", "left pod Δ"], ["Rr", "right pod Δ"], ["B", "back pod Δ"]]);
    let d = `M${x} ${y}`;
    buttons(controls, [["auto", "Auto drive"], ["keys", "Arrow keys (Q/E rotate)"]], mode, v => { mode = v; if (v === "keys") svg.focus(); });
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("keydown", e => { keys[e.key] = true; if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "q", "e"].includes(e.key)) e.preventDefault(); });
    svg.addEventListener("keyup", e => { keys[e.key] = false; });
    const trackW = 3; // pods spacing (units of screen px / 10)
    animate(fig, (dt, t) => {
      if (mode === "auto") { vx = 60 * Math.cos(t * 0.7); vy = 40 * Math.sin(t * 1.1); w = 0.6 * Math.sin(t * 0.5); }
      else { vx = (keys.ArrowRight ? 80 : 0) - (keys.ArrowLeft ? 80 : 0); vy = (keys.ArrowDown ? 80 : 0) - (keys.ArrowUp ? 80 : 0); w = (keys.e ? 1.5 : 0) - (keys.q ? 1.5 : 0); }
      // robot-relative velocities from field vel
      const fwd = (vx * Math.cos(h) + vy * Math.sin(h)) * dt, str = (-vx * Math.sin(h) + vy * Math.cos(h)) * dt, dth = w * dt;
      const dL = fwd - dth * 20, dR = fwd + dth * 20, dB = str + dth * 15; // what the pods would read
      x += vx * dt; y += vy * dt; h += dth;
      x = Math.max(45, Math.min(515, x)); y = Math.max(45, Math.min(255, y));
      bot.setAttribute("transform", `translate(${x} ${y}) rotate(${deg(h)})`);
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; if (d.length > 4000) d = "M" + d.split(" L").slice(-300).join(" L"); trail.setAttribute("d", d);
      R.x.textContent = fmt((x - 20) / 520 * 144, 1); R.y.textContent = fmt((280 - y) / 260 * 72, 1); R.h.textContent = fmt(((deg(h) % 360) + 360) % 360, 0) + "°";
      R.L.textContent = fmt(dL * 10, 1); R.Rr.textContent = fmt(dR * 10, 1); R.B.textContent = fmt(dB * 10, 1);
    });
  };

  /* ================= 16. Belt vs chain vs gear sizing ================= */
  SIMS["center-distance"] = (fig) => {
    const { controls, readout } = stage(fig, 10, 10, "Gears need an exact center distance. Belts need an exact center distance too (or a tensioner). Chain is forgiving because you can add half-links and tension it.");
    fig.querySelector(".stage").remove();
    let type = "gear", t1 = 20, t2 = 40;
    const R = readouts(readout, [["cd", "Center distance"], ["note", "Note"]]);
    const calc = () => {
      if (type === "gear") { const mod = 0.8; const cd = (t1 + t2) * mod / 2; R.cd.textContent = fmt(cd, 2) + " mm"; R.note.textContent = "mod 0.8 gears (goBILDA/REV). Add ~0.1 mm for printed gears."; }
      else if (type === "chain") { const pitch = 6.35; R.cd.textContent = "any, in half-pitch steps (3.175 mm)"; R.note.textContent = "#25 chain. Use a tensioner or a slotted mount."; }
      else { const pitch = 3; const pd1 = t1 * pitch / Math.PI, pd2 = t2 * pitch / Math.PI; const beltLen = 2 * 60 + Math.PI * (pd1 + pd2) / 2 + Math.pow(pd2 - pd1, 2) / (4 * 60); R.cd.textContent = "fixed by belt length"; R.note.textContent = `GT2 3 mm pitch. Belt length ≈ 2C + π(d₁+d₂)/2 + (d₂−d₁)²/4C. Pick a stock belt, then solve for C.`; }
    };
    buttons(controls, [["gear", "Gears"], ["belt", "Belt"], ["chain", "Chain"]], type, v => { type = v; calc(); });
    slider(controls, "Teeth 1", 8, 80, 1, t1, v => { t1 = v; calc(); }); slider(controls, "Teeth 2", 8, 120, 1, t2, v => { t2 = v; calc(); });
    calc();
  };

  /* ================= 17. Field-centric vs robot-centric ================= */
  SIMS["field-centric"] = (fig) => {
    const { svg, controls } = stage(fig, 560, 260, "Same joystick input (push up), robot rotated 90°. Robot-centric moves the robot toward its own front. Field-centric rotates the stick by the IMU heading first, so \"up\" always means away from the driver.");
    let heading = 90, mode = "field";
    const draw = (gx, label, m) => {
      const g = $("g", {}, svg);
      $("text", { x: gx, y: 30, "text-anchor": "middle", class: "t-acc" }, g).textContent = label;
      $("rect", { x: gx - 100, y: 50, width: 200, height: 170, rx: 6, class: "fill-surface border" }, g);
      $("text", { x: gx, y: 240, "text-anchor": "middle", class: "t-muted" }, g).textContent = "driver stands here ▲";
      const bot = $("g", {}, g); $("rect", { x: -20, y: -20, width: 40, height: 40, rx: 4, class: "fill-surface3 border", "stroke-width": 1.5 }, bot); $("path", { d: "M0 -14 l-7 10 h14 z", class: "fill-acc" }, bot);
      const arr = $("g", { class: "fill-ok ok" }, g);
      return { bot, arr, gx, m };
    };
    const panels = [draw(150, "robot-centric", "robot"), draw(410, "field-centric", "field")];
    function update() {
      panels.forEach(p => {
        p.bot.setAttribute("transform", `translate(${p.gx} 140) rotate(${heading})`); p.arr.innerHTML = "";
        const a = p.m === "robot" ? rad(heading - 90) : rad(-90); // stick up
        arrow(p.arr, p.gx, 140, p.gx + 55 * Math.cos(a), 140 + 55 * Math.sin(a), "", 4);
      });
    }
    slider(controls, "Robot heading", 0, 360, 1, heading, v => { heading = v; update(); }, "°");
    update();
  };

  /* ================= 18. Battery / current budget ================= */
  SIMS["current-budget"] = (fig) => {
    const { controls, readout } = stage(fig, 10, 10, "Rough current draw. Stall a mecanum drive against a wall and four motors pull ~36 A, which sags the battery and browns out servos. Design so nothing stalls, and never run near the 20 A fuse for long.");
    fig.querySelector(".stage").remove();
    let motorsDriving = 4, motorsStalled = 0, servos = 4, hub = 0.5;
    const R = readouts(readout, [["cruise", "Cruising draw"], ["stall", "Stall draw"], ["fuse", "20 A fuse"]]);
    const calc = () => { const cruise = motorsDriving * 2 + servos * 0.3 + hub; const stall = motorsStalled * 9.2 + (motorsDriving - motorsStalled) * 2 + servos * 0.3 + hub; R.cruise.textContent = fmt(cruise, 1) + " A"; R.stall.textContent = fmt(stall, 1) + " A"; R.fuse.textContent = stall > 20 ? "would trip if sustained" : "ok"; R.fuse.style.color = stall > 20 ? "var(--bad)" : "var(--ok)"; };
    slider(controls, "Motors running (~2 A each)", 0, 8, 1, motorsDriving, v => { motorsDriving = v; motorsStalled = Math.min(motorsStalled, v); calc(); });
    slider(controls, "…of which stalled (~9 A each)", 0, 8, 1, motorsStalled, v => { motorsStalled = Math.min(v, motorsDriving); calc(); });
    slider(controls, "Servos loaded (~0.3 A each)", 0, 12, 1, servos, v => { servos = v; calc(); });
    calc();
  };

  /* ================= init ================= */
  SIMS.init = () => {
    document.querySelectorAll("[data-sim]").forEach(fig => {
      const kind = fig.getAttribute("data-sim"); const fn = SIMS[kind];
      if (!fn || fig.dataset.ready) return;
      try { fn(fig); fig.dataset.ready = "1"; } catch (e) { console.error("sim failed:", kind, e); fig.innerHTML = '<figcaption class="muted">Diagram failed to load (' + kind + ").</figcaption>"; }
    });
  };
  window.SIMS = SIMS;
})();
