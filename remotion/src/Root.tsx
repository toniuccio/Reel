import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Reel} from './Reel';
import {FPS, H, TOTAL, W} from './timeline';
import {GiemmeReel} from './giemme/Reel';
import {TOTAL as G_TOTAL} from './giemme/timeline';

const FONTS: [string, string, string, string][] = [
  ['Inter Tight', 'fonts/inter-tight-latin-700-normal.woff2', '700', 'normal'],
  ['Inter Tight', 'fonts/inter-tight-latin-800-normal.woff2', '800', 'normal'],
  ['Instrument Serif', 'fonts/instrument-serif-latin-400-italic.woff2', '400', 'italic'],
];
// Inter Tight 500 non serve: per i sottotitoli dello schema uso il 700 a peso visivo ridotto.
const handle = delayRender('font');
Promise.all(
  FONTS.map(([family, file, weight, style]) => {
    const ff = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight, style});
    return ff.load().then((f) => (document.fonts as any).add(f));
  }),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

export const Root: React.FC = () => (
  <>
    <Composition id="DueVertenze" component={Reel} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="GiemmeDVR" component={GiemmeReel} durationInFrames={G_TOTAL} fps={FPS} width={W} height={H} />
  </>
);
