import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {at, atLocal, CLIPS, clipById, clipStart, FPS, TOTAL} from './timeline';
import {SCENES} from './scenes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = 6; // durata delle transizioni di movimento (frame)

type T = 'cut' | 'slide-left' | 'slide-up' | 'zoom' | 'burn';
const IN: Record<string, T> = {
  '9194': 'cut',
  '9200': 'cut',
  '9202': 'slide-left',
  '9220': 'burn',
  '9233': 'cut',
  '9235': 'zoom',
  '9236': 'slide-up',
  '9239': 'burn',
  '9241': 'cut',
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
  const c = (id: string) => clipById(id).frames;
  // 9194
  add('quick_whoosh', 3, 0.3);
  add('boom_sub', at('9194', 'vertenze'), 0.5);
  ['centinaia', 'di', 'lavoratori'].forEach((w) => add('tick_rapido', at('9194', w), 0.14));
  const ins1 = at('9194', 'due', 1) - 3;
  add('hollow_whoosh', ins1 + 4, 0.35);
  [0, 3].forEach((k) => add('click_secco', at('9194', 'crotone') + k * 3, 0.25));
  add('boom_sub', at('9194', 'ignorare'), 0.28);
  add('short_whoosh', s['9200'] - 3, 0.35);
  // 9200 / 9202
  add('short_whoosh', at('9200', 'chiama'), 0.3);
  ticks(at('9200', 'centocinquanta'), at('9200', 'lavoratori', 0, 0.4));
  ticks(at('9200', 'rischiano'), at('9200', 'rischiano', 0, 0.3));
  add('quick_whoosh', s['9202'] + 2, 0.4);
  add('short_whoosh_2', at('9202', 'connecta'), 0.3);
  ticks(at('9202', 'centinaia'), at('9202', 'centinaia', 0, 0.35));
  ticks(at('9202', 'cassa'), at('9202', 'integrazione', 0, 0.5));
  // 9220
  add('low_whoosh', s['9220'], 0.35);
  add('attack_whoosh', at('9220', 'preoccupazione'), 0.28);
  add('boom_sub', at('9220', 'preoccupazione'), 0.45);
  add('quick_whoosh', at('9220', 'il') - 2, 0.25);
  ['il', 'a', 'viene', 'di', 'in'].forEach((w) => add('tick_rapido', at('9220', w), 0.12));
  // 9233
  add('boom_sub', at('9233', 'basta'), 0.6);
  add('swoosh_brillante', at('9233', 'uniti'), 0.35);
  // 9235
  add('hollow_whoosh', s['9235'] + 2, 0.4);
  add('hollow_whoosh', at('9235', 'scorsi') + 4, 0.3);
  ['nazionali', 'regionali', 'istituzioni'].forEach((w) => add('doppio_click', at('9235', w), 0.3));
  add('tap_grave', at('9235', 'partito'), 0.3);
  // 9236
  add('short_whoosh_2', s['9236'] + 2, 0.4);
  add('riser_tonale', at('9236', 'fermeremo'), 0.22);
  add('boom_sub', at('9236', 'fermeremo'), 0.6);
  // 9239
  add('low_whoosh', s['9239'], 0.35);
  const click = at('9239', 'straordinario') + 7;
  add('click_secco', click, 0.4);
  add('swoosh_brillante', click + 2, 0.3);
  add('short_whoosh', at('9239', 'perché') + 2, 0.3);
  add('short_whoosh', at('9239', 'cittadini'), 0.3);
  // 9241
  add('click_secco', s['9241'], 0.25);
  add('tap_grave', at('9241', 'tutelare'), 0.35);
  add('tap_grave', at('9241', 'difendere'), 0.35);
  ticks(at('9241', 'il', 1), at('9241', 'lavoro', 0, 0.3));
  ticks(at('9241', 'il', 2), at('9241', 'territorio', 0, 0.45));
  add('low_slow_whoosh', at('9241', 'la'), 0.3);
  add('boom_sub', at('9241', 'la'), 0.35);
  void c;
}

export const Reel: React.FC = () => {
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
            <Audio src={staticFile(`clips/${c.id}.wav`)} startFrom={Math.round(c.trim * FPS)} />
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

export {atLocal};
