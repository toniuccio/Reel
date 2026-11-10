// Inquadrature come src/giemme/video.tsx, ma per pezzo (con pause): durante la pausa il fotogramma resta fermo.
import React from 'react';
import {Freeze, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {baseZoom, faceAt} from '../giemme/timeline';
import {placeVideo} from '../giemme/video';
import {H, Piece, W} from './timeline2';

const Src: React.FC<{p: Piece; style: React.CSSProperties}> = ({p, style}) => {
  const f = useCurrentFrame();
  const v = <OffthreadVideo src={staticFile(`giemme/clips/${p.id}.mp4`)} muted startFrom={p.from} style={{position: 'absolute', ...style}} />;
  // durante la pausa il fotogramma resta fermo sull'ultimo del pezzo
  return f >= p.len ? <Freeze frame={p.len - 1}>{v}</Freeze> : v;
};

/** video a schermo intero del pezzo (dentro una Sequence che parte a p.start) */
export const PieceVideo: React.FC<{p: Piece; zoomMul: (g: number) => number}> = ({p, zoomMul}) => {
  const f = useCurrentFrame();
  const local = p.from + Math.min(f, p.len - 1);
  const z = baseZoom(p.id) * zoomMul(p.start + f);
  const pos = placeVideo(p.id, local, W, H, z, 0.34);
  const face = faceAt(p.id, local);
  const vx = ((pos.left + face.cx * pos.width) / W) * 100;
  const vy = ((pos.top + face.cy * pos.height) / H) * 100;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <Src p={p} style={{left: pos.left, top: pos.top, width: pos.width, height: pos.height}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 55% at ${vx}% ${vy + 6}%, transparent 50%, rgba(0,0,0,.26) 100%)`}} />
    </div>
  );
};

/** card con il video del pezzo; pOf(g): 0 schermo intero → 1 card; opOf(g): uscita */
export const PieceCard: React.FC<{p: Piece; rect: {x: number; y: number; w: number; h: number}; pOf: (g: number) => number; opOf?: (g: number) => number; radius?: number; faceFrac?: number; fy?: number}> = ({p, rect, pOf, opOf, radius = 36, faceFrac = 0.34, fy = 0.42}) => {
  const f = useCurrentFrame();
  const g = p.start + f;
  const local = p.from + Math.min(f, p.len - 1);
  const pr = pOf(g);
  const op = opOf ? opOf(g) : 1;
  if (op <= 0) return null;
  const face = faceAt(p.id, local);
  const x = rect.x * pr;
  const y = rect.y * pr;
  const w = W + (rect.w - W) * pr;
  const h = H + (rect.h - H) * pr;
  const Sfull = baseZoom(p.id);
  const Scard = Math.max((rect.h * faceFrac) / (face.h * H), rect.w / W, rect.h / H);
  const S = Sfull + (Scard - Sfull) * pr;
  const pos = placeVideo(p.id, local, w, h, Math.max(S, w / W, h / H), 0.34 + (fy - 0.34) * pr);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: radius * pr, background: '#000',
      boxShadow: `0 ${18 * pr}px ${50 * pr}px rgba(26,26,30,${0.2 * pr})`, opacity: op, transform: `translateY(${(1 - op) * -60}px) scale(${0.8 + 0.2 * op})`}}>
      <Src p={p} style={pos} />
    </div>
  );
};
