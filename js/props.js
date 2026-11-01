// Things the films hand about: made once, put in the world, laid on the floor, or held in someone's hand.
//   token 執法令: a gilt plate with 令 on it, on a red cord (the Law Hall's warrant token)
//   jade  青龍鑰: a quarter-disc of green jade carved with a dragon, glowing a little (one of the four keys)
//   cup   a white teacup
//   ball  a football;  board:字  an answer board with 字 written on it;  card  a question card
import * as THREE from '../lib/three.module.min.js';
import { plastic, rbox } from './brick/minifig.js';

function textTex(ch, bg, fg, size = 180) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 256); g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(14, 14, 228, 228); g.fillStyle = fg; g.font = `900 ${size}px "Noto Serif TC", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 128, 138); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function jadeTex() { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 20, 128, 128, 140); r.addColorStop(0, '#9ae8b8'); r.addColorStop(1, '#2a8a5a'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(20,70,40,0.7)'; g.lineWidth = 7; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 1.6, rr = 40 + i * 1.8; g.lineTo(128 + Math.cos(a) * rr * 0.9, 128 + Math.sin(a) * rr * 0.9); } g.stroke(); g.beginPath(); g.arc(70, 90, 10, 0, 6.3); g.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export function makeProp(kind) {
  const G = new THREE.Group(), add = (m) => { m.castShadow = true; G.add(m); return m; };
  if (kind === 'token') {
    const face = new THREE.MeshPhysicalMaterial({ map: textTex('令', '#c89a2a', '#5a1a0a'), metalness: 0.6, roughness: 0.3 }), gold = plastic('#c89a2a', { metalness: 0.6, roughness: 0.3 });
    add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.03), [gold, gold, gold, gold, face, face]));
    const cord = add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), plastic('#c02a2a'))); cord.position.y = 0.14;
  } else if (kind === 'jade') {
    const m = new THREE.MeshPhysicalMaterial({ map: jadeTex(), roughness: 0.15, clearcoat: 1, transmission: 0.2, emissive: '#2aa86a', emissiveIntensity: 0.2 });
    const g = new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24, 1, false, 0, Math.PI / 2); g.rotateX(Math.PI / 2); add(new THREE.Mesh(g, m));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: '#5ad890', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.set(0.05, 0.05, 0); G.add(glow); G.userData.glow = glow;
  } else if (kind === 'ball') { // a football, white with black patches
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#1a1a1a';
    for (const [x, y] of [[32, 30], [96, 70], [160, 30], [224, 70], [64, 110], [192, 110], [128, 4]]) { g.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 14); } g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.4, clearcoat: 0.4 })));
  } else if (kind.startsWith('board:')) { // an answer board, a character (or a few) written on it in black marker
    const text = kind.slice(6), c = document.createElement('canvas'); c.width = 320; c.height = 240; const g = c.getContext('2d');
    g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, 320, 240); g.strokeStyle = '#2a64b8'; g.lineWidth = 12; g.strokeRect(6, 6, 308, 228); g.fillStyle = '#141414';
    let fs = 176; g.font = `900 ${fs}px "LXGW WenKai TC", "Noto Serif TC", serif`; while (g.measureText(text).width > 290 && fs > 30) { fs -= 6; g.font = `900 ${fs}px "LXGW WenKai TC", "Noto Serif TC", serif`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 160, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const back = plastic('#2a64b8'), face = new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.5 });
    add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.015), [back, back, back, back, face, back]));
  } else if (kind === 'card') { add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.01), plastic('#f4ecd4'))); } else if (kind === 'cup') { add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.06, 16), plastic('#f0ece0'))); }
  else if (kind === 'mic') { // a handheld microphone: a black grip, a silver grille
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.2, 14), plastic('#141418'))); const h = add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), plastic('#b8bcc8', { metalness: 0.6, roughness: 0.35 }))); h.position.y = 0.12;
  } else if (kind === 'tea') { // bubble tea: a clear cup, milk tea, pearls, a fat straw
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.14, 16), new THREE.MeshPhysicalMaterial({ color: '#c8986a', roughness: 0.2, clearcoat: 1 }))); const s2 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), plastic('#ff3a8a'))); s2.position.set(0.01, 0.1, 0); s2.rotation.z = 0.2;
    for (let i = 0; i < 6; i++) { const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), plastic('#2a1a10'))); b.position.set(Math.cos(i) * 0.025, -0.055, Math.sin(i) * 0.025); }
  } else if (kind === 'pot') { // a big cooking pot with a lid
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.14, 24), plastic('#b8bcc8', { metalness: 0.6, roughness: 0.3 }))); const l = add(new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.02, 24), plastic('#a8acb8', { metalness: 0.6 }))); l.position.y = 0.08; const k = add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), plastic('#141418'))); k.position.y = 0.1;
  } else if (kind === 'phone') { add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.012), [plastic('#141418'), plastic('#141418'), plastic('#141418'), plastic('#141418'), new THREE.MeshBasicMaterial({ color: '#5ab8ff' }), plastic('#141418')])); }
  return G;
}

// a film's props: put one down, give it to someone, take it away
export function propShelf(scene) {
  const items = {};
  return {
    items,
    put(name, kind, pos, rot = 0) { let p = items[name]; if (!p) { p = items[name] = { G: makeProp(kind) }; } p.held = null; scene.add(p.G); p.G.position.copy(pos); p.G.rotation.set(0, rot, 0); p.G.visible = true; return p; },
    hold(name, f, side = 'R', off = [0, -0.04, 0.06]) { const p = items[name]; if (p) p.held = { f, side, off }; },
    hide(name) { const p = items[name]; if (p) { p.G.visible = false; p.held = null; } },
    clear() { for (const p of Object.values(items)) { p.G.visible = false; p.held = null; } },
    update(t) { for (const p of Object.values(items)) { if (p.held) { const h = p.held.f.F.hands[p.held.side === 'R' ? 0 : 1]; h.updateMatrixWorld(true); const w = h.localToWorld(new THREE.Vector3(...p.held.off.map((v) => v / 0.0375))); p.G.position.copy(w); p.G.rotation.y = p.held.f.mark.yaw; } if (p.G.userData.glow) p.G.userData.glow.material.opacity = 0.1 + Math.sin(t * 3) * 0.04; } },
  };
}
