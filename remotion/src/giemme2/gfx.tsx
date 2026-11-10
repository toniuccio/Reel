// Grafiche v2 (scheda G "Explainer SaaS" nei colori Giemme): tile squircle, nido d'ape, archi, chevron, pillole, cursore.
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {W, H} from '../giemme/timeline';

export const RED = '#E50210';
export const RED_D = '#9E0010';
export const RED_L = '#FF3B30';
export const PINK = '#FFC9C4';
export const INK = '#1A1A1E';
export const OK = '#1F9D55';
export const FONT = 'Mulish, "Helvetica Neue", Arial, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const k = (g: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(g, [a, b], [0, 1], {...clamp, easing: e});
const eo = Easing.out(Easing.cubic);

/** ingresso "da sfocato a nitido" + uscita sfocata: restituisce lo stile e se è visibile */
export const inOut = (g: number, at: number, out = Infinity, len = 15, rise = 46): React.CSSProperties | null => {
  if (g < at || g >= out + 11) return null;
  const p = k(g, at, at + len, eo);
  const q = Number.isFinite(out) ? k(g, out, out + 11, Easing.inOut(Easing.cubic)) : 0;
  const o = p * (1 - q);
  const blur = 16 * (1 - p) + 14 * q;
  return {opacity: o, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateY(${(1 - p) * rise - q * 30}px) scale(${0.94 + 0.06 * p - 0.06 * q})`};
};

/* ---------- fondo: bianco con puntini, sfumatura e sfere rosa che scivolano ---------- */
export const Paper: React.FC<{g: number}> = ({g}) => {
  const d = Math.sin(g / 60) * 30;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(rgba(26,26,30,.09) 2px, transparent 2.4px) 0 ${g * 0.3}px/46px 46px, linear-gradient(#fff, #ECECEF)`}} />
      <div style={{position: 'absolute', left: -200 + d, top: -150, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,179,173,.75), rgba(255,201,196,.25) 60%, transparent 72%)', filter: 'blur(16px)'}} />
      <div style={{position: 'absolute', right: -260 - d, top: 1080 + d, width: 760, height: 760, borderRadius: '50%', opacity: 0.7, background: 'radial-gradient(circle at 35% 35%, rgba(255,179,173,.75), rgba(255,201,196,.25) 60%, transparent 72%)', filter: 'blur(16px)'}} />
    </AbsoluteFill>
  );
};

/* archi rossi sottili negli angoli, che si disegnano e ruotano lenti */
export const Arcs: React.FC<{g: number; at: number}> = ({g, at}) => {
  const p = k(g, at, at + 18, eo);
  const r = (g - at) * 0.15;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={-40} cy={-40} r={420} fill="none" stroke={RED} strokeWidth={7} pathLength={1} strokeDasharray={`${0.25 * p} 1`} transform={`rotate(${r} -40 -40)`} />
      <circle cx={W + 80} cy={H + 60} r={520} fill="none" stroke={RED} strokeWidth={7} pathLength={1} strokeDasharray={`${0.25 * p} 1`} transform={`rotate(${180 + r} ${W + 80} ${H + 60})`} />
    </svg>
  );
};

/* ---------- illustrazioni line art ---------- */
const st = {stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const Ill: React.FC<{name: string; p?: number}> = ({name, p = 1}) => {
  const box = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 100" style={{width: '62%', height: 'auto', overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.18))'}}>
      {children}
    </svg>
  );
  switch (name) {
    case 'archivio': {
      // p: 0 foglio sopra, 1 dentro il cassetto chiuso
      const doc = Math.min(1, p * 1.4);
      const close = Math.max(0, (p - 0.6) / 0.4);
      return box(
        <>
          <rect x={22} y={14} width={56} height={74} rx={5} fill="#fff" {...st} />
          <g transform={`translate(${-10 * (1 - close)},0)`}>
            <rect x={28} y={22} width={44} height={18} rx={3} fill={PINK} {...st} />
            <path d="M44 31h12" {...st} />
          </g>
          <rect x={28} y={46} width={44} height={18} rx={3} fill="#fff" {...st} />
          <path d="M44 55h12" {...st} />
          <rect x={28} y={70} width={44} height={12} rx={3} fill="#fff" {...st} />
          <g transform={`translate(${52 - 14 * doc},${-6 + 24 * doc}) rotate(${12 - 12 * doc})`} opacity={1 - close}>
            <rect width={26} height={32} rx={2} fill="#fff" {...st} />
            <path d="M5 9h16M5 15h12M5 21h14" {...st} />
            <rect x={17} y={25} width={5} height={5} fill={RED} />
          </g>
        </>,
      );
    }
    case 'puntina':
      return box(
        <>
          <rect x={16} y={20} width={68} height={56} rx={6} fill="#fff" {...st} />
          <rect x={26} y={32} width={30} height={22} rx={2} fill={PINK} {...st} />
          <path d="M62 34h12M62 42h10M30 64h40" {...st} />
          <circle cx={41} cy={30 - 10 * (1 - p)} r={6} fill={RED} {...st} />
          <path d={`M41 ${36 - 10 * (1 - p)}v6`} {...st} />
        </>,
      );
    case 'interruttore':
      return box(
        <>
          <rect x={14} y={34} width={72} height={34} rx={17} fill={p > 0.5 ? PINK : '#eee'} {...st} />
          <circle cx={32 + 36 * p} cy={51} r={13} fill="#fff" {...st} />
          <text x={26} y={88} fontFamily="Mulish" fontWeight={800} fontSize={13} fill={INK}>ON</text>
        </>,
      );
    case 'occhio':
      return box(
        <>
          <path d={`M10 50 C 28 ${50 - 26 * p}, 72 ${50 - 26 * p}, 90 50 C 72 ${50 + 26 * p}, 28 ${50 + 26 * p}, 10 50z`} fill="#fff" {...st} />
          <g opacity={p}>
            <circle cx={50} cy={50} r={15} fill={PINK} {...st} />
            <circle cx={50} cy={50} r={6} fill={INK} />
            <circle cx={54} cy={46} r={2} fill="#fff" />
          </g>
        </>,
      );
    case 'lavoratore':
      return box(
        <>
          <path d="M30 40 a20 20 0 0 1 40 0z" fill={p > 0.5 ? RED : '#C9C9C4'} {...st} />
          <rect x={25} y={39} width={50} height={6} rx={3} fill={INK} />
          <circle cx={50} cy={54} r={11} fill="#fff" {...st} />
          <path d="M26 92 c4-18 44-18 48 0" fill={PINK} {...st} />
        </>,
      );
    case 'ufficio':
      return box(
        <>
          <rect x={18} y={24} width={64} height={40} rx={4} fill="#fff" {...st} />
          <rect x={24} y={30} width={52} height={28} rx={2} fill={PINK} {...st} />
          <path d="M40 64v10h20V64M30 78h40M30 38h22M30 46h14" {...st} />
        </>,
      );
    case 'cantiere':
      return box(
        <>
          <path d="M30 88V20h6v68M36 26h46l-6 8H36" fill="#fff" {...st} />
          <path d="M74 34v18" {...st} />
          <rect x={66} y={52} width={16} height={12} fill={PINK} {...st} />
          <path d="M22 88h40M30 34l6 8M30 50l6 8M30 66l6 8" {...st} />
        </>,
      );
    case 'magazzino':
      return box(
        <>
          <path d="M16 86V40l34-18 34 18v46z" fill="#fff" {...st} />
          <rect x={28} y={56} width={18} height={14} fill={PINK} {...st} />
          <rect x={48} y={56} width={18} height={14} fill="#fff" {...st} />
          <rect x={38} y={42} width={18} height={14} fill={PINK} {...st} />
          <path d="M16 86h68" {...st} />
        </>,
      );
    case 'macchine':
      return box(
        <>
          <g transform={`rotate(${p * 90} 44 54)`}>
            <circle cx={44} cy={54} r={20} fill="#fff" {...st} />
            <circle cx={44} cy={54} r={8} fill={PINK} {...st} />
            <path d="M44 28v6M44 74v6M18 54h6M64 54h6M26 36l4 4M58 68l4 4M26 72l4-4M58 40l4-4" {...st} />
          </g>
          <circle cx={74} cy={30} r={10} fill={PINK} {...st} />
          <circle cx={74} cy={30} r={3} fill={RED} />
        </>,
      );
    case 'scudo':
      return box(
        <>
          <path d="M50 10l34 12v26c0 22-15 38-34 46C31 86 16 70 16 48V22z" fill="#fff" {...st} />
          <path d="M50 20l24 8v20c0 16-11 28-24 34-13-6-24-18-24-34V28z" fill={PINK} />
          <path d="M36 50l10 10 20-22" stroke={RED} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </>,
      );
    case 'azienda':
      return box(
        <>
          <path d="M10 84V46l22-12v12l22-12v12l22-12v50z" fill="#fff" {...st} />
          <rect x={62} y={24} width={24} height={60} fill={PINK} {...st} />
          <path d="M68 34h12M68 44h12M68 54h12M68 64h12" {...st} />
          <rect x={20} y={62} width={10} height={22} fill={PINK} {...st} />
          <rect x={40} y={58} width={12} height={10} fill="#fff" {...st} />
          <path d="M6 84h88" {...st} />
          <rect x={80} y={14 - 10 * (1 - p)} width={7} height={7} fill={RED} opacity={p} />
        </>,
      );
    default:
      return null;
  }
};

export const Hazard: React.FC<{sym: string}> = ({sym}) => (
  <svg viewBox="0 0 40 40" style={{width: '64%', height: 'auto'}}>
    <path d="M20 5L36 33H4z" fill="#FFC21A" stroke="#111" strokeWidth={2.2} strokeLinejoin="round" />
    {sym === '!' && (
      <>
        <path d="M20 15v8" stroke="#111" strokeWidth={3} strokeLinecap="round" />
        <circle cx={20} cy={28} r={1.8} fill="#111" />
      </>
    )}
    {sym === 'el' && <path d="M22 12l-6 10h5l-3 9 7-11h-5z" fill="#111" />}
    {sym === 'ru' && <path d="M14 18h4l5-4v14l-5-4h-4z" fill="#111" />}
    {sym === 'ca' && <path d="M20 12v12M15 20l5 6 5-6M13 30h14" stroke="#111" strokeWidth={2.8} fill="none" strokeLinecap="round" />}
  </svg>
);

/* ---------- tile squircle ---------- */
export const Tile: React.FC<{
  g: number; at: number; out?: number; x: number; y: number; w: number; label?: string;
  children: React.ReactNode; sel?: number; dim?: number; grad?: boolean; mini?: boolean;
}> = ({g, at, out = Infinity, x, y, w, label, children, sel = 0, dim = 0, grad, mini}) => {
  const s = inOut(g, at, out, 10, 50);
  if (!s) return null;
  const scale = 1 + 0.06 * sel;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: w, ...s, opacity: (s.opacity as number) * (1 - 0.45 * dim)}}>
      <div
        style={{
          width: '100%', height: '100%', borderRadius: '23%', display: 'grid', placeItems: 'center', alignContent: 'center', gap: w * 0.04,
          transform: `scale(${scale})`,
          background: grad ? `linear-gradient(170deg, ${RED} 0%, #F25A52 45%, #fff 100%)` : `linear-gradient(150deg, ${RED_L}, ${RED} 45%, ${RED_D})`,
          boxShadow: `inset 0 6px 0 rgba(255,255,255,.35), inset 0 -18px 34px rgba(0,0,0,.22), 0 ${36 + 10 * sel}px ${70 + 20 * sel}px rgba(158,0,16,${0.3 + 0.1 * sel})${sel ? ', 0 0 0 8px #fff' : ''}`,
          filter: dim ? `saturate(${1 - 0.2 * dim})` : undefined,
        }}
      >
        {children}
        {label && !mini && <span style={{color: grad ? INK : '#fff', fontFamily: FONT, fontWeight: 700, fontSize: w * 0.11}}>{label}</span>}
      </div>
      {label && mini && (
        <div style={{position: 'absolute', top: w + 16, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 40, whiteSpace: 'nowrap', textShadow: '0 3px 14px rgba(0,0,0,.55)'}}>{label}</div>
      )}
    </div>
  );
};

/* ---------- nido d'ape ---------- */
export const HEX_W = 184;
export const hexPos = (c: number, r: number) => ({x: W * (0.04 + c * 0.19 + (r % 2 ? 0.095 : 0)), y: H * (0.22 + r * 0.092)});
export const HexGrid: React.FC<{g: number; at: number; fade?: number; cells: {c: number; r: number; at: number; node: React.ReactNode}[]}> = ({g, at, fade = 0, cells}) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 5; c++) {
      const {x, y} = hexPos(c, r);
      if (x > W * 0.86) continue;
      const a = at + (r + c) * 1.5;
      const p = k(g, a, a + 10, eo);
      const cell = cells.find((q) => q.c === c && q.r === r);
      const cp = cell ? k(g, cell.at, cell.at + 8, Easing.out(Easing.back(1.8))) : 0;
      out.push(
        <div key={`${c}-${r}`} style={{position: 'absolute', left: x, top: y, width: HEX_W, height: HEX_W * 1.1547, opacity: p * (1 - fade * 0.85), transform: `scale(${(0.8 + 0.2 * p) * (1 + 0.06 * cp)})`, filter: 'drop-shadow(0 8px 14px rgba(26,26,30,.08))'}}>
          <div style={{width: '100%', height: '100%', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', background: cell && g >= cell.at ? '#fff' : 'linear-gradient(160deg,#fff,#EDEDF0)', display: 'grid', placeItems: 'center'}}>
            {cell && g >= cell.at && <div style={{width: '100%', display: 'grid', placeItems: 'center', transform: `scale(${cp})`}}>{cell.node}</div>}
          </div>
        </div>,
      );
    }
  return <>{out}</>;
};

/* ---------- navigatore 01-02-03 ---------- */
export const Nav: React.FC<{g: number; at: number; out: number; step: number}> = ({g, at, out, step}) => {
  const s = inOut(g, at, out, 10, -30);
  if (!s) return null;
  const labels = ['Attività', 'Rischi', 'Misure'];
  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 250, display: 'flex', gap: 22, ...s}}>
      {labels.map((l, i) => {
        const on = i === step;
        const done = i < step;
        return (
          <div key={l} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 44, transform: `scale(${on ? 1.08 : 1})`, background: on ? `linear-gradient(150deg, ${RED_L}, ${RED} 45%, ${RED_D})` : '#fff', boxShadow: '0 10px 30px rgba(26,26,30,.1)', fontFamily: FONT, fontWeight: 800, fontSize: 38, color: on ? '#fff' : done ? INK : '#9a9ca3', transition: 'none'}}>
            <b style={{display: 'grid', placeItems: 'center', width: 66, height: 66, borderRadius: 20, background: on ? 'rgba(255,255,255,.25)' : done ? OK : '#ECECEF', color: on || done ? '#fff' : '#9a9ca3', fontSize: done ? 40 : 30}}>{done ? '✓' : `0${i + 1}`}</b>
            {l}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- pillole, testi, sottolineatura ---------- */
export const Pill: React.FC<{g: number; at: number; out?: number; x: number; y: number; text: string; kind?: 'red' | 'out'; size?: number; strikeAt?: number; pressAt?: number}> = ({g, at, out = Infinity, x, y, text, kind = 'red', size = 48, strikeAt, pressAt}) => {
  const s = inOut(g, at, out, 8, 30);
  if (!s) return null;
  const strike = strikeAt !== undefined ? k(g, strikeAt, strikeAt + 7, eo) : 0;
  const press = pressAt !== undefined ? interpolate(g, [pressAt, pressAt + 3, pressAt + 8], [1, 0.92, 1], clamp) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%)`}}>
      <div style={s}>
      <div style={{position: 'relative', whiteSpace: 'nowrap', borderRadius: 99, padding: `${size * 0.36}px ${size * 0.9}px`, fontFamily: FONT, fontWeight: 800, fontSize: size, transform: `scale(${press})`,
        ...(kind === 'red' ? {background: `linear-gradient(180deg, ${RED_L}, ${RED})`, color: '#fff', boxShadow: `0 ${18 * press}px 40px rgba(229,2,16,.35)`} : {background: '#fff', color: INK, border: `5px solid ${INK}`})}}>
        {text}
        {strikeAt !== undefined && <i style={{position: 'absolute', left: '-6%', width: '112%', top: '48%', height: 10, borderRadius: 9, background: RED, transform: `rotate(-6deg) scaleX(${strike})`, transformOrigin: '0 50%'}} />}
      </div>
      </div>
    </div>
  );
};

export const Heading: React.FC<{g: number; at: number; out?: number; y: number; parts: {text: string; red?: boolean; at?: number}[]; size?: number; dark?: boolean}> = ({g, at, out = Infinity, y, parts, size = 70, dark = true}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1.12}}>
    {parts.map((p, i) => {
      const s = inOut(g, p.at ?? at + i * 3, out, 8, 24);
      if (!s) return null;
      return <span key={i} style={{...s, color: p.red ? RED : dark ? INK : '#fff', textShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,.45)'}}>{p.text}</span>;
    })}
  </div>
);

/** sottotitoli sul parlato: parole che entrano da sfocate; la parola chiave arriva con un rimbalzo e la pillola rossa si allarga dietro */
export const Sub: React.FC<{g: number; y: number; out: number; words: {at: number; text: string; key?: boolean}[]; size?: number}> = ({g, y, out, words, size = 68}) => (
  <div style={{position: 'absolute', left: 44, right: 44, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: size * 0.26, rowGap: 12, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '-0.015em'}}>
    {words.map((w, i) => {
      const s = inOut(g, w.at, out, w.key ? 12 : 10, 20);
      if (!s) return null;
      if (!w.key) return <span key={i} style={{...s, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.5)'}}>{w.text}</span>;
      const pill = k(g, w.at + 2, w.at + 12, Easing.out(Easing.cubic));
      const bump = 1 + 0.12 * Math.sin(Math.min(1, Math.max(0, (g - w.at) / 14)) * Math.PI);
      return (
        <span key={i} style={{...s, position: 'relative', display: 'inline-block', padding: `4px ${size * 0.38}px`, color: '#fff', transform: `${s.transform} scale(${bump})`}}>
          <i style={{position: 'absolute', inset: 0, borderRadius: 99, background: `linear-gradient(180deg, ${RED_L}, ${RED})`, boxShadow: '0 12px 30px rgba(229,2,16,.4)', transform: `scaleX(${pill})`, transformOrigin: '0 50%', zIndex: -1}} />
          <span style={{position: 'relative'}}>{w.text}</span>
        </span>
      );
    })}
  </div>
);

export const Underline: React.FC<{g: number; at: number}> = ({g, at}) => {
  const p = k(g, at, at + 9, eo);
  return (
    <svg viewBox="0 0 600 40" style={{position: 'absolute', left: '-2%', bottom: -34, width: '104%', overflow: 'visible'}}>
      <path d="M8 26 C 140 8, 320 6, 592 18" stroke={RED} strokeWidth={11} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      <path d="M60 34 C 220 22, 400 22, 560 30" stroke={RED} strokeWidth={11} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k(g, at + 4, at + 12, eo)} />
    </svg>
  );
};

/* ---------- chevron rossi: tre strati che scorrono in continuo (p 0 → 0,5 copre, 0,5 → 1 esce a destra) ---------- */
const CHEV = ['#B0000E', '#D10112', '#7A000C'];
export const ChevronWipe: React.FC<{p: number; drift?: number}> = ({p, drift = 0}) => {
  if (p <= 0 || p >= 1) return null;
  const layers = [0, 1, 2].map((i) => {
    // ogni strato parte e arriva leggermente sfalsato: movimento continuo, senza scatti
    // p 0 → 0,5: entrata che rallenta fino a coprire; 0,5 → 1: uscita lenta e costante che scopre la scena
    const tip = p < 0.5
      ? -0.1 * W + 2.2 * W * Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (p / 0.5 - 0.06 * i) / 0.88)))
      : 2.1 * W + 2.4 * W * Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, ((p - 0.5) / 0.5 - 0.05 * i) / 0.9)));
    const tipX = tip + drift - i * 0.16 * W;
    return {i, tip: tipX};
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        {CHEV.map((c, i) => (
          <linearGradient key={i} id={`chg${i}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#6A000A" />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
        <filter id="chsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="18" dy="0" stdDeviation="22" floodColor="#000" floodOpacity=".35" /></filter>
      </defs>
      {layers.reverse().map(({i, tip}) => {
        const LB = 2.1 * W; // banda a freccia: punta davanti, incavo dietro (come nel riferimento)
        const d = `M${tip - 0.62 * W - LB} 0 H${tip - 0.62 * W} L${tip} ${H / 2} L${tip - 0.62 * W} ${H} H${tip - 0.62 * W - LB} L${tip - LB} ${H / 2}z`;
        return (
          <g key={i} filter="url(#chsh)">
            <path d={d} fill={`url(#chg${i})`} />
            <path d={`M${tip - 0.62 * W} 0 L${tip} ${H / 2} L${tip - 0.62 * W} ${H}`} stroke="rgba(255,255,255,.28)" strokeWidth={3} fill="none" />
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- barra del rischio ---------- */
export const RiskBar: React.FC<{g: number; at: number; out: number; a: number; b: number; y: number}> = ({g, at, out, a, b, y}) => {
  const s = inOut(g, at, out, 8, 24);
  if (!s) return null;
  const pos = 0.9 - 0.8 * k(g, a, b);
  return (
    <div style={{position: 'absolute', left: W * 0.18, right: W * 0.18, top: y, ...s}}>
      <div style={{height: 46, borderRadius: 99, background: `linear-gradient(90deg, ${OK}, #FFC21A, ${RED})`, position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>
        <i style={{position: 'absolute', left: `${pos * 100}%`, top: '50%', width: 72, height: 72, borderRadius: '50%', background: '#fff', transform: 'translate(-50%,-50%)', boxShadow: '0 6px 20px rgba(0,0,0,.4)'}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 32, textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>
        <span>BASSO</span>
        <span>ALTO</span>
      </div>
    </div>
  );
};

/* ---------- cursore ---------- */
export const Cursor: React.FC<{g: number; at: number; clickAt: number; x: number; y: number}> = ({g, at, clickAt, x, y}) => {
  if (g < at) return null;
  const p = k(g, at, clickAt - 2, Easing.inOut(Easing.cubic));
  const press = interpolate(g, [clickAt, clickAt + 3, clickAt + 8], [1, 0.82, 1], clamp);
  const cx = x + 260 * (1 - p);
  const cy = y + 300 * (1 - p);
  return (
    <svg viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, width: 86, transform: `scale(${press})`, transformOrigin: '10% 10%', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.4))'}}>
      <path d="M4 2l15 11-7 1-3 7z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
};
