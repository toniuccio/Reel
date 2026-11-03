import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {atLocal, clipById, H, W} from './timeline';
import {FramedVideo, VideoCard} from './video';
import {GREEN, RED, Row, Stack, Typed, UI, Word} from './text';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const TEXT_TOP = H * 0.55;

/** rampa morbida di zoom */
const ramp = (f: number, a: number, b: number, z1: number, z2: number) =>
  interpolate(f, [a, b], [z1, z2], {...clamp, easing: ease});
/** punch-in rapido: 4 frame con un leggero rimbalzo */
const punch = (f: number, at: number, amount: number) =>
  1 + interpolate(f, [at, at + 4], [0, amount], {...clamp, easing: Easing.out(Easing.back(1.6))});

const White: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <AbsoluteFill style={{background: '#F4F4F2', opacity}} />
);

const Check: React.FC<{on: number; size: number}> = ({on, size}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [on, on + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const active = f >= on;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `5px solid ${active ? RED : '#111'}`,
        background: active ? RED : '#F4F4F2',
        display: 'grid',
        placeItems: 'center',
        transform: `scale(${active ? 0.85 + 0.15 * p : 1})`,
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke={active ? '#fff' : '#111'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
  );
};

/* ---------------- 9194: hook + insert "Crotone" ---------------- */
const S9194: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9194', w, n);
  const ins = L('due', 1) - 3; // inizio insert bianco
  const end = clipById('9194').frames;
  const zoom = ramp(f, 0, ins, 1, 1.03) * punch(f, L('vertenze'), 0.05);
  const pOut = interpolate(f, [ins, ins + 9], [0, 1], {...clamp, easing: ease});
  const pBack = interpolate(f, [end - 8, end], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const p = Math.min(pOut, pBack);
  const card = {x: (W - 520) / 2, y: 620, w: 520, h: 650};
  const cr = L('crotone');
  const cardImg = (src: string, k: number, rot: number, dx: number) => {
    const o = interpolate(f, [cr + k * 3, cr + k * 3 + 2], [0, 1], clamp);
    return (
      <Img
        src={staticFile(`img/${src}`)}
        style={{position: 'absolute', left: card.x + dx, top: card.y + 10, width: card.w, height: card.h, objectFit: 'cover', transform: `rotate(${rot}deg)`, opacity: o * pOut * pBack, boxShadow: '0 16px 44px rgba(0,0,0,.18)'}}
      />
    );
  };
  return (
    <AbsoluteFill>
      <FramedVideo id="9194" zoomMul={zoom} />
      <Stack top={TEXT_TOP} until={ins + 2}>
        <Word at={L('due')} text="due" style={{alignSelf: 'center', marginLeft: -320}} />
        <Word at={L('vertenze')} text="vertenze" size="xl" glow />
        <Row>
          <Word at={L('centinaia')} text="centinaia" />
          <Word at={L('di')} text="di" />
          <Word at={L('lavoratori')} text="lavoratori" />
        </Row>
      </Stack>
      {f >= ins && (
        <AbsoluteFill>
          <White opacity={Math.min(pOut, interpolate(f, [end - 3, end], [1, 0], clamp))} />
          {cardImg('card_corso.jpg', 0, -5, -90)}
          {cardImg('card_municipio.jpg', 1, 5, 90)}
          <VideoCard id="9194" rect={card} p={p} />
          <div style={{opacity: pBack}}>
            <Stack top={H * 0.17}>
              <Word at={L('che')} text="che a" ink="dark" />
            </Stack>
            <Stack top={H * 0.235}>
              <Word at={cr} text="Crotone" ink="dark" px={58} />
            </Stack>
            <Stack top={card.y + card.h + 60} gap={10}>
              <Word at={L('non')} text="non possiamo più" ink="dark" />
              <Word at={L('ignorare')} text="ignorare." size="m" ink="red" />
            </Stack>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 9200 + 9202: lista Abramo / Konecta ---------------- */
const ListAbramo: React.FC<{local0: number}> = ({local0}) => {
  // local0: frame di questa clip in cui la lista "comincia" rispetto a 9200 (per continuare sopra la 9202)
  const L = (w: string, n = 0, off = 0) => atLocal('9200', w, n, off) - local0;
  return (
    <>
      <Word at={L('chiama')} text="Abramo:" size="l" glow />
      <Typed parts={[
        {text: '≈150 lavoratori', from: L('centocinquanta'), to: L('lavoratori', 0, 0.4)},
        {text: ' a rischio', from: L('rischiano'), to: L('rischiano', 0, 0.3)},
      ]} cursorUntil={L('lavoro')} />
    </>
  );
};

const S9200: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FramedVideo id="9200" zoomMul={ramp(f, 0, clipById('9200').frames, 1, 1.05)} />
      <Stack top={TEXT_TOP} align="left" gap={8}>
        <ListAbramo local0={0} />
      </Stack>
    </AbsoluteFill>
  );
};

const S9202: React.FC = () => {
  const f = useCurrentFrame();
  const end = clipById('9202').frames;
  const L = (w: string, n = 0, off = 0) => atLocal('9202', w, n, off);
  const prev = clipById('9200').frames;
  return (
    <AbsoluteFill>
      <FramedVideo id="9202" zoomMul={ramp(f, 0, end, 1, 1.04)} />
      <Stack top={TEXT_TOP} align="left" gap={8} until={end}>
        <ListAbramo local0={-prev} />
        <div style={{height: 14}} />
        <Word at={L('connecta')} text="Konecta:" size="l" glow />
        <Typed parts={[
          {text: 'centinaia', from: L('centinaia'), to: L('centinaia', 0, 0.35)},
          {text: ' in cassa integrazione', from: L('cassa'), to: L('integrazione', 0, 0.5)},
        ]} />
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- 9220: preoccupazione + insert nero ---------------- */
const S9220: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9220', w, n);
  const blk = L('il');
  const zoom = punch(f, L('preoccupazione'), 0.1) * interpolate(f, [blk - 5, blk], [1, 1.12], {...clamp, easing: Easing.in(Easing.cubic)});
  const toBlack = interpolate(f, [blk - 5, blk], [0, 1], clamp);
  const seq: [string, string][] = [['il', 'il lavoro'], ['a', 'a Crotone'], ['viene', 'viene messo'], ['di', 'di nuovo'], ['in', 'in discussione.']];
  const starts = seq.map(([w]) => L(w, w === 'a' ? 0 : 0));
  const cur = starts.reduce((acc, s, i) => (f >= s ? i : acc), -1);
  return (
    <AbsoluteFill>
      <FramedVideo id="9220" zoomMul={zoom} />
      <Stack top={TEXT_TOP} until={blk - 2}>
        <Row>
          <Word at={0} text="due" />
          <Word at={L('situaze')} text="situazioni" />
          <Word at={L('situaze') + 12} text="diverse," />
        </Row>
        <Row>
          <Word at={L('una')} text="una" />
          <Word at={L('stessa')} text="stessa" />
        </Row>
        <Word at={L('preoccupazione')} text="preoccupazione" size="xl" px={140} glow />
      </Stack>
      <AbsoluteFill style={{background: '#000', opacity: toBlack, filter: toBlack < 1 ? `blur(${(1 - toBlack) * 6}px)` : undefined}} />
      {cur >= 0 && (
        <AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>
          <Word key={cur} at={starts[cur]} text={seq[cur][1]} px={66} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 9233: basta / uniti ---------------- */
const S9233: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9233', w, n);
  const b = L('basta');
  const su = L('su');
  const zoom = interpolate(f, [b, b + 4, su, su + 20], [1.0, 1.13, 1.13, 1.0], {...clamp, easing: Easing.out(Easing.cubic)});
  const shake = f >= b && f < b + 4 ? 6 : 0;
  const flash = interpolate(f, [0, 2], [0.55, 0], clamp);
  return (
    <AbsoluteFill>
      <FramedVideo id="9233" zoomMul={zoom} shake={shake} />
      <AbsoluteFill style={{background: RED, opacity: flash, mixBlendMode: 'screen'}} />
      <Stack top={TEXT_TOP} until={su}>
        <Word at={b} text="basta." size="xl" glow />
        <Row>
          <Word at={L('con')} text="con una Crotone" />
          <Word at={L('lasciata')} text="lasciata sola" />
        </Row>
      </Stack>
      <Stack top={TEXT_TOP}>
        <Word at={L('uniti')} text="uniti" size="xl" serif px={240} glow />
        <Row>
          <Word at={L('al')} text="al di là dei" />
          <Word at={L('colori')} text="colori politici" />
        </Row>
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- 9235: schema dei livelli ---------------- */
const Level: React.FC<{on: number; title: string; sub: string; subAt: number; logoAt?: number}> = ({on, title, sub, subAt, logoAt}) => {
  const f = useCurrentFrame();
  const subO = interpolate(f, [subAt, subAt + 5], [0, 1], clamp);
  const lg = logoAt === undefined ? 0 : interpolate(f, [logoAt, logoAt + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{display: 'grid', gridTemplateColumns: '108px 1fr auto', gap: 40, alignItems: 'center'}}>
      <Check on={on} size={108} />
      <div>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 82, letterSpacing: '-0.04em', color: '#111', lineHeight: 1}}>{title}</div>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 45, color: '#555', letterSpacing: '-0.01em', marginTop: 6, opacity: subO, minHeight: 50}}>{sub}</div>
      </div>
      {logoAt !== undefined && (
        <Img src={staticFile('img/logo-pd.jpg')} style={{width: 140, mixBlendMode: 'multiply', opacity: lg, transform: `scale(${0.9 + 0.1 * lg})`}} />
      )}
    </div>
  );
};

const S9235: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9235', w, n);
  const ins = L('scorsi');
  const end = clipById('9235').frames;
  const p = interpolate(f, [ins, ins + 9], [0, 1], {...clamp, easing: ease});
  const card = {x: (W - 800) / 2, y: 163, w: 800, h: 800};
  return (
    <AbsoluteFill>
      <FramedVideo id="9235" zoomMul={ramp(f, 0, ins, 1, 1.05)} />
      <Stack top={TEXT_TOP} until={ins + 2}>
        <Row>
          <Word at={0} text="queste" />
          <Word at={L('due')} text="due" />
          <Word at={L('battaglie')} text="battaglie" />
        </Row>
      </Stack>
      {f >= ins && (
        <AbsoluteFill>
          <White opacity={p} />
          <VideoCard id="9235" rect={card} p={p} faceFrac={0.3} fy={0.36} />
          <div style={{opacity: interpolate(f, [ins + 6, ins + 11], [0, 1], clamp)}}>
            <Stack top={card.y + card.h + 32}>
              <Word at={ins + 6} text="le abbiamo già affrontate" ink="dark" px={58} />
            </Stack>
            <div style={{position: 'absolute', left: 140, right: 140, top: H * 0.59, display: 'grid', gap: 40}}>
              <div style={{position: 'absolute', left: 54, top: 60, bottom: 60, borderLeft: '5px dashed #9b9b97'}} />
              <Level on={L('istituzioni')} title="Comune" sub="Crotone" subAt={L('istituzioni')} />
              <Level on={L('regionali')} title="Regione" sub="con il consigliere Ernesto Alecci" subAt={L('consigliere')} />
              <Level on={L('nazionali')} title="Nazionale" sub="Partito Democratico" subAt={L('partito')} logoAt={L('partito')} />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 9236: non ci fermeremo ---------------- */
const S9236: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9236', w, n);
  const n = L('non');
  const zoom = ramp(f, 0, L('fermeremo'), 1, 1.1) * punch(f, L('fermeremo'), 0.04);
  return (
    <AbsoluteFill>
      <FramedVideo id="9236" zoomMul={zoom} />
      <Stack top={TEXT_TOP} until={n}>
        <Row>
          <Word at={0} text="ora" />
          <Word at={L('siamo')} text="siamo" />
          <Word at={L('pronti')} text="pronti" />
        </Row>
      </Stack>
      <Stack top={TEXT_TOP}>
        <Word at={n} text="non ci" style={{marginLeft: -360}} />
        <Word at={L('fermeremo')} text="fermeremo." size="xl" px={170} glow />
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- 9239: consiglio comunale + cittadini ---------------- */
const S9239: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0) => atLocal('9239', w, n);
  const back = L('perché') + 6;
  const pIn = interpolate(f, [0, 7], [0, 1], {...clamp, easing: ease});
  const pBack = interpolate(f, [back - 8, back], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const p = Math.min(pIn, pBack);
  const card = {x: (W - 600) / 2, y: 330, w: 600, h: 750};
  const click = L('straordinario') + 7;
  const cursorX = interpolate(f, [click - 12, click], [860, 600], {...clamp, easing: Easing.out(Easing.cubic)});
  const cursorY = interpolate(f, [click - 12, click], [1520, 1290], {...clamp, easing: Easing.out(Easing.cubic)});
  const press = f >= click && f < click + 3 ? 0.85 : 1;
  const pill = interpolate(f, [click, click + 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill>
      <FramedVideo id="9239" zoomMul={ramp(f, back, clipById('9239').frames, 1, 1.06)} />
      {f < back && (
        <AbsoluteFill>
          <White opacity={pBack} />
          <VideoCard id="9239" rect={card} p={p} faceFrac={0.22} fy={0.42} />
          <div style={{opacity: pBack}}>
            <Stack top={H * 0.105}>
              <Word at={L('chiederemo')} text="chiederemo un" ink="dark" />
            </Stack>
            <Stack top={H * 0.135}>
              <Word at={L('consiglio')} text="Consiglio comunale" ink="dark" px={60} />
            </Stack>
            <Stack top={card.y + card.h + 40} gap={30}>
              <Word at={L('straordinario')} text="straordinario" size="m" ink="red" />
              <div style={{opacity: pill, transform: `scale(${0.8 + 0.2 * pill})`, display: 'inline-flex', alignItems: 'center', gap: 16, background: RED, color: '#fff', borderRadius: 999, padding: '16px 34px', fontFamily: UI, fontWeight: 700, fontSize: 44, letterSpacing: '-0.02em'}}>
                <span style={{display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '50%', background: GREEN}}>
                  <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                richiesta inviata
              </div>
            </Stack>
            {f >= click - 12 && (
              <svg viewBox="0 0 24 24" width={76} height={76} style={{position: 'absolute', left: cursorX, top: cursorY, transform: `scale(${press})`, opacity: interpolate(f, [click + 14, click + 20], [1, 0], clamp)}}>
                <path d="M5 3l14 8-6 1.5L10 19z" fill="#111" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </AbsoluteFill>
      )}
      <Stack top={TEXT_TOP}>
        <Word at={L('la')} text="la voce dei" />
        <Word at={L('cittadini')} text="cittadini" size="xl" px={176} glow />
        <Row>
          <Word at={L('ai')} text="ai tavoli" />
          <Word at={L('dove')} text="dove si decide" />
        </Row>
      </Stack>
    </AbsoluteFill>
  );
};

/* ---------------- 9241: tutelare / difendere / la faccia ---------------- */
const S9241: React.FC = () => {
  const f = useCurrentFrame();
  const L = (w: string, n = 0, off = 0) => atLocal('9241', w, n, off);
  const e = L('e', 1);
  const end = clipById('9241').frames;
  const zoom = ramp(f, e, end + 12, 1.06, 1.0);
  return (
    <AbsoluteFill>
      <FramedVideo id="9241" zoomMul={f < e ? 1.06 : zoom} />
      <Stack top={TEXT_TOP} align="left" gap={8} until={e}>
        <Word at={L('tutelare')} text="Tutelare:" size="l" glow />
        <Typed parts={[{text: 'il lavoro.', from: L('il', 1), to: L('lavoro', 0, 0.3)}]} cursorUntil={L('difendere')} />
        <div style={{height: 14}} />
        <Word at={L('difendere')} text="Difendere:" size="l" glow />
        <Typed parts={[{text: 'il territorio.', from: L('il', 2), to: L('territorio', 0, 0.45)}]} />
      </Stack>
      <Stack top={TEXT_TOP} gap={4}>
        <Word at={L('continueremo')} text="continueremo a" />
        <Word at={L('metterci')} text="metterci" size="m" />
        <Word at={L('la', 0)} text="la faccia." size="xl" serif px={230} glow />
      </Stack>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC> = {
  '9194': S9194,
  '9200': S9200,
  '9202': S9202,
  '9220': S9220,
  '9233': S9233,
  '9235': S9235,
  '9236': S9236,
  '9239': S9239,
  '9241': S9241,
};
