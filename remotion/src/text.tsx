import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export const UI = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';
export const SERIF = '"Instrument Serif", "Times New Roman", serif';
export const RED = '#E20612';
export const GREEN = '#009043';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SHADOW = '0 2px 6px rgba(0,0,0,.35), 0 4px 24px rgba(0,0,0,.5)';

type Size = 's' | 'm' | 'l' | 'xl';
const SIZES: Record<Size, number> = {s: 50, m: 100, l: 92, xl: 184};

/**
 * Parola o gruppo di parole che entra al frame `at` (frame della Sequence corrente).
 * - piccole: pop a scatto (scala 0,86 -> 1 in 4 frame)
 * - grandi: arrivano enormi, sfocate e trasparenti e si mettono a fuoco in 7 frame
 * - glow: nascono rosse e "si accendono" (nucleo chiaro + bagliore rosso)
 */
export const Word: React.FC<{
  at: number;
  text: string;
  size?: Size;
  px?: number;
  serif?: boolean;
  glow?: boolean;
  ink?: 'white' | 'dark' | 'red';
  style?: React.CSSProperties;
}> = ({at, text, size = 's', px, serif, glow, ink = 'white', style}) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const big = size === 'xl' || size === 'm';
  let opacity: number, scale: number, blur: number;
  if (big) {
    const p = interpolate(f, [0, 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    opacity = p;
    scale = 1.35 - 0.35 * p;
    blur = 14 * (1 - p);
  } else {
    const p = interpolate(f, [0, 4], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
    opacity = interpolate(f, [0, 2], [0, 1], clamp);
    scale = 0.86 + 0.14 * p;
    blur = 0;
  }
  let color = ink === 'dark' ? '#111' : ink === 'red' ? RED : '#fff';
  let textShadow = ink === 'white' ? SHADOW : 'none';
  if (glow) {
    const g = interpolate(f, [2, 9], [0, 1], clamp);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * g);
    color = `rgb(${mix(226, 255)},${mix(6, 244)},${mix(18, 242)})`;
    textShadow = `0 0 6px rgba(255,120,110,${0.95 * g}), 0 0 22px rgba(226,6,18,${0.9 * g}), 0 0 54px rgba(226,6,18,${0.6 * g}), 0 4px 18px rgba(0,0,0,.35)`;
  }
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: serif ? SERIF : UI,
        fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : size === 's' ? 700 : 800,
        fontSize: px ?? (serif ? SIZES[size] * 1.2 : SIZES[size]),
        letterSpacing: serif ? '-0.01em' : size === 's' ? '-0.03em' : '-0.055em',
        lineHeight: serif ? 0.88 : 0.98,
        color,
        textShadow,
        opacity,
        transform: `scale(${scale})`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </span>
  );
};

/** Riga che si scrive lettera per lettera tra `from` e `to`, con il cursore che lampeggia. */
export const Typed: React.FC<{
  parts: {text: string; from: number; to: number}[];
  ink?: 'white' | 'dark';
  px?: number;
  cursorUntil?: number;
}> = ({parts, ink = 'white', px = 50, cursorUntil = Infinity}) => {
  const f = useCurrentFrame();
  if (f < parts[0].from) return null;
  let shown = '';
  for (const p of parts) {
    const n = Math.floor(interpolate(f, [p.from, p.to], [0, p.text.length], clamp));
    shown += p.text.slice(0, n);
  }
  const cursorOn = f < cursorUntil && Math.floor(f / 8) % 2 === 0;
  return (
    <span
      style={{
        fontFamily: UI,
        fontWeight: 700,
        fontSize: px,
        letterSpacing: '-0.03em',
        color: ink === 'dark' ? '#111' : '#fff',
        textShadow: ink === 'white' ? SHADOW : 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1.05,
      }}
    >
      {shown}
      <span style={{display: 'inline-block', width: 5, height: px * 0.9, marginLeft: 6, verticalAlign: '-0.1em', background: 'currentColor', opacity: cursorOn ? 1 : 0}} />
    </span>
  );
};

/** Gruppo di testo centrato con uscita sfocata. */
export const Stack: React.FC<{
  top: number;
  until?: number;
  gap?: number;
  align?: 'center' | 'left';
  /** frame da cui compare l'ombreggiatura scura dietro al testo (leggibilità su sfondi chiari) */
  scrimFrom?: number;
  scrimStrength?: number;
  children: React.ReactNode;
}> = ({top, until = Infinity, gap = 6, align = 'center', scrimFrom, scrimStrength = 0.58, children}) => {
  const f = useCurrentFrame();
  const out = Number.isFinite(until) ? interpolate(f, [until - 5, until], [1, 0], clamp) : 1;
  if (out <= 0) return null;
  const scrim = scrimFrom === undefined ? 0 : interpolate(f, [scrimFrom - 2, scrimFrom + 6], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: align === 'left' ? 130 : 0,
        right: align === 'left' ? undefined : 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'left' ? 'flex-start' : 'center',
        gap,
        opacity: out,
        filter: out < 1 ? `blur(${(1 - out) * 10}px)` : undefined,
        isolation: 'isolate',
      }}
    >
      {scrim > 0 && (
        <div
          style={{
            position: 'absolute',
            left: align === 'left' ? -220 : '-5%',
            right: align === 'left' ? -260 : '-5%',
            top: -170,
            bottom: -190,
            zIndex: -1,
            opacity: scrim,
            background: `radial-gradient(ellipse 62% 50% at 50% 50%, rgba(0,0,0,${scrimStrength}) 0%, rgba(0,0,0,${scrimStrength * 0.6}) 45%, transparent 100%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export const Row: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 16}) => (
  <div style={{display: 'flex', gap, alignItems: 'baseline'}}>{children}</div>
);
