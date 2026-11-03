import words from './data/words.json';
import faces from './data/faces.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Clip in ordine, già tagliate e accelerate a 1,06x (strumenti/prepara_clip.sh).
// trim: secondi tolti all'inizio della clip preparata.
export const CLIPS = [
  {id: '9194', dur: 4.2333, trim: 0},
  {id: '9200', dur: 6.0333, trim: 0},
  {id: '9202', dur: 6.6, trim: 0.45},
  {id: '9220', dur: 5.3, trim: 0},
  {id: '9233', dur: 5.3333, trim: 0},
  {id: '9235', dur: 8.8667, trim: 0},
  {id: '9236', dur: 2.5333, trim: 0},
  {id: '9239', dur: 5.9667, trim: 0},
  {id: '9241', dur: 6.1, trim: 0},
].map((c) => ({...c, frames: Math.round((c.dur - c.trim) * FPS)}));

export const clipStart: Record<string, number> = {};
{
  let acc = 0;
  for (const c of CLIPS) {
    clipStart[c.id] = acc;
    acc += c.frames;
  }
}
export const TAIL = 12;
export const TOTAL = CLIPS.reduce((a, c) => a + c.frames, 0) + TAIL;

export const clipById = (id: string) => CLIPS.find((c) => c.id === id)!;

const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ù0-9']/g, '');

/** Frame locale (dentro la clip) in cui viene pronunciata la parola: n = occorrenza (0 = prima). */
export const atLocal = (id: string, word: string, n = 0, offset = 0): number => {
  const list = (words as any)[id].words as {w: string; t: number}[];
  let hits = list.filter((x) => norm(x.w) === norm(word));
  if (!hits.length) hits = list.filter((x) => norm(x.w).startsWith(norm(word)));
  if (!hits[n]) throw new Error(`Parola "${word}" non trovata in ${id}`);
  const c = clipById(id);
  return Math.round((hits[n].t - c.trim + offset) * FPS);
};

/** Stesso tempo, ma sulla timeline globale. */
export const at = (id: string, word: string, n = 0, offset = 0) => clipStart[id] + atLocal(id, word, n, offset);

/** Posizione del viso (0-1) nel frame locale della clip, dalla traccia smussata. */
export const faceAt = (id: string, localFrame: number) => {
  const c = clipById(id);
  const f = localFrame + c.trim * FPS;
  const tr = (faces as any)[id] as number[][];
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

/** Zoom di base della clip: viso al 34% dell'altezza, mai oltre il 118%. */
export const baseZoom = (id: string) => {
  const tr = (faces as any)[id] as number[][];
  const cy = tr.reduce((a, r) => a + r[2], 0) / tr.length;
  const h = tr.reduce((a, r) => a + r[3], 0) / tr.length;
  let z = Math.min(1.18, Math.max(1, 0.66 / (1 - cy)));
  z = Math.min(z, Math.max(1, 0.26 / h));
  return z;
};
