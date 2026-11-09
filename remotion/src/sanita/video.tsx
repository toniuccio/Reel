import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {H, W, baseZoom, clipById, faceAt, FPS} from './timeline';

/** Posiziona il video (1080x1920 * scala S) dentro un contenitore w x h, con il viso nel punto (w/2, h*fy). */
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

export const ClipVideo: React.FC<{id: string; style?: React.CSSProperties}> = ({id, style}) => {
  const c = clipById(id);
  return (
    <OffthreadVideo
      src={staticFile(`sanita/clips/${id}.mp4`)}
      startFrom={Math.round(c.trim * FPS)}
      muted
      style={{position: 'absolute', ...style}}
    />
  );
};

/** Video a schermo intero con inquadratura sul viso; zoomMul aggiunge punch-in e push-in. */
export const FramedVideo: React.FC<{id: string; zoomMul?: number; shake?: number}> = ({id, zoomMul = 1, shake = 0}) => {
  const local = useCurrentFrame();
  const z = baseZoom(id) * zoomMul;
  const p = placeVideo(id, local, W, H, z, 0.34);
  const face = faceAt(id, local);
  const sx = shake ? Math.sin(local * 2.7) * shake : 0;
  const sy = shake ? Math.cos(local * 3.1) * shake : 0;
  // vignettatura leggera centrata sul viso
  const vx = ((p.left + face.cx * p.width) / W) * 100;
  const vy = ((p.top + face.cy * p.height) / H) * 100;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <ClipVideo id={id} style={{left: p.left + sx, top: p.top + sy, width: p.width, height: p.height}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 75% 55% at ${vx}% ${vy + 6}%, transparent 50%, rgba(0,0,0,.26) 100%)`,
        }}
      />
    </div>
  );
};

/**
 * Card con il video dentro, centrata sul viso. p = 0 -> card a schermo intero (uguale al FramedVideo),
 * p = 1 -> card finale. Serve per lo zoom out verso l'insert bianco e lo zoom in di ritorno.
 */
export const VideoCard: React.FC<{
  id: string;
  rect: {x: number; y: number; w: number; h: number};
  p: number;
  faceFrac?: number;
  fy?: number;
}> = ({id, rect, p, faceFrac = 0.27, fy = 0.38}) => {
  const local = useCurrentFrame();
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
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: 'hidden',
        boxShadow: `0 ${16 * p}px ${44 * p}px rgba(0,0,0,${0.2 * p})`,
        background: '#000',
      }}
    >
      <ClipVideo id={id} style={pos} />
    </div>
  );
};
