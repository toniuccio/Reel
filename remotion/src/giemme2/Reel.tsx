// Reel Giemme DVR · v2.1 — scheda G nei colori Giemme, con pause di lettura, chevron continui e SFX vari
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {G, H, PIECES, pieceStartAt, segStart, TOTAL, VOICE_END, W, FPS} from './timeline2';
import {SEGS} from '../giemme/timeline';
import {PieceCard, SegVideo} from './video2';
import {Arcs, ChevronWipe, Cursor, FONT, Hazard, HEX_W, HexGrid, hexPos, Heading, Ill, inOut, INK, k, Nav, Paper, Pill, RiskBar, Sub, Tile, Underline} from './gfx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const punch = (g: number, at: number, amount: number) =>
  1 + interpolate(g, [at, at + 6], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.4))});
const ramp = (g: number, a: number, b: number, z1: number, z2: number) =>
  interpolate(g, [a, b], [z1, z2], {...clamp, easing: Easing.inOut(Easing.cubic)});

/* ---------------- tempi (frame globali, pause incluse) ---------------- */
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
  dopoMisure: pieceStartAt('0109', 16.1), dopoDvr: pieceStartAt('0110', 8.15),
  f0: segStart['0110'], quindi: G('0110', 'quindi'), deve: G('0110', 'deve'), rappresentare: G('0110', 'rappresentare'),
  realmente2: G('0110', 'realmente'), azienda: G('0110', "l'azienda"), esuo: G('0110', 'e'), ciclo: G('0110', 'ciclo'),
  tu: G('0110', 'tu'), sapevi: G('0110', 'sapevi'), cosa: G('0110', 'cosa'), dvr2: G('0110', 'dvr', 1), fammelo: G('0110', 'fammelo'), sapere: G('0110', 'sapere'),
};
T.per = Math.max(T.per, T.dopoMisure + 2);
T.fammelo = Math.max(T.fammelo, T.dopoDvr + 2);
const N = 9; // transizioni zoom più morbide
const W_IN = 16; // chevron: entrata (0,5 s)
const W_OUT = 32; // chevron: uscita lenta che scopre la scena (1 s)
const S3 = {a: T.cassetto - 3, b: T.c0};
const W1 = T.d0 - W_IN; // chevron tra la domanda e le tre parole: a metà corsa copre lo schermo
const S5 = {a: T.d0, b: T.e0};
const S7 = {a: T.e0, b: T.dopoMisure};
const W2 = S7.b - W_IN; // i chevron coprono durante la pausa e scoprono il parlato esattamente quando riparte
const S11 = {a: T.azienda - 3, b: T.tu - 6};
const CH_IN = T.tu - 14; // chevron che coprono per «E tu?»
const CH_OUT = T.dopoDvr; // i chevron escono quando riparte il parlato (niente fotogrammi fermi)

/* ---------------- parlato ---------------- */
const zoomMul = (id: string) => (g: number) => {
  switch (id) {
    case '0103a': return ramp(g, 0, T.b0, 1, 1.03);
    case '0103b': return 1.03 * punch(g, T.b0, 0.07) * ramp(g, T.b0, T.cassetto, 1, 1.03);
    case '0103c': return ramp(g, T.c0, T.d0, 1.02, 1.08) * punch(g, T.dvr, 0.06);
    case '0109': return ramp(g, T.per, VOICE_END, 1, 1.05) * punch(g, T.ridurre, 0.05);
    case '0110': return ramp(g, T.f0, T.azienda, 1, 1.04) * punch(g, T.realmente2, 0.05) * ramp(g, T.fammelo - 4, VOICE_END + 12, 1, 0.92);
    default: return 1;
  }
};

/* ---------------- livelli ---------------- */
type Tin = 'zoom-out' | 'cut';
type Tout = 'zoom-in' | 'cut';
const Layer: React.FC<{g: number; a: number; b: number; tin: Tin; tout: Tout; grp?: Grp; children: React.ReactNode}> = ({g, a, b, tin, tout, grp, children}) => {
  if (g < a || g >= b + (tout === 'zoom-in' ? N : 0)) return null;
  const ei = k(g, a, a + N);
  const eo = k(g, b, b + N);
  let transform = grp ? `translateX(${shiftX(grp, g)}px) ` : '';
  let opacity = 1;
  if (tin === 'zoom-out') { transform += `scale(${1.2 - 0.2 * ei}) `; opacity = ei; }
  if (tout === 'zoom-in' && g >= b) { transform += `scale(${1 + 0.3 * eo}) `; opacity = 1 - eo; }
  const blur = g < a + N && tin === 'zoom-out' ? Math.sin(ei * Math.PI) * 14 : g >= b && tout === 'zoom-in' ? Math.sin(eo * Math.PI) * 14 : 0;
  return <AbsoluteFill style={{transform, opacity, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};
type Grp = 'talk' | 'S5' | 'S7' | 'S11';
const PUSH: {s: number; out: Grp | null; inn: Grp | null}[] = [
  {s: W1, out: 'talk', inn: 'S5'},
  {s: W2, out: 'S7', inn: 'talk'},
  {s: CH_IN, out: 'S11', inn: null},
  {s: CH_OUT - W_IN, out: null, inn: 'talk'},
];
const shiftX = (grp: Grp, g: number) => {
  let x = 0;
  for (const t of PUSH) {
    const m = t.s + W_IN;
    if (t.out === grp && g >= t.s && g < m) x += 0.28 * W * Easing.in(Easing.cubic)((g - t.s) / W_IN);
    if (t.inn === grp && g >= m && g < m + W_OUT) x -= 0.34 * W * (1 - Easing.out(Easing.cubic)((g - m) / W_OUT));
  }
  return x;
};
const wipeP = (g: number, start: number) => (g < start + W_IN ? (g - start) / W_IN / 2 : 0.5 + (g - start - W_IN) / W_OUT / 2);

/* ---------------- testi sul parlato ---------------- */
const Over: React.FC = () => {
  const g = useCurrentFrame();
  const hookOut = T.non - 3;
  const hk = inOut(g, 14, hookOut, 14, 34);
  return (
    <>
      {/* 1 · hook */}
      <Sub g={g} y={1020} out={hookOut} size={62} words={['Il', 'tuo', 'DVR', 'è', 'in', 'un'].map((t, i) => ({at: 1 + i * 2, text: t}))} />
      {hk && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1105, display: 'flex', justifyContent: 'center', ...hk}}>
          <div style={{position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 176, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', textShadow: '0 5px 26px rgba(0,0,0,.45)'}}>
            cassetto?
            <Underline g={g} at={20} />
          </div>
        </div>
      )}
      {/* 2 · il mito */}
      <Sub g={g} y={1040} out={S3.a + 1} words={[{at: T.non, text: 'non è'}, {at: T.solamente, text: 'solamente', key: true}]} />
      <Sub g={g} y={1140} out={S3.a + 1} words={[{at: T.documento, text: 'un documento'}, {at: T.tenere, text: 'da tenere'}]} />
      {/* 4 · DVR */}
      <Sub g={g} y={1000} out={W1 + 12} size={58} words={[{at: T.sai, text: 'Sai'}, {at: T.cos, text: "che cos'è"}, {at: T.realmente1, text: 'realmente'}, {at: T.dvr - 2, text: 'un DVR?', key: true}]} />
      {[['D', 'Documento'], ['V', 'Valutazione'], ['R', 'Rischi']].map(([l, w], i) => (
        <Tile key={l} g={g} at={T.dvr + 4 + i * 7} out={W1 + 12} x={86 + i * 314} y={1110} w={280} label={w} mini>
          <span style={{color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 1}}>{l}</span>
        </Tile>
      ))}
      {/* 10 · ridurre */}
      <Sub g={g} y={1020} out={T.f0 - 2} words={[{at: T.per + 2, text: 'per mitigare e'}, {at: T.ridurre, text: 'ridurre', key: true}]} />
      <RiskBar g={g} at={T.mitigare} out={T.f0 - 6} a={T.ridurre} b={T.rischio + 10} y={1160} />
      {/* 11 · sintesi sul parlato */}
      <Sub g={g} y={1020} out={S11.a + 1} words={[{at: T.f0 + 2, text: 'Il DVR'}, {at: T.quindi, text: 'quindi'}]} />
      <Sub g={g} y={1120} out={S11.a + 1} words={[{at: T.deve, text: 'deve rappresentare'}, {at: T.realmente2, text: 'realmente', key: true}]} />
      {/* 13 · CTA */}
      <Sub g={g} y={1040} out={Infinity} words={[{at: CH_OUT + 18, text: 'Fammelo'}, {at: Math.max(T.sapere, CH_OUT + 22), text: 'sapere', key: true}]} />
      <Pill g={g} at={T.sapere + 4} x={W / 2} y={1160} text="Scrivilo nei commenti" size={52} pressAt={T.sapere + 22} />
      <Cursor g={g} at={T.sapere + 6} clickAt={T.sapere + 22} x={W * 0.6} y={1215} />
    </>
  );
};

const OverShift: React.FC = () => {
  const g = useCurrentFrame();
  return <AbsoluteFill style={{transform: `translateX(${shiftX('talk', g)}px)`}}><Over /></AbsoluteFill>;
};

/* ---------------- grafiche ---------------- */
const Graphics: React.FC = () => {
  const g = useCurrentFrame();
  const sel = (at: number, next: number) => k(g, at, at + 8) * (1 - k(g, next, next + 8));
  const workers = [[1, 0], [2, 1], [0, 1], [3, 2], [1, 2], [2, 3], [0, 3], [3, 4], [1, 4]];
  const actCells = [{c: 1, r: 0, at: T.documento2, n: 'ufficio'}, {c: 2, r: 1, at: T.analizzate, n: 'cantiere'}, {c: 1, r: 2, at: T.singole, n: 'magazzino'}, {c: 2, r: 3, at: T.attivita, n: 'macchine'}];
  const hazCells = [{c: 2, r: 0, at: T.rischi, s: '!'}, {c: 3, r: 1, at: T.rischi + 7, s: 'el'}, {c: 0, r: 2, at: T.rischi + 14, s: 'ca'}, {c: 3, r: 3, at: T.queste, s: 'ru'}];
  const labels = [{t: 'Ufficio', x: 40, y: 0.27}, {t: 'Cantiere', x: 790, y: 0.37}, {t: 'Magazzino', x: 40, y: 0.46}, {t: 'Macchine', x: 790, y: 0.55}];
  const step = g < T.vengono2 ? 0 : g < T.infine ? 1 : 2;
  const center = (c: number, r: number) => {const p = hexPos(c, r); return {x: p.x + HEX_W / 2, y: p.y + HEX_W * 0.577};};
  const p0104 = PIECES.find((p) => p.id === '0104')!;
  return (
    <>
      {/* 3 · nel cassetto */}
      <Layer g={g} a={S3.a} b={S3.b} tin="zoom-out" tout="zoom-in">
        <Paper g={g} />
        <Heading g={g} at={S3.a + 3} y={250} size={76} parts={[{text: 'nel'}, {text: 'cassetto', red: true}]} />
        <Tile g={g} at={S3.a + 4} x={194} y={410} w={692} label="Archivio">
          <Ill name="archivio" p={k(g, S3.a + 8, T.regola - 2)} />
        </Tile>
        <Pill g={g} at={T.regola - 4} x={W / 2} y={1210} text="✓ in regola" kind="out" size={56} strikeAt={T.regola + 10} />
      </Layer>

      {/* 5-6 · tre parole + lavoratori (dopo i chevron W1) */}
      <Layer g={g} a={S5.a} b={S5.b} tin="cut" tout="cut" grp="S5">
        <Paper g={g} />
        <Sequence from={p0104.start} durationInFrames={p0104.len + p0104.hold}>
          <PieceCard p={p0104} rect={{x: 313, y: 240, w: 454, h: 454}} radius={104} faceFrac={0.42} fy={0.45} pOf={() => 1} opOf={(x) => k(x, S5.a, S5.a + 10) * (1 - k(x, T.da2, T.da2 + 10))} />
        </Sequence>
        <Heading g={g} at={T.tale} out={T.da2} y={730} size={58} parts={[{text: 'Tale documento deve essere'}]} />
        <Tile g={g} at={T.presente} out={T.da2} x={43} y={870} w={313} label="presente" sel={sel(T.presente, T.attivo)} dim={g >= T.attivo + 4 ? 1 : 0}><Ill name="puntina" p={k(g, T.presente + 4, T.presente + 14)} /></Tile>
        <Tile g={g} at={T.attivo} out={T.da2} x={383} y={860} w={335} label="attivo" sel={sel(T.attivo, T.visionabile)} dim={g >= T.visionabile + 4 ? 1 : 0}><Ill name="interruttore" p={k(g, T.attivo + 4, T.attivo + 12)} /></Tile>
        <Tile g={g} at={T.visionabile} out={T.da2} x={724} y={870} w={313} label="visionabile" sel={sel(T.visionabile, T.da2)}><Ill name="occhio" p={k(g, T.visionabile + 4, T.visionabile + 14)} /></Tile>
        {[T.presente, T.attivo, T.visionabile].map((a, i) => {
          const s = inOut(g, a + 7, T.da2, 8, 10);
          return s && <div key={i} style={{position: 'absolute', top: 1225, left: [200, 550, 880][i] - 24, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#1F9D55', ...s}}>✓</div>;
        })}
        <Pill g={g} at={T.tutta} out={T.da2} x={W / 2} y={1340} text="di tutta l'azienda" kind="out" size={48} />
        {g >= T.da2 && <Arcs g={g} at={T.da2} />}
        <Heading g={g} at={T.da2} y={250} size={68} parts={[{text: 'da parte di', at: T.da2 + 2}, {text: 'tutti', red: true, at: T.tutti}, {text: 'i lavoratori', at: T.tutti + 4}]} />
        {g >= T.da2 + 4 && <HexGrid g={g} at={T.da2 + 4} cells={workers.map(([c, r], i) => ({c, r, at: T.tutti + i * 3, node: <Ill name="lavoratore" p={1} />}))} />}
      </Layer>

      {/* 7-9 · attività -> rischi -> misure */}
      <Layer g={g} a={S7.a} b={S7.b} tin="cut" tout="cut" grp="S7">
        <Paper g={g} />
        <Arcs g={g} at={S7.a} />
        <Nav g={g} at={S7.a + 2} out={Infinity} step={step} />
        <HexGrid g={g} at={S7.a + 2} fade={k(g, T.infine, T.infine + 14)}
          cells={[...actCells.map((q) => ({c: q.c, r: q.r, at: q.at, node: <Ill name={q.n} p={k(g, q.at, q.at + 24)} />})), ...hazCells.map((q) => ({c: q.c, r: q.r, at: q.at, node: <Hazard sym={q.s} />}))]} />
        {labels.map((l, i) => {
          const s = inOut(g, actCells[i].at + 4, T.infine, 10, 18);
          return s && <div key={l.t} style={{position: 'absolute', left: l.x, top: H * l.y, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: INK, background: '#fff', borderRadius: 99, padding: '8px 26px', boxShadow: '0 10px 30px rgba(26,26,30,.12)', ...s}}>{l.t}</div>;
        })}
        {g >= T.rischi && g < T.infine + 12 && (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 1 - k(g, T.infine, T.infine + 12)}}>
            {hazCells.map((h, i) => {
              const a = center(actCells[i].c, actCells[i].r);
              const b = center(h.c, h.r);
              const d = k(g, h.at, h.at + 12);
              return <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * d} y2={a.y + (b.y - a.y) * d} stroke={INK} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />;
            })}
          </svg>
        )}
        <Tile g={g} at={T.strutturare - 6} x={238} y={440} w={604} label="Misure" grad><Ill name="scudo" p={k(g, T.misure, T.misure + 14)} /></Tile>
        <Pill g={g} at={T.prevenzione} x={300} y={1190} text="prevenzione" size={52} />
        <Pill g={g} at={T.tecniche} x={790} y={1190} text="tecniche" size={52} />
        <Pill g={g} at={T.organizzative} x={W / 2} y={1330} text="organizzative" size={52} />
      </Layer>

      {/* 11 · l'azienda e il suo ciclo */}
      <Layer g={g} a={S11.a} b={CH_IN + W_IN} tin="zoom-out" tout="cut" grp="S11">
        <Paper g={g} />
        <Heading g={g} at={S11.a + 3} y={250} size={66} parts={[{text: 'rappresentare'}, {text: 'realmente', red: true}, {text: "l'azienda", at: T.azienda + 2}]} />
        {(() => {
          const p = k(g, S11.a + 6, S11.a + 28);
          return (
            <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
              <circle cx={540} cy={900} r={410} fill="none" stroke="#E50210" strokeWidth={9} strokeDasharray="60 40" pathLength={1000} strokeDashoffset={-g * 2.4} opacity={p} transform={`rotate(${-90 + 360 * (1 - p)} 540 900)`} />
            </svg>
          );
        })()}
        <Tile g={g} at={S11.a + 6} x={290} y={650} w={500}><Ill name="azienda" p={k(g, S11.a + 14, S11.a + 24)} /></Tile>
        <Pill g={g} at={T.ciclo - 8} x={230} y={470} text="progetto" kind="out" size={46} />
        <Pill g={g} at={T.ciclo - 3} x={860} y={700} text="produzione" kind="out" size={46} />
        <Pill g={g} at={T.ciclo + 2} x={860} y={1140} text="consegna" kind="out" size={46} />
        <Pill g={g} at={T.ciclo + 7} x={240} y={1290} text="manutenzione" kind="out" size={46} />
        <Heading g={g} at={T.esuo} y={1400} size={60} parts={[{text: 'e il suo', at: T.esuo}, {text: 'ciclo lavorativo', red: true, at: T.ciclo}]} />
      </Layer>

      {/* chevron W1: domanda -> tre parole */}
      <ChevronWipe p={wipeP(g, W1)} />
      {/* chevron W2: lavagna -> parlato */}
      <ChevronWipe p={wipeP(g, W2)} />

      {/* 12 · E tu? sui chevron: entrano, restano con una leggera deriva, poi escono a destra */}
      {g >= CH_IN && g < CH_OUT + W_OUT && (
        <AbsoluteFill>
          <ChevronWipe p={g < CH_IN + W_IN ? wipeP(g, CH_IN) : g < CH_OUT ? 0.5 : 0.5 + (g - CH_OUT) / W_OUT / 2} drift={g >= CH_IN + W_IN && g < CH_OUT ? Math.sin((g - CH_IN) / 18) * 10 : 0} />
          {g < CH_OUT + 10 && (
            <div style={{position: 'absolute', left: 86, top: 690, color: '#fff', fontFamily: FONT, opacity: 1 - k(g, CH_OUT, CH_OUT + 10)}}>
              {(() => {const s = inOut(g, Math.max(T.tu - 2, CH_IN + 12), Infinity, 12, 26); return s && <div style={{fontWeight: 900, fontSize: 196, letterSpacing: '-0.04em', lineHeight: 1, ...s}}>E tu?</div>;})()}
              <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 22, width: 840, marginTop: 34, fontWeight: 700, fontSize: 80, lineHeight: 1.15}}>
                {[[T.sapevi, 'Sapevi'], [T.cosa, 'cosa fosse'], [T.dvr2, 'un DVR?']].map(([a, t]) => {const s = inOut(g, a as number, Infinity, 10, 16); return s && <span key={t as string} style={s}>{t}</span>;})}
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}
    </>
  );
};

/* ---------------- effetti sonori: entrata e uscita per ogni enfasi, con suoni diversi a seconda del tipo ---------------- */
const PEAK: Record<string, number> = {
  short_whoosh: 0.22, short_whoosh_2: 0.2, quick_whoosh: 0.13, hollow_whoosh: 0.38, low_whoosh: 0.42, low_slow_whoosh: 0.75,
  attack_whoosh: 0.55, boom_sub: 0, click_secco: 0, tick_rapido: 0, tap_grave: 0, doppio_click: 0, swoosh_brillante: 0.18, riser_tonale: 1.4,
  pop_morbido: 0, bolla: 0, ting: 0, chime_ok: 0.08, swipe_su: 0.17, swipe_giu: 0.06, carta: 0.11, tonfo_morbido: 0, blip_digitale: 0,
  riser_corto: 0.77, whoosh_reverse: 0.5, whoosh_largo: 0.47, brillio: 0.13,
};
const sfx: {name: string; peak: number; vol: number}[] = [];
const add = (name: string, peak: number, vol: number) => sfx.push({name, peak, vol});
{
  // 1 · hook: il titolo sale, la sottolineatura si traccia
  add('swipe_su', 3, 0.22); add('riser_corto', 14, 0.16); add('boom_sub', 15, 0.42); add('carta', 22, 0.18);
  add('swipe_giu', T.non - 3, 0.14);
  // 2 · sottotitoli: una sola enfasi, sulla parola chiave
  add('pop_morbido', T.solamente + 2, 0.22);
  // 3 · cassetto
  add('hollow_whoosh', S3.a + 4, 0.3); add('bolla', S3.a + 6, 0.18); add('carta', S3.a + 12, 0.24); add('tonfo_morbido', T.regola - 4, 0.42);
  add('pop_morbido', T.regola - 2, 0.2); add('click_secco', T.regola + 10, 0.3);
  add('whoosh_reverse', S3.b, 0.22); add('swipe_giu', S3.b + 3, 0.12);
  // 4 · DVR
  add('swipe_su', T.sai, 0.1); add('attack_whoosh', T.dvr - 2, 0.2); add('boom_sub', T.dvr - 2, 0.38);
  [0, 1, 2].forEach((i) => add(['pop_morbido', 'bolla', 'pop_morbido'][i], T.dvr + 4 + i * 7, 0.22));
  // chevron 1
  add('whoosh_largo', W1 + W_IN, 0.42);
  // 5-6
  add('swipe_su', T.tale, 0.12);
  add('short_whoosh', T.presente + 3, 0.2); add('ting', T.presente + 7, 0.14);
  add('short_whoosh_2', T.attivo + 3, 0.2); add('blip_digitale', T.attivo + 6, 0.18); add('ting', T.attivo + 7, 0.12);
  add('short_whoosh', T.visionabile + 3, 0.2); add('chime_ok', T.visionabile + 7, 0.16);
  add('pop_morbido', T.tutta, 0.16);
  add('swipe_giu', T.da2, 0.18); add('low_whoosh', T.da2 + 6, 0.2);
  for (let i = 0; i < 9; i += 2) add('bolla', T.tutti + i * 3, 0.1);
  // 7-9
  add('blip_digitale', S7.a + 3, 0.2); add('low_slow_whoosh', S7.a + 4, 0.18);
  [T.documento2, T.analizzate, T.singole, T.attivita].forEach((f, i) => add(i % 2 ? 'bolla' : 'pop_morbido', f + 1, 0.16));
  add('blip_digitale', T.vengono2 + 1, 0.2); add('chime_ok', T.vengono2 + 2, 0.1);
  [T.rischi, T.rischi + 7, T.rischi + 14, T.queste].forEach((f, i) => {add(i % 2 ? 'tick_rapido' : 'pop_morbido', f, 0.14); if (i === 0) add('swipe_su', f + 3, 0.1);});
  add('blip_digitale', T.infine + 1, 0.2); add('whoosh_reverse', T.strutturare - 6, 0.16);
  add('boom_sub', T.strutturare, 0.26); add('brillio', T.misure, 0.2); add('chime_ok', T.misure + 12, 0.14);
  [T.prevenzione, T.tecniche, T.organizzative].forEach((f, i) => add(['pop_morbido', 'bolla', 'pop_morbido'][i], f + 1, 0.18));
  // chevron 2 + ridurre
  add('whoosh_largo', W2 + W_IN, 0.42);
  add('swipe_su', T.mitigare, 0.1); add('riser_tonale', T.rischio + 10, 0.13); add('tap_grave', T.ridurre, 0.24); add('boom_sub', T.rischio + 10, 0.26);
  add('swipe_giu', T.f0 - 6, 0.12);
  // 11
  add('pop_morbido', T.realmente2 + 2, 0.2);
  add('hollow_whoosh', S11.a + 4, 0.26); add('brillio', S11.a + 16, 0.14); add('low_slow_whoosh', S11.a + 24, 0.16);
  [T.ciclo - 8, T.ciclo - 3, T.ciclo + 2, T.ciclo + 7].forEach((f, i) => add(i % 2 ? 'bolla' : 'tick_rapido', f + 1, 0.14));
  // 12 · E tu?
  add('whoosh_largo', CH_IN + W_IN, 0.42); add('boom_sub', Math.max(T.tu - 2, CH_IN + 12), 0.45);
  [T.sapevi, T.cosa, T.dvr2].forEach((f) => add('tick_rapido', f, 0.08));
  add('whoosh_largo', CH_OUT + 14, 0.32);
  // 13 · CTA
  add('pop_morbido', T.sapere + 4, 0.22); add('swipe_su', T.sapere + 6, 0.1); add('click_secco', T.sapere + 22, 0.38); add('chime_ok', T.sapere + 25, 0.18);
  add('low_slow_whoosh', TOTAL - 4, 0.18);
}

export const GiemmeReel2: React.FC<{voce?: 'originale' | 'ai'}> = ({voce = 'originale'}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SEGS.map((s, i) => {
      const end = i < SEGS.length - 1 ? segStart[SEGS[i + 1].id] : TOTAL;
      return (
        <Sequence key={`v${s.id}`} from={segStart[s.id]} durationInFrames={end - segStart[s.id]}>
          <SegVideo id={s.id} zoomMul={zoomMul(s.id)} shift={(g) => shiftX('talk', g)} />
        </Sequence>
      );
    })}
    <OverShift />
    <Graphics />
    {PIECES.map((p, i) => (
      <Sequence key={`a${i}`} from={p.start} durationInFrames={p.len}>
        <Audio src={staticFile(voce === 'ai' ? `giemme/voce_ai/${p.id}.wav` : `giemme/clips/${p.id}.wav`)} startFrom={p.from} />
      </Sequence>
    ))}
    {sfx.map((s, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(s.peak - PEAK[s.name] * FPS))} durationInFrames={Math.round(2 * FPS)}>
        <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const TOTAL2 = TOTAL;
