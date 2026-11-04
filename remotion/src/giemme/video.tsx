// Stesse inquadrature di src/video.tsx (stile approvato), collegate alla timeline di questo reel.
import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {H, W, baseZoom, faceAt, segAt, segStart} from './timeline';

export const placeVideo = (id: string, local: number, w: number, h: number, S: number, fy: number) => {
  const face = faceAt(id, local);
  const vw = W * S;
  const vh = H * S;
  let left = w / 2 - face.cx * vw;
  let top = h * fy - face.cy * vh;
  left = Math.min(0, Math.max(w - vw, left));
  top = Math.min(0, Math.max(h - vh, top));
  return {left, top, width: vw, height: vh};
};

/** Il pezzo di video giusto per il frame globale corrente (dentro una Sequence che parte da 0). */
const SegVideo: React.FC<{id: string; style: React.CSSProperties}> = ({id, style}) => (
  <OffthreadVideo src={staticFile(`giemme/clips/${id}.mp4`)} muted style={{position: 'absolute', ...style}} />
);

/**
 * Video a schermo intero con inquadratura sul viso. Va messo dentro una Sequence che parte all'inizio del pezzo `id`.
 */
export const FramedVideo: React.FC<{id: string; zoomMul?: number}> = ({id, zoomMul = 1}) => {
  const local = useCurrentFrame();
  const z = baseZoom(id) * zoomMul;
  const p = placeVideo(id, local, W, H, z, 0.34);
  const face = faceAt(id, local);
  const vx = ((p.left + face.cx * p.width) / W) * 100;
  const vy = ((p.top + face.cy * p.height) / H) * 100;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <SegVideo id={id} style={{left: p.left, top: p.top, width: p.width, height: p.height}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 55% at ${vx}% ${vy + 6}%, transparent 50%, rgba(0,0,0,.26) 100%)`}} />
    </div>
  );
};

/**
 * Card con il video dentro, centrata sul viso. Va messa dentro una Sequence che parte all'inizio del pezzo `id`.
 * pOf(g): 0 -> schermo intero, 1 -> card finale (g = frame globale). opOf(g): opacità/uscita.
 */
export const VideoCard: React.FC<{
  id: string;
  rect: {x: number; y: number; w: number; h: number};
  pOf: (g: number) => number;
  opOf?: (g: number) => number;
  radius?: number;
  faceFrac?: number;
  fy?: number;
  round?: boolean;
}> = ({id, rect, pOf, opOf, radius = 36, faceFrac = 0.34, fy = 0.42, round}) => {
  const local = useCurrentFrame();
  const g = local + segStart[id];
  const p = pOf(g);
  const op = opOf ? opOf(g) : 1;
  if (op <= 0) return null;
  const face = faceAt(id, local);
  const x = rect.x * p;
  const y = rect.y * p;
  const w = W + (rect.w - W) * p;
  const h = H + (rect.h - H) * p;
  const Sfull = baseZoom(id);
  const Scard = Math.max((rect.h * faceFrac) / (face.h * H), rect.w / W, rect.h / H);
  const S = Sfull + (Scard - Sfull) * p;
  const pos = placeVideo(id, local, w, h, Math.max(S, w / W, h / H), 0.34 + (fy - 0.34) * p);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden',
        borderRadius: round ? Math.max(w, h) : radius * p,
        boxShadow: `0 ${18 * p}px ${50 * p}px rgba(26,26,30,${0.2 * p})`, background: '#000',
        opacity: op, transform: `scale(${0.6 + 0.4 * op})`,
      }}
    >
      <SegVideo id={id} style={pos} />
    </div>
  );
};

export {segStart, segAt};
