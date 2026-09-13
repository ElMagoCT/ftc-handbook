/* =========================================================
   FTC Handbook — themed SVG graphics
   Usage: <div class="fig graphic" data-graphic="mecanum-drive"></div>
   Every drawing uses CSS variables, so it follows the color profile.
   Schematic style: top-down or side view, no photos.
   ========================================================= */
(function () {
  "use strict";
  const G = {};
  const W = 240, H = 180;
  const wrap = (inner, vb = `0 0 ${W} ${H}`) => `<svg viewBox="${vb}" class="gfx" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  // ---- primitives ----
  const body = (x, y, w, h, r = 10, cls = "g-body") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${cls}"/>`;
  const front = (cx, y) => `<path d="M${cx} ${y} l-7 11 h14 z" class="g-acc-fill"/>`;
  // wheel with roller hatches; dir = 1 or -1 for 45° roller angle, 0 for plain traction, 2 for omni (90°)
  const wheel = (x, y, w, h, dir = 0) => {
    let hatch = "";
    if (dir === 1 || dir === -1) for (let k = 0; k < 4; k++) hatch += `<line x1="${x + 3}" y1="${y + 5 + k * (h - 8) / 3 - 4 * dir}" x2="${x + w - 3}" y2="${y + 5 + k * (h - 8) / 3 + 4 * dir}" class="g-hatch"/>`;
    if (dir === 2) for (let k = 0; k < 4; k++) hatch += `<line x1="${x + 3}" y1="${y + 5 + k * (h - 8) / 3}" x2="${x + w - 3}" y2="${y + 5 + k * (h - 8) / 3}" class="g-hatch"/>`;
    if (dir === 0) hatch = `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="2" class="g-tread"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="g-wheel"/>${hatch}`;
  };
  const arrow = (x1, y1, x2, y2, cls = "g-acc", w = 2.5) => {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    return `<g class="${cls}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x2} ${y2} L${x2 - s * Math.cos(a - .5)} ${y2 - s * Math.sin(a - .5)} L${x2 - s * Math.cos(a + .5)} ${y2 - s * Math.sin(a + .5)} Z" stroke="none"/></g>`;
  };
  const gear = (cx, cy, r, teeth, cls = "g-gear") => {
    const m = r * 0.16; let d = "";
    for (let i = 0; i < teeth; i++) {
      const a0 = i / teeth * Math.PI * 2, st = Math.PI * 2 / teeth;
      [[r - m, a0], [r - m, a0 + st * .25], [r + m, a0 + st * .38], [r + m, a0 + st * .62], [r - m, a0 + st * .75], [r - m, a0 + st]].forEach(([rr, a], j) => { d += (i === 0 && j === 0 ? "M" : "L") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1) + " "; });
    }
    return `<path d="${d}Z" class="${cls}"/><circle cx="${cx}" cy="${cy}" r="${r * .18}" class="g-hole"/>`;
  };
  const label = (x, y, t, cls = "g-label", anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;
  const ball = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="g-ball"/>`;
  const spin = (cx, cy, r, cw = true) => `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}" class="g-acc" fill="none" stroke-width="2" ${cw ? "" : `transform="scale(-1 1) translate(${-2 * cx} 0)"`}/><path d="M ${cw ? cx + r : cx - r} ${cy} l ${cw ? -6 : 6} -8 l ${cw ? 8 : -8} -1 z" class="g-acc-fill"/>`;

  // ---- drivetrains (top-down) ----
  const chassis = (extra = "") => body(70, 30, 100, 120, 12) + front(120, 42) + extra;
  G["mecanum-drive"] = () => wrap(chassis() + wheel(52, 40, 18, 40, 1) + wheel(170, 40, 18, 40, -1) + wheel(52, 100, 18, 40, -1) + wheel(170, 100, 18, 40, 1) + arrow(120, 95, 120, 60, "g-ok") + arrow(120, 95, 160, 95, "g-ok") + arrow(120, 95, 150, 70, "g-ok") + label(120, 170, "rollers form an X from above"));
  G["tank-drive"] = () => wrap(chassis() + wheel(52, 36, 18, 34, 0) + wheel(52, 73, 18, 34, 0) + wheel(52, 110, 18, 34, 0) + wheel(170, 36, 18, 34, 0) + wheel(170, 73, 18, 34, 0) + wheel(170, 110, 18, 34, 0) + arrow(120, 100, 120, 62, "g-ok") + spin(120, 96, 20) + label(120, 170, "drives forward, turns in place, no strafe"));
  G["h-drive"] = () => wrap(chassis() + wheel(52, 40, 18, 40, 2) + wheel(170, 40, 18, 40, 2) + wheel(52, 100, 18, 40, 2) + wheel(170, 100, 18, 40, 2) + `<rect x="98" y="82" width="44" height="16" rx="4" class="g-wheel"/><line x1="104" y1="90" x2="136" y2="90" class="g-hatch"/>` + arrow(120, 120, 160, 120, "g-ok") + label(120, 170, "omni sides + one sideways wheel"));
  G["x-drive"] = () => wrap(body(70, 30, 100, 120, 30) + front(120, 42) + `<g transform="rotate(45 70 40)">${wheel(61, 20, 18, 40, 2)}</g><g transform="rotate(-45 170 40)">${wheel(161, 20, 18, 40, 2)}</g><g transform="rotate(-45 70 140)">${wheel(61, 120, 18, 40, 2)}</g><g transform="rotate(45 170 140)">${wheel(161, 120, 18, 40, 2)}</g>` + arrow(120, 95, 120, 62, "g-ok") + arrow(120, 95, 155, 95, "g-ok") + label(120, 172, "four omni wheels at 45°"));
  G["kiwi-drive"] = () => { const c = [120, 92]; let s = `<circle cx="120" cy="92" r="52" class="g-body"/>` + front(120, 50); [90, 210, 330].forEach(a => { const r = 58, x = c[0] + r * Math.cos(a * Math.PI / 180), y = c[1] + r * Math.sin(a * Math.PI / 180); s += `<g transform="rotate(${a + 90} ${x} ${y})">${wheel(x - 8, y - 17, 16, 34, 2)}</g>`; }); return wrap(s + label(120, 172, "three omni wheels, 120° apart")); };
  G["swerve-drive"] = () => { let s = chassis(); [[52, 40], [170, 40], [52, 100], [170, 100]].forEach(([x, y], i) => { const a = [20, -30, 60, -10][i]; s += `<g transform="rotate(${a} ${x + 9} ${y + 20})">${wheel(x, y, 18, 40, 0)}</g><circle cx="${x + 9}" cy="${y + 20}" r="4" class="g-acc-fill"/>`; }); return wrap(s + arrow(120, 95, 165, 60, "g-ok") + label(120, 172, "each wheel steers on its own")); };
  G["differential-swerve"] = () => wrap(`<circle cx="120" cy="85" r="60" class="g-body"/>` + gear(120, 85, 52, 40, "g-gear") + gear(120, 85, 30, 22, "g-gear2") + `<rect x="108" y="60" width="24" height="50" rx="5" class="g-wheel"/><circle cx="60" cy="150" r="14" class="g-motor"/><circle cx="180" cy="150" r="14" class="g-motor"/>` + label(60, 175, "motor A") + label(180, 175, "motor B") + label(120, 24, "two motors, one module"));
  G["ball-drive"] = () => wrap(body(70, 40, 100, 90, 14) + `<circle cx="120" cy="130" r="26" class="g-ball"/><circle cx="120" cy="130" r="26" class="g-outline" fill="none"/>` + label(120, 172, "a robot on a ball. fun. not a drivetrain."));
  G["omni-wheel"] = () => wrap(`<circle cx="120" cy="90" r="60" class="g-wheel"/>` + [...Array(12)].map((_, i) => { const a = i * 30 * Math.PI / 180; return `<rect x="-6" y="-14" width="12" height="28" rx="6" class="g-tread" transform="translate(${120 + 56 * Math.cos(a)} ${90 + 56 * Math.sin(a)}) rotate(${i * 30})"/>`; }).join("") + `<circle cx="120" cy="90" r="10" class="g-hole"/>`);

  // ---- intakes (side view) ----
  const floor = () => `<line x1="10" y1="150" x2="230" y2="150" class="g-floor"/>`;
  G["compliant-intake"] = () => wrap(floor() + body(120, 70, 100, 80, 8) + `<circle cx="112" cy="112" r="30" class="g-compliant"/>` + [...Array(8)].map((_, i) => { const a = i * 45 * Math.PI / 180; return `<line x1="${112 + 12 * Math.cos(a)}" y1="${112 + 12 * Math.sin(a)}" x2="${112 + 27 * Math.cos(a)}" y2="${112 + 27 * Math.sin(a)}" class="g-hatch"/>`; }).join("") + spin(112, 108, 38, false) + ball(55, 139) + arrow(70, 139, 92, 139, "g-ok") + label(120, 30, "squishy wheel grabs on contact, pulls it under"));
  G["counter-roller"] = () => wrap(floor() + `<circle cx="100" cy="70" r="22" class="g-compliant"/><circle cx="100" cy="128" r="22" class="g-compliant"/>` + spin(100, 66, 30, true) + `<g transform="scale(1 -1) translate(0 -256)">${spin(100, 128, 30, true)}</g>` + ball(50, 99) + arrow(60, 99, 80, 99, "g-ok") + arrow(122, 99, 170, 99, "g-ok") + label(120, 30, "two rollers pull it between them"));
  G["ramp-intake"] = () => wrap(floor() + `<path d="M40 150 L160 80 L230 80 L230 150 Z" class="g-body"/>` + ball(70, 133) + arrow(30, 140, 55, 128, "g-ok") + `<circle cx="150" cy="50" r="20" class="g-compliant"/>` + spin(150, 46, 26, false) + label(120, 172, "drive in, the ramp lifts it, a roller helps"));
  G["mecanum-roller"] = () => wrap(floor() + `<rect x="60" y="60" width="120" height="30" rx="8" class="g-wheel"/>` + [...Array(6)].map((_, i) => `<line x1="${68 + i * 18}" y1="64" x2="${78 + i * 18}" y2="86" class="g-hatch"/>`).join("") + ball(75, 118) + arrow(88, 118, 118, 118, "g-ok") + label(120, 40, "angled rollers push it toward the center") + label(120, 172, "as they pull it in"));
  // ---- claws ----
  G["pincher-claw"] = () => wrap(`<rect x="105" y="20" width="30" height="40" rx="6" class="g-motor"/><path d="M92 60 L70 130 L84 134 L104 66 Z" class="g-body"/><path d="M148 60 L170 130 L156 134 L136 66 Z" class="g-body"/>` + ball(120, 120, 16) + arrow(60, 100, 82, 108, "g-acc") + arrow(180, 100, 158, 108, "g-acc") + label(120, 168, "servo squeezes two fingers"));
  G["roller-claw"] = () => wrap(`<rect x="105" y="16" width="30" height="34" rx="6" class="g-motor"/><path d="M80 50 h80 v40 h-80 z" class="g-body"/><circle cx="90" cy="118" r="18" class="g-compliant"/><circle cx="150" cy="118" r="18" class="g-compliant"/>` + spin(90, 114, 24, true) + spin(150, 114, 24, false) + ball(120, 120, 15) + label(120, 168, "rollers pull in, spin out to release"));
  G["hybrid-claw"] = () => wrap(`<rect x="105" y="16" width="30" height="30" rx="6" class="g-motor"/><path d="M90 46 L72 120 L84 124 L100 52 Z" class="g-body"/><path d="M150 46 L168 120 L156 124 L140 52 Z" class="g-body"/><circle cx="92" cy="112" r="14" class="g-compliant"/><circle cx="148" cy="112" r="14" class="g-compliant"/>` + spin(92, 108, 19, true) + spin(148, 108, 19, false) + ball(120, 118, 14) + label(120, 168, "rollers grab, fingers lock"));
  G["wrist"] = () => wrap(`<rect x="40" y="80" width="80" height="20" rx="6" class="g-body"/><circle cx="130" cy="90" r="16" class="g-motor"/><g transform="rotate(-30 130 90)"><rect x="130" y="82" width="70" height="16" rx="5" class="g-acc-stroke"/></g>` + spin(130, 90, 30, true) + label(120, 160, "servo between arm and claw"));

  // ---- arms & linear (side view) ----
  G["pivot-arm"] = () => wrap(floor() + `<rect x="40" y="120" width="70" height="30" rx="5" class="g-body"/><circle cx="75" cy="120" r="10" class="g-motor"/><g transform="rotate(-35 75 120)"><rect x="75" y="114" width="130" height="12" rx="5" class="g-arm"/></g>` + ball(190, 55, 12) + arrow(190, 70, 190, 105, "g-bad") + label(75, 172, "one motor, one pivot") + label(200, 130, "weight × reach = torque", "g-label", "end"));
  G["four-bar"] = () => wrap(floor() + `<rect x="30" y="110" width="50" height="40" rx="5" class="g-body"/>` + `<line x1="55" y1="115" x2="165" y2="60" class="g-arm-line"/><line x1="55" y1="140" x2="165" y2="85" class="g-arm-line2"/><rect x="160" y="50" width="16" height="45" rx="4" class="g-acc-stroke"/>` + [[55, 115], [55, 140], [165, 60], [165, 85]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" class="g-pin"/>`).join("") + label(120, 172, "parallel links keep the plate level"));
  G["virtual-four-bar"] = () => wrap(floor() + `<rect x="30" y="110" width="50" height="40" rx="5" class="g-body"/><circle cx="55" cy="125" r="16" class="g-pulley"/><line x1="55" y1="125" x2="170" y2="70" class="g-arm-line"/><circle cx="170" cy="70" r="16" class="g-pulley"/><line x1="49" y1="110" x2="164" y2="55" class="g-belt"/><line x1="61" y1="140" x2="176" y2="85" class="g-belt"/><rect x="164" y="40" width="14" height="40" rx="4" class="g-acc-stroke"/>` + label(120, 172, "belt anchored to the base levels the end"));
  G["segmented-arm"] = () => wrap(floor() + `<rect x="30" y="120" width="50" height="30" rx="5" class="g-body"/><circle cx="55" cy="120" r="8" class="g-motor"/><line x1="55" y1="120" x2="120" y2="60" class="g-arm-line"/><circle cx="120" cy="60" r="8" class="g-motor"/><line x1="120" y1="60" x2="195" y2="80" class="g-arm-line"/><circle cx="195" cy="80" r="8" class="g-motor"/>` + label(120, 172, "every joint is a motor and an encoder"));
  G["linear-slides"] = () => wrap(floor() + `<rect x="60" y="100" width="120" height="50" rx="5" class="g-body"/><rect x="70" y="60" width="16" height="90" rx="3" class="g-slide"/><rect x="88" y="30" width="14" height="120" rx="3" class="g-slide2"/><rect x="104" y="10" width="12" height="140" rx="3" class="g-acc-stroke"/>` + arrow(140, 90, 140, 25, "g-ok") + label(160, 60, "stages nest", "g-label", "start") + label(120, 172, "rails on bearings, driven by string or belt"));
  G["rack-pinion"] = () => wrap(floor() + `<rect x="30" y="90" width="180" height="14" rx="2" class="g-slide"/>` + [...Array(15)].map((_, i) => `<rect x="${34 + i * 12}" y="84" width="6" height="6" class="g-tooth"/>`).join("") + gear(120, 62, 22, 14) + arrow(140, 120, 190, 120, "g-ok") + label(120, 172, "gear rolls along a toothed bar"));
  G["linear-actuator"] = () => wrap(floor() + `<rect x="40" y="80" width="80" height="26" rx="6" class="g-motor"/><rect x="120" y="86" width="70" height="14" rx="3" class="g-slide"/>` + [...Array(9)].map((_, i) => `<line x1="${124 + i * 7}" y1="86" x2="${128 + i * 7}" y2="100" class="g-hatch"/>`).join("") + arrow(150, 120, 195, 120, "g-ok") + label(120, 172, "lead screw: slow, strong, holds position"));
  G["scissor-lift"] = () => wrap(floor() + `<rect x="50" y="140" width="140" height="10" rx="3" class="g-body"/>` + [0, 1, 2].map(i => `<line x1="70" y1="${140 - i * 40}" x2="170" y2="${100 - i * 40}" class="g-arm-line2"/><line x1="170" y1="${140 - i * 40}" x2="70" y2="${100 - i * 40}" class="g-arm-line2"/>`).join("") + `<rect x="60" y="14" width="120" height="8" rx="3" class="g-bad-stroke"/>` + arrow(200, 70, 215, 40, "g-bad") + label(120, 172, "wobbles, binds, and fights hardest at the bottom"));
  // ---- launch ----
  G["flywheel"] = () => wrap(`<circle cx="90" cy="95" r="42" class="g-wheel"/><circle cx="90" cy="95" r="28" class="g-hole"/>` + spin(90, 91, 50, true) + `<path d="M40 150 Q 20 100 60 60" class="g-hood" fill="none"/>` + ball(140, 95, 12) + arrow(155, 88, 215, 40, "g-ok") + label(120, 172, "spinning mass flings the element"));
  G["catapult"] = () => wrap(floor() + `<rect x="40" y="120" width="120" height="30" rx="5" class="g-body"/><g transform="rotate(-40 70 120)"><rect x="70" y="114" width="110" height="10" rx="4" class="g-arm"/></g>` + ball(148, 44, 12) + arrow(160, 40, 205, 20, "g-ok") + `<path d="M70 120 q30 -40 60 -30" class="g-spring" fill="none"/>` + label(120, 172, "stored energy released all at once"));
  G["turret"] = () => wrap(`<circle cx="120" cy="100" r="60" class="g-body"/><circle cx="120" cy="100" r="60" class="g-outline" fill="none"/><rect x="110" y="30" width="20" height="70" rx="6" class="g-arm"/>` + spin(120, 100, 75, true) + label(120, 172, "aim without turning the robot"));
  // ---- transmission ----
  G["direct-drive"] = () => wrap(`<rect x="40" y="70" width="80" height="50" rx="8" class="g-motor"/><rect x="120" y="90" width="30" height="10" class="g-shaft"/><rect x="150" y="55" width="30" height="80" rx="6" class="g-wheel"/>` + label(120, 160, "wheel straight on the motor shaft"));
  G["spur-gears"] = () => wrap(gear(80, 90, 44, 20) + gear(160, 90, 30, 14, "g-gear2") + spin(80, 90, 56, true) + spin(160, 90, 42, false) + label(120, 170, "straight teeth, exact center distance"));
  G["bevel-gears"] = () => wrap(`<path d="M60 120 L60 60 L120 80 L120 100 Z" class="g-gear"/>` + [...Array(6)].map((_, i) => `<line x1="60" y1="${64 + i * 10}" x2="120" y2="${82 + i * 3.4}" class="g-hatch"/>`).join("") + `<path d="M120 80 L180 60 L180 120 L120 100 Z" class="g-gear2" transform="rotate(90 150 90) translate(0 -30)"/>` + arrow(40, 90, 55, 90, "g-acc") + arrow(150, 45, 150, 30, "g-acc") + label(120, 170, "turns rotation 90°"));
  G["worm-gear"] = () => wrap(`<rect x="30" y="80" width="130" height="24" rx="12" class="g-shaft2"/>` + [...Array(10)].map((_, i) => `<line x1="${40 + i * 12}" y1="80" x2="${48 + i * 12}" y2="104" class="g-hatch"/>`).join("") + gear(160, 60, 34, 22, "g-gear2") + arrow(20, 92, 30, 92, "g-acc") + label(120, 170, "huge reduction, cannot be back-driven"));
  G["chain-drive"] = () => wrap(gear(70, 90, 30, 16) + gear(170, 90, 22, 12, "g-gear2") + `<path d="M70 58 L170 66 M70 122 L170 114" class="g-chain"/>` + [...Array(9)].map((_, i) => `<circle cx="${75 + i * 12}" cy="${58.8 + i * .9}" r="2.5" class="g-pin"/><circle cx="${75 + i * 12}" cy="${121 - i * .9}" r="2.5" class="g-pin"/>`).join("") + label(120, 170, "forgiving spacing, needs a tensioner"));
  G["belt-drive"] = () => wrap(`<circle cx="70" cy="90" r="30" class="g-pulley"/><circle cx="170" cy="90" r="20" class="g-pulley"/><path d="M70 60 L170 70 M70 120 L170 110" class="g-belt"/>` + [...Array(12)].map((_, i) => `<line x1="${72 + i * 8}" y1="${60 + i * .8}" x2="${72 + i * 8}" y2="${64 + i * .8}" class="g-hatch"/>`).join("") + label(120, 170, "quiet, low backlash, slips instead of breaking"));
  G["planetary"] = () => wrap(`<circle cx="120" cy="90" r="64" class="g-ring"/>` + gear(120, 90, 22, 12, "g-gear2") + [0, 120, 240].map(a => gear(120 + 40 * Math.cos(a * Math.PI / 180), 90 + 40 * Math.sin(a * Math.PI / 180), 17, 10)).join("") + label(120, 172, "sun, planets, ring"));
  G["herringbone"] = () => wrap(`<rect x="50" y="60" width="140" height="60" rx="6" class="g-gear"/>` + [...Array(10)].map((_, i) => `<path d="M${58 + i * 13} 64 l6 26 l-6 26" class="g-hatch" fill="none"/>`).join("") + label(120, 160, "angled teeth, thrust cancels"));
  G["cycloidal"] = () => wrap(`<circle cx="120" cy="90" r="60" class="g-ring"/>` + [...Array(12)].map((_, i) => { const a = i * 30 * Math.PI / 180; return `<circle cx="${120 + 52 * Math.cos(a)}" cy="${90 + 52 * Math.sin(a)}" r="6" class="g-pin"/>`; }).join("") + `<path d="${[...Array(60)].map((_, i) => { const t = i / 60 * Math.PI * 2; const r = 40 + 6 * Math.cos(11 * t); return (i ? "L" : "M") + (126 + r * Math.cos(t)).toFixed(1) + " " + (90 + r * Math.sin(t)).toFixed(1); }).join(" ")}Z" class="g-gear2"/>` + label(120, 172, "lobed disc in a ring of pins"));
  G["capstan"] = () => wrap(`<circle cx="70" cy="90" r="22" class="g-pulley"/><circle cx="170" cy="90" r="44" class="g-pulley"/><path d="M70 68 C 120 60, 130 50, 170 46 M70 112 C 120 120, 130 130, 170 134" class="g-cable"/>` + label(120, 170, "cable wrapped on drums: zero backlash"));
  G["differential"] = () => wrap(gear(120, 90, 40, 24) + `<rect x="30" y="85" width="50" height="10" class="g-shaft"/><rect x="160" y="85" width="50" height="10" class="g-shaft"/>` + gear(60, 90, 16, 10, "g-gear2") + gear(180, 90, 16, 10, "g-gear2") + label(120, 170, "splits or combines two inputs"));
  G["ratchet"] = () => wrap(`<circle cx="110" cy="95" r="46" class="g-gear"/>` + [...Array(12)].map((_, i) => { const a = i * 30 * Math.PI / 180, b = (i * 30 + 14) * Math.PI / 180; return `<path d="M${110 + 46 * Math.cos(a)} ${95 + 46 * Math.sin(a)} L${110 + 56 * Math.cos(b)} ${95 + 56 * Math.sin(b)} L${110 + 46 * Math.cos(b + .12)} ${95 + 46 * Math.sin(b + .12)}" class="g-tooth"/>`; }).join("") + `<path d="M175 40 L150 62" class="g-arm-line"/><circle cx="175" cy="40" r="5" class="g-pin"/>` + spin(110, 95, 68, true) + label(120, 172, "spins one way, locks the other"));
  G["bowden"] = () => wrap(`<rect x="20" y="70" width="40" height="30" rx="6" class="g-motor"/><path d="M60 85 C 100 85, 100 130, 150 130 S 200 60, 215 60" class="g-cable" fill="none"/><path d="M60 85 C 100 85, 100 130, 150 130 S 200 60, 215 60" class="g-sheath" fill="none"/>` + label(120, 170, "servo here, motion over there"));
  G["constant-force"] = () => wrap(`<circle cx="70" cy="70" r="30" class="g-spring"/><circle cx="70" cy="70" r="20" class="g-spring"/><circle cx="70" cy="70" r="10" class="g-spring"/><line x1="70" y1="40" x2="200" y2="40" class="g-belt"/><rect x="195" y="30" width="20" height="60" rx="4" class="g-slide"/>` + arrow(190, 110, 110, 110, "g-ok") + label(120, 170, "same pull at any extension"));
  G["hook"] = () => wrap(`<rect x="100" y="100" width="14" height="60" rx="3" class="g-slide"/><path d="M107 100 V 60 Q 107 30 137 30 Q 160 30 160 52" class="g-arm-line" fill="none"/><line x1="40" y1="40" x2="200" y2="40" class="g-bar"/>` + label(120, 175, "shaped hook on a slide, ratchet below"));
  G["motor"] = () => wrap(`<rect x="60" y="60" width="90" height="60" rx="8" class="g-motor"/><rect x="150" y="70" width="30" height="40" rx="4" class="g-gearbox"/><rect x="180" y="85" width="30" height="10" class="g-shaft"/><rect x="30" y="80" width="30" height="20" rx="3" class="g-encoder"/>` + label(105, 150, "motor · gearbox · hex output"));

  // ---- Onshape configuration mock-ups ----
  const panel = (rows) => wrap(`<rect x="10" y="10" width="220" height="${40 + rows.length * 40}" rx="8" class="g-panel"/><text x="24" y="36" class="g-ui-title">Configurations</text><rect x="196" y="22" width="18" height="16" rx="3" class="g-ui-icon"/>` + rows.join(""), `0 0 240 ${60 + rows.length * 40}`);
  G["config-variable"] = () => panel([`<text x="24" y="78" class="g-ui">Length</text><line x1="90" y1="82" x2="214" y2="82" class="g-ui-line"/><text x="214" y="78" text-anchor="end" class="g-ui-val">750 mm</text>`, `<text x="24" y="118" class="g-ui">Width</text><line x1="90" y1="122" x2="214" y2="122" class="g-ui-line"/><text x="214" y="118" text-anchor="end" class="g-ui-val">686 mm</text>`]);
  G["config-checkbox"] = () => panel([`<rect x="24" y="64" width="16" height="16" rx="3" class="g-ui-check"/><path d="M27 72 l4 4 l7 -8" class="g-ui-tick" fill="none"/><text x="50" y="77" class="g-ui">Lightening pattern</text>`, `<rect x="24" y="104" width="16" height="16" rx="3" class="g-ui-check-off"/><text x="50" y="117" class="g-ui">Sensor mount</text>`]);
  G["config-list"] = () => panel([`<text x="24" y="78" class="g-ui">Position</text><rect x="90" y="62" width="124" height="24" rx="4" class="g-ui-select"/><text x="100" y="79" class="g-ui-val">Stowed</text><path d="M200 71 l5 6 l5 -6" class="g-ui-tick" fill="none"/>`, `<text x="24" y="118" class="g-ui">Channel</text><rect x="90" y="102" width="124" height="24" rx="4" class="g-ui-select"/><text x="100" y="119" class="g-ui-val">336 mm</text><path d="M200 111 l5 6 l5 -6" class="g-ui-tick" fill="none"/>`]);

  // ---- decision maps (flowcharts) ----
  const node = (x, y, w, h, t, cls = "g-node") => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8" class="${cls}"/>` + t.split("\n").map((l, i, a) => `<text x="${x}" y="${y + 4 + (i - (a.length - 1) / 2) * 13}" text-anchor="middle" class="g-node-text">${l}</text>`).join("");
  const edge = (x1, y1, x2, y2, t) => arrow(x1, y1, x2, y2, "g-edge", 1.5) + (t ? `<text x="${(x1 + x2) / 2 + 6}" y="${(y1 + y2) / 2 - 4}" class="g-edge-text">${t}</text>` : "");
  G["map-drivetrain"] = () => wrap(
    node(300, 30, 200, 36, "Do you need to strafe?", "g-node-q") +
    edge(250, 48, 140, 88, "no") + edge(350, 48, 460, 88, "yes") +
    node(120, 110, 180, 44, "Pushing game or\nrookie month?", "g-node-q") + node(480, 110, 180, 44, "Veteran team with a\nfull pre-season?", "g-node-q") +
    edge(80, 132, 60, 178, "yes") + edge(160, 132, 200, 178, "no") + edge(440, 132, 380, 178, "no") + edge(520, 132, 540, 178, "yes") +
    node(60, 200, 110, 40, "Tank", "g-node-a") + node(210, 200, 130, 40, "Mecanum", "g-node-a") + node(370, 200, 130, 40, "Mecanum", "g-node-a") + node(550, 200, 120, 40, "Swerve\n(if you must)", "g-node-w"),
    "0 0 600 240");
  G["map-intake"] = () => wrap(
    node(300, 30, 240, 36, "Where does the element come from?", "g-node-q") +
    edge(200, 48, 110, 88, "floor") + edge(300, 48, 300, 88, "human player") + edge(400, 48, 490, 88, "fixed spot") +
    node(110, 110, 170, 44, "Approach angle\nsloppy?", "g-node-q") + node(300, 110, 170, 44, "Handed to you\nalready aligned", "g-node") + node(490, 110, 170, 44, "Precise placement\nmatters more?", "g-node-q") +
    edge(70, 132, 50, 178, "yes") + edge(150, 132, 180, 178, "no") + edge(300, 132, 300, 178, "") + edge(450, 132, 420, 178, "yes") + edge(530, 132, 550, 178, "no") +
    node(50, 200, 110, 40, "Compliant\nwheels", "g-node-a") + node(185, 200, 120, 40, "Counter rollers", "g-node-a") + node(300, 200, 110, 40, "Simple claw\nor ramp", "g-node-a") + node(420, 200, 110, 40, "Claw + wrist", "g-node-a") + node(550, 200, 110, 40, "Roller claw", "g-node-a"),
    "0 0 600 240");
  G["map-localization"] = () => wrap(
    node(300, 30, 220, 36, "How good does the auto need to be?", "g-node-q") +
    edge(220, 48, 100, 88, "just move") + edge(300, 48, 300, 88, "score reliably") + edge(380, 48, 500, 88, "score a lot") +
    node(100, 110, 160, 44, "Drive encoders\n+ IMU", "g-node-a") + node(300, 110, 170, 44, "Dead wheels + Pinpoint\nor OTOS", "g-node-a") + node(500, 110, 170, 44, "Odometry + AprilTag\ncorrection", "g-node-a") +
    node(100, 190, 160, 40, "free · slips on mecanum", "g-node") + node(300, 190, 170, 40, "~$100–280 · the standard", "g-node") + node(500, 190, 170, 40, "+ camera or Limelight", "g-node"),
    "0 0 600 230");
  G["map-awards"] = () => wrap(
    node(300, 28, 240, 34, "What is your strongest story?", "g-node-q") +
    edge(190, 45, 80, 82, "") + edge(260, 45, 210, 82, "") + edge(330, 45, 380, 82, "") + edge(400, 45, 520, 82, "") +
    node(80, 104, 140, 44, "We tested and\niterated, with math", "g-node") + node(210, 104, 130, 44, "A mechanism nobody\nelse has", "g-node") + node(380, 104, 140, 44, "Sensors run\nthe robot", "g-node") + node(520, 104, 140, 44, "We brought people\ninto FIRST", "g-node") +
    edge(80, 126, 80, 160, "") + edge(210, 126, 210, 160, "") + edge(380, 126, 380, 160, "") + edge(520, 126, 520, 160, "") +
    node(80, 182, 120, 40, "Think", "g-node-a") + node(210, 182, 120, 40, "Innovate", "g-node-a") + node(380, 182, 120, 40, "Control", "g-node-a") + node(520, 182, 120, 40, "Reach", "g-node-a") +
    node(300, 228, 320, 30, "All four at once, with a plan and a budget → Inspire", "g-node-w"),
    "0 0 600 260");
  G["map-material"] = () => wrap(
    node(300, 28, 240, 34, "What does the part have to do?", "g-node-q") +
    edge(200, 45, 90, 82, "") + edge(270, 45, 230, 82, "") + edge(330, 45, 370, 82, "") + edge(400, 45, 510, 82, "") +
    node(90, 104, 150, 44, "Carry the robot\nor a big load", "g-node") + node(230, 104, 130, 44, "Guide game\nelements", "g-node") + node(370, 104, 130, 44, "Complex shape,\nmoderate load", "g-node") + node(510, 104, 150, 44, "Grip or\ncushion", "g-node") +
    edge(90, 126, 90, 160, "") + edge(230, 126, 230, 160, "") + edge(370, 126, 370, 160, "") + edge(510, 126, 510, 160, "") +
    node(90, 182, 150, 40, "Aluminum\n(or CF plate)", "g-node-a") + node(230, 182, 130, 40, "Polycarbonate", "g-node-a") + node(370, 182, 130, 40, "PETG / nylon\nprint, 4 walls", "g-node-a") + node(510, 182, 150, 40, "TPU print or\nsilicone", "g-node-a"),
    "0 0 600 220");

  // ---- energy losses ----
  G["energy-losses"] = () => {
    const segs = [["battery sag & wiring", 8, "g-seg1"], ["motor heat (I²R)", 30, "g-seg2"], ["gearbox friction", 12, "g-seg3"], ["chain / belt / gears", 8, "g-seg4"], ["bearings, slides, rubbing", 7, "g-seg5"], ["wheel slip", 5, "g-seg6"], ["useful work", 30, "g-seg-ok"]];
    let x = 20, s = `<text x="20" y="22" class="g-label" text-anchor="start">100% from the battery →</text>`;
    segs.forEach(([t, pct, cls]) => { const w = pct * 5.6; s += `<rect x="${x}" y="34" width="${w}" height="34" class="${cls}"/>` + (w > 30 ? `<text x="${x + w / 2}" y="56" text-anchor="middle" class="g-seg-text">${pct}%</text>` : ""); x += w; });
    s += segs.map(([t, , cls], i) => `<rect x="${20 + (i % 3) * 190}" y="${92 + Math.floor(i / 3) * 24}" width="12" height="12" rx="2" class="${cls}"/><text x="${38 + (i % 3) * 190}" y="${102 + Math.floor(i / 3) * 24}" class="g-label" text-anchor="start">${t}</text>`).join("");
    s += `<text x="20" y="182" text-anchor="start" class="g-label">Rough numbers for a drivetrain under load.</text><text x="20" y="196" text-anchor="start" class="g-label">A binding slide or a stalled motor moves whole bars to the left.</text>`;
    return wrap(s, "0 0 600 206");
  };

  // ---- season / misc ----
  G["field"] = () => wrap(`<rect x="20" y="20" width="200" height="140" rx="4" class="g-body"/>` + [...Array(5)].map((_, i) => `<line x1="${20 + (i + 1) * 200 / 6}" y1="20" x2="${20 + (i + 1) * 200 / 6}" y2="160" class="g-grid"/>`).join("") + [...Array(5)].map((_, i) => `<line x1="20" y1="${20 + (i + 1) * 140 / 6}" x2="220" y2="${20 + (i + 1) * 140 / 6}" class="g-grid"/>`).join("") + `<rect x="30" y="30" width="30" height="30" rx="3" class="g-red"/><rect x="180" y="120" width="30" height="30" rx="3" class="g-blue"/>` + label(120, 175, "3.66 m × 3.66 m (12 ft), 610 mm tiles"));

  // ---- render ----
  G.init = () => {
    document.querySelectorAll("[data-graphic]").forEach(el => {
      if (el.dataset.ready) return;
      const fn = G[el.getAttribute("data-graphic")];
      if (!fn) { el.innerHTML = '<span class="muted small">graphic missing</span>'; return; }
      try { el.innerHTML = fn(); el.dataset.ready = "1"; } catch (e) { console.error("graphic failed", el.getAttribute("data-graphic"), e); }
    });
  };
  window.GRAPHICS = G;
  document.addEventListener("DOMContentLoaded", G.init);
})();
