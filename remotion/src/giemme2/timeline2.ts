// Timeline v2.1: stessi pezzi del montaggio, con pause di lettura inserite nei silenzi del parlato.
// Le pause cadono dove le grafiche coprono il video (o a fine frase), così il labiale resta sincronizzato.
import words from '../giemme/data/words.json';
import {FPS, SEGS} from '../giemme/timeline';

export {FPS};
export const W = 1080;
export const H = 1920;

/** pause: pezzo, punto di taglio in secondi (locali al pezzo; 'end' = in coda), durata della pausa */
const HOLDS: {id: string; at: number | 'end'; s: number}[] = [
  {id: '0103b', at: 'end', s: 0.9}, // "…in regola." → si legge il timbro barrato
  {id: '0103c', at: 'end', s: 0.7}, // "…un DVR?" → si leggono D · V · R
  {id: '0104', at: 'end', s: 0.8}, // "…tutti i lavoratori." → nido d'ape
  {id: '0109', at: 5.68, s: 0.8}, // dopo le attività
  {id: '0109', at: 9.6, s: 0.8}, // dopo i rischi
  {id: '0109', at: 16.1, s: 0.9}, // dopo le misure
  {id: '0110', at: 5.7, s: 0.6}, // dopo "ciclo lavorativo."
  {id: '0110', at: 8.15, s: 0.5}, // dopo "Sapevi cosa fosse un DVR?"
];

export type Piece = {id: string; from: number; len: number; start: number; hold: number};
export const PIECES: Piece[] = [];
export const segStart: Record<string, number> = {};
{
  let g = 0;
  for (const s of SEGS) {
    const cuts = HOLDS.filter((h) => h.id === s.id).map((h) => ({f: h.at === 'end' ? s.frames : Math.round(h.at * FPS), hold: Math.round(h.s * FPS)}))
      .sort((a, b) => a.f - b.f);
    let from = 0;
    segStart[s.id] = g;
    const bounds = [...cuts, ...(cuts.some((c) => c.f === s.frames) ? [] : [{f: s.frames, hold: 0}])];
    for (const c of bounds) {
      PIECES.push({id: s.id, from, len: c.f - from, start: g, hold: c.hold});
      g += c.f - from + c.hold;
      from = c.f;
    }
  }
}
export const VOICE_END = PIECES.reduce((a, p) => Math.max(a, p.start + p.len + p.hold), 0);
export const TAIL = 14;
export const TOTAL = VOICE_END + TAIL;

/** frame globale di un frame locale del pezzo */
export const toGlobal = (id: string, local: number) => {
  const ps = PIECES.filter((p) => p.id === id);
  for (const p of ps) if (local < p.from + p.len) return p.start + (local - p.from);
  const l = ps[ps.length - 1];
  return l.start + l.len;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ù0-9']/g, '');
/** frame globale in cui viene detta la parola (n = occorrenza) */
export const G = (id: string, word: string, n = 0, offset = 0): number => {
  const list = (words as any)[id].words as {w: string; t: number}[];
  let hits = list.filter((x) => norm(x.w) === norm(word));
  if (!hits.length) hits = list.filter((x) => norm(x.w).startsWith(norm(word)));
  if (!hits[n]) throw new Error(`Parola "${word}" non trovata in ${id}`);
  return toGlobal(id, Math.round((hits[n].t + offset) * FPS));
};

/** inizio (frame globale) del pezzo che parte al secondo locale `sec` del clip (o subito dopo) */
export const pieceStartAt = (id: string, sec: number) => {
  const f = Math.round(sec * FPS) - 1;
  const p = PIECES.find((q) => q.id === id && q.from >= f);
  if (!p) throw new Error(`nessun pezzo di ${id} dopo ${sec}s`);
  return p.start;
};

/**
 * Frame del video da mostrare al frame globale g, per il clip `id`: mai fermo.
 * Durante una pausa il tratto di silenzio intorno al taglio (A frame prima, B dopo) viene rallentato
 * su tutta la durata della pausa, così il volto resta vivo e il labiale torna in sincrono subito dopo.
 */
const A = 7;
const B = 6;
export const vmap = (id: string, g: number): number => {
  const ps = PIECES.filter((q) => q.id === id);
  const last = ps[ps.length - 1].from + ps[ps.length - 1].len - 1;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    const next = ps[i + 1];
    const end = p.from + p.len; // frame locale del taglio
    const b = next ? B : 0;
    const winStartG = p.start + Math.max(0, p.len - A);
    const winEndG = p.start + p.len + p.hold + b;
    if (p.hold > 0 && g >= winStartG && g < winEndG) {
      const l0 = end - Math.min(A, p.len);
      const l1 = end + b;
      return Math.min(last, Math.round(l0 + ((g - winStartG) / (winEndG - winStartG)) * (l1 - l0)));
    }
    if (g < p.start + p.len + p.hold) return Math.min(last, p.from + Math.max(0, g - p.start));
  }
  const l = ps[ps.length - 1];
  return l.from + l.len - 1;
};
