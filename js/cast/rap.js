// The people of 《大嘻哈時代3》.
//   The judges: J.Sheon (the R&B one: round tinted glasses, a black leather jacket, a thin gold chain), Gummy B (the
//   funny one: thick black glasses, a grey beanie, an oversized hoodie), 熱狗 (the veteran: a flat-brimmed red cap,
//   dark glasses, a black OG tee, a beard). DJ 嗡嗡 at the decks: headphones, a backwards cap.
//   The contestants: 金花阿嬤 (72, the morning market's queen: a grey bun, glasses, a flowered top, a shopping bag);
//   Lil 泡麵 (16: bleached spikes, sunglasses, a chain bigger than his verse); 凱文王子 (22, R&B: a white suit, a pink
//   shirt, slick hair); 外送員阿傑 (28: a helmet, a green jacket, the delivery box on his back); 肌肉 Max (30: a red
//   headband, a vest, arms); MC 憂鬱 (25, the poet: a beret, a black turtleneck, a sigh); Josh (10, from San Diego,
//   in his bear tee with a backwards cap and a chain) and his brother Jasper (8, spiky hair, the dinosaur tee, the
//   little mole above the right of his lip).
import * as THREE from '../../lib/three.module.min.js';
import { makeFig, plastic, rbox } from '../brick/minifig.js';

const mk = (g, m, p) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
const torsoY = (F) => (F.body.children.find((m) => Array.isArray(m.material))?.position.y ?? 14);
const build = (spec, dress) => (scene) => { const F = makeFig(spec), extra = dress?.(F) || {}; scene?.add(F.root); return { F, grips: [], tip: null, remove() { F.root.parent?.remove(F.root); }, sway() {}, setGlow() {}, ...extra }; };
const rest = (face = {}, fidget = 0) => (c) => ({ pose: { armR: -0.2 + Math.sin(c * 1.3) * 0.03, outR: 0.12, armL: -0.2, outL: 0.12, hipR: -0.06, hipL: 0.06, head: Math.sin(c * 0.5) * 0.25, y: Math.abs(Math.sin(c * 4)) * 0.015 * fidget + Math.sin(c * 1.7) * 0.004 }, face: { mouth: { smile: 0.45 }, ...face } });
const who = (id, zh, en, tzh, ten, spec, o = {}) => ({ id, name: { zh, en }, title: { zh: tzh, en: ten }, bio: o.bio || { zh: tzh, en: ten }, spec, moves: [], idle: o.idle || rest(o.face, o.fidget), build: build(spec, o.dress), poem: o.poem });

// ---------------------------------------------------------------- the pieces they wear
const gold = () => plastic('#e8b830', { metalness: 0.75, roughness: 0.22 });
function chain(F, big = 1) { // a gold chain round the neck, a pendant on the chest
  const y = torsoY(F) + 12.2, g = new THREE.Group(); F.body.add(g); g.position.set(0, y, 0.2);
  const ring = mk(new THREE.TorusGeometry(5.6, 0.55 * big, 8, 32), gold(), g); ring.rotation.x = Math.PI / 2 - 0.35; ring.scale.set(1, 1.15, 1);
  const pend = mk(big > 1.5 ? new THREE.CylinderGeometry(2.6 * big * 0.6, 2.6 * big * 0.6, 0.8, 24).rotateX(Math.PI / 2) : rbox(2.4 * big, 2.4 * big, 0.8, 0.3), gold(), g); pend.position.set(0, -4.6 - big, 4.6 + big * 0.3);
  return g;
}
function shades(F, color = '#101014', round = false) { // sunglasses over the printed eyes
  const g = new THREE.Group(); F.headP.add(g); g.position.set(0, 5.3, 4.95); const m = plastic(color, { roughness: 0.12, clearcoat: 1 });
  for (const s of [-1, 1]) { const l = mk(round ? new THREE.CylinderGeometry(1.7, 1.7, 0.5, 20).rotateX(Math.PI / 2) : rbox(3.2, 2.0, 0.5, 0.5), m, g); l.position.x = s * 2.0; }
  mk(rbox(1.2, 0.5, 0.4, 0.2), m, g); return g;
}
function beanie(F, color) { const b = mk(new THREE.SphereGeometry(6.2, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), plastic(color, { roughness: 0.8 }), F.headP); b.position.y = 6.4; b.scale.y = 1.1; const r = mk(new THREE.CylinderGeometry(6.25, 6.25, 1.8, 30, 1, true), plastic(color, { roughness: 0.8 }), F.headP); r.position.y = 7.0; }
function backCap(F, color) { const h = mk(new THREE.SphereGeometry(6.0, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), plastic(color), F.headP); h.position.y = 6.8; const b = mk(rbox(8, 0.8, 5, 0.4), plastic(color), F.headP); b.position.set(0, 7.2, -5.6); b.rotation.x = -0.25; }
function flatCap(F, color, brim = '#141414') { const h = mk(new THREE.CylinderGeometry(5.4, 6.1, 4.6, 30), plastic(color), F.headP); h.position.y = 9.4; const b = mk(rbox(10, 0.7, 6.2, 0.3), plastic(brim), F.headP); b.position.set(0, 7.3, 5.6); }
function beret(F, color) { const b = mk(new THREE.SphereGeometry(6.4, 28, 10), plastic(color, { roughness: 0.85 }), F.headP); b.position.set(0.8, 9.6, 0); b.scale.set(1.05, 0.38, 1.05); b.rotation.z = -0.18; }
function phones(F) { const m = plastic('#1a1a1e'); const band = mk(new THREE.TorusGeometry(6.4, 0.7, 8, 24, Math.PI), m, F.headP); band.position.y = 5.8; for (const s of [-1, 1]) { const c = mk(new THREE.CylinderGeometry(2.2, 2.2, 1.6, 20).rotateZ(Math.PI / 2), plastic(s < 0 ? '#ff3a8a' : '#3ae8ff'), F.headP); c.position.set(s * 5.6, 5.4, 0); } }

// ---------------------------------------------------------------- the judges
export const JSHEON = who('jsheon', 'J.Sheon', 'J.Sheon', '評審・R&B', 'Judge — R&B',
  { age: 'adult', colors: { top: '#141418', bottom: '#2a2a32', shoes: '#f4f4f4' }, outfit: { top: 'suit', bottom: 'pants', shirt: '#f4f4f4', tie: '#f4f4f4', pocket: '#141418' }, hair: { style: 'short', color: '#141012' } },
  { face: { mouth: { smile: 0.35 } }, dress: (F) => { shades(F, '#5a3a24', true); chain(F, 0.6); } });
export const GUMMYB = who('gummyb', 'Gummy B', 'Gummy B', '評審・饒舌', 'Judge — rap',
  { age: 'adult', glasses: '#141012', stubble: true, colors: { top: '#4a5a6a', bottom: '#2a2a34', shoes: '#d84a2a' }, outfit: { top: 'hoodie', bottom: 'pants' }, hair: { style: 'short', color: '#141012' } },
  { face: { mouth: { smile: 0.7 } }, dress: (F) => { beanie(F, '#7a7a84'); } });
export const HOTDOG = who('hotdog', '熱狗', 'MC HotDog', '評審・饒舌老大哥', 'Judge — the veteran',
  { age: 'adult', beard: '#2a1a14', colors: { top: '#121216', bottom: '#2a2a30', shoes: '#141414' }, outfit: { top: 'print', bottom: 'pants', pic: 'OG', size: 70, ink: '#e8b830' }, hair: { style: 'short', color: '#141012' } },
  { face: { mouth: { smile: 0.2 }, browIn: 0.3 }, dress: (F) => { flatCap(F, '#c8282a'); shades(F); } });
export const DJ = who('dj', 'DJ 嗡嗡', 'DJ Wong Wong', 'DJ', 'The DJ',
  { age: 'adult', colors: { top: '#2a2a34', bottom: '#1a1a22', shoes: '#f4f4f4' }, outfit: { top: 'hoodie', bottom: 'pants' }, hair: { style: 'short', color: '#141012' } },
  { dress: (F) => { backCap(F, '#3a7ad8'); phones(F); } });

// ---------------------------------------------------------------- the contestants
export const JINHUA = who('jinhua', '金花阿嬤', 'Grandma Jinhua', '72 歲・菜市場饒舌女王', '72, queen of the market rap',
  { age: 'adult', glasses: '#8a3a2a', cheeks: true, colors: { top: '#c84a7a', bottom: '#5a3a7a', shoes: '#3a2a1a' }, outfit: { top: 'print', bottom: 'pants', pic: '🌸', size: 80 }, hair: { style: 'bun', color: '#c8c8cc' } },
  { face: { mouth: { smile: 0.8 } }, dress: (F) => { const bag = new THREE.Group(); F.hands[1].add(bag); bag.position.set(0, -4, 1); const m = plastic('#e8e0c8', { roughness: 0.8 }); mk(rbox(5, 6, 3, 0.6), m, bag).position.y = -3; const lk = mk(new THREE.SphereGeometry(1.4, 10, 8), plastic('#4a9a3a'), bag); lk.position.set(0.5, 0.6, 0); lk.scale.set(1, 2.2, 1); return { bag }; } });
export const PAOMIAN = who('paomian', 'Lil 泡麵', 'Lil Noodle', '16 歲・Trap 新星', '16, trap rookie',
  { age: 'adult', colors: { top: '#141418', bottom: '#4a4a54', shoes: '#f2c21a' }, outfit: { top: 'hoodie', bottom: 'pants' }, hair: { style: 'spiky', color: '#f0e08a' } },
  { fidget: 2, face: { mouth: { smile: 0.5 } }, dress: (F) => { shades(F); chain(F, 2.2); } });
export const KAIWEN = who('kaiwen', '凱文王子', 'Prince Kevin', '22 歲・R&B 王子', '22, the R&B prince',
  { age: 'adult', lashes: true, colors: { top: '#f4f2ee', bottom: '#f4f2ee', shoes: '#f4f2ee' }, outfit: { top: 'suit', bottom: 'pants', shirt: '#f08ab0', tie: '#f08ab0', pocket: '#f08ab0' }, hair: { style: 'short', color: '#2a1a12' } },
  { face: { mouth: { smile: 0.6 }, blink: 0.3 }, dress: (F) => { const e = mk(new THREE.SphereGeometry(0.6, 10, 8), gold(), F.headP); e.position.set(-5.2, 3.2, 0.4); } });
export const AJIE = who('ajie', '外送員阿傑', 'A-Jie the courier', '28 歲・外送員', '28, food courier',
  { age: 'adult', stubble: true, colors: { top: '#3aa85a', bottom: '#2a3a4a', shoes: '#2a2a2a' }, outfit: { top: 'hoodie', bottom: 'pants' }, hair: { style: 'short', color: '#141012' } },
  { dress: (F) => { const h = mk(new THREE.SphereGeometry(6.4, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), plastic('#3aa85a', { clearcoat: 1 }), F.headP); h.position.y = 6.4; const v = mk(rbox(9, 3, 1, 0.5), plastic('#9ad0ec', { transmission: 0, opacity: 0.6, transparent: true }), F.headP); v.position.set(0, 7.0, 5.8);
    const box = new THREE.Group(); F.body.add(box); box.position.set(0, torsoY(F) + 6, -9); const b = mk(rbox(14, 14, 10, 1), plastic('#3aa85a'), box); const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#3aa85a'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff'; g.font = '900 90px sans-serif'; g.textAlign = 'center'; g.fillText('外送', 128, 150); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const lab = mk(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: t }), box); lab.position.z = -5.05; lab.rotation.y = Math.PI; return { box }; } });
export const MAX = who('max', '肌肉 Max', 'Muscle Max', '30 歲・健身教練', '30, personal trainer',
  { age: 'adult', colors: { top: '#c8282a', bottom: '#141418', shoes: '#f4f4f4' }, outfit: { top: 'print', bottom: 'pants', pic: '💪', size: 90 }, hair: { style: 'short', color: '#141012' } },
  { fidget: 1, face: { mouth: { smile: 0.8 }, browIn: 0.4 }, dress: (F) => { const hb = mk(new THREE.CylinderGeometry(5.2, 5.2, 1.4, 28, 1, true), plastic('#f4f4f4'), F.headP); hb.position.y = 7.4; const torso = F.body.children.find((m) => Array.isArray(m.material)); torso?.scale.set(1.18, 1, 1.1); for (const a of F.arms || []) a.scale?.set(1.25, 1, 1.25); } });
export const YOUYU = who('youyu', 'MC 憂鬱', 'MC Melancholy', '25 歲・詩人', '25, the poet',
  { age: 'adult', glasses: '#141012', colors: { top: '#141418', bottom: '#3a3a44', shoes: '#141418' }, outfit: { top: 'print', bottom: 'pants', pic: '☁', size: 70, ink: '#8a8a9a' }, hair: { style: 'short', color: '#141012' } },
  { face: { mouth: { smile: -0.3 }, blink: 0.45, brow: 0.3 }, dress: (F) => beret(F, '#2a2a34') });
export const JOSH = who('josh', 'Josh', 'Josh', '10 歲・加州聖地牙哥', 'Ten, San Diego, California',
  { age: 'kid', cheeks: true, colors: { top: '#1f3e7a', bottom: '#c8b07a', shoes: '#f2f2f2' }, outfit: { top: 'print', bottom: 'pants', pic: '🐻', size: 84 }, hair: { style: 'short', color: '#141012' } },
  { face: { mouth: { smile: 0.5 } }, dress: (F) => { backCap(F, '#c8282a'); chain(F, 0.8); } });
export const JASPER = who('jasper', 'Jasper', 'Jasper', '8 歲・Josh 的弟弟', 'Eight, Josh’s little brother',
  { age: 'kid', cheeks: true, mole: { side: 1, x: 22, y: 176, r: 6 }, colors: { top: '#d8342a', bottom: '#2a3a5a', shoes: '#3a7ad8' }, outfit: { top: 'print', bottom: 'pants', pic: '🦖', size: 90 }, hair: { style: 'spiky', color: '#141012' } },
  { fidget: 2, face: { mouth: { smile: 0.9 }, eyes: 1.1 }, dress: (F) => { chain(F, 0.7); } });
