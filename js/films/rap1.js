// 《大嘻哈時代3》 Josh and Jasper on a rap show: eight contestants, thirty seconds each, three judges — J.Sheon, Gummy B
// and 熱狗 — a gold chain each to give. Two chains and you go through; three, and the flames go up.
//   金花阿嬤 raps cabbage prices and takes a phone call mid-verse. Lil 泡麵 says yeah eleven times. 凱文王子 sings
//   every run he knows at J.Sheon and breaks on the last note. 外送員阿傑 leaves in the middle for an order and comes
//   back. 肌肉 Max raps push-ups until he can't. MC 憂鬱 gets four words out in thirty seconds and the judges fall
//   asleep. Josh sings his hook and raps about Saturdays and the fries his brother stole; Jasper raps his mole and
//   his dinosaurs, roars, confesses to the fries, and drops the mic. Next round: brother against brother.
//   Written as it runs; the dialogue timed from the recordings (rap1.durs.js), the songs from tools/perform.py (rap1.perf.js).
import { DURS } from './rap1.durs.js';
import { PERF } from './rap1.perf.js';
import { HIPHOP } from '../hiphop.js';
import { GESTURES } from '../gestures.js';

const PI = Math.PI;
const MIC = HIPHOP.mic, WING = HIPHOP.wingL, J = { jsheon: HIPHOP.judge(0), hotdog: HIPHOP.judge(1), gummyb: HIPHOP.judge(2) }, CH = { jsheon: 0, hotdog: 1, gummyb: 2 };
const JUDGES = ['jsheon', 'hotdog', 'gummyb'], CONTESTANTS = ['jinhua', 'paomian', 'kaiwen', 'ajie', 'max', 'youyu', 'josh', 'jasper'];
const est = (s) => Math.max(1.0, [...s].length * 0.2);
// ---------------------------------------------------------------- gestures for the show (laid over the engine's own)
const sit = (o = {}) => (t) => ({ hipR: -1.55, hipL: -1.55, y: -0.12, tilt: -0.04, armR: -0.75, outR: 0.05, armL: -0.75, outL: 0.05, head: Math.sin(t * 0.6) * 0.12, ...(typeof o === 'function' ? o(t) : o) });
Object.assign(GESTURES, {
  jsit: { len: 99, pose: sit() },
  jnod: { len: 99, pose: sit((t) => ({ y: -0.12 + Math.abs(Math.sin(t * 4.8)) * 0.012, tilt: -0.04 + Math.abs(Math.sin(t * 4.8)) * 0.08 })) }, // nodding along
  jlaugh: { len: 2.2, pose: sit((t) => ({ tilt: -0.2 + Math.sin(t * 12) * 0.06, armR: -1.0, outR: 0.4, armL: -0.9, outL: 0.3 })), face: { happy: 1, mouth: { open: 0.75, wide: 0.9, smile: 1 } } },
  jshock: { len: 2.0, pose: sit({ tilt: -0.35, armR: -1.9, outR: 0.5, armL: -1.6, outL: 0.4 }), face: { eyes: 1.4, brow: 0.8, mouth: { open: 0.8, round: 1 } } },
  jpress: { len: 1.2, pose: sit((t) => { const k = Math.sin(Math.min(1, t / 0.6) * PI); return { armR: -1.2 - 0.3 * k, outR: -0.1, tilt: 0.05 + 0.12 * k }; }), face: { mouth: { open: 0.3, smile: 0.7 } } },
  jsleep: { len: 99, pose: sit((t) => ({ tilt: 0.35 + Math.sin(t * 1.6) * 0.04, head: 0.2, armR: -0.5, armL: -0.5 })), face: { blink: 1, mouth: { open: 0.35, round: 0.6 } } },
  jthink: { len: 2.4, pose: sit({ armR: -2.0, outR: -0.5, wristR: 0.6, head: 0.2 }), face: { look: [0.4, 0.3], browIn: 0.5, mouth: { smile: 0, round: 0.4 } } },
  jpoint: { len: 1.6, pose: sit({ armR: -1.6, outR: 0.1, tilt: 0.04 }), face: { browIn: 0.6, mouth: { open: 0.3, smile: 0.3 } } },
  jstand: { len: 99, pose: (t) => ({ armR: -2.7, outR: 0.3 + Math.sin(t * 8) * 0.25, armL: -0.3, y: Math.abs(Math.sin(t * 6)) * 0.02 }), face: { happy: 0.8, mouth: { open: 0.5, smile: 1 } } },
  phone: { len: 99, pose: { armL: -2.6, outL: -0.75, wristL: 0.4, armR: -0.4, head: -0.15, tilt: 0.04 }, face: { mouth: { open: 0.3 }, browIn: 0.6 } },
  pushup: { len: 99, pose: (t) => { const k = Math.abs(Math.sin(t * 4.0)); return { tilt: 1.42, y: 0.12 + k * 0.1, armR: -1.55, outR: 0.25 - k * 0.2, armL: -1.55, outL: 0.25 - k * 0.2, hipR: 0, hipL: 0 }; }, face: { browIn: 1, mouth: { open: 0.4, wide: 0.8 } } },
  collapse: { len: 99, pose: { tilt: 1.52, y: 0.08, armR: -0.2, outR: 0.9, armL: -0.2, outL: 0.9, head: 0.5 }, face: { blink: 1, mouth: { open: 0.5, round: 0.8 } } },
  slump: { len: 99, pose: (t) => ({ tilt: 0.12, head: Math.sin(t * 0.8) * 0.1, armR: -0.15, armL: -0.15 }), face: { blink: 0.5, mouth: { smile: -0.4 } } },
  scratch: { len: 99, pose: (t) => ({ armR: -1.2, outR: -0.1 + Math.sin(t * 9) * 0.25, armL: -1.1, outL: -0.2, tilt: 0.12, head: Math.sin(t * 4.8) * 0.15, y: Math.abs(Math.sin(t * 4.8)) * 0.01 }) },
  covers: { len: 2.4, pose: { armR: -2.5, outR: -0.6, wristR: 0.6, armL: -2.5, outL: -0.6, wristL: 0.6, tilt: 0.1 }, face: { blink: 1, mouth: { open: 0.4, wide: 1 } } }, // hands over ears
  drop: { len: 1.4, pose: (t) => ({ armR: -1.6 + Math.min(1, t * 3) * 0.9, outR: 0.6, armL: -0.3, tilt: -0.05 }), face: { happy: 0.6, mouth: { smile: 1 }, browIn: 0.6 } },
  swag: { len: 99, pose: (t) => ({ armR: -0.4, outR: 0.5, armL: -0.4, outL: 0.5, y: Math.abs(Math.sin(t * 5)) * 0.015, tilt: -0.05, head: Math.sin(t * 2.5) * 0.2 }), face: { mouth: { smile: 0.8 }, browIn: 0.4 } },
  wink: { len: 1.5, pose: { armR: -1.8, outR: 0.2, wristR: 0.4, armL: -0.3, tilt: -0.06 }, face: { blink: 0.5, mouth: { smile: 1 }, happy: 0.6 } },
});
const beatGest = (bpm, kind) => { // a performer moving with the song: the mic at the mouth, the other hand chopping out the beat (or reaching, for a singer)
  const name = `${kind}${bpm}`; if (GESTURES[name]) return name; const w = 2 * PI * bpm / 60;
  GESTURES[name] = kind === 'sing'
    ? { len: 99, pose: (t) => ({ armR: -1.85, outR: -0.55, wristR: 0.6, armL: -1.2 - 0.5 * Math.max(0, Math.sin(t * w / 4)), outL: 0.6, y: Math.sin(t * w / 2) * 0.008, tilt: -0.04 + Math.sin(t * w / 4) * 0.04, head: Math.sin(t * w / 4) * 0.25 }) }
    : { len: 99, pose: (t) => { const k = Math.abs(Math.sin(t * w / 2)); return { armR: -1.85, outR: -0.55, wristR: 0.6, armL: -1.0 - 0.7 * k, outL: 0.25 + 0.25 * Math.sin(t * w / 4), y: k * 0.03, tilt: 0.03 + k * 0.06, head: Math.sin(t * w / 4) * 0.2, hipR: -0.1 * k, hipL: 0.1 * k }; } };
  return name;
};
// ---------------------------------------------------------------- the shots used again and again
const WIDE = { kind: 'at', pos: [0, 3.6, 10.2], look: [0, 1.3, -2.6], fov: 48 };
const STAGE = { kind: 'at', pos: [0.2, 1.35, 2.4], look: [0, 1.0, -1.6], fov: 34 };
const LOW = { kind: 'at', pos: [1.4, 0.45, 0.4], look: [0, 1.15, -1.5], fov: 50 };
const LOWL = { kind: 'at', pos: [-1.5, 0.5, 0.3], look: [0, 1.1, -1.6], fov: 50 };
const JUDGEW = { kind: 'at', pos: [0, 1.45, -0.6], look: [0, 0.8, 3.4], fov: 46 };
const SIDE = { kind: 'at', pos: [5.2, 1.6, 1.4], look: [-0.5, 1.0, -0.6], fov: 40 };
const DJC = { kind: 'at', pos: [-2.2, 1.35, -1.4], look: [-3.1, 1.0, -3.6], fov: 40 };
const CROWD = { kind: 'at', pos: [0, 2.0, 1.2], look: [0, 1.4, 8.0], fov: 52 };
const close = (on, o = {}) => ({ kind: 'close', on, side: o.side ?? 1, dist: o.dist ?? (JUDGES.includes(on) ? 1.7 : 1.6), ...o });
const judgeC = (n) => ({ kind: 'at', pos: [J[n][0] + 0.3, 1.25, J[n][1] - 2.5], look: [J[n][0], 0.98, J[n][1]], fov: 34 });
const judgeUp = (n) => ({ kind: 'at', pos: [J[n][0] + 0.3, 1.55, J[n][1] - 2.4], look: [J[n][0], 1.25, J[n][1]], fov: 40 }); // standing to wave

// ---------------------------------------------------------------- a scene, written as it runs
let LI = 0; const SCENES = [];
function scene(o, write) {
  const lines = [], cues = [], shots = [], say = [], perf = []; let t = o.lead ?? 0.8, lastWho = null, side = 1;
  const shotFor = (who) => JUDGES.includes(who) ? judgeC(who) : close(who, { side: (side = -side) });
  const sc = {
    L(who, zh, en, feel = '', x = {}) {
      t += x.gap ?? 0.3; lines.push([t, who, zh, en, feel]); say.push(x.say || null); perf.push(null);
      if (x.shot) shots.push([t - 0.12, x.shot]); else if (!x.keep && who !== lastWho) shots.push([t - 0.12, shotFor(who)]);
      if (x.cue) cues.push([t + (x.at ?? 0), x.cue]);
      lastWho = who; t += DURS[LI] ?? est(x.say || zh); LI++; return sc;
    },
    W(s) { t += s; return sc; }, C(fn, off = 0) { cues.push([t + off, fn]); return sc; }, S(shot, off = 0) { shots.push([t + off, shot]); lastWho = null; return sc; },
    // a performance: the beat starts, the lines land on it (with anything said over it), the camera moves round
    P(pid, who, o = {}) {
      const S = PERF[pid], t0 = t + (o.lead ?? 0.3), kind = S.lines.some((l) => l.kind === 'sing') && !S.lines.some((l) => l.kind === 'rap') ? 'sing' : 'rap', g = beatGest(S.bpm, kind);
      cues.push([t0, (A, F) => { F.sfx('sample', S.beatFile, o.vol ?? 0.5); set(F).beat(S.bpm, S.len - (S.len > 31 ? 1.6 : 0)); set(F).screen('live', { name: o.name, len: Math.min(30, S.len) }); if (o.gest !== false) A[who].gest(g, { hold: true }); for (const j of JUDGES) A[j].gest('jnod', { hold: true }); if (A.dj && !o.noDJ) A.dj.gest('scratch', { hold: true }); }]);
      const items = [...S.lines.map((l, i) => ({ at: l.at, perf: `${pid}:${i}`, who, zh: (l.phone ? '📱 ' : '') + l.text, en: l.en, feel: 'excited' })), ...(o.over || []).map((x) => ({ ...x, perf: null }))].sort((a, b) => a.at - b.at);
      for (const it of items) { lines.push([t0 + it.at, it.who, it.zh, it.en, it.feel || 'excited']); say.push(it.say || null); perf.push(it.perf); LI++; }
      for (const [at, fn] of o.cues || []) cues.push([t0 + at, fn]);
      const end = Math.max(S.len, ...S.lines.map((l) => l.at + l.dur));
      // the camera: wide for the intro, then round the performer, the judges and the crowd, unless the scene says otherwise
      const plan = o.shots || [[0, WIDE], [S.beat * 8, close(who, { dist: 1.5 })], [S.beat * 16, LOW], [S.beat * 22, JUDGEW], [S.beat * 26, close(who, { side: -1, dist: 1.4 })], [S.beat * 32, SIDE], [S.beat * 38, LOWL], [S.beat * 44, CROWD], [S.beat * 48, STAGE], [S.beat * 56, close(who)], [S.beat * 64, WIDE]];
      for (const [at, sh] of plan) if (at < end) shots.push([t0 + at, sh]);
      cues.push([t0 + end + 0.1, (A, F) => { set(F).stopBeat(); if (o.gest !== false) A[who].gesture = null; for (const j of JUDGES) A[j].gest('jsit', { hold: true }); if (A.dj) A.dj.gesture = null; set(F).screen('name', { name: o.name, sub: o.sub }); }]);
      t = t0 + end + (o.tail ?? 0.4); lastWho = null; return sc;
    },
  };
  write(sc);
  SCENES.push({ ...o, len: t + (o.tail ?? 1.2), lines, cues, shots: shots.sort((a, b) => a[0] - b[0]), say, perf });
}
// ---------------------------------------------------------------- what happens on the floor
const set = (F) => F.set();
const TAKES = { laugh_s: 4, laugh_m: 6, laugh_b: 4, aww: 2, ooh: 4, cheer: 2, applause: 4 };
const pick = (F, base) => base + (1 + Math.floor(F.now() * 7.31) % TAKES[base]);
const laugh = (k = 1, who = []) => (A, F) => { F.sfx('sample', pick(F, k > 1.5 ? 'laugh_b' : k < 0.8 ? 'laugh_s' : 'laugh_m'), 0.75 + 0.15 * k); set(F).crowd('laugh', 1.8 + k); for (const n of who) A[n]?.gest(JUDGES.includes(n) ? 'jlaugh' : 'laugh'); };
const clap = (len = 3) => (A, F) => { F.sfx('sample', len > 4 ? 'applause_long' : pick(F, 'applause'), 0.7); set(F).crowd('clap', len); };
const cheer = (len = 3) => (A, F) => { F.sfx('sample', pick(F, 'cheer'), 0.85); set(F).crowd('cheer', len); };
const ooh = (A, F) => { F.sfx('sample', pick(F, 'ooh'), 0.85); set(F).crowd('ooh', 2); };
const sfx = (n, v = 0.8) => (A, F) => F.sfx('sample', n, v);
const mic = (who) => (A, F) => { F.put('mic_' + who, 'mic', F.P(0, -9)); F.give('mic_' + who, who, 'R', [0.0, -0.02, 0.07]); };
const nomic = (who) => (A, F) => F.hide('mic_' + who);
const card = (name, sub, style) => (A, F) => { set(F).screen('name', { name, sub, style }); F.sfx('sample', 'whoosh', 0.6); };
// the verdict: the judges press (or don't), one after another; two chains and you're through
const verdict = (sc, name, on, after = {}) => {
  const lit = [false, false, false];
  sc.C((A, F) => { lit.fill(false); set(F).screen('chains', { name, on: [false, false, false] }); set(F).chains([false, false, false]); }).S(JUDGEW).W(0.8);
  for (const j of JUDGES) if (on[CH[j]]) sc.C((A, F) => { A[j].gest('jpress'); lit[CH[j]] = true; set(F).chain(CH[j], true); F.sfx('sample', 'chain', 0.7); set(F).screen('chains', { name, on: [...lit] }); }).W(0.9);
  const n = on.filter(Boolean).length, pass = n >= 2;
  sc.C((A, F) => { set(F).screen('chains', { name, on, verdict: pass ? '晉級' : '淘汰' }); if (pass) { F.sfx('sample', 'airhorn', 0.6); cheer(3)(A, F); if (n === 3) { set(F).flames(); set(F).confetti(); set(F).lights('party'); } } else { F.sfx('sample', 'sadtrombone', 0.7); set(F).crowd('ooh', 2); } })
    .S(n === 3 ? LOW : after.shot || STAGE).W(n === 3 ? 3.2 : 2.4);
};
const enter = (who, o = {}) => (A, F) => { F.walk(who, MIC[0], MIC[1], { speed: o.speed || 1.4, face: 0 }); if (o.gest) A[who].gest(o.gest, { hold: true }); };
const leave = (who) => (A, F) => { A[who].gesture = null; F.walk(who, WING[0] - 2, WING[1], { speed: 1.6 }); };
const placeBase = (extra = {}) => { const p = { dj: { x: HIPHOP.dj[0], z: HIPHOP.dj[1], yaw: 0.35 } }; for (const j of JUDGES) p[j] = { x: J[j][0], z: J[j][1], yaw: PI }; return { ...p, ...extra }; };
const seated = (A) => { for (const j of JUDGES) A[j].gest('jsit', { hold: true }); };
const wing = (dx = 0) => ({ x: WING[0] + dx, z: WING[1], yaw: PI / 2 + 0.3 });

// ================================================================ 0 開場
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], caption: { zh: '大嘻哈時代3・海選', en: 'The Rap Era 3 — auditions' }, lead: 0.5, place: placeBase(), setup: (A, F) => { seated(A); set(F).lights('dim'); set(F).screen('off'); } }, (sc) => {
  sc.S({ kind: 'at', pos: [0, 4.4, 10.4], look: [0, 2.6, -4.5], fov: 50, drift: [0, -0.12, -0.25] })
    .C(sfx('scratchstop', 0.7)).W(0.8)
    .C((A, F) => { set(F).screen('logo'); set(F).lights('party'); set(F).flames(); F.sfx('sample', 'airhorn', 0.7); cheer(4)(A, F); A.dj.gest('scratch', { hold: true }); }).W(0.4)
    .C((A, F) => F.title(6)).W(5.6)
    .C((A) => { A.dj.gesture = null; }).C((A, F) => set(F).lights('show'))
    .L('dj', '各位！歡迎來到《大嘻哈時代3》海選現場！我是 DJ 嗡嗡！', 'Everybody! Welcome to The Rap Era 3 auditions! I’m DJ Wong Wong!', 'excited', { shot: DJC, cue: clap(3), at: 2.5 })
    .L('dj', '今天的規則很簡單：每個人只有三十秒！', 'Today’s rules are simple: everybody gets thirty seconds!', 'excited', { keep: true, cue: card('30 秒定生死', '每人只有三十秒'), at: 0.2 })
    .L('dj', '三位評審，每人一條金項鍊。拿到兩條就晉級！', 'Three judges, one gold chain each. Two chains and you’re through!', 'excited', { keep: true, cue: (A, F) => set(F).screen('chains', { name: '兩條晉級', on: [true, true, false] }) })
    .L('dj', '讓我們歡迎今天的評審！', 'Let’s welcome today’s judges!', 'excited', { keep: true, cue: cheer(3), at: 1.0 })
    .C((A, F) => { A.jsheon.gest('jstand'); set(F).screen('name', { name: 'J.Sheon', sub: '評審' }); }).S(judgeUp('jsheon')).W(0.5)
    .L('jsheon', '大家好。今天我只想聽到真的聲音。', 'Hi everyone. Today I only want to hear real voices.', 'calm', { keep: true })
    .C((A) => { A.jsheon.gest('jsit', { hold: true }); A.gummyb.gest('jstand'); }).C((A, F) => set(F).screen('name', { name: 'Gummy B', sub: '評審' })).S(judgeUp('gummyb')).W(0.4)
    .L('gummyb', '三十秒？三十秒夠我講一個笑話……不夠，我的笑話比較長。', 'Thirty seconds? That’s enough for one of my jokes… no it isn’t, mine are long.', 'happy', { keep: true })
    .C(laugh(1.2)).C((A) => { A.gummyb.gest('jsit', { hold: true }); A.hotdog.gest('jstand'); }).C((A, F) => set(F).screen('name', { name: '熱狗', sub: '評審' }), 0.4).S(judgeUp('hotdog'), 0.4).W(1.4)
    .L('hotdog', '三十秒，夠了。真正會的人，五秒就聽得出來。', 'Thirty seconds is plenty. The real ones, you can tell in five.', 'calm', { keep: true })
    .C((A) => A.hotdog.gest('jsit', { hold: true })).C(ooh)
    .L('gummyb', '那剩下二十五秒我們要做什麼？', 'So what do we do with the other twenty-five?', 'happy', { shot: judgeC('gummyb') })
    .L('hotdog', '……忍耐。', '…Endure.', 'calm', { shot: judgeC('hotdog') })
    .C(laugh(1.6, ['gummyb', 'jsheon'])).W(1.6)
    .L('dj', '第一位參賽者，請上台！', 'Contestant number one, come on up!', 'excited', { shot: DJC, cue: (A, F) => F.sfx('sample', 'whoosh', 0.6), at: 1.0 })
    .W(0.6);
});

// ================================================================ 1 金花阿嬤
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ jinhua: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: '金花阿嬤', sub: '72 歲・菜市場饒舌女王' }); mic('jinhua')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('jinhua', { speed: 0.9 })).C(clap(3)).W(3.2)
    .L('gummyb', '阿嬤……妳是不是走錯棚了？菜市場在隔壁喔。', 'Grandma… are you in the wrong studio? The market’s next door.', 'happy')
    .C(laugh(1))
    .L('jinhua', '少年欸，阿嬤是來比賽的啦！', 'Young man, Grandma is here to compete!', 'excited', { gap: 0.6 })
    .L('hotdog', '阿嬤，妳的藝名是？', 'Grandma, your stage name?', 'calm')
    .L('jinhua', 'MC 金花！菜市場第一把麥克風！', 'MC Jinhua! The market’s number one mic!', 'proud', { cue: (A) => A.jinhua.gest('raise'), at: 0.3 })
    .C(cheer(2)).W(0.5)
    .L('dj', '阿嬤，beat 給妳！', 'Grandma, the beat’s yours!', 'excited', { shot: DJC })
    .P('jinhua', 'jinhua', { name: '金花阿嬤', sub: '72 歲・菜市場饒舌女王', cues: [
      [13.0, (A, F) => { F.sfx('sample', 'ring', 0.8); }], [13.6, (A, F) => { A.jinhua.gest('phone', { hold: true }); F.put('phone_j', 'phone', F.P(0, -9)); F.give('phone_j', 'jinhua', 'L', [0, 0.02, 0.05]); laugh(1, ['gummyb'])(A, F); }],
      [18.5, (A, F) => { F.hide('phone_j'); A.jinhua.gest(beatGestName('jinhua'), { hold: true }); }], [21.3, (A) => A.hotdog.gest('jpoint')], [27.5, cheer(3)],
    ], shots: [[0, WIDE], [2.6, close('jinhua', { dist: 1.5 })], [8.0, LOW], [10.6, JUDGEW], [13.6, close('jinhua', { side: -1, dist: 1.3 })], [18.6, judgeC('gummyb')], [21.3, close('jinhua')], [24.0, CROWD], [27.3, STAGE]] })
    .C(cheer(3))
    .L('hotdog', '阿嬤，妳的節奏比很多年輕人穩。真的。', 'Grandma, your timing is steadier than a lot of young people’s. Really.', 'calm', { gap: 0.8 })
    .L('gummyb', '我只記得高麗菜一顆三十。好便宜！', 'All I remember is cabbage, thirty a head. That’s cheap!', 'happy')
    .C(laugh(1))
    .L('jsheon', '中間那通電話……是真的嗎？', 'That phone call in the middle… was it real?', 'thinking')
    .L('jinhua', '真的啦！阿嬤現在要回家看瓦斯爐。', 'Of course! Grandma has to go home and check the stove.', 'worried')
    .C(laugh(1.6, ['gummyb', 'hotdog']));
  verdict(sc, '金花阿嬤', [true, true, true]);
  sc.L('jinhua', '謝謝評審！你們三個，等一下來阿嬤家吃飯！', 'Thank you, judges! You three — dinner at Grandma’s!', 'excited', { cue: (A) => A.jinhua.gest('wave') })
    .C(leave('jinhua')).C(clap(3)).S(WIDE).W(2.5);
});

// ================================================================ 2 Lil 泡麵
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ paomian: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: 'Lil 泡麵', sub: '16 歲・Trap 新星' }); mic('paomian')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('paomian', { gest: 'swag' })).C(sfx('clank', 0.8)).C(sfx('clank', 0.8), 1.2).C(sfx('clank', 0.8), 2.4).W(3.0)
    .C((A) => { A.paomian.gesture = null; })
    .L('paomian', 'Yo！我是 Lil 泡麵！', 'Yo! I’m Lil Noodle!', 'excited')
    .L('gummyb', '你的鏈子……會不會太大了？你走路有聲音耶。', 'Your chain… isn’t it a bit big? You clank when you walk.', 'happy')
    .C(laugh(1))
    .L('paomian', '這是我阿嬤送的。純金……塑膠。', 'My grandma gave it to me. Solid gold… plastic.', 'proud')
    .C(laugh(1.4, ['gummyb']))
    .L('hotdog', '好，三十秒，開始。', 'OK. Thirty seconds. Go.', 'calm')
    .P('paomian', 'paomian', { name: 'Lil 泡麵', sub: '16 歲・Trap 新星', cues: [[8.6, (A) => A.gummyb.gest('jthink')], [14.2, (A) => { A.paomian.gest('slump', { hold: true }); }], [14.6, laugh(0.8)], [17.2, (A) => A.paomian.gest(beatGestName('paomian'), { hold: true })], [19.7, (A) => A.hotdog.gest('jthink')]],
      shots: [[0, WIDE], [3.4, close('paomian', { dist: 1.4 })], [6.9, LOW], [8.6, judgeC('gummyb')], [11.0, close('paomian', { side: -1 })], [14.1, JUDGEW], [17.1, close('paomian', { dist: 1.3 })], [19.7, LOWL], [24.0, judgeC('hotdog')], [26.0, STAGE]] })
    .L('gummyb', '我幫你數了一下。三十秒，你講了十一個 yeah。', 'I counted for you. Thirty seconds, eleven “yeah”s.', 'happy', { gap: 0.8 })
    .C(laugh(1.4))
    .L('paomian', '那是我的風格。', 'That’s my style.', 'proud')
    .L('hotdog', '你的鏈子，比你的歌詞還重。', 'Your chain is heavier than your lyrics.', 'calm')
    .C(ooh)
    .L('jsheon', '「泡麵要加蛋」……其實我同意。', '“Noodles need an egg”… I do agree, actually.', 'thinking')
    .C(laugh(1, ['gummyb']));
  verdict(sc, 'Lil 泡麵', [false, false, false]);
  sc.L('paomian', 'Skrrt。', 'Skrrt.', 'sad', { cue: (A) => A.paomian.gest('slump', { hold: true }) })
    .C(leave('paomian')).C(sfx('clank', 0.7), 0.5).C(sfx('clank', 0.7), 1.4).C(laugh(0.8), 1.0).S(WIDE).W(2.6);
});

// ================================================================ 3 凱文王子
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ kaiwen: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: '凱文王子', sub: '22 歲・R&B 王子' }); mic('kaiwen')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('kaiwen', { speed: 1.1 })).C((A, F) => { set(F).lights('spot'); }, 1).W(3.0)
    .C((A, F) => F.face('kaiwen', J.jsheon)).C((A) => A.kaiwen.gest('wink'))
    .L('kaiwen', 'J 哥，這首歌……是為你唱的。', 'J-ge, this song… is for you.', 'shy', { shot: close('kaiwen', { dist: 1.3 }) })
    .C(ooh)
    .L('jsheon', '……謝謝？', '…Thanks?', 'surprised', { shot: judgeC('jsheon') })
    .L('gummyb', '我覺得我們兩個可以先出去一下。', 'I think the two of us should step outside for a bit.', 'happy', { cue: (A) => A.gummyb.gest('jpoint'), at: 0.4 })
    .C(laugh(1.2, ['hotdog']))
    .P('kaiwen', 'kaiwen', { name: '凱文王子', sub: '22 歲・R&B 王子', cues: [[10.3, (A) => A.jsheon.gest('jthink')], [17.2, (A, F) => F.face('kaiwen', J.jsheon)], [24.0, (A, F) => { set(F).lights('party'); }], [25.6, (A) => { for (const j of JUDGES) A[j].gest('jshock'); }], [26.0, ooh], [28.3, laugh(1.6, ['gummyb'])]],
      shots: [[0, WIDE], [3.4, close('kaiwen', { dist: 1.5 })], [7.0, LOW], [10.3, judgeC('jsheon')], [13.0, close('kaiwen', { side: -1, dist: 1.3 })], [17.1, close('kaiwen', { dist: 1.2 })], [21.0, judgeC('jsheon')], [24.0, LOWL], [25.6, JUDGEW], [28.2, close('kaiwen', { dist: 1.4 })]] })
    .C((A, F) => set(F).lights('show'))
    .L('jsheon', '你那個轉音……轉到我頭有點暈。', 'Those runs of yours… made my head spin a little.', 'thinking', { gap: 0.8 })
    .L('gummyb', '最後那個高音，我家的狗在外面回答你了。', 'That last high note — my dog outside answered you.', 'happy')
    .C(laugh(1.6))
    .L('hotdog', 'R&B 不是轉越多越好。', 'R&B isn’t about doing as many runs as you can.', 'calm')
    .L('kaiwen', '那我……少轉一點？喔～耶～', 'Then I’ll… do fewer? Oh~ yeah~', 'shy', { say: '那我，少轉一點？喔，耶。' })
    .C(laugh(1, ['gummyb']));
  verdict(sc, '凱文王子', [true, false, false]);
  sc.L('jsheon', '這一條給你，因為你真的很敢。', 'This one’s for you, because you’ve really got nerve.', 'calm', { shot: judgeC('jsheon') })
    .L('kaiwen', 'J 哥……我會一輩子記得你。', 'J-ge… I’ll remember you forever.', 'shy', { cue: (A) => A.kaiwen.gest('wink') })
    .C(leave('kaiwen')).C(laugh(1.2, ['gummyb', 'hotdog'])).S(WIDE).W(2.6);
});

// ================================================================ 4 外送員阿傑
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ ajie: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: '外送員阿傑', sub: '28 歲・外送員' }); mic('ajie')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('ajie', { speed: 2.4 })).W(2.6)
    .L('ajie', '不好意思不好意思！剛送完一單，還好有趕上！', 'Sorry, sorry! Just finished a delivery — made it in time!', 'excited')
    .L('hotdog', '你背著那個箱子比賽？', 'You’re competing with that box on your back?', 'calm')
    .L('ajie', '箱子不能離身。這是外送員的尊嚴。', 'The box never leaves me. It’s a courier’s pride.', 'proud')
    .C(laugh(0.9))
    .P('ajie', 'ajie', { name: '外送員阿傑', sub: '28 歲・外送員', cues: [
      [12.3, (A, F) => F.sfx('sample', 'notify', 0.8)], [12.8, (A, F) => { A.ajie.gest('phone', { hold: true }); F.put('phone_a', 'phone', F.P(0, -9)); F.give('phone_a', 'ajie', 'L', [0, 0.02, 0.05]); }],
      [18.4, (A, F) => { F.hide('phone_a'); A.ajie.gesture = null; F.walk('ajie', WING[0] - 2.5, WING[1], { speed: 2.6 }); }], [19.0, (A) => { for (const j of JUDGES) A[j].gest('jshock'); }], [19.5, laugh(1.4)],
      [21.0, (A) => { A.gummyb.gest('jthink'); A.jsheon.gest('jsit', { hold: true }); A.hotdog.gest('jsit', { hold: true }); }],
      [23.2, (A, F) => { F.walk('ajie', MIC[0], MIC[1], { speed: 2.8, face: 0 }); }], [25.0, cheer(2)], [26.0, (A) => A.ajie.gest(beatGestName('ajie'), { hold: true })],
    ], over: [{ at: 20.4, who: 'dj', zh: '呃……我再 loop 一下？', en: 'Uh… I’ll loop it a bit more?', feel: 'worried' }],
      shots: [[0, WIDE], [2.5, close('ajie', { dist: 1.5 })], [7.5, LOW], [10.0, JUDGEW], [12.7, close('ajie', { side: -1, dist: 1.3 })], [18.3, WIDE], [19.0, JUDGEW], [20.3, DJC], [22.0, judgeC('gummyb')], [23.2, SIDE], [25.0, close('ajie')], [27.5, LOW]] })
    .L('hotdog', '你是我看過最敬業的……外送員。', 'You are the most dedicated… courier I’ve ever seen.', 'calm', { gap: 0.8 })
    .C(laugh(1))
    .L('gummyb', '我剛剛有點餓。你箱子裡有珍奶嗎？', 'I got a bit hungry back there. Any bubble tea in that box?', 'happy')
    .L('ajie', '有！半糖少冰。', 'Yes! Half sugar, less ice.', 'excited', { cue: (A, F) => { F.put('tea', 'tea', F.P(0, -9)); F.give('tea', 'ajie', 'R', [0, 0.0, 0.07]); A.ajie.gest('present'); }, at: 0.4 })
    .L('gummyb', '……這杯是誰的？', '…Whose is this?', 'thinking')
    .L('ajie', '……剛剛那一單的。', '…The order I just took.', 'scared')
    .C(laugh(2.2, ['gummyb', 'hotdog', 'jsheon'])).W(1.4)
    .L('jsheon', '那你剛剛到底送了什麼過去？', 'Then what did you actually deliver just now?', 'surprised')
    .L('ajie', '……我的歌詞本。', '…My lyric book.', 'sad')
    .C(laugh(1.8));
  verdict(sc, '外送員阿傑', [false, true, true]);
  sc.L('ajie', '謝謝評審！記得給我五星好評！', 'Thank you, judges! Five stars, please!', 'excited', { cue: (A) => A.ajie.gest('cheer') })
    .C(leave('ajie')).C((A, F) => F.hide('tea')).C(clap(3)).S(WIDE).W(2.4);
});

// ================================================================ 5 肌肉 Max
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ max: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: '肌肉 Max', sub: '30 歲・健身教練' }); } }, (sc) => {
  sc.S(WIDE).C(enter('max', { speed: 1.3, gest: 'swag' })).W(3.0).C((A) => { A.max.gesture = null; A.max.gest('fist'); })
    .L('max', '大家好！我是肌肉 Max！今天我要一邊做伏地挺身一邊饒舌！', 'Hi everyone! I’m Muscle Max! Today I rap while doing push-ups!', 'excited')
    .L('gummyb', '為什麼？', 'Why?', 'surprised')
    .L('max', '因為饒舌是有氧運動！', 'Because rapping is cardio!', 'proud', { cue: (A) => A.max.gest('raise'), at: 0.3 })
    .C(laugh(1))
    .L('hotdog', '那麥克風呢？', 'And the microphone?', 'calm')
    .L('max', '我用丹田！', 'I project from the core!', 'shout')
    .C(laugh(1.4, ['gummyb']))
    .P('max', 'max', { name: '肌肉 Max', sub: '30 歲・健身教練', gest: false, cues: [
      [0.6, (A) => A.max.gest('pushup', { hold: true })], [10.0, (A) => A.gummyb.gest('jlaugh')], [16.2, (A) => A.jsheon.gest('jthink')], [21.6, (A) => { A.max.gest('collapse', { hold: true }); }], [22.3, laugh(1.6, ['gummyb', 'hotdog'])],
    ], shots: [[0, WIDE], [3.8, SIDE], [7.7, { kind: 'at', pos: [-1.6, 0.6, -0.6], look: [0, 0.3, -1.5], fov: 44 }], [10.1, judgeC('gummyb')], [13.5, SIDE], [16.4, { kind: 'at', pos: [1.4, 0.7, -0.4], look: [0, 0.3, -1.5], fov: 44 }], [21.5, WIDE], [23.0, JUDGEW], [26.0, { kind: 'at', pos: [-1.2, 0.8, 0.2], look: [0, 0.2, -1.5], fov: 44 }]] })
    .L('gummyb', '需要幫你叫救護車，還是蛋白粉？', 'Shall I call you an ambulance, or protein powder?', 'happy', { gap: 0.6 })
    .C(laugh(1.2))
    .L('max', '我……可以……再一組……', 'I… can do… one more set…', 'sad', { shot: LOWL })
    .L('hotdog', '饒舌要練的是嘴巴，不是胸肌。', 'In rap, you train your mouth, not your pecs.', 'calm')
    .L('jsheon', '不過你的伏地挺身……很標準。', 'Your push-ups, though… perfect form.', 'calm')
    .C(laugh(1));
  verdict(sc, '肌肉 Max', [false, false, false], { shot: LOWL });
  sc.L('max', '沒關係……我先……去喝水……', 'That’s OK… I’ll go… get some water…', 'sad', { shot: LOWL, cue: (A) => { A.max.gesture = null; }, at: 1.4 })
    .C(leave('max')).C(laugh(0.8), 0.6).S(WIDE).W(2.4);
});

// ================================================================ 6 MC 憂鬱
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ youyu: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 } }), setup: (A, F) => { seated(A); set(F).screen('name', { name: 'MC 憂鬱', sub: '25 歲・詩人' }); mic('youyu')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('youyu', { speed: 0.6 })).C((A, F) => set(F).lights('dim'), 1.5).W(5.4)
    .L('gummyb', '他走了十秒。這樣三十秒會不會不夠？', 'He took ten seconds just walking on. Will thirty be enough?', 'thinking')
    .C(laugh(0.8))
    .L('youyu', '我的饒舌……叫做……「詩」。', 'My rap… is called… “poetry”.', 'sad', { say: '我的饒舌，叫做，詩。', shot: close('youyu', { dist: 1.4 }) })
    .L('hotdog', '好。開始吧。', 'OK. Go ahead.', 'calm')
    .P('youyu', 'youyu', { name: 'MC 憂鬱', sub: '25 歲・詩人', gest: false, cues: [
      [0.4, (A) => A.youyu.gest('slump', { hold: true })], [7.0, (A) => A.gummyb.gest('jthink')], [12.5, (A) => { A.gummyb.gest('jsleep', { hold: true }); }], [13.5, (A, F) => F.sfx('sample', 'snore', 0.6)],
      [16.0, (A) => A.hotdog.gest('jsleep', { hold: true })], [19.0, (A, F) => { F.sfx('sample', 'snore', 0.7); set(F).crowd('sleep', 6); }], [22.0, (A) => A.jsheon.gest('jsleep', { hold: true })], [24.5, laugh(1.2)],
      [29.8, (A, F) => F.sfx('sample', 'snore', 0.8)],
    ], shots: [[0, WIDE], [3.6, close('youyu', { dist: 1.5 })], [7.0, judgeC('gummyb')], [10.7, close('youyu', { side: -1, dist: 1.3 })], [13.5, JUDGEW], [17.4, close('youyu', { dist: 1.2 })], [19.0, CROWD], [22.0, judgeC('jsheon')], [25.7, close('youyu', { dist: 1.1 })], [28.0, JUDGEW], [31.5, close('youyu', { side: -1 })]] })
    .C((A, F) => { set(F).lights('show'); F.sfx('sample', 'scratchstop', 0.6); })
    .L('gummyb', '啊？結束了嗎？我有在聽！你剛剛說……雲？', 'Huh? Is it over? I was listening! You said… cloud?', 'surprised', { gap: 0.5, cue: (A) => { for (const j of JUDGES) A[j].gest('jshock'); } })
    .C(laugh(1.8))
    .L('jsheon', '很有意境。但是三十秒，你只說了四個字。', 'Very evocative. But in thirty seconds, you said four words.', 'thinking')
    .L('hotdog', '一個字七秒半。比我家的網路還慢。', 'Seven and a half seconds a word. Slower than my home internet.', 'calm')
    .C(laugh(1.6, ['gummyb']))
    .L('youyu', '……這就是人生。', '…That is life.', 'sad');
  verdict(sc, 'MC 憂鬱', [false, false, false]);
  sc.L('youyu', '……沒關係。雲……本來就會散。', '…It’s fine. Clouds… always drift apart.', 'sad', { say: '沒關係。雲，本來就會散。' })
    .C(leave('youyu')).C(laugh(1)).S(WIDE).W(2.6);
});

// ================================================================ 7 Josh
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ josh: { x: WING[0], z: WING[1] + 0.3, yaw: PI / 2 }, jasper: wing(-0.6) }), setup: (A, F) => { seated(A); set(F).screen('name', { name: 'Josh', sub: '10 歲・加州聖地牙哥' }); mic('josh')(A, F); } }, (sc) => {
  sc.S(WIDE).C(enter('josh', { speed: 1.3 })).C(clap(3)).W(2.8)
    .L('jasper', '哥哥！你不要忘詞喔！', 'Big brother! Don’t forget your words!', 'excited', { shot: { kind: 'at', pos: [-4.0, 1.0, -1.0], look: [-6.2, 0.8, -2.6], fov: 40 }, cue: (A) => A.jasper.gest('jump'), at: 0.2 })
    .L('josh', '你才不要忘詞！你等一下就上台了！', 'YOU don’t forget yours! You’re on right after me!', 'shout', { cue: (A, F) => F.face('josh', 'jasper'), at: 0.1 })
    .C(laugh(1))
    .L('hotdog', '那是你弟弟？', 'Is that your brother?', 'calm', { cue: (A, F) => F.face('josh', J.hotdog), at: 0.4 })
    .L('josh', '對。他很吵。', 'Yes. He’s loud.', 'calm')
    .L('jasper', '我是低音砲！', 'I’m a subwoofer!', 'shout', { shot: { kind: 'at', pos: [-4.0, 1.0, -1.0], look: [-6.2, 0.8, -2.6], fov: 40 } })
    .C(laugh(1.2, ['gummyb']))
    .L('gummyb', '好，Josh，從聖地牙哥來的。秀給我們看。', 'OK, Josh, all the way from San Diego. Show us.', 'happy')
    .P('josh', 'josh', { name: 'Josh', sub: '10 歲・加州聖地牙哥', cues: [[5.2, (A) => A.jsheon.gest('jthink')], [7.9, ooh], [16.3, (A, F) => F.face('jasper', 'josh')], [19.0, (A) => A.hotdog.gest('jpoint')], [21.0, cheer(2)], [28.8, cheer(4)]],
      over: [{ at: 18.0, who: 'jasper', zh: '我才沒有！', en: 'I did not!', feel: 'shout' }],
      shots: [[0, WIDE], [2.6, close('josh', { dist: 1.4 })], [5.2, judgeC('jsheon')], [7.8, LOW], [13.0, close('josh', { side: -1, dist: 1.3 })], [15.6, close('josh', { dist: 1.2 })], [17.9, { kind: 'at', pos: [-4.0, 1.0, -1.0], look: [-6.2, 0.8, -2.6], fov: 40 }], [18.9, LOWL], [20.9, judgeC('hotdog')], [23.4, STAGE], [26.0, CROWD], [28.6, LOW]] })
    .L('jsheon', '副歌那個音很準。十歲耶。', 'The hook was right on pitch. At ten.', 'surprised', { gap: 0.8 })
    .L('gummyb', 'taco 配滷肉飯……我覺得可以申請專利。', 'Tacos with braised-pork rice… I think you could patent that.', 'happy')
    .C(laugh(1))
    .L('hotdog', '自己寫的詞，聽得出來。有你的生活。', 'Your own words — you can hear it. Your life’s in them.', 'calm');
  verdict(sc, 'Josh', [true, true, true]);
  sc.L('josh', 'Yes！', 'Yes!', 'excited', { cue: (A) => A.josh.gest('cheer') })
    .L('jasper', '換我！換我！換我！', 'My turn! My turn! My turn!', 'excited', { cue: (A, F) => { A.jasper.gesture = null; F.walk('jasper', MIC[0] - 0.9, MIC[1] + 0.2, { speed: 2.2, face: 0.3 }); }, at: 0.1 })
    .L('josh', '你還沒輪到！先下去！', 'It’s not your turn yet! Get off!', 'shout', { shot: { kind: 'two', on: ['josh', 'jasper'], side: 1, dist: 2.4 } })
    .C(laugh(1.4, ['gummyb']))
    .L('dj', '呃……好，那就……直接換弟弟！', 'Uh… OK then… little brother, you’re up!', 'excited', { shot: DJC })
    .C((A, F) => { F.walk('josh', WING[0] + 0.4, WING[1] + 0.2, { speed: 1.4, face: PI / 2 + 0.3 }); F.hide('mic_josh'); }).W(2.0);
});

// ================================================================ 8 Jasper
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, place: placeBase({ jasper: { x: MIC[0] - 0.9, z: MIC[1] + 0.2, yaw: 0 }, josh: wing(0.4) }), setup: (A, F) => { seated(A); set(F).screen('name', { name: 'Jasper', sub: '8 歲・Josh 的弟弟', style: '低音砲' }); mic('jasper')(A, F); } }, (sc) => {
  sc.S(STAGE).C(enter('jasper', { speed: 1.2 })).W(1.4)
    .L('jasper', '大家好！我是 Jasper！你們看，我人中右邊有一顆痣！', 'Hi everyone! I’m Jasper! Look — there’s a mole above my lip!', 'excited', { shot: close('jasper', { dist: 1.1 }) })
    .L('gummyb', '……好，我們看到了。', '…Yes, we can see it.', 'happy')
    .C(laugh(1))
    .L('jasper', '這是我的 logo！', 'It’s my logo!', 'proud')
    .L('hotdog', '弟弟，你知道三十秒有多長嗎？', 'Little man, do you know how long thirty seconds is?', 'calm')
    .L('jasper', '知道！刷牙的時間！', 'Yes! As long as brushing your teeth!', 'excited')
    .C(laugh(1.4, ['gummyb', 'jsheon']))
    .P('jasper', 'jasper', { name: 'Jasper', sub: '8 歲・Josh 的弟弟', cues: [
      [6.9, (A) => A.gummyb.gest('jlaugh')], [10.3, (A) => A.hotdog.gest('jthink')], [17.1, (A, F) => { F.sfx('sample', 'roar', 0.9); set(F).flames(); A.jasper.gest('raise'); for (const j of JUDGES) A[j].gest('jshock'); }], [17.6, ooh],
      [18.0, (A) => A.jasper.gest(beatGestName('jasper'), { hold: true })], [20.4, (A) => { A.josh.gest('scared'); }], [20.9, laugh(1.6)],
      [28.4, (A, F) => { A.jasper.gest('drop'); F.hide('mic_jasper'); F.put('mic_floor', 'mic', F.P(MIC[0] + 0.15, MIC[1] + 0.2)); F.sfx('sample', 'micdrop', 0.9); A.dj.gest('covers'); }], [29.0, cheer(4)],
    ], over: [{ at: 21.1, who: 'josh', zh: '你說什麼？！', en: 'You said WHAT?!', feel: 'shout' }],
      shots: [[0, WIDE], [3.4, close('jasper', { dist: 1.2 })], [6.8, judgeC('gummyb')], [8.6, LOW], [10.3, judgeC('hotdog')], [12.0, close('jasper', { side: -1, dist: 1.1 })], [13.7, LOWL], [17.0, LOW], [17.6, JUDGEW], [18.8, close('jasper', { dist: 1.1 })], [21.0, { kind: 'at', pos: [-4.0, 1.0, -1.0], look: [-6.0, 0.8, -2.4], fov: 40 }], [22.2, close('jasper', { dist: 1.2 })], [26.4, STAGE], [28.3, LOW], [29.6, DJC]] })
    .L('gummyb', '他把我的笑話都講完了。我今天可以回家了。', 'He’s used up all my jokes. I can go home now.', 'happy', { gap: 0.6 })
    .C(laugh(1.4))
    .L('hotdog', '八歲，敢 mic drop。有種。', 'Eight years old and he drops the mic. Guts.', 'calm')
    .L('jsheon', '那一聲吼……低頻很足。', 'That roar… plenty of low end.', 'thinking')
    .C(laugh(1))
    .L('jasper', '評審，項鍊可以換冰淇淋嗎？', 'Judges, can I trade the chain for ice cream?', 'excited', { shot: close('jasper', { dist: 1.1 }) })
    .L('gummyb', '不行。但是我口袋裡有軟糖。', 'No. But I’ve got gummies in my pocket.', 'happy', { cue: (A) => A.gummyb.gest('jpoint') })
    .C(laugh(1.2, ['hotdog']));
  verdict(sc, 'Jasper', [true, true, true]);
  sc.L('josh', '等一下！我的薯條！', 'Wait! My fries!', 'shout', { cue: (A, F) => { A.josh.gesture = null; F.walk('josh', MIC[0] + 0.9, MIC[1] + 0.2, { speed: 2.4, face: -0.4 }); }, at: 0.1 })
    .L('jasper', '已經消化了。', 'Already digested.', 'proud', { shot: { kind: 'two', on: ['jasper', 'josh'], side: 1, dist: 2.4 } })
    .C(laugh(2.2, ['gummyb', 'hotdog', 'jsheon'])).W(2.2);
});

// ================================================================ 9 結果
scene({ set: 'hiphop', tod: 'night', focus: [0, 0], lead: 0.4, caption: { zh: '海選結果', en: 'The results' },
  place: placeBase({ jinhua: { x: -2.4, z: -2.4, yaw: 0.2 }, ajie: { x: -1.2, z: -2.6, yaw: 0.1 }, josh: { x: 0.4, z: -2.0, yaw: -0.1 }, jasper: { x: 1.4, z: -1.9, yaw: -0.2 } }),
  setup: (A, F) => { seated(A); set(F).screen('text', { text: '晉級名單', sub: '金花阿嬤・外送員阿傑・Josh・Jasper' }); } }, (sc) => {
  sc.S(WIDE).C(cheer(3)).W(2.6)
    .L('hotdog', '今天晉級的四位：金花阿嬤、外送員阿傑、Josh，還有 Jasper。', 'Through today: Grandma Jinhua, A-Jie the courier, Josh, and Jasper.', 'calm', { cue: clap(3), at: 3.0 })
    .L('hotdog', '下一輪是一對一 battle。抽籤結果……', 'Next round is one-on-one battles. The draw…', 'calm', { cue: (A, F) => F.sfx('sample', 'drumroll16', 0.8), at: 1.0 })
    .C((A, F) => { set(F).screen('text', { text: 'Josh vs Jasper', sub: '第二輪・兄弟對決' }); F.sfx('sample', 'airhorn', 0.7); set(F).flames(); ooh(A, F); }).S({ kind: 'at', pos: [0, 2.6, 2.0], look: [0, 2.8, -5.4], fov: 46 }).W(2.6)
    .C((A, F) => { F.face('josh', 'jasper'); F.face('jasper', 'josh'); })
    .L('josh', '……準備好輸吧。', '…Get ready to lose.', 'calm', { shot: { kind: 'two', on: ['josh', 'jasper'], side: 1, dist: 2.2 } })
    .L('jasper', '你才準備好你的薯條吧。', 'YOU get your fries ready.', 'proud', { keep: true })
    .C(ooh)
    .L('gummyb', '這個節目，正式變成家庭糾紛了。', 'This show has officially become a family dispute.', 'happy')
    .C(laugh(1.6, ['jsheon']))
    .L('jinhua', '好了好了，不要吵！大家來阿嬤家吃飯！', 'Enough, enough, stop squabbling! Everyone, dinner at Grandma’s!', 'excited', { cue: (A, F) => { F.put('pot', 'pot', F.P(0, -9)); F.give('pot', 'jinhua', 'R', [0, -0.02, 0.1]); A.jinhua.gest('raise'); }, at: 0.2 })
    .L('ajie', '阿嬤，要不要外送？', 'Grandma, want it delivered?', 'excited', { gap: 0.2 })
    .L('jinhua', '你剛剛那單還沒送到啦！', 'You haven’t even delivered the last order!', 'shout')
    .C(laugh(2.2, ['gummyb', 'hotdog', 'jsheon']))
    .L('dj', '《大嘻哈時代3》海選，我們下次見！', 'That’s The Rap Era 3 auditions — see you next time!', 'excited', { shot: WIDE, cue: (A, F) => { set(F).lights('party'); set(F).confetti(); set(F).screen('logo'); F.sfx('sample', 'airhorn', 0.6); A.dj.gest('scratch', { hold: true }); for (const j of JUDGES) A[j].gest('jstand'); }, at: 0.4 })
    .C(cheer(5)).C(clap(6), 1.0)
    .S({ kind: 'at', pos: [0, 4.6, 10.4], look: [0, 1.8, -3.5], fov: 50, drift: [0, 0.08, 0.1] }).W(6.0);
});

// a performer's beat gesture by name (for cues that put them back on the beat after a phone call or a stumble)
function beatGestName(pid) { const S = PERF[pid]; return beatGest(S.bpm, 'rap'); }

// ---------------------------------------------------------------- laid end to end
let T0 = 0; const lines = [], cues = [], shots = [], scenes = [], say = [], perf = [];
for (const s of SCENES) {
  scenes.push({ t: T0, set: s.set, tod: s.tod, ambience: s.ambience, focus: s.focus, caption: s.caption, place: s.place, room: HIPHOP.room, setup: s.setup });
  for (const [t, ...r] of s.lines) lines.push([T0 + t, ...r]); say.push(...s.say); perf.push(...s.perf);
  for (const [t, f] of s.cues) cues.push([T0 + t, f]);
  for (const [t, sh] of s.shots) shots.push([T0 + t, sh]);
  T0 += s.len;
}
cues.sort((a, b) => a[0] - b[0]); shots.sort((a, b) => a[0] - b[0]);
export const RAP1 = {
  id: 'rap1', len: T0, voiced: true, audioV: 2, pace: 0, scenes, lines, cues, shots, say, perf,
  samplesV: 2, samples: ['applause_long', 'drumroll16', 'ring', 'notify', 'roar', 'micdrop', 'snore', 'scratchstop', 'clank', 'chain', 'sadtrombone', 'whoosh', 'airhorn', ...Object.values(PERF).map((p) => p.beatFile), ...Object.entries(TAKES).flatMap(([b, n]) => Array.from({ length: n }, (_, i) => b + (i + 1)))],
  title: { zh: ['Josh & Jasper', '大嘻哈時代3'], en: ['Josh & Jasper', 'The Rap Era 3'] },
  end: { zh: '《大嘻哈時代3》海選　完', en: 'The End' },
  blurb: { zh: '八位參賽者，每人只有三十秒！菜市場饒舌阿嬤、只會說 yeah 的 Lil 泡麵、對著評審唱情歌的 R&B 王子、唱到一半去送單的外送員、邊做伏地挺身邊饒舌的健身教練、三十秒只說四個字的詩人……還有從聖地牙哥來的 Josh，和人中有顆痣、會恐龍吼的弟弟 Jasper。', en: 'Eight contestants, thirty seconds each! A market grandma, a rookie who only says yeah, an R&B prince serenading a judge, a courier who leaves mid-song for an order, a trainer rapping through push-ups, a poet who gets four words out — and Josh from San Diego, with his little brother Jasper and his dinosaur roar.' },
  cast: Object.fromEntries([...JUDGES, 'dj', ...CONTESTANTS].map((n) => [n, [n, { team: 'show' }]])),
};
