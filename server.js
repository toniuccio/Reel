// Vels Reel Studio — server locale (zero dipendenze, richiede Node 18+ e FFmpeg)
// Avvio: node server.js  →  http://localhost:4747
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const crypto = require('crypto');
const os = require('os');

const PORT = process.env.PORT || 4747;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 = raggiungibile dal telefono sulla stessa Wi-Fi
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const DIRS = {
  uploads: path.join(DATA, 'uploads'),
  processed: path.join(DATA, 'processed'),
  exports: path.join(DATA, 'exports'),
  projects: path.join(DATA, 'projects'),
  luts: path.join(DATA, 'luts'),
  tmp: path.join(DATA, 'tmp'),
};
const LIBRARY = path.join(DATA, 'library.json');
Object.values(DIRS).forEach((d) => fs.mkdirSync(d, { recursive: true }));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.m4v': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.ogg': 'audio/ogg', '.cube': 'text/plain', '.webmanifest': 'application/manifest+json',
};
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];
const AUDIO_EXT = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];

// ---------- utilità ----------
const id = () => crypto.randomBytes(6).toString('hex');
const safeExt = (name) => (path.extname(name || '').toLowerCase().replace(/[^.a-z0-9]/g, '') || '.bin');
function hasCmd(cmd) {
  try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' }); return true; } catch { return false; }
}
function run(cmd, args, { onStderr } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => { err += d; onStderr && onStderr(String(d)); });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exit ${code}: ${err.slice(-1500)}`))));
  });
}
async function probe(file) {
  const out = await run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  const j = JSON.parse(out);
  const v = j.streams.find((s) => s.codec_type === 'video' && !(s.disposition && s.disposition.attached_pic));
  const a = j.streams.find((s) => s.codec_type === 'audio');
  let w = v ? v.width : 0, h = v ? v.height : 0;
  const rot = v && ((v.tags && +v.tags.rotate) || (v.side_data_list || []).map((s) => s.rotation).find((r) => r != null) || 0);
  if (Math.abs(rot) === 90 || Math.abs(rot) === 270) [w, h] = [h, w];
  return { duration: +(j.format.duration || 0), width: w, height: h, vcodec: v && v.codec_name, hasAudio: !!a, rotation: rot || 0 };
}
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let b = ''; req.on('data', (d) => (b += d));
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
function saveBody(req, file) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(file);
    req.pipe(ws); ws.on('finish', resolve); ws.on('error', reject); req.on('error', reject);
  });
}
// converte un url "/data/uploads/x.mp4" in path locale sicuro
function localPath(url) {
  const clean = decodeURIComponent(String(url || '').split('?')[0]);
  if (!clean.startsWith('/data/')) throw new Error('Percorso non valido');
  const p = path.normalize(path.join(ROOT, clean));
  if (!p.startsWith(DATA)) throw new Error('Percorso non valido');
  return p;
}
const toUrl = (p) => '/' + path.relative(ROOT, p).split(path.sep).join('/');

// ---------- LUT generate (file .cube) ----------
function writeCube(name, fn, size = 17) {
  const file = path.join(DIRS.luts, name + '.cube');
  if (fs.existsSync(file)) return;
  let s = `TITLE "${name}"\nLUT_3D_SIZE ${size}\n`;
  const cl = (x) => Math.min(1, Math.max(0, x));
  for (let b = 0; b < size; b++) for (let g = 0; g < size; g++) for (let r = 0; r < size; r++) {
    const [R, G, B] = fn(r / (size - 1), g / (size - 1), b / (size - 1));
    s += `${cl(R).toFixed(5)} ${cl(G).toFixed(5)} ${cl(B).toFixed(5)}\n`;
  }
  fs.writeFileSync(file, s);
}
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const sCurve = (x, k = 0.5) => x - (k * Math.sin(2 * Math.PI * x)) / (2 * Math.PI);
const contrast = (x, c) => (x - 0.5) * c + 0.5;
writeCube('Teal & Orange', (r, g, b) => {
  const l = luma(r, g, b), t = l; // ombre verso teal, luci verso arancio
  return [contrast(r + (t - 0.5) * 0.14, 1.08), contrast(g + (t - 0.5) * 0.02, 1.06), contrast(b - (t - 0.5) * 0.16, 1.06)];
});
writeCube('Film Caldo', (r, g, b) => {
  const lift = 0.06, f = (x) => lift + x * (0.94 - lift);
  return [f(sCurve(r)) * 1.04, f(sCurve(g)) * 1.0, f(sCurve(b)) * 0.9];
});
writeCube('Clinico Pulito', (r, g, b) => {
  const l = luma(r, g, b), sat = 0.92;
  return [contrast(l + (r - l) * sat, 1.05) + 0.02, contrast(l + (g - l) * sat, 1.05) + 0.03, contrast(l + (b - l) * sat, 1.05) + 0.05];
});
writeCube('Luxe Noir', (r, g, b) => {
  const l = luma(r, g, b), sat = 0.75;
  return [contrast(l + (r - l) * sat, 1.18) + 0.01, contrast(l + (g - l) * sat, 1.18), contrast(l + (b - l) * sat, 1.18) - 0.01];
});
writeCube('Food Vivace', (r, g, b) => {
  const l = luma(r, g, b), sat = 1.25;
  return [contrast(l + (r - l) * sat, 1.06) + 0.03, contrast(l + (g - l) * sat, 1.06) + 0.01, contrast(l + (b - l) * sat, 1.06) - 0.03];
});
writeCube('Bianco e Nero', (r, g, b) => { const l = contrast(luma(r, g, b), 1.15); return [l, l, l]; });

// ---------- job in background (enhance / transcode) ----------
const jobs = {};
function startJob(fn) {
  const jid = id();
  jobs[jid] = { status: 'running', progress: 0 };
  fn((p) => (jobs[jid].progress = p))
    .then((result) => Object.assign(jobs[jid], { status: 'done', progress: 1, result }))
    .catch((e) => Object.assign(jobs[jid], { status: 'error', error: e.message }));
  return jid;
}
function ffProgress(duration, onProgress) {
  return (chunk) => {
    const m = /time=(\d+):(\d+):(\d+\.?\d*)/.exec(chunk);
    if (m && duration) onProgress(Math.min(0.99, (+m[1] * 3600 + +m[2] * 60 + +m[3]) / duration));
  };
}

// ---------- API ----------
const api = {
  async 'GET /api/status'() {
    return { ok: true, ffmpeg: hasCmd('ffmpeg'), whisper: hasCmd('whisper'), luts: fs.readdirSync(DIRS.luts).filter((f) => f.endsWith('.cube')).map((f) => f.replace(/\.cube$/, '')) };
  },

  // upload grezzo: body = file, ?name=nome.ext
  async 'POST /api/upload'(req, res, q) {
    const name = q.get('name') || 'file';
    const ext = safeExt(name);
    const fid = id();
    const raw = path.join(DIRS.uploads, fid + ext);
    await saveBody(req, raw);
    const kind = IMAGE_EXT.includes(ext) ? 'image' : AUDIO_EXT.includes(ext) ? 'audio' : 'video';
    let info = {};
    try { info = await probe(raw); } catch { /* immagini a volte non probano */ }
    const item = { id: fid, name, kind, url: toUrl(raw), original: toUrl(raw), ...info };

    if (kind === 'image' && ext === '.heic') {
      const jpg = path.join(DIRS.uploads, fid + '.jpg');
      await run('ffmpeg', ['-y', '-i', raw, jpg]);
      item.url = toUrl(jpg);
    }
    if (kind === 'video') {
      // proxy H.264 se il codec non è riproducibile dal browser (es. HEVC iPhone)
      const okCodec = ['h264', 'vp8', 'vp9', 'av1'].includes(info.vcodec);
      if (!okCodec) {
        const out = path.join(DIRS.processed, fid + '_proxy.mp4');
        item.jobId = startJob(async (p) => {
          await run('ffmpeg', ['-y', '-i', raw, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
            '-vf', "scale='min(1920,iw)':-2", '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out],
          { onStderr: ffProgress(info.duration, p) });
          return { url: toUrl(out) };
        });
      }
      // miniatura
      const thumb = path.join(DIRS.processed, fid + '_thumb.jpg');
      try {
        await run('ffmpeg', ['-y', '-ss', String(Math.min(1, (info.duration || 1) / 3)), '-i', raw, '-frames:v', '1', '-vf', 'scale=240:-2', thumb]);
        item.thumb = toUrl(thumb);
      } catch {}
    }
    if (kind === 'image') item.thumb = item.url;
    return item;
  },

  // correzione automatica colore / LUT / audio → nuovo file processato
  async 'POST /api/enhance'(req) {
    const b = await readJson(req);
    const src = localPath(b.source);
    const info = await probe(src).catch(() => ({ duration: 0, hasAudio: false }));
    const isImage = IMAGE_EXT.includes(path.extname(src).toLowerCase());
    const vf = [];
    if (b.autoColor) vf.push('normalize=smoothing=30:independence=0.4:strength=0.7', 'eq=saturation=1.08:gamma=1.02');
    if (b.lut && b.lut !== 'none') {
      const lutFile = path.join(DIRS.luts, b.lut + '.cube');
      if (!fs.existsSync(lutFile)) throw new Error('LUT non trovata');
      const esc = lutFile.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
      vf.push(`lut3d=file='${esc}':interp=tetrahedral`);
      if (b.lutStrength != null && b.lutStrength < 1) {
        // mix con l'originale
        vf.splice(vf.length - 1, 1);
        vf.push(`split[a][b];[b]lut3d=file='${esc}'[l];[a][l]blend=all_expr='A*(1-${(+b.lutStrength).toFixed(2)})+B*${(+b.lutStrength).toFixed(2)}'`);
      }
    }
    const af = [];
    if (b.cleanVoice) af.push('highpass=f=80', 'lowpass=f=14000', 'afftdn=nf=-25', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2');
    if (b.normalize) af.push('loudnorm=I=-16:TP=-1.5:LRA=11');

    const fid = id();
    if (isImage) {
      const out = path.join(DIRS.processed, fid + '_fx.jpg');
      const args = ['-y', '-i', src];
      if (vf.length) args.push('-vf', vf.join(',').replace('normalize=smoothing=30', 'normalize=smoothing=0'));
      args.push('-q:v', '2', out);
      await run('ffmpeg', args);
      return { url: toUrl(out) };
    }
    const out = path.join(DIRS.processed, fid + '_fx.mp4');
    const jobId = startJob(async (p) => {
      const args = ['-y', '-i', src];
      if (vf.length) args.push('-filter_complex', `[0:v]${vf.join(',')},format=yuv420p[v]`, '-map', '[v]');
      else args.push('-map', '0:v:0');
      if (info.hasAudio) { args.push('-map', '0:a:0'); if (af.length) args.push('-af', af.join(',')); args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000'); }
      args.push('-c:v', vf.length ? 'libx264' : 'copy');
      if (vf.length) args.push('-preset', 'veryfast', '-crf', '17');
      args.push('-movflags', '+faststart', out);
      await run('ffmpeg', args, { onStderr: ffProgress(info.duration, p) });
      return { url: toUrl(out) };
    });
    return { jobId };
  },

  // indirizzi per aprire lo studio dal telefono
  async 'GET /api/lan'() { return { port: PORT, urls: lanIps().map((ip) => `http://${ip}:${PORT}`) }; },

  // rileva i silenzi (per tagliare automaticamente pause e tempi morti)
  async 'POST /api/silences'(req) {
    const b = await readJson(req);
    const src = localPath(b.source);
    const noise = Number.isFinite(+b.noise) ? +b.noise : -32, min = Number.isFinite(+b.min) ? +b.min : 0.45;
    let log = '';
    await run('ffmpeg', ['-hide_banner', '-nostats', '-i', src, '-vn', '-af', `silencedetect=noise=${noise}dB:d=${min}`, '-f', 'null', '-'], { onStderr: (d) => (log += d) });
    const out = []; let cur = null;
    for (const line of log.split('\n')) {
      let m = /silence_start: (-?[\d.]+)/.exec(line); if (m) cur = { start: Math.max(0, +m[1]) };
      m = /silence_end: ([\d.]+)/.exec(line); if (m && cur) { cur.end = +m[1]; out.push(cur); cur = null; }
    }
    if (cur) { cur.end = (await probe(src)).duration; out.push(cur); }
    return { silences: out };
  },

  // libreria riferimenti/B-roll (file scaricati da Pinterest ecc., con tag)
  async 'GET /api/library'() { return readLib(); },
  async 'POST /api/library'(req) {
    const b = await readJson(req), lib = readLib();
    const item = { id: id(), url: b.url, thumb: b.thumb || b.url, name: b.name || '', kind: b.kind === 'image' ? 'image' : 'video', category: b.category || 'all', trend: b.trend || 'cinematic', duration: b.duration || 0, added: Date.now() };
    localPath(item.url); lib.unshift(item); fs.writeFileSync(LIBRARY, JSON.stringify(lib, null, 1));
    return item;
  },
  async 'DELETE /api/library'(req, res, q) {
    const lib = readLib().filter((x) => x.id !== q.get('id'));
    fs.writeFileSync(LIBRARY, JSON.stringify(lib, null, 1)); return { ok: true };
  },

  async 'GET /api/job'(req, res, q) {
    const j = jobs[q.get('id')];
    if (!j) throw new Error('Job inesistente');
    return j;
  },

  // trascrizione con Whisper locale (pip install openai-whisper)
  async 'POST /api/transcribe'(req) {
    const b = await readJson(req);
    if (!hasCmd('whisper')) {
      const e = new Error('Whisper non installato. Installa con:  pip install -U openai-whisper   (poi riavvia il server)');
      e.code = 501; throw e;
    }
    const src = localPath(b.source);
    const outDir = path.join(DIRS.tmp, id());
    fs.mkdirSync(outDir, { recursive: true });
    const jobId = startJob(async (p) => {
      const wav = path.join(outDir, 'audio.wav');
      await run('ffmpeg', ['-y', '-i', src, '-vn', '-ac', '1', '-ar', '16000', wav]);
      p(0.15);
      await run('whisper', [wav, '--model', b.model || 'small', '--language', b.language || 'it', '--word_timestamps', 'True',
        '--output_format', 'json', '--output_dir', outDir, '--verbose', 'False', '--fp16', 'False']);
      const j = JSON.parse(fs.readFileSync(path.join(outDir, 'audio.json'), 'utf8'));
      const words = [];
      for (const s of j.segments || []) {
        if (s.words && s.words.length) for (const w of s.words) words.push({ w: w.word.trim(), t0: w.start, t1: w.end });
        else words.push(...splitEven(s.text, s.start, s.end));
      }
      fs.rmSync(outDir, { recursive: true, force: true });
      return { words: words.filter((w) => w.w) };
    });
    return { jobId };
  },

  // B-roll da Pexels (serve una API key gratuita: pexels.com/api)
  async 'POST /api/broll/search'(req) {
    const b = await readJson(req);
    if (!b.key) throw new Error('Inserisci la tua API key Pexels nelle Impostazioni');
    const kind = b.kind === 'photo' ? 'v1/search' : 'videos/search';
    const url = `https://api.pexels.com/${kind}?query=${encodeURIComponent(b.query)}&orientation=portrait&per_page=15&locale=it-IT`;
    const r = await fetch(url, { headers: { Authorization: b.key } });
    if (!r.ok) throw new Error('Pexels: ' + r.status + ' (controlla la API key)');
    const j = await r.json();
    if (b.kind === 'photo') return { items: (j.photos || []).map((p) => ({ id: p.id, thumb: p.src.medium, url: p.src.large2x, kind: 'image', author: p.photographer })) };
    return {
      items: (j.videos || []).map((v) => {
        const files = v.video_files.filter((f) => f.file_type === 'video/mp4').sort((a, b2) => Math.abs(a.height - 1920) - Math.abs(b2.height - 1920));
        return { id: v.id, thumb: v.image, url: files[0] && files[0].link, kind: 'video', duration: v.duration, author: v.user && v.user.name };
      }).filter((x) => x.url),
    };
  },
  async 'POST /api/broll/download'(req) {
    const b = await readJson(req);
    if (!/^https:\/\/([a-z0-9-]+\.)*pexels\.com\//.test(b.url)) throw new Error('URL non consentito');
    const r = await fetch(b.url);
    if (!r.ok) throw new Error('Download fallito: ' + r.status);
    const ext = b.kind === 'image' ? '.jpg' : '.mp4';
    const file = path.join(DIRS.uploads, 'broll_' + id() + ext);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return { url: toUrl(file) };
  },

  // export: riceve il video registrato dal browser → MP4 H.264 pronto per Instagram/TikTok
  async 'POST /api/export'(req, res, q) {
    const name = (q.get('name') || 'reel').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60) || 'reel';
    const tmp = path.join(DIRS.tmp, id() + safeExt(q.get('ext') || '.webm'));
    await saveBody(req, tmp);
    const info = await probe(tmp).catch(() => ({ duration: 0, hasAudio: true }));
    const out = path.join(DIRS.exports, `${name}_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.mp4`);
    const loud = q.get('loudnorm') !== '0';
    const fps = q.get('fps') || '30';
    const jobId = startJob(async (p) => {
      const args = ['-y', '-fflags', '+genpts', '-i', tmp, '-r', fps, '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-profile:v', 'high',
        '-pix_fmt', 'yuv420p', '-vsync', 'cfr'];
      if (info.hasAudio) { if (loud) args.push('-af', 'loudnorm=I=-14:TP=-1:LRA=11'); args.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000'); }
      args.push('-movflags', '+faststart', out);
      await run('ffmpeg', args, { onStderr: ffProgress(info.duration, p) });
      fs.rmSync(tmp, { force: true });
      return { url: toUrl(out), name: path.basename(out) };
    });
    return { jobId };
  },
  async 'GET /api/exports'() {
    return fs.readdirSync(DIRS.exports).filter((f) => f.endsWith('.mp4'))
      .map((f) => ({ name: f, url: '/data/exports/' + encodeURIComponent(f), time: fs.statSync(path.join(DIRS.exports, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);
  },

  // progetti
  async 'GET /api/projects'() {
    return fs.readdirSync(DIRS.projects).filter((f) => f.endsWith('.json')).map((f) => {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(DIRS.projects, f), 'utf8'));
        return { id: p.id, name: p.name, category: p.category, updated: p.updated, thumb: p.thumb, clips: (p.clips || []).length, duration: p.durationCache || 0 };
      } catch { return null; }
    }).filter(Boolean).sort((a, b) => b.updated - a.updated);
  },
  async 'GET /api/project'(req, res, q) {
    const f = path.join(DIRS.projects, String(q.get('id')).replace(/[^a-z0-9]/gi, '') + '.json');
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  },
  async 'POST /api/project'(req) {
    const p = await readJson(req);
    p.id = String(p.id || id()).replace(/[^a-z0-9]/gi, '');
    p.updated = Date.now();
    fs.writeFileSync(path.join(DIRS.projects, p.id + '.json'), JSON.stringify(p, null, 1));
    return { id: p.id, updated: p.updated };
  },
  async 'DELETE /api/project'(req, res, q) {
    fs.rmSync(path.join(DIRS.projects, String(q.get('id')).replace(/[^a-z0-9]/gi, '') + '.json'), { force: true });
    return { ok: true };
  },
};

function readLib() { try { return JSON.parse(fs.readFileSync(LIBRARY, 'utf8')); } catch { return []; } }
function lanIps() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const a of list || []) if (a.family === 'IPv4' && !a.internal) out.push(a.address);
  return out;
}

function splitEven(text, t0, t1) {
  const ws = String(text).trim().split(/\s+/).filter(Boolean);
  const d = (t1 - t0) / Math.max(1, ws.length);
  return ws.map((w, i) => ({ w, t0: t0 + i * d, t1: t0 + (i + 1) * d }));
}

// ---------- static con supporto Range (necessario per lo scrubbing dei video) ----------
function serveFile(req, res, file) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, { error: 'Non trovato' });
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : st.size - 1;
      if (!m[1] && m[2]) { start = st.size - +m[2]; end = st.size - 1; }
      end = Math.min(end, st.size - 1);
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      const headers = { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' };
      if (req.url.includes('download=1')) headers['Content-Disposition'] = `attachment; filename="${path.basename(file)}"`;
      res.writeHead(200, headers);
      fs.createReadStream(file).pipe(res);
    }
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const key = `${req.method} ${u.pathname}`;
  if (api[key]) {
    try { send(res, 200, await api[key](req, res, u.searchParams)); }
    catch (e) { console.error('[api]', key, e.message); send(res, e.code || 500, { error: e.message }); }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Metodo non consentito' });
  try {
    if (u.pathname.startsWith('/data/')) return serveFile(req, res, localPath(u.pathname));
    let p = path.normalize(path.join(PUBLIC, decodeURIComponent(u.pathname)));
    if (!p.startsWith(PUBLIC)) return send(res, 403, { error: 'Vietato' });
    if (u.pathname === '/' ) p = path.join(PUBLIC, 'index.html');
    serveFile(req, res, p);
  } catch (e) { send(res, 400, { error: e.message }); }
});

server.listen(PORT, HOST, () => {
  console.log('\n  ▶ Vels Reel Studio attivo su  http://localhost:' + PORT);
  if (HOST === '0.0.0.0') lanIps().forEach((ip) => console.log('    📱 Dal telefono (stessa Wi-Fi):  http://' + ip + ':' + PORT));
  console.log('    FFmpeg: ' + (hasCmd('ffmpeg') ? 'ok' : 'NON TROVATO (installalo!)') + '   Whisper: ' + (hasCmd('whisper') ? 'ok' : 'non installato (sottotitoli automatici disattivati)') + '\n');
});
