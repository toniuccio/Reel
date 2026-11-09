import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {atLocal, clipById, H, W} from './timeline';
import {FramedVideo, VideoCard} from './video';
import {RED, Row, Stack, UI, Word} from '../text';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const TEXT_TOP = H * 0.56;
// b-roll senza viso: testo più in alto, così anche i blocchi da 4 righe finiscono sopra y = 1440
const TOP_B = H * 0.5;
// blocchi alti sui primi piani: partono un po' più su per restare nella safe zone
const TOP_T = H * 0.53;
const ramp = (f: number, a: number, b: number, z1: number, z2: number) => interpolate(f, [a, b], [z1, z2], {...clamp, easing: ease});
const punch = (f: number, at: number, amount: number) => 1 + interpolate(f, [at, at + 4], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.6))});

/** Tutti i testi stanno nella safe zone Reels/TikTok: x 90-920 (centro 505). */
const Safe: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 90, right: 160, top: 0, bottom: 0}}>{children}</div>
);

/** ripresa dell'ospedale (voce di Andrea sopra): schermo intero con push-in lento e vignettatura */
const Broll: React.FC<{id: string}> = ({id}) => {
  const f = useCurrentFrame();
  const len = clipById(id).frames;
  const z = interpolate(f, [0, len], [1.03, 1.08], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(`sanita/clips/${id}.mp4`)} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 45%, transparent 50%, rgba(0,0,0,.28) 100%)'}} />
    </AbsoluteFill>
  );
};

/** parola che compare e poi viene barrata da una linea rossa luminosa */
const Strike: React.FC<{show: number; at: number; text: string; px: number}> = ({show, at, text, px}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  if (f < show) return null;
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <Word at={show} text={text} size="m" px={px} />
      <div style={{position: 'absolute', left: '-3%', top: '52%', height: px * 0.09, width: `${106 * p}%`, background: RED, borderRadius: 8, boxShadow: '0 0 22px rgba(226,6,18,.85)'}} />
    </div>
  );
};

const Pill: React.FC<{at: number; text: string}> = ({at, text}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = interpolate(f, [at, at + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <span style={{display: 'inline-block', background: RED, color: '#fff', borderRadius: 999, padding: '16px 34px', fontFamily: UI, fontWeight: 700, fontSize: 46, letterSpacing: '-0.02em', transform: `scale(${0.8 + 0.2 * p})`, opacity: p}}>{text}</span>
  );
};

/* 01 · hook */
const S0396: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, o = 0) => atLocal('0396', w, n, o);
  const end = clipById('0396').frames;
  return (
    <AbsoluteFill>
      <FramedVideo id="0396" zoomMul={ramp(f, 0, end, 1, 1.03) * punch(f, L('malati'), 0.05)} />
      <Safe>
        <Stack top={TEXT_TOP} until={L('gli')} scrimFrom={L('dottore')}>
          <Word at={L('dottore')} text="dottor Graziano," />
          <Word at={L('vorrei')} text="vorrei dirle una cosa" />
        </Stack>
        <Stack top={TOP_T} until={end - 1} scrimFrom={L('gli')}>
          <Word at={L('gli')} text="gli sprechi in sanità" />
          <Word at={L('non')} text="non sono i" />
          <Word at={L('malati')} text="malati" size="xl" px={200} glow />
          <Word at={L('da')} text="da curare." />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 02 · ADI (b-roll) */
const S0397: React.FC = () => {
  const L = (w: string, n = 0, o = 0) => atLocal('0397', w, n, o);
  const end = clipById('0397').frames;
  const adi = L('sulla', 0, 0.24);
  return (
    <AbsoluteFill>
      <Broll id="0397" />
      <Safe>
        <Stack top={TOP_B} until={L('notizie') - 1} scrimFrom={0} scrimStrength={0.68}>
          <Word at={L('ho')} text="ho seguito" />
          <Word at={L('con')} text="con attenzione" />
        </Stack>
        <Stack top={TOP_B} until={end - 1} scrimFrom={L('notizie')} scrimStrength={0.68}>
          <Word at={L('notizie')} text="le notizie di questi giorni sull'" />
          <Word at={adi} text="ADI" size="xl" px={240} glow />
          <Word at={L('acrotone')} text="a Crotone" />
          <Word at={L('polemiche')} text="e le polemiche" />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 03 · persone dietro l'assistenza (insert bianco) */
const S0404: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, o = 0) => atLocal('0404', w, n, o);
  const end = clipById('0404').frames;
  const ins = L('ci');
  const pOut = interpolate(f, [ins, ins + 9], [0, 1], {...clamp, easing: ease});
  const pBack = interpolate(f, [end - 9, end - 1], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const p = Math.min(pOut, pBack);
  const card = {x: 90 + (830 - 680) / 2, y: 260, w: 680, h: 680};
  return (
    <AbsoluteFill>
      <FramedVideo id="0404" zoomMul={ramp(f, 0, ins, 1, 1.04)} />
      <Safe>
        <Stack top={TEXT_TOP} until={ins} scrimFrom={L('settore')}>
          <Word at={L('settore')} text="direttore generale," />
          <Word at={L('dietro')} text="dietro ogni" />
          <Word at={L('assistenza')} text="assistenza" size="m" px={100} />
          <Word at={L('domiciliare')} text="domiciliare" size="m" px={100} />
        </Stack>
      </Safe>
      {f >= ins && (
        <AbsoluteFill>
          <AbsoluteFill style={{background: '#F4F4F2', opacity: Math.min(pOut, interpolate(f, [end - 4, end - 1], [1, 0], clamp))}} />
          <VideoCard id="0404" rect={card} p={p} faceFrac={0.3} fy={0.36} />
          <div style={{opacity: Math.pow(pBack, 4)}}>
            <Safe>
              <Stack top={card.y + card.h + 40} gap={26}>
                <Word at={ins} text="ci sono" ink="dark" px={56} />
                <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', width: 800}}>
                  <Pill at={L('famiglie')} text="famiglie" />
                  <Pill at={L('persone')} text="persone fragili" />
                  <Pill at={L('cargiver')} text="caregiver" />
                </div>
              </Stack>
            </Safe>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* 04 · diritto alle cure, non spreco */
const S0405: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, o = 0) => atLocal('0405', w, n, o);
  const end = clipById('0405').frames;
  return (
    <AbsoluteFill>
      <FramedVideo id="0405" zoomMul={ramp(f, 0, end, 1, 1.03) * punch(f, L('cure'), 0.04)} />
      <Safe>
        <Stack top={TEXT_TOP} until={L('il') - 1} scrimFrom={0}>
          <Word at={L('non')} text="non possiamo trasformare" />
        </Stack>
        <Stack top={TOP_T} until={end - 1} gap={10} scrimFrom={L('il')}>
          <Word at={L('il')} text="il diritto alle" />
          <Word at={L('cure')} text="cure" size="xl" px={200} glow />
          <Strike show={L('voce')} at={L('spreco', 0, 0.12)} text="spreco" px={110} />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 05 · inefficienze e scelte sbagliate (b-roll OSPEDALE) */
const S0408: React.FC = () => {
  const L = (w: string, n = 0, o = 0) => atLocal('0408', w, n, o);
  const end = clipById('0408').frames;
  return (
    <AbsoluteFill>
      <Broll id="0408" />
      <Safe>
        <Stack top={TOP_B} until={L('sono') - 1} scrimFrom={0} scrimStrength={0.68}>
          <Word at={L('gli')} text="gli sprechi," />
          <Word at={L('se')} text="se vogliamo cercarli," />
        </Stack>
        <Stack top={TOP_B} until={L('di') - 1} gap={8} scrimFrom={L('sono')} scrimStrength={0.68}>
          <Word at={L('sono')} text="sono nelle" />
          <Word at={L('inefficienze')} text="inefficienze" size="xl" px={115} glow />
          <Word at={L('e')} text="e nelle" />
          <Word at={L('scel')} text="scelte sbagliate" size="m" px={90} glow />
        </Stack>
        <Stack top={TOP_B} until={end - 1} gap={8} scrimFrom={L('di')} scrimStrength={0.68}>
          <Word at={L('di')} text="di tutti questi" />
          <Word at={L('messia')} text="messia" size="m" px={110} glow />
          <Word at={L('venuti')} text="venuti da fuori" />
          <Word at={L('per')} text="per governare la sanità crotonese" px={42} />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 06 · operatori sanitari (b-roll) */
const S0409: React.FC = () => {
  const L = (w: string, n = 0, o = 0) => atLocal('0409', w, n, o);
  const end = clipById('0409').frames;
  return (
    <AbsoluteFill>
      <Broll id="0409" />
      <Safe>
        <Stack top={TOP_B} until={L('che') - 1} gap={8} scrimFrom={L('voglio')} scrimStrength={0.68}>
          <Word at={L('voglio')} text="voglio fare un plauso" />
          <Word at={L('a')} text="a tutti gli" />
          <Word at={L('operatori')} text="operatori" size="xl" px={150} glow />
          <Word at={L('sanitari')} text="sanitari" size="m" px={100} />
        </Stack>
        <Stack top={TOP_B} until={end - 1} gap={8} scrimFrom={L('che')} scrimStrength={0.68}>
          <Word at={L('nonostante')} text="che nonostante le difficoltà" />
          <Word at={L('continuano')} text="continuano" />
          <Word at={L('ogni')} text="ogni giorno" size="m" px={110} glow />
          <Word at={L('garantire')} text="a garantire assistenza" />
          <Word at={L('ai')} text="ai nostri cittadini" />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 07 · al Presidente Occhiuto */
const S0412: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, o = 0) => atLocal('0412', w, n, o);
  const end = clipById('0412').frames;
  return (
    <AbsoluteFill>
      <FramedVideo id="0412" zoomMul={ramp(f, 0, end, 1, 1.04) * punch(f, L('territorio'), 0.05)} />
      <Safe>
        <Stack top={TEXT_TOP} until={L('da') - 1} scrimFrom={L('al')}>
          <Word at={L('al')} text="al Presidente Occhiuto" />
          <Word at={L("l'ospedale")} text="l'ospedale di Crotone" />
          <Word at={L('governato')} text="va governato" size="m" px={96} />
        </Stack>
        <Stack top={TEXT_TOP} until={L('i') - 1} scrimFrom={L('da')}>
          <Word at={L('chi')} text="da chi conosce il" />
          <Word at={L('territorio')} text="territorio" size="xl" px={140} glow />
        </Stack>
        <Stack top={TEXT_TOP} until={end - 1} scrimFrom={L('i')}>
          <Word at={L('suoi')} text="i suoi problemi" />
          <Word at={L('sa')} text="e sa dove intervenire" />
          <Word at={L('immediatamente')} text="immediatamente" size="m" px={96} glow />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 08 · Terza Commissione (b-roll) */
const S0413: React.FC = () => {
  const L = (w: string, n = 0, o = 0) => atLocal('0413', w, n, o);
  const end = clipById('0413').frames;
  return (
    <AbsoluteFill>
      <Broll id="0413" />
      <Safe>
        <Stack top={TOP_B} until={L('ospite') - 1} gap={8} scrimFrom={0} scrimStrength={0.68}>
          <Word at={L('già')} text="ho già presentato" />
          <Word at={L('formale')} text="formale richiesta" size="m" px={96} />
          <Word at={L('avere')} text="per avere il dottor Graziano" />
        </Stack>
        <Stack top={TOP_B} until={L('che') - 1} gap={4} scrimFrom={L('ospite')} scrimStrength={0.68}>
          <Word at={L('ospite')} text="ospite nella" />
          <Word at={L('terza')} text="Terza" size="xl" px={125} glow />
          <Word at={L('commissione')} text="Commissione" size="xl" px={125} glow />
          <Word at={L('consigliare')} text="consiliare · Comune di Crotone" px={42} />
        </Stack>
        <Stack top={TOP_B} until={end - 1} gap={8} scrimFrom={L('che')} scrimStrength={0.68}>
          <Word at={L('occupa')} text="che si occupa di sanità" />
          <Word at={L('confrontarci')} text="per confrontarci sui" />
          <Word at={L('problemi')} text="problemi reali" size="m" px={110} glow />
          <Word at={L('nostro')} text="del nostro ospedale" />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

/* 09 · chiusura */
const S0414: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, o = 0) => atLocal('0414', w, n, o);
  const end = clipById('0414').frames;
  return (
    <AbsoluteFill>
      <FramedVideo id="0414" zoomMul={ramp(f, L('risposte'), end + 12, 1.05, 1.0)} />
      <Safe>
        <Stack top={TEXT_TOP} until={L('non') - 1} scrimFrom={0}>
          <Word at={L('crotone')} text="Crotone e il suo ospedale" />
        </Stack>
        <Stack top={TOP_T} gap={14} scrimFrom={L('non')}>
          <Word at={L('non')} text="non hanno bisogno di" />
          <Strike show={L('promesse')} at={L('promesse', 0, 0.2)} text="promesse" px={110} />
          <Word at={L('risposte')} text="risposte!" size="xl" serif px={190} glow />
        </Stack>
      </Safe>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  '0396': S0396, '0397': S0397, '0404': S0404, '0405': S0405, '0408': S0408,
  '0409': S0409, '0412': S0412, '0413': S0413, '0414': S0414,
};
void Row;
void W;
