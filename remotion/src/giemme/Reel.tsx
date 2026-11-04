import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {G, H, SEGS, segById, segStart, TOTAL, VOICE_END, W, FPS} from './timeline';
import {FramedVideo, VideoCard} from './video';
import {Row, Stack, Word} from '../text';
import {Board, Building, Comment, Drawer, Gauge, Grid, Ink, k, Line, Stamp, Tag, TitleBox, Workers} from './broll';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TEXT_TOP = H * 0.55;
const punch = (g: number, at: number, amount: number) =>
  1 + interpolate(g, [at, at + 4], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.6))});
const ramp = (g: number, a: number, b: number, z1: number, z2: number) =>
  interpolate(g, [a, b], [z1, z2], {...clamp, easing: Easing.inOut(Easing.cubic)});

/* ---------------- tempi (frame globali, dalle parole) ---------------- */
const T = {
  b0: segStart['0103b'],
  non: G('0103b', 'non'),
  solamente: G('0103b', 'solamente'),
  documento: G('0103b', 'documento'),
  tenere: G('0103b', 'tenere'),
  cassetto: G('0103b', 'cassetto'),
  affinche: G('0103b', 'affinché'),
  regola: G('0103b', 'regola'),
  c0: segStart['0103c'],
  sai: G('0103c', 'sai'),
  realmente1: G('0103c', 'realmente'),
  dvr: G('0103c', 'dbr'),
  d0: segStart['0104'],
  tale: G('0104', 'tale'),
  presente: G('0104', 'presente'),
  attivo: G('0104', 'attivo'),
  visionabile: G('0104', 'visionabile'),
  da2: G('0104', 'da', 1),
  tutti: G('0104', 'tutti'),
  e0: segStart['0109'],
  documento2: G('0109', 'documento'),
  analizzate: G('0109', 'analizzate'),
  singole: G('0109', 'singole'),
  attivita: G('0109', 'attività'),
  lavorative: G('0109', 'lavorative'),
  vengono2: G('0109', 'vengono', 1),
  rischi: G('0109', 'rischi'),
  queste: G('0109', 'queste'),
  infine: G('0109', 'infine'),
  strutturare: G('0109', 'strutturare'),
  misure: G('0109', 'misure'),
  prevenzione: G('0109', 'prevenzione'),
  tecniche: G('0109', 'tecniche'),
  organizzative: G('0109', 'organizzative'),
  per: G('0109', 'per'),
  mitigare: G('0109', 'mitigare'),
  ridurre: G('0109', 'ridurre'),
  rischio: G('0109', 'rischio'),
  f0: segStart['0110'],
  il: G('0110', 'il'),
  quindi: G('0110', 'quindi'),
  rappresentare: G('0110', 'rappresentare'),
  realmente2: G('0110', 'realmente'),
  azienda: G('0110', "l'azienda"),
  esuo: G('0110', 'e'),
  ciclo: G('0110', 'ciclo'),
  lavorativo: G('0110', 'lavorativo'),
  tu: G('0110', 'tu'),
  sapevi: G('0110', 'sapevi'),
  cosa: G('0110', 'cosa'),
  fosse: G('0110', 'fosse'),
  dvr2: G('0110', 'dvr', 1),
  fammelo: G('0110', 'fammelo'),
  sapere: G('0110', 'sapere'),
};
// finestre delle grafiche a tutto schermo
const S3 = {a: T.cassetto - 3, b: T.c0}; // cassetto + timbro
const S5 = {a: T.d0, b: T.e0}; // card + tre parole + lavoratori
const S7 = {a: T.e0, b: T.per}; // lavagna 3 passi
const S11 = {a: T.azienda - 3, b: T.tu - 4}; // azienda in sezione
const N = 7; // durata delle transizioni

/* ---------------- zoom del parlato ---------------- */
const zoomMul = (id: string, g: number) => {
  switch (id) {
    case '0103a':
      return ramp(g, 0, segStart['0103b'], 1, 1.03);
    case '0103b':
      return 1.03 * punch(g, T.b0, 0.07) * ramp(g, T.b0, T.cassetto, 1, 1.03);
    case '0103c':
      return ramp(g, T.c0, T.c0 + 50, 1.02, 1.05) * punch(g, T.dvr, 0.1);
    case '0109':
      return ramp(g, T.per, VOICE_END, 1, 1.05) * punch(g, T.ridurre, 0.05);
    case '0110': {
      const out = ramp(g, T.fammelo - 4, VOICE_END + 10, 1, 0.9);
      return ramp(g, T.f0, T.azienda, 1, 1.04) * punch(g, T.realmente2, 0.05) * punch(g, T.tu, 0.1) * out;
    }
    default:
      return 1;
  }
};

const Talking: React.FC<{id: string}> = ({id}) => {
  const local = useCurrentFrame();
  return <FramedVideo id={id} zoomMul={zoomMul(id, local + segStart[id])} />;
};

/* ---------------- transizioni ---------------- */
type Tin = 'slide-up' | 'slide-left' | 'zoom-out' | 'none';
type Tout = 'zoom-in' | 'none';
const layerStyle = (g: number, a: number, b: number, tin: Tin, tout: Tout): React.CSSProperties | null => {
  if (g < a || g >= b + (tout === 'zoom-in' ? N : 0)) return null;
  const ei = k(g, a, a + N);
  const eo = k(g, b, b + N);
  const blurIn = Math.sin(ei * Math.PI) * 16;
  const blurOut = Math.sin(eo * Math.PI) * 16;
  let transform = '';
  let opacity = 1;
  if (tin === 'slide-up') transform += `translateY(${(1 - ei) * 100}%) `;
  if (tin === 'slide-left') transform += `translateX(${(1 - ei) * 100}%) `;
  if (tin === 'zoom-out') {
    transform += `scale(${1.25 - 0.25 * ei}) `;
    opacity = ei;
  }
  if (tout === 'zoom-in' && g >= b) {
    transform += `scale(${1 + 0.35 * eo}) `;
    opacity = 1 - eo;
  }
  const blur = g < a + N ? blurIn : g >= b ? blurOut : 0;
  return {transform, opacity, filter: blur > 0.3 ? `blur(${blur}px)` : undefined};
};

const Layer: React.FC<{g: number; a: number; b: number; tin: Tin; tout: Tout; children: React.ReactNode}> = ({g, a, b, tin, tout, children}) => {
  const st = layerStyle(g, a, b, tin, tout);
  if (!st) return null;
  return <AbsoluteFill style={st}>{children}</AbsoluteFill>;
};

/** Film burn leggero dai bordi (come nel reel "Due vertenze"). */
const Burn: React.FC<{g: number; at: number; len?: number; corner?: 'bl' | 'tr'; peak?: number}> = ({g, at, len = 12, corner = 'bl', peak = 0.5}) => {
  if (g < at || g > at + len) return null;
  const o = interpolate(g - at, [0, len * 0.45, len], [0, peak, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  const pos = corner === 'bl' ? ['12% 88%', '88% 8%'] : ['88% 12%', '10% 92%'];
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen', opacity: o, filter: 'blur(20px)',
        background: `radial-gradient(60% 42% at ${pos[0]}, rgba(255,90,40,1), rgba(229,2,16,.75) 35%, transparent 68%), radial-gradient(48% 36% at ${pos[1]}, rgba(255,170,70,.9), transparent 65%)`,
      }}
    />
  );
};

const Flash: React.FC<{g: number; at: number}> = ({g, at}) =>
  g >= at && g < at + 2 ? <AbsoluteFill style={{background: '#E50210', opacity: g === at ? 0.85 : 0.45}} /> : null;

/* ---------------- testi sul parlato (frame globali dentro la Sequence del parlato) ---------------- */
const Over: React.FC = () => {
  const g = useCurrentFrame();
  const vis = (a: number, b: number) => g >= a && g < b;
  return (
    <>
      {/* hook */}
      <TitleBox g={g} at={0} shrinkAt={T.non} outAt={S3.a} />
      {vis(0, S3.a + 2) && (
        <Stack top={TEXT_TOP} until={S3.a + 2} gap={4}>
          <Row>
            <Word at={2} text="Il DVR" />
            <Word at={T.non} text="non è" />
            <Word at={T.solamente} text="solamente" serif />
          </Row>
          <Row>
            <Word at={T.documento} text="un documento" />
            <Word at={T.tenere} text="da tenere" />
          </Row>
        </Stack>
      )}
      {/* la domanda */}
      {vis(T.c0, T.d0) && (
        <Stack top={TEXT_TOP} gap={2}>
          <Row>
            <Word at={T.sai} text="Sai che cos'è" />
            <Word at={T.realmente1} text="realmente" serif />
          </Row>
          <Word at={T.dvr} text="un DVR?" size="xl" glow />
          <Row gap={22}>
            {['Documento', 'Valutazione', 'Rischi'].map((w, i) => (
              <span key={w} style={{display: 'inline-flex', alignItems: 'baseline'}}>
                <Word at={T.dvr + 9 + i * 4} text={w[0]} px={56} ink="red" style={{fontWeight: 800}} />
                <Word at={T.dvr + 9 + i * 4} text={w.slice(1)} px={44} />
              </span>
            ))}
          </Row>
        </Stack>
      )}
      {/* ridurre il rischio */}
      {vis(T.per, T.f0) && (
        <Stack top={H * 0.525} gap={0} until={T.f0}>
          <Word at={T.per} text="per mitigare e" />
          <Word at={T.ridurre} text="ridurre" size="xl" px={170} serif glow />
        </Stack>
      )}
      <Gauge g={g} at={T.mitigare} a={T.ridurre} b={T.rischio + 6} top={H * 0.655} until={T.f0} />
      {/* sintesi sul parlato */}
      {vis(T.f0, S11.a + 2) && (
        <Stack top={TEXT_TOP} gap={4} until={S11.a + 2}>
          <Row>
            <Word at={T.il} text="Il DVR" />
            <Word at={T.quindi} text="quindi" />
          </Row>
          <Word at={T.rappresentare} text="deve rappresentare" />
          <Word at={T.realmente2} text="realmente" size="xl" px={150} serif glow />
        </Stack>
      )}
      {/* CTA */}
      {vis(T.tu - 4, T.fammelo) && (
        <Stack top={TEXT_TOP} gap={8} until={T.fammelo}>
          <Word at={T.tu - 2} text="E tu?" size="xl" glow />
          <Row>
            <Word at={T.sapevi} text="Sapevi" />
            <Word at={T.cosa} text="cosa fosse" />
            <Word at={T.dvr2} text="un DVR?" />
          </Row>
        </Stack>
      )}
      {g >= T.fammelo && (
        <Stack top={H * 0.57}>
          <Row>
            <Word at={T.fammelo} text="Fammelo" />
            <Word at={T.sapere} text="sapere" serif />
          </Row>
        </Stack>
      )}
      <Comment g={g} at={T.fammelo + 3} />
    </>
  );
};

/* ---------------- grafiche a tutto schermo ---------------- */
const Graphics: React.FC = () => {
  const g = useCurrentFrame();
  // scena 5-6: card del soggetto (dentro la Sequence del pezzo 0104) + tre parole + lavoratori
  const up = k(g, T.da2, T.da2 + 10);
  const tagY = (i: number) => H * ((0.51 + i * 0.09) * (1 - up) + (0.16 + i * 0.08) * up);
  return (
    <>
      {/* 3 · cassetto e timbro */}
      <Layer g={g} a={S3.a} b={S3.b} tin="slide-up" tout="zoom-in">
        <Grid g={g} />
        <Line top={H * 0.07}>
          <Ink g={g} at={S3.a + 2} text="nel" />
          <Ink g={g} at={S3.a + 4} text="cassetto" serif red />
        </Line>
        {g >= S3.a + 8 && (
          <div style={{position: 'absolute', left: W / 2, top: H * 0.145, transform: 'translateX(-50%)', fontFamily: 'IBM Plex Mono, ui-monospace, monospace', fontWeight: 500, fontSize: 34, color: '#1A1A1E', background: '#fff', border: '3px solid #1A1A1E', padding: '6px 18px', opacity: k(g, S3.a + 8, S3.a + 12)}}>
            D.Lgs. 81/08
          </div>
        )}
        <Drawer g={g} at={S3.a + 2} docAt={S3.a + 6} closeAt={T.affinche} />
        <Stamp g={g} at={T.regola} y={H * 0.7} />
      </Layer>

      {/* 5-6 · presente, attivo, visionabile + tutti i lavoratori */}
      <Layer g={g} a={S5.a} b={S5.b} tin="none" tout="none">
        <AbsoluteFill style={{opacity: k(g, S5.a, S5.a + 8)}}>
          <Grid g={g} />
        </AbsoluteFill>
        <Sequence from={segStart['0104']} durationInFrames={segById('0104').frames}>
          <VideoCard
            id="0104"
            rect={{x: (W - 600) / 2, y: H * 0.06, w: 600, h: H * 0.355}}
            pOf={(x) => k(x, S5.a, S5.a + 11, Easing.inOut(Easing.cubic))}
            opOf={(x) => 1 - k(x, T.da2, T.da2 + 8)}
          />
        </Sequence>
        <AbsoluteFill style={{opacity: 1 - k(g, T.da2, T.da2 + 6)}}>
          <Line top={H * 0.44}>
            <Ink g={g} at={T.tale} text="Tale documento deve essere" px={58} />
          </Line>
        </AbsoluteFill>
        <Tag g={g} at={T.presente} check={T.presente + 6} text="presente" y={tagY(0)} scale={1 - 0.08 * up} />
        <Tag g={g} at={T.attivo} check={T.attivo + 6} text="attivo" y={tagY(1)} scale={1 - 0.08 * up} />
        <Tag g={g} at={T.visionabile} check={T.visionabile + 6} text="visionabile" y={tagY(2)} scale={1 - 0.08 * up} />
        {g >= T.da2 && (
          <Line top={H * 0.075} gap={16}>
            <Ink g={g} at={T.da2} text="da parte di" px={66} />
            <Ink g={g} at={T.tutti} text="tutti" serif red px={66} />
            <Ink g={g} at={T.tutti + 3} text="i lavoratori" px={66} />
          </Line>
        )}
        <Workers g={g} at={T.da2 + 6} on={T.tutti} />
      </Layer>

      {/* 7-9 · lavagna: attività -> rischi -> misure */}
      <Layer g={g} a={S7.a} b={S7.b} tin="zoom-out" tout="zoom-in">
        <Grid g={g} />
        <Sequence from={segStart['0109']} durationInFrames={segById('0109').frames}>
          <VideoCard
            id="0109"
            round
            rect={{x: W * 0.64, y: H * 0.125, w: 330, h: 330}}
            faceFrac={0.42}
            fy={0.45}
            pOf={() => 1}
            opOf={(x) => k(x, S7.a + 4, S7.a + 12) * (1 - k(x, T.vengono2 - 2, T.vengono2 + 6))}
          />
        </Sequence>
        {g >= S7.a + 6 && g < T.vengono2 + 6 && (
          <svg viewBox="0 0 100 100" style={{position: 'absolute', left: W * 0.64 - 22, top: H * 0.125 - 22, width: 374, height: 374, opacity: 1 - k(g, T.vengono2 - 2, T.vengono2 + 6)}}>
            <circle cx="50" cy="50" r="48.5" fill="none" stroke="#1A1A1E" strokeWidth="0.9" strokeDasharray="2.4 2.4" pathLength={300} />
          </svg>
        )}
        <Board
          g={g}
          t0={S7.a}
          iconsAt={[T.documento2, T.analizzate, T.singole, T.attivita]}
          step2={T.vengono2}
          hazAt={[T.rischi, T.rischi + 5, T.rischi + 10, T.queste]}
          step3={T.infine}
          shieldAt={T.strutturare}
          checkAt={T.misure}
        />
        <Tag g={g} at={T.prevenzione} text="prevenzione" x={W * 0.28} y={H * 0.68} scale={0.8} />
        <Tag g={g} at={T.tecniche} text="tecniche" x={W * 0.74} y={H * 0.68} scale={0.8} />
        <Tag g={g} at={T.organizzative} text="organizzative" y={H * 0.745} scale={0.8} />
      </Layer>

      {/* 11 · l'azienda e il suo ciclo lavorativo */}
      <Layer g={g} a={S11.a} b={S11.b} tin="slide-up" tout="zoom-in">
        <Grid g={g} />
        <Line top={H * 0.06} gap={16}>
          <Ink g={g} at={S11.a + 2} text="deve rappresentare" px={62} />
          <Ink g={g} at={S11.a + 4} text="realmente" serif red px={62} />
        </Line>
        <Line top={H * 0.105}>
          <Ink g={g} at={T.azienda} text="l'azienda" px={62} />
        </Line>
        <Building g={g} at={S11.a + 4} cycleAt={T.ciclo - 4} />
        <Line top={H * 0.69} gap={16}>
          <Ink g={g} at={T.esuo} text="e il suo" px={62} />
          <Ink g={g} at={T.ciclo} text="ciclo lavorativo" serif red px={62} />
        </Line>
      </Layer>
    </>
  );
};

/* ---------------- effetti sonori ---------------- */
const PEAK: Record<string, number> = {
  short_whoosh: 0.22, short_whoosh_2: 0.2, quick_whoosh: 0.13, hollow_whoosh: 0.38, low_whoosh: 0.42,
  low_slow_whoosh: 0.75, attack_whoosh: 0.55, boom_sub: 0, click_secco: 0, tick_rapido: 0, tap_grave: 0,
  doppio_click: 0, swoosh_brillante: 0.18, riser_tonale: 1.4,
};
const sfx: {name: string; peak: number; vol: number}[] = [];
const add = (name: string, peak: number, vol: number) => sfx.push({name, peak, vol});
{
  add('quick_whoosh', 3, 0.3);
  add('tick_rapido', 12, 0.14);
  [T.non, T.solamente, T.documento, T.tenere].forEach((f) => add('tick_rapido', f, 0.1));
  add('short_whoosh', S3.a + 3, 0.35);
  add('tick_rapido', S3.a + 4, 0.1);
  add('tap_grave', T.affinche + 8, 0.35);
  add('boom_sub', T.regola, 0.5);
  add('click_secco', T.regola + 10, 0.3);
  add('hollow_whoosh', S3.b + 3, 0.35);
  add('boom_sub', T.dvr, 0.5);
  [0, 1, 2].forEach((i) => add('tick_rapido', T.dvr + 9 + i * 4, 0.12));
  add('short_whoosh_2', S5.a + 5, 0.35);
  [T.presente, T.attivo, T.visionabile].forEach((f) => add('doppio_click', f + 6, 0.3));
  add('quick_whoosh', T.da2 + 2, 0.3);
  for (let i = 0; i < 11; i++) add('tick_rapido', T.tutti + i * 2, 0.06);
  add('low_whoosh', S7.a, 0.35);
  [T.documento2, T.analizzate, T.singole, T.attivita].forEach((f) => add('tick_rapido', f, 0.12));
  add('short_whoosh', T.vengono2 + 4, 0.3);
  add('doppio_click', T.vengono2 + 2, 0.25);
  [T.rischi, T.rischi + 5, T.rischi + 10, T.queste].forEach((f) => add('tick_rapido', f, 0.12));
  add('short_whoosh_2', T.infine + 4, 0.3);
  add('doppio_click', T.infine + 2, 0.25);
  add('boom_sub', T.strutturare, 0.3);
  add('doppio_click', T.misure + 4, 0.3);
  [T.prevenzione, T.tecniche, T.organizzative].forEach((f) => add('tick_rapido', f, 0.12));
  add('hollow_whoosh', S7.b + 3, 0.35);
  add('boom_sub', T.ridurre, 0.35);
  add('riser_tonale', T.rischio, 0.2);
  add('boom_sub', T.realmente2, 0.3);
  add('short_whoosh', S11.a + 3, 0.35);
  add('low_slow_whoosh', T.ciclo, 0.25);
  add('attack_whoosh', T.tu, 0.3);
  add('boom_sub', T.tu, 0.55);
  add('doppio_click', T.fammelo + 3, 0.3);
  add('low_slow_whoosh', TOTAL - 4, 0.22);
}

export const GiemmeReel: React.FC = () => {
  const g = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* parlato */}
      {SEGS.map((s, i) => (
        <Sequence key={s.id} from={segStart[s.id]} durationInFrames={s.frames + (i === SEGS.length - 1 ? TOTAL - VOICE_END : 0)}>
          <Talking id={s.id} />
        </Sequence>
      ))}
      <Over />
      <Graphics />
      {/* transizioni di colore */}
      <Flash g={g} at={T.d0 - 1} />
      <Flash g={g} at={T.tu - 2} />
      <Burn g={g} at={S7.a - 5} corner="tr" />
      <Burn g={g} at={S11.a - 4} corner="bl" peak={0.45} />
      <Burn g={g} at={TOTAL - 16} len={16} corner="tr" peak={0.45} />
      {/* voce */}
      {SEGS.map((s) => (
        <Sequence key={`a${s.id}`} from={segStart[s.id]} durationInFrames={s.frames}>
          <Audio src={staticFile(`giemme/clips/${s.id}.wav`)} />
        </Sequence>
      ))}
      {sfx.map((s, i) => {
        const from = Math.max(0, Math.round(s.peak - PEAK[s.name] * FPS));
        return (
          <Sequence key={i} from={from} durationInFrames={Math.round(2 * FPS)}>
            <Audio src={staticFile(`sfx/${s.name}.wav`)} volume={s.vol} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
