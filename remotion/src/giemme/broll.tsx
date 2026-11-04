// Grafiche animate del reel Giemme: linguaggio del video di riferimento (griglia tecnica, box titolo,
// riquadri con le maniglie, cerchi tratteggiati) con i colori Giemme e l'isometria del monogramma.
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {H, W} from './timeline';
import {SERIF, UI} from '../text';

export const PAPER = '#F4F4F2';
export const INK = '#1A1A1E';
export const RED = '#E50210';
export const OK = '#1F9D55';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const k = (g: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(g, [a, b], [0, 1], {...clamp, easing: e});
export const pop = (g: number, at: number, len = 5) => k(g, at, at + len, Easing.out(Easing.back(2)));
const fade = (g: number, at: number, len = 3) => k(g, at, at + len, Easing.linear);

/* ---------- fondo: foglio da tavola tecnica ---------- */
export const Grid: React.FC<{g: number}> = ({g}) => {
  const drift = (g * 0.25) % 108;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        backgroundImage: `linear-gradient(rgba(26,26,30,.075) 2px,transparent 2px),linear-gradient(90deg,rgba(26,26,30,.075) 2px,transparent 2px),linear-gradient(rgba(26,26,30,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,30,.035) 1px,transparent 1px)`,
        backgroundSize: '108px 108px,108px 108px,21.6px 21.6px,21.6px 21.6px',
        backgroundPosition: `0 ${drift}px,0 ${drift}px,0 ${drift}px,0 ${drift}px`,
      }}
    />
  );
};

/* ---------- testo su fondo chiaro ---------- */
export const Ink: React.FC<{g: number; at: number; text: string; serif?: boolean; red?: boolean; px?: number}> = ({g, at, text, serif, red, px = 72}) => {
  if (g < at) return null;
  const p = pop(g, at, 4);
  return (
    <span
      style={{
        display: 'inline-block', fontFamily: serif ? SERIF : UI, fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : 800, fontSize: serif ? px * 1.22 : px, letterSpacing: serif ? '-0.01em' : '-0.035em',
        lineHeight: 1, color: red ? RED : INK, opacity: fade(g, at, 2), transform: `scale(${0.86 + 0.14 * p})`, whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

export const Line: React.FC<{top: number; children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({top, children, gap = 18, style}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap, ...style}}>{children}</div>
);

/* ---------- box del titolo (come il "Did you know?" del riferimento) ---------- */
export const TitleBox: React.FC<{g: number; at: number; shrinkAt: number; outAt: number}> = ({g, at, shrinkAt, outAt}) => {
  if (g < at || g > outAt + 6) return null;
  const wIn = k(g, at, at + 6, Easing.out(Easing.cubic));
  const hIn = k(g, at + 5, at + 11, Easing.out(Easing.cubic));
  const txt = fade(g, at + 8, 4);
  const sq = k(g, at + 9, at + 17, Easing.out(Easing.bounce));
  const sh = k(g, shrinkAt, shrinkAt + 8);
  const out = 1 - k(g, outAt, outAt + 6);
  const scale = 1 - 0.36 * sh;
  const boxW = 820;
  const boxH = 250;
  return (
    <div style={{position: 'absolute', left: W / 2, top: 120 - 30 * sh, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0', opacity: out}}>
      <div style={{width: boxW * (0.04 + 0.96 * wIn), height: 14 + (boxH - 14) * hIn, background: RED, borderRadius: 34 * hIn, margin: '0 auto', position: 'relative', overflow: 'visible'}}>
        <div style={{position: 'absolute', inset: 0, padding: '30px 46px', opacity: txt, color: '#fff', fontFamily: UI, fontWeight: 800, fontSize: 86, lineHeight: 1.02, letterSpacing: '-0.035em', whiteSpace: 'nowrap', overflow: 'hidden'}}>
          Il tuo DVR
          <br />è in un <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 104, letterSpacing: 0}}>cassetto?</span>
        </div>
        <div style={{position: 'absolute', right: -22, top: -22 - 160 * (1 - sq), width: 52, height: 52, background: '#fff', boxShadow: `0 0 0 9px ${RED}`, opacity: g >= at + 9 ? 1 : 0}} />
      </div>
    </div>
  );
};

/* ---------- etichetta con le maniglie (selezione) ---------- */
export const Tag: React.FC<{g: number; at: number; text: string; check?: number; x?: number; y: number; scale?: number; size?: number}> = ({g, at, text, check, x = W / 2, y, scale = 1, size = 80}) => {
  if (g < at) return null;
  const p = pop(g, at, 6);
  const c = check !== undefined ? pop(g, check, 5) : 0;
  const hd = 18;
  const handle = (s: React.CSSProperties) => <i style={{position: 'absolute', width: hd, height: hd, background: INK, ...s}} />;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%,0) scale(${scale * (0.85 + 0.15 * p)})`, transformOrigin: '50% 0',
        opacity: fade(g, at, 3), display: 'flex', alignItems: 'center', gap: 24, padding: '20px 42px', border: `4px dashed ${INK}`,
        background: 'rgba(255,255,255,.7)', fontFamily: SERIF, fontStyle: 'italic', fontSize: size, lineHeight: 1, color: INK, whiteSpace: 'nowrap',
      }}
    >
      {handle({left: -11, top: -11})}
      {handle({right: -11, top: -11})}
      {handle({left: -11, bottom: -11})}
      {handle({right: -11, bottom: -11})}
      <b style={{width: 26, height: 26, background: RED, flex: 'none'}} />
      <span>{text}</span>
      {check !== undefined && g >= check && (
        <svg viewBox="0 0 20 20" width={58} height={58} style={{transform: `scale(${c})`}}>
          <circle cx="10" cy="10" r="9.5" fill={OK} />
          <path d="M5.5 10.5l3 3 6-7" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

/* ---------- cassetto isometrico ---------- */
export const Drawer: React.FC<{g: number; at: number; docAt: number; closeAt: number}> = ({g, at, docAt, closeAt}) => {
  const body = k(g, at, at + 8, Easing.out(Easing.cubic));
  const doc = k(g, docAt, docAt + 12, Easing.out(Easing.cubic));
  const close = k(g, closeAt, closeAt + 8, Easing.in(Easing.cubic));
  const dx = -48 * (1 - close);
  const dy = 24 * (1 - close);
  const docY = -150 + 210 * doc;
  return (
    <svg viewBox="0 0 300 240" style={{position: 'absolute', left: W * 0.03, top: H * 0.215, width: W * 0.94, overflow: 'visible', opacity: body, transform: `translateY(${(1 - body) * 40}px)`}}>
      <polygon points="40,70 150,15 260,70 150,125" fill="#fff" stroke={INK} strokeWidth="2" />
      <polygon points="40,70 150,125 150,225 40,170" fill="#E9E9E6" stroke={INK} strokeWidth="2" />
      <polygon points="150,125 260,70 260,170 150,225" fill="#DADAD6" stroke={INK} strokeWidth="2" />
      {/* vano del cassetto */}
      <polygon points="60,108 130,143 130,178 60,143" fill="#2a2a2e" />
      {/* documento */}
      <g transform={`translate(${66 + dx * close},${docY + dy}) rotate(${-8 + 8 * doc})`} opacity={g >= docAt ? 1 - close : 0}>
        <rect width="62" height="80" rx="3" fill="#fff" stroke={INK} strokeWidth="2" />
        <text x="9" y="22" fontFamily="Inter Tight" fontWeight="800" fontSize="15" fill={INK}>DVR</text>
        <rect x="9" y="32" width="44" height="3" fill="#C9C9C4" />
        <rect x="9" y="41" width="36" height="3" fill="#C9C9C4" />
        <rect x="9" y="50" width="40" height="3" fill="#C9C9C4" />
        <rect x="45" y="62" width="8" height="8" fill={RED} />
      </g>
      {/* frontale del cassetto (si chiude) */}
      <g transform={`translate(${dx},${dy})`}>
        <polygon points="60,108 130,143 130,178 60,143" fill="#fff" stroke={INK} strokeWidth="2" />
        <polygon points="60,108 60,143 12,167 12,132" fill="#ECECE9" stroke={INK} strokeWidth="2" opacity={1 - close} />
        <line x1="82" y1="134" x2="108" y2="147" stroke={RED} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/* ---------- timbro "IN REGOLA" barrato ---------- */
export const Stamp: React.FC<{g: number; at: number; y: number}> = ({g, at, y}) => {
  if (g < at) return null;
  const p = k(g, at, at + 5, Easing.out(Easing.cubic));
  const strike = k(g, at + 9, at + 15, Easing.out(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: W / 2, top: y, transform: `translate(-50%,-50%) rotate(-9deg) scale(${2.2 - 1.2 * p})`, opacity: p}}>
      <div style={{position: 'relative', fontFamily: UI, fontWeight: 800, fontSize: 118, letterSpacing: '0.04em', color: RED, border: `12px solid ${RED}`, borderRadius: 22, padding: '6px 38px', whiteSpace: 'nowrap', opacity: 0.94}}>
        IN REGOLA
        <i style={{position: 'absolute', left: '-7%', width: '114%', top: '50%', height: 18, background: INK, transform: `rotate(-4deg) scaleX(${strike})`, transformOrigin: '0 50%'}} />
      </div>
    </div>
  );
};

/* ---------- lavoratori con il casco ---------- */
export const Workers: React.FC<{g: number; at: number; on: number}> = ({g, at, on}) => (
  <>
    {Array.from({length: 15}).map((_, i) => {
      const a = at + i;
      if (g < a) return null;
      const lit = i < 11 && g >= on + i * 2;
      const p = pop(g, a, 5);
      const x = W * (0.045 + (i % 5) * 0.186);
      const y = H * (0.44 + Math.floor(i / 5) * 0.11);
      return (
        <svg key={i} viewBox="0 0 40 44" style={{position: 'absolute', left: x, top: y, width: 140, transform: `scale(${0.6 + 0.4 * p})`, opacity: p, filter: lit ? 'drop-shadow(0 0 14px rgba(229,2,16,.45))' : undefined}}>
          <path d="M8 18a12 12 0 0 1 24 0z" fill={lit ? RED : '#C9C9C4'} />
          <rect x="5" y="17" width="30" height="3.5" rx="1.5" fill={INK} />
          <circle cx="20" cy="26" r="6" fill={INK} />
          <path d="M8 44a12 10 0 0 1 24 0z" fill={INK} />
        </svg>
      );
    })}
  </>
);

/* ---------- icone ---------- */
const ICON: Record<string, React.ReactNode> = {
  ufficio: (
    <>
      <rect x="9" y="11" width="22" height="15" rx="2" fill="none" stroke={INK} strokeWidth="2.2" />
      <path d="M15 31h10M20 26v5" stroke={INK} strokeWidth="2.2" />
    </>
  ),
  cantiere: (
    <>
      <path d="M8 27a12 12 0 0 1 24 0z" fill={RED} />
      <rect x="6" y="27" width="28" height="3.5" rx="1.5" fill={INK} />
      <path d="M20 13v6" stroke="#fff" strokeWidth="2.2" />
    </>
  ),
  magazzino: (
    <>
      <path d="M20 8l12 6v13l-12 6-12-6V14z" fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8 14l12 6 12-6M20 20v13" stroke={INK} strokeWidth="2.2" />
    </>
  ),
  macchine: (
    <>
      <circle cx="20" cy="20" r="5" fill="none" stroke={RED} strokeWidth="2.6" />
      <path d="M20 7v5M20 28v5M7 20h5M28 20h5M11 11l3.5 3.5M25.5 25.5L29 29M11 29l3.5-3.5M25.5 14.5L29 11" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};
const HAZ: Record<string, React.ReactNode> = {
  caduta: (
    <>
      <path d="M20 15v8" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="28" r="1.8" fill="#111" />
    </>
  ),
  elettrico: <path d="M22 12l-6 10h5l-3 9 7-11h-5z" fill="#111" />,
  rumore: (
    <>
      <path d="M14 18h4l5-4v14l-5-4h-4z" fill="#111" />
      <path d="M26 17c2 2 2 6 0 8" stroke="#111" strokeWidth="2" fill="none" />
    </>
  ),
  carichi: (
    <>
      <path d="M20 12v12M15 20l5 6 5-6" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 30h14" stroke="#111" strokeWidth="2.8" strokeLinecap="round" />
    </>
  ),
};
const ACTS = [['ufficio', 'Ufficio'], ['cantiere', 'Cantiere'], ['magazzino', 'Magazzino'], ['macchine', 'Macchine']];
const RISKS = [['caduta', 'Caduta'], ['elettrico', 'Elettrico'], ['rumore', 'Rumore'], ['carichi', 'Carichi']];

/* ---------- lavagna a 3 passi: attività -> rischi -> misure ---------- */
export const Board: React.FC<{
  g: number;
  t0: number;
  iconsAt: number[];
  step2: number;
  hazAt: number[];
  step3: number;
  shieldAt: number;
  checkAt: number;
}> = ({g, t0, iconsAt, step2, hazAt, step3, shieldAt, checkAt}) => {
  const p2 = k(g, step2, step2 + 12);
  const p3 = k(g, step3, step3 + 10);
  const stepState = (i: number) => (i === 0 ? (g < step2 ? 'on' : 'done') : i === 1 ? (g < step2 ? 'off' : g < step3 ? 'on' : 'done') : g < step3 ? 'off' : 'on');
  // posizioni dei nodi attività: griglia 2x2 (passo 1) -> colonna (passi 2-3)
  const colY = (i: number) => H * ((0.3 + i * 0.125) * (1 - p3) + (0.29 + i * 0.1) * p3);
  const nodeSize = 150 - 10 * p3;
  const nodes = ACTS.map(([key, label], i) => {
    const a = iconsAt[i];
    if (g < a) return null;
    const p = pop(g, a, 6);
    const gx = W * [0.27, 0.73][i % 2];
    const gy = H * [0.35, 0.57][Math.floor(i / 2)] + 140;
    const cx = W * 0.05 + nodeSize / 2;
    const cy = colY(i) + nodeSize / 2;
    const x = gx + (cx - gx) * p2;
    const y = gy + (cy - gy) * p2;
    const size = 270 + (nodeSize - 270) * p2;
    const ring = k(g, a, a + 10);
    return (
      <div key={key} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * p})`, opacity: fade(g, a, 3)}}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{display: 'block', overflow: 'visible'}}>
          <circle cx="50" cy="50" r="46" fill="#fff" />
          <circle cx="50" cy="50" r="49" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="4 4" opacity={ring} />
          <g transform="translate(18,18) scale(1.6)">{ICON[key]}</g>
        </svg>
        <div
          style={{
            position: 'absolute', whiteSpace: 'nowrap', fontFamily: UI, fontWeight: 800, color: INK, letterSpacing: '-0.02em',
            fontSize: 62 - 8 * p2,
            left: (size / 2) * (1 - p2) + (size + 20) * p2, top: (size + 12) * (1 - p2) + (size / 2) * p2,
            transform: `translate(${-50 * (1 - p2)}%, ${-50 * p2}%)`,
          }}
        >
          {label}
        </div>
      </div>
    );
  });
  const hazards = RISKS.map(([key, label], i) => {
    const a = hazAt[i];
    if (g < a) return null;
    const p = pop(g, a, 6);
    const y = colY((i + 0) % 4) + nodeSize / 2;
    return (
      <div key={key} style={{position: 'absolute', right: W * 0.05, top: y, transform: `translateY(-50%) scale(${0.7 + 0.3 * p})`, transformOrigin: '100% 50%', opacity: fade(g, a, 3), display: 'flex', alignItems: 'center', gap: 18, fontFamily: UI, fontWeight: 800, fontSize: 52, color: INK, letterSpacing: '-0.02em'}}>
        {label}
        <svg viewBox="0 0 40 40" width={nodeSize * 0.92} height={nodeSize * 0.92}>
          <path d="M20 4L37 34H3z" fill="#FFC21A" stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
          {HAZ[key]}
        </svg>
      </div>
    );
  });
  const links = RISKS.map((_, i) => {
    const a = hazAt[i];
    if (g < a) return null;
    const d = k(g, a, a + 9, Easing.out(Easing.cubic));
    const from = (i + 3) % 4; // ogni rischio collegato a due attività
    const y1 = colY(from) + nodeSize / 2;
    const y1b = colY(i) + nodeSize / 2;
    const y2 = colY(i) + nodeSize / 2;
    const x1 = W * 0.36;
    const x2 = W * 0.6;
    return (
      <g key={i}>
        <clipPath id={`lk${i}`}>
          <rect x={x1 - 10} y={0} width={(x2 - x1 + 20) * d} height={H} />
        </clipPath>
        <g clipPath={`url(#lk${i})`} stroke={INK} strokeWidth="3.5" strokeDasharray="10 10" fill="none">
          <path d={`M${x1} ${y1b} L ${x2} ${y2}`} />
          <path d={`M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`} />
        </g>
      </g>
    );
  });
  const sh = k(g, shieldAt, shieldAt + 14, Easing.out(Easing.cubic));
  const ck = k(g, checkAt, checkAt + 8, Easing.out(Easing.cubic));
  return (
    <>
      {/* passi */}
      <div style={{position: 'absolute', left: W * 0.05, top: H * 0.05, display: 'grid', gap: 18, width: W * 0.54}}>
        {[['01', 'Attività'], ['02', 'Rischi'], ['03', 'Misure']].map(([n, t], i) => {
          const st = stepState(i);
          const a = t0 + 2 + i * 3;
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '12px 26px', borderRadius: 20, background: st === 'on' ? RED : 'transparent', color: st === 'on' ? '#fff' : st === 'done' ? INK : '#B9B9B4', fontFamily: UI, fontWeight: 800, fontSize: 66, letterSpacing: '-0.025em', opacity: fade(g, a, 4), transform: `translateX(${(1 - k(g, a, a + 6, Easing.out(Easing.cubic))) * -40}px)`}}>
              <span style={{fontFamily: 'IBM Plex Mono, ui-monospace, monospace', fontWeight: 500, fontSize: 38}}>{n}</span>
              {t}
              {st === 'done' && <span style={{marginLeft: 'auto', color: OK, fontSize: 60}}>✓</span>}
            </div>
          );
        })}
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>{links}</svg>
      {nodes}
      {hazards}
      {g >= shieldAt && (
        <svg viewBox="0 0 120 140" style={{position: 'absolute', left: W * 0.3, top: H * 0.28, width: W * 0.4, overflow: 'visible', transform: `scale(${0.8 + 0.2 * sh})`, transformOrigin: '50% 50%'}}>
          <path d="M60 6l48 18v40c0 34-22 58-48 70C34 122 12 98 12 64V24z" fill={RED} fillOpacity={0.09 * sh} stroke={RED} strokeWidth="3.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - sh} />
          <path d="M40 70l14 14 28-32" stroke={RED} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ck} />
        </svg>
      )}
    </>
  );
};

/* ---------- indicatore del rischio ---------- */
export const Gauge: React.FC<{g: number; at: number; a: number; b: number; top: number; until: number}> = ({g, at, a, b, top, until}) => {
  if (g < at || g >= until) return null;
  const p = k(g, at, at + 7, Easing.out(Easing.cubic)) * (1 - k(g, until - 5, until));
  const ang = 58 - 116 * k(g, a, b, Easing.inOut(Easing.cubic));
  return (
    <svg viewBox="0 0 200 124" style={{position: 'absolute', left: W * 0.29, top, width: W * 0.42, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,.4))'}}>
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0" stopColor={OK} />
          <stop offset=".5" stopColor="#FFC21A" />
          <stop offset="1" stopColor={RED} />
        </linearGradient>
      </defs>
      <path d="M20 105a80 80 0 0 1 160 0" stroke="url(#gg)" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M20 105a80 80 0 0 1 160 0" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 10" fill="none" opacity=".8" />
      <g transform={`rotate(${ang} 100 105)`}>
        <path d="M100 105L100 36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="105" r="8" fill="#fff" />
      <text x="16" y="122" fontSize="11" fontFamily="Inter Tight" fontWeight="800" fill="#fff">BASSO</text>
      <text x="152" y="122" fontSize="11" fontFamily="Inter Tight" fontWeight="800" fill="#fff">ALTO</text>
    </svg>
  );
};

/* ---------- l'azienda in sezione isometrica con il ciclo di lavoro ---------- */
export const Building: React.FC<{g: number; at: number; cycleAt: number}> = ({g, at, cycleAt}) => {
  const f = (i: number) => k(g, at + i * 3, at + i * 3 + 7, Easing.out(Easing.cubic));
  const roof = k(g, at + 10, at + 22);
  const cyc = k(g, cycleAt, cycleAt + 16, Easing.out(Easing.cubic));
  const spin = g * 1.4;
  const lbl = (i: number) => fade(g, cycleAt + 4 + i * 4, 4);
  return (
    <svg viewBox="0 0 300 260" style={{position: 'absolute', left: W * 0.05, top: H * 0.19, width: W * 0.9, overflow: 'visible'}}>
      <defs>
        <marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10z" fill={RED} />
        </marker>
      </defs>
      <ellipse cx="150" cy="150" rx="140" ry="70" fill="none" stroke={RED} strokeWidth="3" pathLength={100} strokeDasharray={`${8 * cyc} ${8 * cyc + 6 * (1 - cyc) + 0.001}`} strokeDashoffset={-spin} opacity={cyc} />
      <g opacity={f(0)} transform={`translate(0,${(1 - f(0)) * 20})`}>
        <polygon points="70,120 150,160 150,230 70,190" fill="#E9E9E6" stroke={INK} strokeWidth="2" />
      </g>
      <g opacity={f(1)} transform={`translate(0,${(1 - f(1)) * 20})`}>
        <polygon points="150,160 230,120 230,190 150,230" fill="#D3D3CF" stroke={INK} strokeWidth="2" />
      </g>
      <g opacity={f(2)} transform={`translate(0,${(1 - f(2)) * 20})`}>
        <polygon points="70,120 150,80 230,120 150,160" fill="#fff" stroke={INK} strokeWidth="2" />
        <path d="M90 150v26M110 160v26M170 172v-26M190 162v-26M210 152v-26" stroke={INK} strokeWidth="2" />
      </g>
      <polygon points="150,80 230,120 230,60 150,20" fill="none" stroke={RED} strokeWidth="2.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - roof} />
      <polygon points="70,120 150,80 150,20 70,60" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="4 4" opacity={roof} />
      <rect x="143" y="10" width="14" height="14" fill={RED} opacity={roof} transform={`translate(0,${(1 - roof) * -30})`} />
      <g fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="11" fill={INK} fontWeight="500">
        <text x="2" y="96" opacity={lbl(0)}>PROGETTO</text>
        <text x="228" y="96" opacity={lbl(1)}>PRODUZIONE</text>
        <text x="230" y="250" opacity={lbl(2)}>CONSEGNA</text>
        <text x="0" y="250" opacity={lbl(3)}>MANUTENZIONE</text>
      </g>
    </svg>
  );
};

/* ---------- fumetto del commento ---------- */
export const Comment: React.FC<{g: number; at: number}> = ({g, at}) => {
  if (g < at) return null;
  const p = pop(g, at, 7);
  const pulse = 1 + 0.04 * Math.sin((g - at) * 0.35);
  const bob = Math.sin((g - at) * 0.3) * 12;
  return (
    <>
      <svg viewBox="0 0 120 120" style={{position: 'absolute', left: W * 0.52, top: H * 0.655, width: W * 0.2, transform: `scale(${p * pulse})`, filter: 'drop-shadow(0 6px 22px rgba(0,0,0,.35))'}}>
        <path d="M14 18h92a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H50L28 104V86H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="#fff" stroke={RED} strokeWidth="5" />
        <circle cx="38" cy="52" r="6" fill={RED} />
        <circle cx="60" cy="52" r="6" fill={RED} />
        <circle cx="82" cy="52" r="6" fill={RED} />
      </svg>
      <div style={{position: 'absolute', left: W * 0.36, top: H * 0.665 + bob, fontFamily: UI, fontWeight: 800, fontSize: 130, color: '#fff', opacity: p, textShadow: '0 0 22px rgba(229,2,16,.9), 0 4px 18px rgba(0,0,0,.4)'}}>↓</div>
    </>
  );
};
