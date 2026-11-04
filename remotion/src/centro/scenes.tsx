import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Freeze} from 'remotion';
import {atLocal, clipById, H, W} from './timeline';
import {FramedVideo, VideoCard} from './video';
import {GREEN, RED, Row, Stack, Typed, UI, Word} from '../text';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const TEXT_TOP = H * 0.55;
const ramp = (f: number, a: number, b: number, z1: number, z2: number) => interpolate(f, [a, b], [z1, z2], {...clamp, easing: ease});
const punch = (f: number, at: number, amount: number) => 1 + interpolate(f, [at, at + 4], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.6))});

const CheckSvg: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** b-roll a schermo intero, con push-in lento e vignettatura */
const Broll: React.FC<{id: string; from: number; to: number; startFrom?: number}> = ({id, from, to, startFrom = 0}) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)} layout="none">
    <BrollInner id={id} len={to - from} startFrom={startFrom} />
  </Sequence>
);
const BrollInner: React.FC<{id: string; len: number; startFrom: number}> = ({id, len, startFrom}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, len], [1.04, 1.1], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(`centro/broll/${id}.mp4`)} startFrom={startFrom} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 45%, transparent 50%, rgba(0,0,0,.3) 100%)'}} />
    </AbsoluteFill>
  );
};

/** linea rossa luminosa che barra la parola */
const Strike: React.FC<{at: number; text: string; px: number}> = ({at, text, px}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <Word at={at - 10} text={text} size="m" px={px} />
      <div style={{position: 'absolute', left: '-3%', top: '52%', height: px * 0.09, width: `${106 * p}%`, background: RED, borderRadius: 8, boxShadow: '0 0 22px rgba(226,6,18,.85)'}} />
    </div>
  );
};

/** 12 tacche dei mesi: `lit(f)` dice quante/quali sono accese */
const Months: React.FC<{state: (f: number, i: number) => number}> = ({state}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10, width: 900}}>
      {'GFMAMGLASOND'.split('').map((m, i) => {
        const on = state(f, i);
        return (
          <div key={i} style={{display: 'grid', gap: 8, justifyItems: 'center', fontFamily: UI, fontWeight: 700, fontSize: 32, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,.5)'}}>
            <div style={{width: '100%', height: 22, borderRadius: 10, background: on > 0.5 ? RED : 'rgba(255,255,255,.3)', boxShadow: on > 0.5 ? '0 0 20px rgba(226,6,18,.9)' : 'none', transform: `scaleY(${0.7 + 0.3 * on})`}} />
            {m}
          </div>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{at: number; text: string; dim?: boolean}> = ({at, text}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = interpolate(f, [at, at + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <span style={{display: 'inline-block', background: RED, color: '#fff', borderRadius: 999, padding: '14px 32px', fontFamily: UI, fontWeight: 700, fontSize: 42, letterSpacing: '-0.02em', boxShadow: '0 0 30px rgba(226,6,18,.5)', transform: `scale(${0.8 + 0.2 * p})`, opacity: p}}>{text}</span>
  );
};

/* ---------------- 0389: hook ---------------- */
const S0389: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0389', w, n);
  const br = L('continuiamo') - 3;
  const br2 = L('sempre');
  const end = clipById('0389').frames;
  const days = Math.round(interpolate(f, [L('mesi'), L('mesi') + 18], [0, 178], clamp));
  return (
    <AbsoluteFill>
      <FramedVideo id="0389" zoomMul={ramp(f, 0, br, 1, 1.03) * punch(f, L('mesi'), 0.05)} />
      <Stack top={TEXT_TOP} until={br} scrimFrom={L('quasi')}>
        <Word at={L('quasi')} text="quasi" style={{marginLeft: -360}} />
        <Word at={L('sei')} text="6 mesi" size="xl" px={230} glow />
        {f >= L('mesi') && (
          <span style={{fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 40, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,.5)', marginTop: 10}}>
            10 mag → oggi · {days} giorni
          </span>
        )}
      </Stack>
      <Broll id="0366" from={br} to={br2} />
      <Broll id="0367" from={br2} to={end} startFrom={10} />
      <Sequence from={br} layout="none">
        <Stack top={TEXT_TOP} gap={4} scrimFrom={0} scrimStrength={0.68}>
          <Word at={0} text="continuiamo a parlare" />
          <Word at={L('sempre') - br} text="sempre degli" />
          <Word at={L('stessi') - br} text="stessi" size="xl" px={200} glow />
          <Word at={L('problemi') - br} text="problemi." size="m" px={130} />
        </Stack>
      </Sequence>
    </AbsoluteFill>
  );
};

/* ---------------- 0370: le proposte non mancano (+ sfocatura verso il vecchio reel) ---------------- */
const S0370: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0370', w, n);
  const end = clipById('0370').frames;
  const b = interpolate(f, [end - 10, end], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: b > 0 ? `blur(${b * 22}px) brightness(${1 - 0.38 * b})` : undefined, transform: `scale(${1 + 0.05 * b})`}}>
        <FramedVideo id="0370" zoomMul={ramp(f, 0, end, 1, 1.04)} />
      </AbsoluteFill>
      <Stack top={TEXT_TOP} until={end} scrimFrom={L('le')}>
        <Word at={L('le')} text="eppure le proposte" />
        <Word at={L('non')} text="non mancano." size="xl" serif px={170} glow />
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- vecchio reel del 10 maggio ---------------- */
const OldCard: React.FC<{p: number}> = ({p}) => {
  // card 4:5 con la parte alta del vecchio video (720x1280): i sottotitoli stampati restano fuori
  const cw = 620;
  const ch = 775;
  const srcH = 1280 * 0.55;
  const s = ch / srcH;
  const vw = 720 * s;
  const vh = 1280 * s;
  const left = Math.min(0, Math.max(cw - vw, cw / 2 - 0.47 * vw));
  return (
    <div style={{position: 'relative', width: cw, height: ch, borderRadius: 30, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.5)', transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 60}px)`, opacity: p}}>
      <OffthreadVideo src={staticFile('centro/old/old.mp4')} muted style={{position: 'absolute', left, top: 0, width: vw, height: vh}} />
    </div>
  );
};

const SOld: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('old', w, n);
  const end = clipById('old').frames;
  const pin = interpolate(f, [0, 9], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const pout = interpolate(f, [end - 8, end], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const p = Math.min(pin, pout);
  const items: [string, string][] = [['recupero', 'recupero'], ['riqualificazione', 'riqualificazione'], ['sostegno', 'attività e giovani'], ['accessibilità', 'accessibilità'], ['zona', 'zona a traffico limitato']];
  return (
    <AbsoluteFill>
      {/* sfondo: ultimo fotogramma di Andrea, sfocato e scurito */}
      <AbsoluteFill style={{filter: 'blur(22px) brightness(.62)', transform: 'scale(1.05)'}}>
        <Freeze frame={clipById('0370').frames - 1}>
          <FramedVideo id="0370" zoomMul={1.04} />
        </Freeze>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, opacity: pout}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.14)', border: '3px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 999, padding: '12px 32px', fontFamily: UI, fontWeight: 700, fontSize: 40, opacity: pin}}>
          ▶ Reel del 10 maggio 2026
        </span>
        <OldCard p={p} />
        <Word at={L('serve')} text="«Serve un piano vero»" px={54} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 44px', width: 860}}>
          {items.map(([w, label]) => {
            const at = L(w);
            const on = f >= at;
            const k = interpolate(f, [at, at + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
            return (
              <div key={w} style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: UI, fontWeight: 700, fontSize: 42, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 3px 18px rgba(0,0,0,.5)', opacity: on ? 1 : 0.35, whiteSpace: 'nowrap'}}>
                <span style={{width: 50, height: 50, borderRadius: '50%', display: 'grid', placeItems: 'center', flex: 'none', background: on ? RED : 'transparent', border: on ? 'none' : '4px solid #fff', transform: `scale(${on ? 0.8 + 0.2 * k : 1})`}}>
                  {on && <CheckSvg size={32} />}
                </span>
                {label}
              </div>
            );
          })}
        </div>
        <Word at={L('decoro')} text="decoro." size="xl" serif px={180} glow />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 0374: Confcommercio ---------------- */
const S0374: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0374', w, n);
  const br = L('che');
  return (
    <AbsoluteFill>
      <FramedVideo id="0374" zoomMul={ramp(f, br, clipById('0374').frames, 1, 1.05)} />
      <Broll id="0385" from={0} to={br} />
      <Stack top={TEXT_TOP} until={br} scrimFrom={L('giustamente')} scrimStrength={0.68}>
        <Word at={L('giustamente')} text="giustamente" />
        <Word at={L('confcommercio')} text="Confcommercio" size="xl" px={132} glow />
        <Word at={L('chiesto')} text="chiede un intervento" />
        <Word at={L('immediato')} text="immediato" size="m" px={96} />
      </Stack>
      <Stack top={TEXT_TOP} scrimFrom={L('soltanto')}>
        <Word at={L('soltanto')} text="non soltanto" />
        <Strike at={L('natalizio')} text="a Natale." px={130} />
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- 0380: tavolo permanente ---------------- */
const Hub: React.FC<{nodes: {t: string; x: number; y: number; at: number}[]; centerAt: number}> = ({nodes, centerAt}) => {
  const f = useCurrentFrame();
  const c = interpolate(f, [centerAt, centerAt + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
  const box = {w: 960, h: 600};
  return (
    <div style={{position: 'absolute', left: (W - box.w) / 2, top: 1090, width: box.w, height: box.h}}>
      <svg width={box.w} height={box.h} style={{position: 'absolute', inset: 0}}>
        {nodes.map((n, i) => {
          const k = interpolate(f, [n.at - 4, n.at + 2], [0, 1], clamp);
          const x2 = box.w / 2 + (n.x * box.w - box.w / 2) * k;
          const y2 = box.h / 2 + (n.y * box.h - box.h / 2) * k;
          return k > 0 ? <line key={i} x1={box.w / 2} y1={box.h / 2} x2={x2} y2={y2} stroke="#9b9b97" strokeWidth={5} strokeDasharray="14 11" /> : null;
        })}
      </svg>
      <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${c})`, background: RED, color: '#fff', fontFamily: UI, fontWeight: 800, fontSize: 56, letterSpacing: '-0.03em', borderRadius: 30, padding: '24px 38px', textAlign: 'center', lineHeight: 1}}>
        Tavolo
        <br />
        permanente
      </div>
      {nodes.map((n, i) => {
        const k = interpolate(f, [n.at, n.at + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
        return (
          <div key={i} style={{position: 'absolute', left: n.x * box.w, top: n.y * box.h, transform: `translate(-50%,-50%) scale(${k})`, background: '#fff', border: '5px solid #111', color: '#111', fontFamily: UI, fontWeight: 700, fontSize: 40, borderRadius: 999, padding: '12px 28px', whiteSpace: 'nowrap'}}>
            {n.t}
          </div>
        );
      })}
    </div>
  );
};

const S0380: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0380', w, n);
  const ins = L('un');
  const end = clipById('0380').frames;
  const pOut = interpolate(f, [ins, ins + 9], [0, 1], {...clamp, easing: ease});
  const pBack = interpolate(f, [end - 8, end], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const p = Math.min(pOut, pBack);
  const card = {x: (W - 700) / 2, y: 150, w: 700, h: 700};
  const nodes = [
    {t: 'Comune', x: 0.5, y: 0.07, at: L('comune')},
    {t: 'associazioni', x: 0.17, y: 0.33, at: L('associazioni')},
    {t: 'comitati di quartiere', x: 0.78, y: 0.33, at: L('comitati')},
    {t: 'residenti', x: 0.2, y: 0.9, at: L('residenti')},
    {t: 'commercianti', x: 0.78, y: 0.9, at: L('commercianti')},
  ];
  return (
    <AbsoluteFill>
      <FramedVideo id="0380" zoomMul={ramp(f, 0, ins, 1, 1.04) * punch(f, L('concreta'), 0.04)} />
      <Stack top={TEXT_TOP} until={ins + 2} scrimFrom={L('partiamo')}>
        <Word at={L('partiamo')} text="e allora partiamo da una" />
        <Word at={L('proposta')} text="proposta" size="xl" px={170} glow />
        <Word at={L('concreta')} text="concreta." size="m" />
      </Stack>
      {f >= ins && (
        <AbsoluteFill>
          <AbsoluteFill style={{background: '#F4F4F2', opacity: Math.min(pOut, interpolate(f, [end - 3, end], [1, 0], clamp))}} />
          <VideoCard id="0380" rect={card} p={p} faceFrac={0.3} fy={0.36} />
          <div style={{opacity: pBack}}>
            <Stack top={card.y + card.h + 40}>
              <Word at={L('tavolo')} text="un tavolo permanente con" ink="dark" px={56} />
            </Stack>
            <Hub nodes={nodes} centerAt={L('tavolo')} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 0381: problematiche, priorità, tutto l'anno ---------------- */
const S0381: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0381', w, n);
  const andrea = L('stabilire') - 2;
  const br1 = L('garantiscono') - 2;
  const br2 = L('e', 0) - 1;
  const end = clipById('0381').frames;
  const tutto = L('tutto');
  const non = L('non');
  return (
    <AbsoluteFill>
      <FramedVideo id="0381" zoomMul={ramp(f, andrea, br1, 1, 1.05) * punch(f, L('priorità'), 0.04)} />
      <Broll id="0388" from={0} to={andrea} />
      <Stack top={TEXT_TOP} until={andrea} scrimFrom={L('inquadrare')} scrimStrength={0.68}>
        <Word at={L('inquadrare')} text="per inquadrare" />
        <Word at={L('problematiche')} text="le problematiche" size="m" px={120} glow />
      </Stack>
      <Stack top={TEXT_TOP} until={br1} gap={26} scrimFrom={andrea}>
        <div style={{display: 'flex', gap: 18}}>
          <Pill at={andrea} text="problematiche" />
          <Pill at={L('programma')} text="programma" />
          <Pill at={L('priorità')} text="priorità" />
        </div>
        <Word at={L('soprattutto')} text="ma soprattutto" />
        <Word at={L('priorità')} text="le priorità" size="xl" px={170} glow />
      </Stack>
      <Broll id="0386" from={br1} to={br2} />
      <Broll id="0387" from={br2} to={end} />
      <Sequence from={br1} durationInFrames={br2 - br1} layout="none">
        <Stack top={H * 0.5} gap={18} scrimFrom={0} scrimStrength={0.68}>
          <Word at={0} text="che garantiscono al centro storico di" px={44} />
          <Word at={L('risplendere') - br1} text="risplendere" size="xl" serif px={210} glow />
          <Word at={tutto - br1} text="tutto l'anno" size="m" px={110} />
          <Sequence from={tutto - br1} layout="none">
            <Months state={(fr, i) => (fr >= i * 1.5 ? 1 : 0)} />
          </Sequence>
        </Stack>
      </Sequence>
      <Sequence from={br2} layout="none">
        <Stack top={H * 0.53} gap={22} scrimFrom={0} scrimStrength={0.7}>
          <Word at={non - br2} text="e non soltanto" />
          <Strike at={L('natalizio') - br2} text="a Natale" px={120} />
          <Months state={(fr, i) => (i === 11 ? 1 : fr < non - br2 ? 1 : fr < non - br2 + 12 ? (fr - (non - br2)) < (11 - i) ? 1 : 0 : 0)} />
          <Word at={L('come') - br2} text="come sta cercando di fare questa amministrazione" px={40} />
        </Stack>
      </Sequence>
    </AbsoluteFill>
  );
};

/* ---------------- 0383: chiusura ---------------- */
const S0383: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('0383', w, n);
  const br = L('adesso') - 2;
  const back = L('concreta') - 2;
  const end = clipById('0383').frames;
  const pill = interpolate(f, [L('proposte'), L('proposte') + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill>
      <FramedVideo id="0383" zoomMul={f < back ? 1 : ramp(f, back, end + 12, 1.05, 1.0)} />
      <Stack top={TEXT_TOP} until={br} gap={14} scrimFrom={L('proposte')}>
        <div style={{opacity: pill, transform: `scale(${0.8 + 0.2 * pill})`, display: 'inline-flex', alignItems: 'center', gap: 16, background: RED, color: '#fff', borderRadius: 999, padding: '16px 36px', fontFamily: UI, fontWeight: 700, fontSize: 46}}>
          <span style={{display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: '50%', background: GREEN}}>
            <CheckSvg size={30} />
          </span>
          proposte e idee
        </div>
        <Word at={L('ci')} text="ci sono." size="xl" px={170} glow />
      </Stack>
      <Broll id="0384" from={br} to={back} />
      <Stack top={TEXT_TOP} until={back} scrimFrom={L('adesso')} scrimStrength={0.68}>
        <Word at={L('adesso')} text="adesso partiamo con una" />
        <Word at={L('campagna')} text="campagna" size="m" px={120} />
      </Stack>
      <Stack top={TEXT_TOP} gap={8} scrimFrom={L('concreta')}>
        <Word at={L('concreta')} text="concreta e seria" size="xl" serif px={158} glow />
        <Word at={L('per')} text="per il centro storico di Crotone" />
      </Stack>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  '0389': S0389,
  '0370': S0370,
  old: SOld,
  '0374': S0374,
  '0380': S0380,
  '0381': S0381,
  '0383': S0383,
};
void Img;
void Typed;
void Row;
