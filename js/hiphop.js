// 《大嘻哈時代3》's stage, in bricks: a raised black stage edged in neon; behind it a great LED wall (the show's
// graffiti logo, the contestant's name card, a visualiser that bounces with the beat, gold chains when someone
// goes through); graffiti walls either side; a DJ booth with two turntables; speaker stacks; the microphone stand
// in the middle; flame jets along the front. Facing the stage, the judges' desk for three, each place with its own
// chain that lights gold; behind them the audience on risers, who bounce with the beat, laugh, cheer and clap.
//   const st = hiphop(scene, O); st.screen('name', { name, sub }); st.beat(bpm, t0); st.chain(i, true);
//   st.crowd('bounce'); st.lights('party'); st.flames(); st.confetti(); st.reset()   — on the set's own clock (tick(dt))
import * as THREE from '../lib/three.module.min.js';
import { kit, P, BH, PH } from './brick/bricks.js';
import { plastic, rbox } from './brick/minifig.js';

// where people stand (in the set's own coordinates; +z is toward the judges and the audience)
export const HIPHOP = {
  mic: [0, -1.5], stage: [0, -2.2], wingL: [-5.6, -2.6], wingR: [5.6, -2.6], dj: [-3.1, -3.6],
  judge(i) { return [(i - 1) * 1.7, 3.35]; }, // the three seats, facing the stage
  room: [-9.6, 9.6, -6.0, 10.6, 7.0],
  STAGE_Y: 0,
};
const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
const FONT = '"Noto Sans TC", sans-serif';

// ---------------------------------------------------------------- what the LED wall shows
function graffiti(g, text, x, y, size, fill, stroke = '#120a1e', rot = -0.06) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size / 4; g.strokeStyle = stroke; g.strokeText(text, 0, 0); g.lineWidth = size / 10; g.strokeStyle = '#ffffff'; g.strokeText(text, 0, 0); g.fillStyle = fill; g.fillText(text, 0, 0); g.restore();
}
function drawScreen(g, W, H, mode, d = {}, t = 0, pulse = 0) {
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#12052a'); bg.addColorStop(0.5, '#2a0640'); bg.addColorStop(1, '#05122a'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // the LED grid
  g.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = 0; x < W; x += 8) g.fillRect(x, 0, 2, H); for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 2);
  const neon = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#fff36a'); gr.addColorStop(0.5, '#ff9a1a'); gr.addColorStop(1, '#ff3a8a'); return gr; };
  if (mode === 'logo') {
    for (let i = 0; i < 26; i++) { const r = rng(i + 4); g.fillStyle = ['#ff3a8a', '#3ae8ff', '#fff36a', '#8a5aff'][i % 4]; g.globalAlpha = 0.25; g.beginPath(); g.arc(r() * W, r() * H, 6 + r() * 26, 0, 7); g.fill(); }
    g.globalAlpha = 1; graffiti(g, '大嘻哈時代', W / 2, H * 0.4, 150 + pulse * 10, neon(H * 0.3, H * 0.5));
    graffiti(g, '3', W * 0.84, H * 0.62, 230 + pulse * 18, '#3ae8ff', '#120a1e', 0.12); g.font = `800 40px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('30 秒 定生死', W / 2, H * 0.8);
  }
  if (mode === 'name') { // the contestant's card
    graffiti(g, d.name, W / 2, H * 0.42, Math.min(170, 1500 / Math.max(3, [...d.name].length * 1.1)), neon(H * 0.3, H * 0.55));
    g.font = `700 46px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.sub || '', W / 2, H * 0.72);
    if (d.style) { g.font = `900 38px ${FONT}`; g.fillStyle = '#3ae8ff'; g.fillText(d.style, W / 2, H * 0.86); }
  }
  if (mode === 'live') { // a visualiser and a countdown
    const n = 40, bw = W / n; for (let i = 0; i < n; i++) { const r = rng(i * 7 + Math.floor(t * 12)); const h = (0.15 + r() * 0.35 + pulse * (0.35 + 0.3 * Math.sin(i * 0.6 + t * 3))) * H * 0.6; g.fillStyle = `hsl(${(i * 9 + t * 60) % 360},95%,60%)`; g.fillRect(i * bw + 3, H - h, bw - 6, h); }
    graffiti(g, d.name || '', W / 2, H * 0.22, 90, neon(H * 0.15, H * 0.3)); const left = Math.max(0, Math.ceil(d.left ?? 30));
    g.font = `900 120px ${FONT}`; g.textAlign = 'right'; g.fillStyle = left <= 5 ? '#ff3a3a' : '#ffffff'; g.fillText(String(left).padStart(2, '0'), W - 40, 100);
  }
  if (mode === 'chains') { // how many chains: three gold rings, lit or dark
    graffiti(g, d.name || '', W / 2, H * 0.2, 80, '#fff');
    for (let i = 0; i < 3; i++) { const x = W / 2 + (i - 1) * 300, y = H * 0.6, on = d.on?.[i]; g.lineWidth = 34; g.strokeStyle = on ? '#ffd23a' : '#3a2a4a'; g.shadowColor = '#ffb81a'; g.shadowBlur = on ? 40 : 0; g.beginPath(); g.ellipse(x, y, 100, 120, 0, 0, 7); g.stroke(); g.shadowBlur = 0; }
    if (d.verdict) graffiti(g, d.verdict, W / 2, H * 0.6, 150, d.verdict === '晉級' ? neon(H * 0.5, H * 0.7) : '#888', '#120a1e', -0.1);
  }
  if (mode === 'text') { graffiti(g, d.text, W / 2, H * 0.48, d.size || 130, d.fill || neon(H * 0.35, H * 0.6)); if (d.sub) { g.font = `700 44px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(d.sub, W / 2, H * 0.78); } }
  if (mode === 'off') { g.fillStyle = '#050508'; g.fillRect(0, 0, W, H); }
}
function wallArt(seed, base) { // a graffiti wall texture
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 14; i++) { g.fillStyle = ['#ff3a8a', '#3ae8ff', '#fff36a', '#8a5aff', '#5aff8a'][i % 5]; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 40 + r() * 120, 20 + r() * 60, r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1; const tags = ['HIP HOP', 'FLOW', '嘻哈', 'YO!', 'MIC', '饒舌', 'BEAT', 'RAP 3'];
  for (let i = 0; i < 6; i++) graffiti(g, tags[(i + seed) % tags.length], 120 + r() * 800, 80 + r() * 360, 60 + r() * 60, ['#ff3a8a', '#3ae8ff', '#fff36a', '#5aff8a'][i % 4], '#0a0614', (r() - 0.5) * 0.4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function hiphop(scene, O) {
  const G = new THREE.Group(); G.position.set(O.x, -PH, O.z); scene.add(G); const K = kit(G), lamps = [];
  const at = (m, x, y, z, ry = 0) => { m.position.set(O.x + x, y, O.z + z); m.rotation.y = ry; m.userData.setPiece = true; scene.add(m); return m; };
  const mk = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return at(m, x, y, z, ry); };
  K.baseplate(0, 2, 80, 80, '#0c0c14');
  // ---- the stage: two bricks high, black and glossy, a neon edge along the front
  const SX = 7.2, SZ0 = -5.4, SZ1 = -0.6;
  for (let x = -SX + 2 * P; x < SX; x += 4 * P) for (let z = SZ0 + 2 * P; z < SZ1; z += 4 * P) K.brick(x, 0, z, 4, 4, 'tile', (Math.round(x / 1.2) + Math.round(z / 1.2)) % 2 ? '#14141c' : '#22222e');
  for (let x = -SX + P; x < SX; x += 2 * P) K.brick(x, 0, SZ1 + 0.15, 2, 1, 'tile', '#3ae8ff', 0, 'glow'); // the neon lip
  // ---- the LED wall and its frame
  const SW = 9.6, SH = 4.4, cv = document.createElement('canvas'); cv.width = 1280; cv.height = 586; const sg = cv.getContext('2d'); const stex = new THREE.CanvasTexture(cv); stex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false })); at(scr, 0, HIPHOP.STAGE_Y + 0.45 + SH / 2, SZ0 + 0.02);
  for (let x = -SW / 2 - 0.15; x <= SW / 2 + 0.16; x += 2 * P) { K.brick(x, 0, SZ0 - 0.05, 2, 1, 'brick', '#2a2a32'); K.brick(x, SH + 0.45, SZ0 - 0.05, 2, 1, 'plate', '#2a2a32'); }
  for (let x = -9.6 + 2 * P; x < 9.7; x += 4 * P) for (let r = 0; r < 20; r++) K.brick(x, r * BH, SZ0 - 0.4, 4, 1, 'brick', r % 5 === 4 ? '#2a1a3a' : '#121218');
  // graffiti on the side walls
  for (const s of [-1, 1]) {
    for (let z = SZ0 - 0.2; z < 10.4; z += 4 * P) for (let r = 0; r < 20; r++) K.brick(s * 9.9, r * BH, z, 1, 4, 'brick', '#16161e');
    const art = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.2), new THREE.MeshStandardMaterial({ map: wallArt(s > 0 ? 3 : 8, '#1e1a2a'), roughness: 0.8 })); at(art, s * 9.72, 2.6, 0.2, -s * Math.PI / 2);
  }
  for (let x = -9.6 + 2 * P; x < 9.7; x += 4 * P) for (let r = 0; r < 20; r++) K.brick(x, r * BH, 10.8, 4, 1, 'brick', '#0e0e14');
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 17), new THREE.MeshStandardMaterial({ color: '#05050a', roughness: 1 })); ceil.rotation.x = Math.PI / 2; at(ceil, 0, 7.2, 2.4);
  // ---- speaker stacks
  const spk = plastic('#141418', { roughness: 0.6 }), cone = plastic('#2a2a30', { roughness: 0.4 });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const y = HIPHOP.STAGE_Y + k * 0.95 + 0.47; mk(rbox(1.3, 0.92, 0.9, 0.04), spk, s * 6.2, y, -4.5); for (const yy of [-0.2, 0.22]) mk(new THREE.CylinderGeometry(yy < 0 ? 0.32 : 0.18, yy < 0 ? 0.32 : 0.18, 0.06, 24).rotateX(Math.PI / 2), cone, s * 6.2, y + yy, -4.03); }
  // ---- the DJ booth: a desk, two turntables that spin, a mixer, a laptop with a glowing apple-less lid
  const djx = HIPHOP.dj[0], djz = HIPHOP.dj[1] - 0.6;
  mk(rbox(2.2, 0.85, 0.8, 0.05), plastic('#1a1a22'), djx, HIPHOP.STAGE_Y + 0.42, djz); const front = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.7), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 170; const g = c.getContext('2d'); g.fillStyle = '#0a0a12'; g.fillRect(0, 0, 512, 170); graffiti(g, 'DJ', 256, 90, 110, '#ff3a8a'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false })); at(front, djx, HIPHOP.STAGE_Y + 0.42, djz + 0.405);
  const platters = []; for (const s of [-1, 1]) { const pl = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 32), plastic('#0a0a0a', { roughness: 0.2 }), djx + s * 0.62, HIPHOP.STAGE_Y + 0.87, djz); const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 20), plastic(s < 0 ? '#ff3a8a' : '#3ae8ff')); pl.add(lab); platters.push(pl); }
  mk(rbox(0.5, 0.06, 0.45, 0.02), plastic('#3a3a44'), djx, HIPHOP.STAGE_Y + 0.88, djz);
  // ---- the microphone stand
  const metal = plastic('#9a9aa8', { metalness: 0.7, roughness: 0.3 });
  // (no stand: everyone holds a handheld microphone; a spare stand waits at the side)
  mk(new THREE.CylinderGeometry(0.22, 0.25, 0.04, 20), metal, 4.4, 0.02, -3.2); mk(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 10), metal, 4.4, 0.56, -3.2);
  // ---- flame jets along the front of the stage (cones of fire, off until called)
  const flames = []; for (const x of [-5.4, -3.2, 3.2, 5.4]) { mk(rbox(0.36, 0.3, 0.36, 0.04), plastic('#2a2a30'), x, HIPHOP.STAGE_Y + 0.15, SZ1 - 0.35); const g = new THREE.ConeGeometry(0.28, 2.4, 16, 1, true); g.translate(0, 1.2, 0); const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); at(f, x, HIPHOP.STAGE_Y + 0.3, SZ1 - 0.35); const l = new THREE.PointLight('#ff7a2a', 0, 7, 1.6); l.position.set(O.x + x, HIPHOP.STAGE_Y + 1.4, O.z + SZ1); scene.add(l); flames.push({ f, l }); }
  // ---- the judges' desk: a long black desk with a neon front, three chairs, a button and a chain for each
  const DZ = 3.0, deskM = plastic('#14141c', { roughness: 0.35 });
  mk(rbox(5.6, 0.44, 0.72, 0.05), deskM, 0, 0.22, DZ); mk(rbox(5.8, 0.05, 0.86, 0.02), plastic('#24242e'), 0, 0.465, DZ);
  const deskFace = (() => { const c = document.createElement('canvas'); c.width = 1400; c.height = 150; const g = c.getContext('2d'); g.fillStyle = '#0a0a12'; g.fillRect(0, 0, 1400, 150); graffiti(g, '大嘻哈時代 3', 700, 78, 92, '#fff36a', '#120a1e', 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  at(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.4), new THREE.MeshBasicMaterial({ map: deskFace, toneMapped: false })), 0, 0.23, DZ - 0.37, Math.PI); // facing the stage
  const chains = [], buttons = [];
  for (let i = 0; i < 3; i++) {
    const [x, z] = HIPHOP.judge(i);
    const ch = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 10, 28), new THREE.MeshPhysicalMaterial({ color: '#7a6a44', emissive: '#ffb81a', emissiveIntensity: 0, metalness: 0.8, roughness: 0.25 })); at(ch, x + 0.38, 0.69, DZ - 0.22, 0); chains.push(ch); // standing on the desk in front of each judge, facing the stage
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.07, 20), new THREE.MeshPhysicalMaterial({ color: '#c8a020', emissive: '#ffd23a', emissiveIntensity: 0, clearcoat: 1, roughness: 0.2 })); at(b, x - 0.2, 0.52, DZ - 0.12); buttons.push(b);
    // the chair: a seat and a high back, behind the desk
    mk(rbox(0.62, 0.1, 0.6, 0.03), plastic('#2a2a34'), x, 0.36, z + 0.04); mk(rbox(0.62, 0.95, 0.1, 0.04), plastic('#2a2a34'), x, 0.86, z + 0.36); mk(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), metal, x, 0.16, z + 0.04);
  }
  // ---- lights: a truss with lamps, a key light on the mic, a spot on the judges, coloured washes, beams in the haze
  for (const z of [-3.6, 2.2]) for (let x = -8.4; x <= 8.41; x += 4 * P) K.brick(x, 6.6, z, 4, 1, 'brick', '#4a4a54');
  const bulbs = []; for (const z of [-3.6, 2.2]) for (let x = -7.8; x <= 7.81; x += 1.2) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.22, 12), new THREE.MeshBasicMaterial({ color: '#ffe8b0', toneMapped: false })); at(b, x, 6.4, z); bulbs.push(b); }
  const key = new THREE.SpotLight('#fff4e4', 70, 24, 0.5, 0.5, 1.6); key.position.set(O.x, 6.6, O.z + 3.5); key.target.position.set(O.x, 1.0, O.z - 1.8); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const jl = new THREE.SpotLight('#ffe8d0', 30, 18, 0.6, 0.6, 1.6); jl.position.set(O.x, 5.6, O.z - 0.5); jl.target.position.set(O.x, 0.8, O.z + 3.3); scene.add(jl, jl.target);
  const wash = [['#ff3a8a', -6, -4], ['#3ae8ff', 6, -4], ['#8a5aff', 0, -4.8]].map(([c, x, z]) => { const l = new THREE.PointLight(c, 8, 10, 1.6); l.position.set(O.x + x, 4.0, O.z + z); scene.add(l); return l; });
  const fill = new THREE.PointLight('#c8d0ff', 5, 16, 1.4); fill.position.set(O.x, 3.5, O.z + 7.5); scene.add(fill);
  const beams = []; for (let i = 0; i < 8; i++) { const g = new THREE.ConeGeometry(0.6, 6.4, 20, 1, true); g.translate(0, -3.2, 0); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#8a7aff', transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); at(m, -7 + i * 2, 6.6, i % 2 ? -3.6 : 2.2); beams.push(m); }
  // ---- the audience: bricks people on four rows of risers behind the judges, all facing the stage
  const ROWS = 4, PER = 20, people = [];
  for (let r = 0; r < ROWS; r++) { const z = 6.6 + r * 0.85, y = r * 2 * BH; for (let x = -8.4 + 2 * P; x < 8.5; x += 4 * P) { for (let k = 0; k < 2 * r + 1; k++) K.brick(x, k * BH, z + 0.1, 4, 3, 'brick', '#22222c'); K.brick(x, y + BH, z + 0.25, 4, 2, 'plate', '#3a3a46'); } }
  const pr = rng(19), shirt = ['#d8462a', '#3a7ad8', '#2a8a4a', '#f2c21a', '#e86aa0', '#f4f4f0', '#5a3a9a', '#2a2a2a', '#f08a2a', '#7ab8e8'], hairC = ['#1a1210', '#2a1a10', '#5a3a1a', '#8a8a8a', '#d8b040', '#141012'];
  for (let r = 0; r < ROWS; r++) for (let i = 0; i < PER; i++) { const x = -7.9 + i * (15.8 / (PER - 1)) + (pr() - 0.5) * 0.12; people.push({ x, y: r * 2 * BH + BH + PH + 0.02, z: 6.6 + r * 0.85 + 0.2, ph: pr() * 6.28, sp: 0.8 + pr() * 0.5, shirt: shirt[Math.floor(pr() * shirt.length)], hair: hairC[Math.floor(pr() * hairC.length)], kid: pr() < 0.15 }); }
  const N = people.length, faceT = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f6c42a'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#1a1210'; for (const x of [116, 140]) { g.beginPath(); g.arc(x, 26, 4, 0, 7); g.fill(); } g.lineWidth = 3; g.strokeStyle = '#1a1210'; g.beginPath(); g.arc(128, 34, 10, 0.2, Math.PI - 0.2); g.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const inst = (geo, mat) => { const m = new THREE.InstancedMesh(geo, mat, N); m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; G.add(m); return m; };
  const torsoI = inst(new THREE.BoxGeometry(0.36, 0.4, 0.22), new THREE.MeshStandardMaterial({ roughness: 0.5 })), headI = inst(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.4 })),
    hairI = inst(new THREE.SphereGeometry(0.135, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ roughness: 0.5 })), armI = inst(new THREE.BoxGeometry(0.09, 0.32, 0.1).translate(0, -0.14, 0), new THREE.MeshStandardMaterial({ roughness: 0.5 })), arm2I = inst(new THREE.BoxGeometry(0.09, 0.32, 0.1).translate(0, -0.14, 0), new THREE.MeshStandardMaterial({ roughness: 0.5 }));
  const cc = new THREE.Color(); people.forEach((p, i) => { torsoI.setColorAt(i, cc.set(p.shirt)); armI.setColorAt(i, cc.set(p.shirt)); arm2I.setColorAt(i, cc.set(p.shirt)); hairI.setColorAt(i, cc.set(p.hair)); headI.setColorAt(i, cc.set('#ffffff')); });
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), Vp = new THREE.Vector3(), Sc = new THREE.Vector3(1, 1, 1);
  const place = (im, i, x, y, z, rx, ry, rz, s = 1) => { Q.setFromEuler(E.set(rx, ry, rz)); Sc.setScalar(s); M4.compose(Vp.set(x, y, z), Q, Sc); im.setMatrixAt(i, M4); };
  // ---- confetti
  const CN = 420, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.11), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), CN); conf.frustumCulled = false; conf.visible = false; conf.position.set(O.x, 0, O.z); scene.add(conf);
  const confC = ['#ffd84a', '#ff5a7a', '#5ad8ff', '#7aff8a', '#ffffff', '#c87aff']; for (let i = 0; i < CN; i++) conf.setColorAt(i, cc.set(confC[i % confC.length]));
  // ---------------------------------------------------------------- the state and its clock
  const S = { t: 0, mood: 'idle', moodT: 0, moodLen: 0, lights: 'show', conf: -1, screen: ['logo', {}], bpm: 0, beatT0: 0, beatEnd: 0, flameT: -9, chainOn: [false, false, false], chainT: [-9, -9, -9], live: null };
  const pulseAt = (t) => { if (!S.bpm || t > S.beatEnd || t < S.beatT0) return 0; const b = 60 / S.bpm, u = ((t - S.beatT0) % b) / b; return Math.exp(-u * 5); };
  let lastDraw = -1;
  const draw = (force) => { const [mode, d] = S.screen; const anim = mode === 'live' || mode === 'logo'; if (!force && !anim) return; const k = Math.floor(S.t * 15); if (!force && k === lastDraw) return; lastDraw = k;
    const dd = mode === 'live' && S.live ? { ...d, left: S.live.len - (S.t - S.live.t0) } : d; drawScreen(sg, cv.width, cv.height, mode, dd, S.t, pulseAt(S.t)); stex.needsUpdate = true; };
  const api = {
    HIPHOP, lamps,
    reset() { S.t = 0; S.mood = 'idle'; S.lights = 'show'; S.conf = -1; conf.visible = false; S.bpm = 0; S.flameT = -9; S.chainOn = [false, false, false]; S.screen = ['logo', {}]; S.live = null; draw(true); },
    screen(mode, d = {}) { S.screen = [mode, d]; if (mode === 'live') S.live = { t0: S.t, len: d.len || 30 }; draw(true); },
    beat(bpm, len = 30) { S.bpm = bpm; S.beatT0 = S.t; S.beatEnd = S.t + len; }, // the lights, the screen and the crowd go with it
    stopBeat() { S.beatEnd = S.t; },
    chain(i, on = true) { S.chainOn[i] = on; S.chainT[i] = S.t; },
    chains(list) { list.forEach((v, i) => api.chain(i, v)); },
    crowd(mood, len = 3) { S.mood = mood; S.moodT = S.t; S.moodLen = len; },
    lights(mode) { S.lights = mode; },
    flames() { S.flameT = S.t; },
    confetti() { S.conf = S.t; conf.visible = true; },
    time() {},
    tick(dt) {
      S.t += dt; const t = S.t, pulse = pulseAt(t), onBeat = S.bpm && t < S.beatEnd && t >= S.beatT0;
      draw(false);
      platters.forEach((p) => (p.rotation.y += dt * (onBeat ? 3.5 : 0.6)));
      // the lights
      const L = S.lights, party = L === 'party' || onBeat, dim = L === 'dim', spot = L === 'spot';
      key.intensity += ((dim ? 25 : spot ? 90 : 70) - key.intensity) * Math.min(1, dt * 3); jl.intensity += ((dim ? 10 : spot ? 8 : 30) - jl.intensity) * Math.min(1, dt * 3); fill.intensity += ((dim || spot ? 1.2 : 5) - fill.intensity) * Math.min(1, dt * 3);
      wash.forEach((l, i) => { l.intensity = (dim ? 2 : spot ? 1 : 8) * (party ? 0.8 + pulse * 1.4 : 1); if (party) l.color.setHSL((t * 0.15 + i / 3) % 1, 0.95, 0.55); });
      beams.forEach((b, i) => { const sp = party ? 1.6 : 0.4; b.rotation.z = Math.sin(t * sp + i * 1.3) * (party ? 0.7 : 0.4); b.rotation.x = Math.cos(t * sp * 0.8 + i) * 0.35; b.material.opacity = dim || spot ? 0.02 : party ? 0.08 + pulse * 0.12 : 0.06; if (party) b.material.color.setHSL((t * 0.2 + i / 8) % 1, 0.9, 0.6); });
      bulbs.forEach((b, i) => { const on = party ? (Math.floor(t * (S.bpm ? S.bpm / 30 : 6)) + i) % 3 === 0 : dim ? false : (Math.floor(t * 1.5) + i) % 2 === 0; b.material.color.set(on ? (party ? ['#ff3a8a', '#3ae8ff', '#fff36a'][i % 3] : '#ffe8b0') : '#3a3040'); });
      // flame jets: a burst that rises and falls in a second and a half
      const fu = t - S.flameT; flames.forEach((fl, i) => { const k = fu >= 0 && fu < 1.6 ? Math.sin(Math.min(1, fu / 1.6) * Math.PI) * (0.8 + 0.2 * Math.sin(t * 40 + i)) : 0; fl.f.material.opacity = k * 0.8; fl.f.scale.set(1, 0.3 + k, 1); fl.l.intensity = k * 40; });
      // the chains on the desk and the buttons
      chains.forEach((c, i) => { const u = t - S.chainT[i]; c.material.emissiveIntensity = S.chainOn[i] ? 1.4 + (u < 1 ? Math.sin(u * 25) * 0.8 : 0.2 * Math.sin(t * 4)) : 0; c.material.color.set(S.chainOn[i] ? '#ffd23a' : '#7a6a44'); c.rotation.y = S.chainOn[i] && u < 1 ? u * 12 : 0; });
      buttons.forEach((b, i) => { const u = t - S.chainT[i]; b.material.emissiveIntensity = S.chainOn[i] ? 1.2 : 0; b.position.y = 0.52 - (u >= 0 && u < 0.15 ? 0.03 : 0); });
      // the audience: everyone bounces with the beat when there is one
      const u = t - S.moodT, live = u < S.moodLen, mood = live ? S.mood : onBeat ? 'bounce' : 'idle', fade = live ? Math.min(1, u / 0.25, (S.moodLen - u) / 0.6) : onBeat ? 1 : 0;
      people.forEach((p, i) => {
        const q = t * p.sp + p.ph; let bob = Math.sin(q * 0.7) * 0.004, lean = Math.sin(q * 0.4) * 0.03, tilt = 0, aR = 0.1, aL = 0.1, aRx = 0, aLx = 0;
        if (mood === 'bounce') { bob += pulse * 0.05 * fade; tilt = pulse * 0.18 * fade; if (i % 3 === 0) { aRx = -2.7 * fade; aR = 0.2 + pulse * 0.3; } }
        if (mood === 'laugh') { bob += Math.abs(Math.sin(q * 9)) * 0.025 * fade; tilt = (0.25 + Math.sin(q * 9) * 0.06) * fade; lean += (i % 3 === 0 ? 0.15 * Math.sin(q * 4.5) : 0) * fade; aRx = 0.4 * fade; aLx = (i % 4 === 0 ? 1.2 : 0.3) * fade; }
        if (mood === 'clap') { const k = Math.abs(Math.sin(q * 12)); aRx = 1.25 * fade; aLx = 1.25 * fade; aR = 0.1 + (0.25 - 0.3 * k) * fade; aL = aR; bob += k * 0.006 * fade; }
        if (mood === 'cheer') { const k = Math.sin(q * 7); aRx = -2.8 * fade; aLx = -2.8 * fade; aR = aL = 0.3 + 0.2 * k * fade; bob += Math.max(0, k) * 0.07 * fade; }
        if (mood === 'ooh') { tilt = 0.15 * fade; aRx = aLx = (i % 3 === 0 ? 2.2 : 0.5) * fade; }
        if (mood === 'sleep') { tilt = 0.35 * fade; lean += 0.2 * Math.sin(q * 0.5) * fade; }
        const s = p.kid ? 0.82 : 1, y = p.y + bob;
        place(torsoI, i, p.x, y + 0.2 * s, p.z, tilt * 0.4, 0, lean * 0.5, s);
        const hy = y + (0.4 + 0.13) * s; place(headI, i, p.x + Math.sin(lean) * 0.05, hy, p.z + Math.sin(tilt) * 0.06, tilt, lean, 0, s); place(hairI, i, p.x + Math.sin(lean) * 0.05, hy + 0.07 * s, p.z + Math.sin(tilt) * 0.09, tilt, lean, 0, s);
        place(armI, i, p.x + 0.225 * s, y + 0.38 * s, p.z, aRx, 0, aR, s); place(arm2I, i, p.x - 0.225 * s, y + 0.38 * s, p.z, aLx, 0, -aL, s);
      });
      for (const m of [torsoI, headI, hairI, armI, arm2I]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      if (S.conf >= 0) { const c = t - S.conf, r = rng(77);
        for (let i = 0; i < CN; i++) { const x0 = (r() - 0.5) * 14, z0 = -4 + r() * 9, d = r() * 2.5, sp = 0.7 + r() * 0.5, k = Math.max(0, c - d), y = 7 - k * sp, ph = r() * 6.28; if (y < 0.02) { place(conf, i, x0, 0.02, z0, -Math.PI / 2, ph, 0); continue; } place(conf, i, x0 + Math.sin(k * 2 + ph) * 0.3, c < d ? 9 : y, z0, k * 3 + ph, k * 2, ph); }
        conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true; }
    },
  };
  K.done(); api.reset(); return api;
}
