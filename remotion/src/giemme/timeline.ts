import words from './data/words.json';
import faces from './data/faces.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Pezzi in ordine di montaggio, già tagliati e accelerati a 1,06x (progetti/giemme-engineering/tagli.txt).
export const SEGS = [
  {id: '0103a', dur: 0.8667},
  {id: '0103b', dur: 4.4667},
  {id: '0103c', dur: 2.0},
  {id: '0104', dur: 6.7},
  {id: '0109', dur: 19.4333},
  {id: '0110', dur: 8.8667},
].map((s) => ({...s, frames: Math.round(s.dur * FPS)}));

export const segStart: Record<string, number> = {};
{
  let acc = 0;
  for (const s of SEGS) {
    segStart[s.id] = acc;
    acc += s.frames;
  }
}
export const TAIL = 14;
export const VOICE_END = SEGS.reduce((a, s) => a + s.frames, 0);
export const TOTAL = VOICE_END + TAIL;
export const segById = (id: string) => SEGS.find((s) => s.id === id)!;

/** Il pezzo che si vede al frame globale f, con il frame locale. */
export const segAt = (f: number) => {
  for (const s of SEGS) if (f < segStart[s.id] + s.frames) return {id: s.id, local: Math.max(0, f - segStart[s.id])};
  const l = SEGS[SEGS.length - 1];
  return {id: l.id, local: l.frames - 1};
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ù0-9']/g, '');

/** Frame globale in cui viene detta la parola (n = occorrenza). */
export const G = (id: string, word: string, n = 0, offset = 0): number => {
  const list = (words as any)[id].words as {w: string; t: number}[];
  let hits = list.filter((x) => norm(x.w) === norm(word));
  if (!hits.length) hits = list.filter((x) => norm(x.w).startsWith(norm(word)));
  if (!hits[n]) throw new Error(`Parola "${word}" non trovata in ${id}`);
  return segStart[id] + Math.round((hits[n].t + offset) * FPS);
};

/** Posizione del viso (0-1) nel frame locale del pezzo. */
export const faceAt = (id: string, local: number) => {
  const tr = (faces as any)[id] as number[][];
  const f = local;
  if (f <= tr[0][0]) return {cx: tr[0][1], cy: tr[0][2], h: tr[0][3]};
  for (let i = 1; i < tr.length; i++) {
    if (f <= tr[i][0]) {
      const a = tr[i - 1];
      const b = tr[i];
      const k = (f - a[0]) / (b[0] - a[0]);
      return {cx: a[1] + (b[1] - a[1]) * k, cy: a[2] + (b[2] - a[2]) * k, h: a[3] + (b[3] - a[3]) * k};
    }
  }
  const l = tr[tr.length - 1];
  return {cx: l[1], cy: l[2], h: l[3]};
};

/** Zoom di base: viso verso il 34% dell'altezza, mai oltre il 118%. */
export const baseZoom = (id: string) => {
  const tr = (faces as any)[id] as number[][];
  const cy = tr.reduce((a, r) => a + r[2], 0) / tr.length;
  const h = tr.reduce((a, r) => a + r[3], 0) / tr.length;
  let z = Math.min(1.18, Math.max(1, 0.66 / (1 - cy)));
  z = Math.min(z, Math.max(1, 0.26 / h));
  return z;
};
