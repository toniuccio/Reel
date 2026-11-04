import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {at, atLocal, CLIPS, clipById, clipStart, FPS, TOTAL} from './timeline';
import {SCENES} from './scenes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = 6; // durata delle transizioni di movimento (frame)

type T = 'cut' | 'slide-left' | 'slide-up' | 'zoom' | 'burn';
const IN: Record<string, T> = {
  '0389': 'cut',
  '0370': 'slide-left',
  old: 'cut',
  '0374': 'zoom',
  '0380': 'slide-left',
  '0381': 'burn',
  '0383': 'slide-up',
};

const moveStyle = (t: T, k: number, dir: 'in' | 'out'): React.CSSProperties => {
  const e = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, k / N)));
  const blur = Math.sin(e * Math.PI) * 14;
  if (t === 'slide-left') {
    const x = dir === 'in' ? (1 - e) * 100 : -e * 100;
    return {transform: `translateX(${x}%)`, filter: `blur(${blur}px)`};
  }
  if (t === 'slide-up') {
    const y = dir === 'in' ? (1 - e) * 100 : -e * 100;
    return {transform: `translateY(${y}%)`, filter: `blur(${blur}px)`};
  }
  if (t === 'zoom') {
    if (dir === 'out') return {transform: `scale(${1 + 0.3 * e})`, opacity: 1 - e, filter: `blur(${blur}px)`};
    return {transform: `scale(${1.25 - 0.25 * e})`, filter: `blur(${blur}px)`};
  }
  return {};
};

const SceneIn: React.FC<{id: string}> = ({id}) => {
  const f = useCurrentFrame();
  const Scene = SCENES[id];
  const t = IN[id];
  const style = f < N ? moveStyle(t, f, 'in') : {};
  return (
    <AbsoluteFill style={style}>
      <Scene />
    </AbsoluteFill>
  );
};

const SceneOut: React.FC<{id: string; next: T}> = ({id, next}) => {
  const f = useCurrentFrame();
  const Scene = SCENES[id];
  return (
    <AbsoluteFill style={moveStyle(next, f, 'out')}>
      <Freeze frame={clipById(id).frames - 1}>
        <Scene />
      </Freeze>
    </AbsoluteFill>
  );
};

/** Film burn leggero: bruciatura rosso-arancio dai bordi, 10-14 frame. */
const Burn: React.FC<{len?: number; corner?: 'bl' | 'tr'; peak?: number}> = ({len = 12, corner = 'bl', peak = 0.6}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, len * 0.45, len], [0, peak, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  const pos = corner === 'bl' ? ['12% 88%', '88% 8%'] : ['88% 12%', '10% 92%'];
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: o,
        background: `radial-gradient(60% 42% at ${pos[0]}, rgba(255,90,40,1), rgba(226,6,18,.75) 35%, transparent 68%), radial-gradient(48% 36% at ${pos[1]}, rgba(255,170,70,.9), transparent 65%)`,
        filter: 'blur(20px)',
      }}
    />
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
const ticks = (from: number, to: number, vol = 0.08) => {
  for (let f = from; f < to; f += 3) add('tick_rapido', f, vol);
};
{
  const s = clipStart;
  // 0389 hook
  add('quick_whoosh', 3, 0.3);
  add('boom_sub', at('0389', 'mesi'), 0.5);
  ticks(at('0389', 'mesi'), at('0389', 'mesi') + 18, 0.07);
  add('quick_whoosh', at('0389', 'continuiamo') - 3, 0.3);
  add('quick_whoosh', at('0389', 'sempre'), 0.25);
  add('boom_sub', at('0389', 'stessi'), 0.35);
  // 0370 -> vecchio reel
  add('quick_whoosh', s['0370'] + 2, 0.35);
  add('riser_tonale', s['old'], 0.18);
  add('hollow_whoosh', s['old'] + 3, 0.4);
  ['recupero', 'riqualificazione', 'sostegno', 'accessibilità', 'zona'].forEach((w) => add('doppio_click', at('old', w), 0.25));
  add('boom_sub', at('old', 'decoro'), 0.35);
  add('low_whoosh', s['0374'] - 2, 0.35);
  // 0374
  add('tap_grave', at('0374', 'confcommercio'), 0.3);
  add('quick_whoosh', at('0374', 'che'), 0.25);
  add('swoosh_brillante', at('0374', 'natalizio'), 0.25);
  // 0380
  add('quick_whoosh', s['0380'] + 2, 0.4);
  add('boom_sub', at('0380', 'concreta'), 0.4);
  add('hollow_whoosh', at('0380', 'un') + 4, 0.35);
  ['comune', 'associazioni', 'comitati', 'residenti', 'commercianti'].forEach((w) => add('doppio_click', at('0380', w), 0.25));
  add('short_whoosh', s['0381'] - 3, 0.35);
  // 0381
  add('low_whoosh', s['0381'], 0.3);
  add('quick_whoosh', at('0381', 'stabilire') - 2, 0.25);
  ['programma', 'priorità'].forEach((w) => add('tick_rapido', at('0381', w), 0.15));
  add('boom_sub', at('0381', 'priorità'), 0.35);
  add('quick_whoosh', at('0381', 'garantiscono') - 2, 0.25);
  add('swoosh_brillante', at('0381', 'risplendere'), 0.35);
  ticks(at('0381', 'tutto'), at('0381', 'tutto') + 18, 0.07);
  add('quick_whoosh', at('0381', 'e') - 1, 0.25);
  add('swoosh_brillante', at('0381', 'natalizio'), 0.2);
  // 0383
  add('short_whoosh_2', s['0383'] + 2, 0.4);
  add('tap_grave', at('0383', 'proposte'), 0.35);
  add('quick_whoosh', at('0383', 'adesso') - 2, 0.25);
  add('quick_whoosh', at('0383', 'concreta') - 2, 0.25);
  add('low_slow_whoosh', at('0383', 'concreta'), 0.3);
  add('boom_sub', at('0383', 'concreta'), 0.35);
}

export const ReelCentro: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {CLIPS.map((c, i) => (
        <React.Fragment key={c.id}>
          <Sequence from={clipStart[c.id]} durationInFrames={c.frames + (i === CLIPS.length - 1 ? 12 : 0)}>
            <SceneIn id={c.id} />
          </Sequence>
          {i > 0 && ['slide-left', 'slide-up', 'zoom'].includes(IN[c.id]) && (
            <Sequence from={clipStart[c.id]} durationInFrames={N}>
              <SceneOut id={CLIPS[i - 1].id} next={IN[c.id]} />
            </Sequence>
          )}
          {IN[c.id] === 'burn' && (
            <Sequence from={clipStart[c.id] - 5} durationInFrames={12}>
              <Burn corner={i % 2 ? 'bl' : 'tr'} />
            </Sequence>
          )}
          <Sequence from={clipStart[c.id]} durationInFrames={c.frames}>
            <Audio src={staticFile(c.id === 'old' ? 'centro/old/old.wav' : `centro/clips/${c.id}.wav`)} />
          </Sequence>
        </React.Fragment>
      ))}
      {/* chiusura: film burn leggero che sfuma */}
      <Sequence from={TOTAL - 16} durationInFrames={16}>
        <Burn len={16} corner="tr" peak={0.45} />
      </Sequence>
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

void atLocal;
void clipById;
