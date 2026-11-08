// Reel Giemme DVR · v2 (scheda G "Explainer SaaS" nei colori Giemme)
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {G, H, SEGS, segById, segStart, TOTAL, VOICE_END, W, FPS} from '../giemme/timeline';
import {FramedVideo, VideoCard} from '../giemme/video';
import {Arcs, Chevrons, Cursor, FONT, Hazard, HEX_W, HexGrid, hexPos, Heading, Ill, inOut, INK, k, Nav, Paper, Pill, RiskBar, Sub, Tile, Underline} from './gfx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const punch = (g: number, at: number, amount: number) =>
  1 + interpolate(g, [at, at + 4], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.6))});
const ramp = (g: number, a: number, b: number, z1: number, z2: number) =>
  interpolate(g, [a, b], [z1, z2], {...clamp, easing: Easing.inOut(Easing.cubic)});

/* ---------------- tempi (frame globali) ---------------- */
const T = {
  b0: segStart['0103b'], non: G('0103b', 'non'), solamente: G('0103b', 'solamente'), documento: G('0103b', 'documento'),
  tenere: G('0103b', 'tenere'), cassetto: G('0103b', 'cassetto'), affinche: G('0103b', 'affinché'), regola: G('0103b', 'regola'),
  c0: segStart['0103c'], sai: G('0103c', 'sai'), cos: G('0103c', "cos'è"), realmente1: G('0103c', 'realmente'), dvr: G('0103c', 'dbr'),
  d0: segStart['0104'], tale: G('0104', 'tale'), presente: G('0104', 'presente'), attivo: G('0104', 'attivo'), visionabile: G('0104', 'visionabile'),
  tutta: G('0104', 'tutta'), da2: G('0104', 'da', 1), tutti: G('0104', 'tutti'),
  e0: segStart['0109'], documento2: G('0109', 'documento'), analizzate: G('0109', 'analizzate'), singole: G('0109', 'singole'),
  attivita: G('0109', 'attività'), vengono2: G('0109', 'vengono', 1), rischi: G('0109', 'rischi'), queste: G('0109', 'queste'),
  infine: G('0109', 'infine'), strutturare: G('0109', 'strutturare'), misure: G('0109', 'misure'), prevenzione: G('0109', 'prevenzione'),
  tecniche: G('0109', 'tecniche'), organizzative: G('0109', 'organizzative'), per: G('0109', 'per'), mitigare: G('0109', 'mitigare'),
  ridurre: G('0109', 'ridurre'), rischio: G('0109', 'rischio'),
  f0: segStart['0110'], quindi: G('0110', 'quindi'), deve: G('0110', 'deve'), rappresentare: G('0110', 'rappresentare'),
  realmente2: G('0110', 'realmente'), azienda: G('0110', "l'azienda"), esuo: G('0110', 'e'), ciclo: G('0110', 'ciclo'),
  tu: G('0110', 'tu'), sapevi: G('0110', 'sapevi'), cosa: G('0110', 'cosa'), dvr2: G('0110', 'dvr', 1), fammelo: G('0110', 'fammelo'), sapere: G('0110', 'sapere'),
};
const N = 7;
const S3 = {a: T.cassetto - 3, b: T.c0};
const S5 = {a: T.d0, b: T.e0};
const S7 = {a: T.e0, b: T.per};
const S11 = {a: T.azienda - 3, b: T.tu - 5};
const CH_IN = T.tu - 5; // chevron che coprono
const CH_OUT = T.fammelo - 3; // chevron che escono
const CH_PER = T.per - 2; // chevron che scoprono il parlato

/* ---------------- parlato ---------------- */
const zoomMul = (id: string, g: number) => {
  switch (id) {
    case '0103a': return ramp(g, 0, T.b0, 1, 1.03);
    case '0103b': return 1.03 * punch(g, T.b0, 0.07) * ramp(g, T.b0, T.cassetto, 1, 1.03);
    case '0103c': return ramp(g, T.c0, T.c0 + 50, 1.02, 1.05) * punch(g, T.dvr, 0.08);
    case '0109': return ramp(g, T.per, VOICE_END, 1, 1.05) * punch(g, T.ridurre, 0.05);
    case '0110': return ramp(g, T.f0, T.azienda, 1, 1.04) * punch(g, T.realmente2, 0.05) * ramp(g, T.fammelo - 4, VOICE_END + 12, 1, 0.92);
    default: return 1;
  }
};
const Talking: React.FC<{id: string}> = ({id}) => {
  const local = useCurrentFrame();
  return <FramedVideo id={id} zoomMul={zoomMul(id, local + segStart[id])} />;
};

/* ---------------- livelli con transizione ---------------- */
type Tin = 'zoom-out' | 'none';
type Tout = 'zoom-in' | 'none';
const Layer: React.FC<{g: number; a: number; b: number; tin: Tin; tout: Tout; children: React.ReactNode}> = ({g, a, b, tin, tout, children}) => {
  if (g < a || g >= b + (tout === 'zoom-in' ? N : 0)) return null;
  const ei = k(g, a, a + N);
  const eo = k(g, b, b + N);
  let transform = '';
  let opacity = 1;
  if (tin === 'zoom-out') { transform += `scale(${1.25 - 0.25 * ei}) `; opacity = ei; }
  if (tout === 'zoom-in' && g >= b) { transform += `scale(${1 + 0.35 * eo}) `; opacity = 1 - eo; }
  const blur = g < a + N && tin !== 'none' ? Math.sin(ei * Math.PI) * 16 : g >= b && tout !== 'none' ? Math.sin(eo * Math.PI) * 16 : 0;
  return <AbsoluteFill style={{transform, opacity, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

const Burn: React.FC<{g: number; at: number; len?: number; peak?: number}> = ({g, at, len = 12, peak = 0.45}) => {
  if (g < at || g > at + len) return null;
  const o = interpolate(g - at, [0, len * 0.45, len], [0, peak, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o, filter: 'blur(20px)', background: 'radial-gradient(60% 42% at 88% 12%, rgba(255,90,40,1), rgba(229,2,16,.75) 35%, transparent 68%), radial-gradient(48% 36% at 10% 92%, rgba(255,170,70,.9), transparent 65%)'}} />;
};

/* ---------------- testi sul parlato ---------------- */
const Over: React.FC = () => {
  const g = useCurrentFrame();
  const hookOut = T.non - 2;
  const hk = inOut(g, 12, hookOut, 9, 30);
  return (
    <>
      {/* 1 · hook */}
      <Sub g={g} y={1030} out={hookOut} size={60} words={['Il', 'tuo', 'DVR', 'è', 'in', 'un'].map((t, i) => ({at: 2 + i * 2, text: t}))} />
      {hk && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', ...hk}}>
          <div style={{position: 'relative', fontFamily: FONT, fontWeight: 800, fontSize: 170, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', textShadow: '0 5px 26px rgba(0,0,0,.45)'}}>
            cassetto?
            <Underline g={g} at={18} />
          </div>
        </div>
      )}
      {/* 2 · il mito */}
      <Sub g={g} y={1050} out={S3.a + 1} words={[{at: T.non, text: 'non è'}, {at: T.solamente, text: 'solamente', key: true}]} />
      <Sub g={g} y={1140} out={S3.a + 1} words={[{at: T.documento, text: 'un documento'}, {at: T.tenere, text: 'da tenere'}]} />
      {/* 4 · DVR */}
      <Sub g={g} y={1010} out={T.d0} size={54} words={[{at: T.sai, text: 'Sai'}, {at: T.cos, text: "che cos'è"}, {at: T.realmente1, text: 'realmente'}, {at: T.dvr - 2, text: 'un DVR?', key: true}]} />
      {[['D', 'Documento'], ['V', 'Valutazione'], ['R', 'Rischi']].map(([l, w], i) => (
        <Tile key={l} g={g} at={T.dvr + 4 + i * 6} out={T.d0 - 1} x={86 + i * 314} y={1110} w={280} label={w} mini>
          <span style={{color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 1}}>{l}</span>
        </Tile>
      ))}
      {/* 10 · ridurre */}
      <Sub g={g} y={1030} out={T.f0} words={[{at: T.per + 2, text: 'per mitigare e'}, {at: T.ridurre, text: 'ridurre', key: true}]} />
      <RiskBar g={g} at={T.mitigare} out={T.f0 - 4} a={T.ridurre} b={T.rischio + 8} y={1160} />
      {/* 11 · sintesi sul parlato */}
      <Sub g={g} y={1030} out={S11.a + 1} words={[{at: T.f0 + 2, text: 'Il DVR'}, {at: T.quindi, text: 'quindi'}]} />
      <Sub g={g} y={1120} out={S11.a + 1} words={[{at: T.deve, text: 'deve rappresentare'}, {at: T.realmente2, text: 'realmente', key: true}]} />
      {/* 13 · CTA */}
      <Sub g={g} y={1050} out={Infinity} words={[{at: CH_OUT + 4, text: 'Fammelo'}, {at: T.sapere, text: 'sapere'}]} />
      <Pill g={g} at={T.fammelo + 2} x={W / 2} y={1150} text="Scrivilo nei commenti" size={52} pressAt={T.sapere + 6} />
      <Cursor g={g} at={T.fammelo + 4} clickAt={T.sapere + 6} x={W * 0.6} y={1205} />
    </>
  );
};

/* ---------------- grafiche ---------------- */
const Graphics: React.FC = () => {
  const g = useCurrentFrame();
  const sel = (at: number, next: number) => k(g, at, at + 6) * (1 - k(g, next, next + 6));
  const dimOf = (at: number) => (g >= at ? 0 : 0);
  const workers = [[1, 0], [2, 1], [0, 1], [3, 2], [1, 2], [2, 3], [0, 3], [3, 4], [1, 4]];
  const actCells = [{c: 1, r: 0, at: T.documento2, n: 'ufficio'}, {c: 2, r: 1, at: T.analizzate, n: 'cantiere'}, {c: 1, r: 2, at: T.singole, n: 'magazzino'}, {c: 2, r: 3, at: T.attivita, n: 'macchine'}];
  const hazCells = [{c: 2, r: 0, at: T.rischi, s: '!'}, {c: 3, r: 1, at: T.rischi + 5, s: 'el'}, {c: 0, r: 2, at: T.rischi + 10, s: 'ca'}, {c: 3, r: 3, at: T.queste, s: 'ru'}];
  const labels = [{t: 'Ufficio', x: 40, y: 0.27}, {t: 'Cantiere', x: 790, y: 0.37}, {t: 'Magazzino', x: 40, y: 0.46}, {t: 'Macchine', x: 790, y: 0.55}];
  const step = g < T.vengono2 ? 0 : g < T.infine ? 1 : 2;
  const center = (c: number, r: number) => {const p = hexPos(c, r); return {x: p.x + HEX_W / 2, y: p.y + HEX_W * 0.577};};
  return (
    <>
      {/* 3 · nel cassetto */}
      <Layer g={g} a={S3.a} b={S3.b} tin="zoom-out" tout="zoom-in">
        <Paper g={g} />
        <Heading g={g} at={S3.a + 2} y={250} parts={[{text: 'nel'}, {text: 'cassetto', red: true}]} />
        <Tile g={g} at={S3.a + 3} x={194} y={410} w={692} label="Archivio">
          <Ill name="archivio" p={k(g, S3.a + 6, T.regola - 2)} />
        </Tile>
        <Pill g={g} at={T.regola - 2} x={W / 2} y={1210} text="✓ in regola" kind="out" size={54} strikeAt={T.regola + 9} />
      </Layer>

      {/* 5-6 · tre parole + lavoratori */}
      <Layer g={g} a={S5.a} b={S5.b} tin="none" tout="none">
        <AbsoluteFill style={{opacity: k(g, S5.a, S5.a + 8)}}><Paper g={g} /></AbsoluteFill>
        <Sequence from={segStart['0104']} durationInFrames={segById('0104').frames}>
          <VideoCard id="0104" rect={{x: 313, y: 240, w: 454, h: 454}} radius={104} faceFrac={0.42} fy={0.45}
            pOf={(x) => k(x, S5.a, S5.a + 11)} opOf={(x) => 1 - k(x, T.da2, T.da2 + 8)} />
        </Sequence>
        <Heading g={g} at={T.tale} out={T.da2} y={730} size={54} parts={[{text: 'Tale documento deve essere'}]} />
        <Tile g={g} at={T.presente} out={T.da2} x={43} y={870} w={313} label="presente" sel={sel(T.presente, T.attivo)} dim={g >= T.attivo ? 1 : 0}><Ill name="puntina" p={k(g, T.presente + 4, T.presente + 12)} /></Tile>
        <Tile g={g} at={T.attivo} out={T.da2} x={383} y={860} w={335} label="attivo" sel={sel(T.attivo, T.visionabile)} dim={g >= T.visionabile ? 1 : 0}><Ill name="interruttore" p={k(g, T.attivo + 4, T.attivo + 10)} /></Tile>
        <Tile g={g} at={T.visionabile} out={T.da2} x={724} y={870} w={313} label="visionabile" sel={sel(T.visionabile, T.da2)}><Ill name="occhio" p={k(g, T.visionabile + 4, T.visionabile + 12)} /></Tile>
        {[T.presente, T.attivo, T.visionabile].map((a, i) => {
          const s = inOut(g, a + 6, T.da2, 5, 10);
          return s && <div key={i} style={{position: 'absolute', top: 1225, left: [200, 550, 880][i] - 24, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#1F9D55', ...s}}>✓</div>;
        })}
        <Pill g={g} at={T.tutta} out={T.da2} x={W / 2} y={1340} text="di tutta l'azienda" kind="out" size={46} />
        {g >= T.da2 && <Arcs g={g} at={T.da2} />}
        <Heading g={g} at={T.da2} y={250} size={64} parts={[{text: 'da parte di', at: T.da2}, {text: 'tutti', red: true, at: T.tutti}, {text: 'i lavoratori', at: T.tutti + 3}]} />
        {g >= T.da2 + 2 && <HexGrid g={g} at={T.da2 + 2} cells={workers.map(([c, r], i) => ({c, r, at: T.tutti + i * 2, node: <Ill name="lavoratore" p={1} />}))} />}
      </Layer>

      {/* 7-9 · attività -> rischi -> misure */}
      <Layer g={g} a={S7.a} b={S7.b} tin="none" tout="zoom-in">
        <Paper g={g} />
        <Arcs g={g} at={S7.a} />
        <Nav g={g} at={S7.a + 2} out={Infinity} step={step} />
        <HexGrid g={g} at={S7.a + 2} fade={k(g, T.infine, T.infine + 10)}
          cells={[...actCells.map((q) => ({c: q.c, r: q.r, at: q.at, node: <Ill name={q.n} p={k(g, q.at, q.at + 20)} />})), ...hazCells.map((q) => ({c: q.c, r: q.r, at: q.at, node: <Hazard sym={q.s} />}))]} />
        {labels.map((l, i) => {
          const s = inOut(g, actCells[i].at + 3, T.infine, 7, 16);
          return s && <div key={l.t} style={{position: 'absolute', left: l.x, top: H * l.y, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK, background: '#fff', borderRadius: 99, padding: '8px 26px', boxShadow: '0 10px 30px rgba(26,26,30,.12)', ...s}}>{l.t}</div>;
        })}
        {g >= T.rischi && g < T.infine + 8 && (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 1 - k(g, T.infine, T.infine + 8)}}>
            {hazCells.map((h, i) => {
              const a = center(actCells[i].c, actCells[i].r);
              const b = center(h.c, h.r);
              const d = k(g, h.at, h.at + 9);
              return <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * d} y2={a.y + (b.y - a.y) * d} stroke={INK} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />;
            })}
          </svg>
        )}
        <Tile g={g} at={T.strutturare - 4} x={238} y={440} w={604} label="Misure" grad><Ill name="scudo" p={k(g, T.misure, T.misure + 10)} /></Tile>
        <Pill g={g} at={T.prevenzione} x={300} y={1190} text="prevenzione" size={50} />
        <Pill g={g} at={T.tecniche} x={790} y={1190} text="tecniche" size={50} />
        <Pill g={g} at={T.organizzative} x={W / 2} y={1330} text="organizzative" size={50} />
      </Layer>

      {/* 11 · l'azienda e il suo ciclo */}
      <Layer g={g} a={S11.a} b={S11.b} tin="zoom-out" tout="none">
        <Paper g={g} />
        <Heading g={g} at={S11.a + 2} y={250} size={64} parts={[{text: 'rappresentare'}, {text: 'realmente', red: true}, {text: "l'azienda", at: T.azienda}]} />
        {(() => {
          const p = k(g, S11.a + 4, S11.a + 22);
          return (
            <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
              <circle cx={540} cy={900} r={410} fill="none" stroke="#E50210" strokeWidth={9} strokeDasharray="60 40" pathLength={1000} strokeDashoffset={-g * 3} opacity={p} transform={`rotate(${-90 + 360 * (1 - p)} 540 900)`} />
            </svg>
          );
        })()}
        <Tile g={g} at={S11.a + 4} x={290} y={650} w={500}><Ill name="azienda" p={k(g, S11.a + 12, S11.a + 20)} /></Tile>
        <Pill g={g} at={T.ciclo - 6} x={230} y={470} text="progetto" kind="out" size={44} />
        <Pill g={g} at={T.ciclo - 2} x={860} y={700} text="produzione" kind="out" size={44} />
        <Pill g={g} at={T.ciclo + 2} x={860} y={1140} text="consegna" kind="out" size={44} />
        <Pill g={g} at={T.ciclo + 6} x={240} y={1290} text="manutenzione" kind="out" size={44} />
        <Heading g={g} at={T.esuo} y={1400} size={56} parts={[{text: 'e il suo', at: T.esuo}, {text: 'ciclo lavorativo', red: true, at: T.ciclo}]} />
      </Layer>

      {/* 10 · chevron che scoprono il parlato */}
      {g >= CH_PER && g < CH_PER + 14 && <Chevrons x={interpolate(g, [CH_PER, CH_PER + 14], [-40, 160], {...clamp, easing: Easing.inOut(Easing.cubic)})} />}

      {/* 12 · E tu? sui chevron */}
      {g >= CH_IN && g < CH_OUT + 14 && (
        <AbsoluteFill>
          <Chevrons x={g < CH_OUT ? interpolate(g, [CH_IN, CH_IN + 10], [-160, 0], {...clamp, easing: Easing.out(Easing.cubic)}) : interpolate(g, [CH_OUT, CH_OUT + 14], [0, 170], {...clamp, easing: Easing.in(Easing.cubic)})} />
          {g < CH_OUT + 4 && (
            <div style={{position: 'absolute', left: 86, top: 690, color: '#fff', fontFamily: FONT, opacity: 1 - k(g, CH_OUT, CH_OUT + 4)}}>
              {(() => {const s = inOut(g, T.tu - 2, Infinity, 7, 20); return s && <div style={{fontWeight: 900, fontSize: 190, letterSpacing: '-0.04em', lineHeight: 1, ...s}}>E tu?</div>;})()}
              <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 22, width: 820, marginTop: 34, fontWeight: 700, fontSize: 76, lineHeight: 1.15}}>
                {[[T.sapevi, 'Sapevi'], [T.cosa, 'cosa fosse'], [T.dvr2, 'un DVR?']].map(([a, t]) => {const s = inOut(g, a as number, Infinity, 6, 14); return s && <span key={t as string} style={s}>{t}</span>;})}
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}
    </>
  );
};

/* ---------------- effetti sonori: entrata e uscita per ogni enfasi ---------------- */
const PEAK: Record<string, number> = {
  short_whoosh: 0.22, short_whoosh_2: 0.2, quick_whoosh: 0.13, hollow_whoosh: 0.38, low_whoosh: 0.42, low_slow_whoosh: 0.75,
  attack_whoosh: 0.55, boom_sub: 0, click_secco: 0, tick_rapido: 0, tap_grave: 0, doppio_click: 0, swoosh_brillante: 0.18, riser_tonale: 1.4,
};
const sfx: {name: string; peak: number; vol: number}[] = [];
const add = (name: string, peak: number, vol: number) => sfx.push({name, peak, vol});
const IN_ = (f: number, v = 0.28) => add(sfx.length % 2 ? 'short_whoosh' : 'short_whoosh_2', f + 3, v); // entrata di un elemento
const OUT_ = (f: number, v = 0.16) => add('quick_whoosh', f + 2, v); // uscita di un elemento
{
  // 1 · hook
  add('attack_whoosh', 12, 0.3); add('boom_sub', 14, 0.45); add('click_secco', 22, 0.2);
  [2, 4, 6, 8, 10].forEach((f) => add('tick_rapido', f, 0.07));
  OUT_(T.non - 2);
  // 2
  [T.non, T.documento, T.tenere].forEach((f) => add('tick_rapido', f, 0.09));
  add('tap_grave', T.solamente, 0.25);
  // 3 · cassetto
  add('hollow_whoosh', S3.a + 3, 0.35); IN_(S3.a + 3); add('tap_grave', T.regola - 6, 0.35);
  IN_(T.regola - 2, 0.22); add('click_secco', T.regola + 9, 0.32); add('boom_sub', T.regola, 0.3);
  add('hollow_whoosh', S3.b + 3, 0.3);
  // 4 · DVR
  [T.sai, T.cos, T.realmente1].forEach((f) => add('tick_rapido', f, 0.08));
  add('attack_whoosh', T.dvr - 2, 0.25); add('boom_sub', T.dvr - 2, 0.45);
  [0, 1, 2].forEach((i) => IN_(T.dvr + 4 + i * 6, 0.24)); OUT_(T.d0 - 1, 0.18);
  // 5-6
  add('low_whoosh', S5.a + 4, 0.3);
  IN_(T.tale, 0.18);
  [T.presente, T.attivo, T.visionabile].forEach((f) => {IN_(f, 0.28); add('doppio_click', f + 6, 0.3);});
  IN_(T.tutta, 0.2);
  OUT_(T.da2, 0.25); add('short_whoosh', T.da2 + 4, 0.25);
  for (let i = 0; i < 9; i++) add('tick_rapido', T.tutti + i * 2, 0.06);
  // 7-9
  add('low_whoosh', S7.a, 0.3); IN_(S7.a + 2, 0.2);
  [T.documento2, T.analizzate, T.singole, T.attivita].forEach((f) => {add('tick_rapido', f, 0.12); IN_(f + 3, 0.14);});
  add('doppio_click', T.vengono2 + 2, 0.25); add('short_whoosh', T.vengono2 + 3, 0.22);
  [T.rischi, T.rischi + 5, T.rischi + 10, T.queste].forEach((f) => {add('tick_rapido', f, 0.12); add('swoosh_brillante', f + 4, 0.1);});
  add('doppio_click', T.infine + 2, 0.25); OUT_(T.infine, 0.22);
  IN_(T.strutturare - 4, 0.3); add('boom_sub', T.strutturare, 0.3); add('swoosh_brillante', T.misure, 0.25); add('doppio_click', T.misure + 8, 0.28);
  [T.prevenzione, T.tecniche, T.organizzative].forEach((f) => IN_(f, 0.22));
  // 10 · chevron + ridurre
  add('hollow_whoosh', CH_PER + 7, 0.38);
  IN_(T.mitigare, 0.18); add('tap_grave', T.ridurre, 0.3); add('riser_tonale', T.rischio + 8, 0.18); add('boom_sub', T.rischio + 8, 0.35);
  OUT_(T.f0 - 4, 0.2);
  // 11
  add('tick_rapido', T.f0 + 2, 0.08); add('tick_rapido', T.quindi, 0.08); add('tap_grave', T.realmente2, 0.28);
  add('hollow_whoosh', S11.a + 3, 0.32); IN_(S11.a + 4, 0.25); add('low_slow_whoosh', S11.a + 20, 0.22);
  [T.ciclo - 6, T.ciclo - 2, T.ciclo + 2, T.ciclo + 6].forEach((f) => IN_(f, 0.16));
  // 12 · E tu?
  add('attack_whoosh', CH_IN + 8, 0.32); add('boom_sub', T.tu - 2, 0.55);
  [T.sapevi, T.cosa, T.dvr2].forEach((f) => add('tick_rapido', f, 0.1));
  add('hollow_whoosh', CH_OUT + 7, 0.35);
  // 13 · CTA
  IN_(T.fammelo + 2, 0.25); add('click_secco', T.sapere + 6, 0.4); add('swoosh_brillante', T.sapere + 8, 0.22);
  add('low_slow_whoosh', TOTAL - 4, 0.2);
}

export const GiemmeReel2: React.FC<{voce?: 'originale' | 'ai'}> = ({voce = 'originale'}) => {
  const g = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SEGS.map((s, i) => (
        <Sequence key={s.id} from={segStart[s.id]} durationInFrames={s.frames + (i === SEGS.length - 1 ? TOTAL - VOICE_END : 0)}>
          <Talking id={s.id} />
        </Sequence>
      ))}
      <Over />
      <Graphics />
      <Burn g={g} at={S7.a - 5} />
      {g >= T.d0 - 1 && g < T.d0 + 1 && <AbsoluteFill style={{background: '#E50210', opacity: g === T.d0 - 1 ? 0.85 : 0.4}} />}
      {SEGS.map((s) => (
        <Sequence key={`a${s.id}`} from={segStart[s.id]} durationInFrames={s.frames}>
          <Audio src={staticFile(voce === 'ai' ? `giemme/voce_ai/${s.id}.wav` : `giemme/clips/${s.id}.wav`)} />
        </Sequence>
      ))}
      {sfx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.peak - PEAK[s.name] * FPS))} durationInFrames={Math.round(2 * FPS)}>
          <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
