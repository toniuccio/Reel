// Vels Reel Studio — motore di rendering (canvas) + audio (WebAudio)
// Tutto viene disegnato in "unità design" (W×H es. 1080×1920) e scalato sul canvas.
(function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const backOut = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const hexToRgb = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const isLight = (h) => { const [r, g, b] = hexToRgb(h); return 0.299 * r + 0.587 * g + 0.114 * b > 150; };
  const gradColors = (g) => (String(g).match(/#[0-9a-f]{6}/gi) || ['#222222', '#444444']);

  class Engine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.project = null;
      this.media = new Map(); // key → {el, kind, ready}
      this.playing = false;
      this.t = 0;
      this.previewScale = 0.5;
      this.listeners = {};
      this.noise = this._makeNoise();
      this.logo = { white: this._img('/assets/logo-white.png'), black: this._img('/assets/logo-black.png') };
      this._raf = this._raf.bind(this);
      requestAnimationFrame(this._raf);
    }
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev, ...a) { (this.listeners[ev] || []).forEach((f) => f(...a)); }
    _img(src) { const i = new Image(); i.src = src; i.onload = () => this.requestDraw(); return i; }

    // ---------- progetto & timeline ----------
    setProject(p) { this.project = p; this.resize(); this.invalidate(); }
    get W() { return VRS.FORMATS[this.project.format][0]; }
    get H() { return VRS.FORMATS[this.project.format][1]; }
    resize(scale) {
      if (scale != null) this.previewScale = scale;
      const s = this.previewScale;
      this.canvas.width = Math.round(this.W * s);
      this.canvas.height = Math.round(this.H * s);
      this.requestDraw();
    }
    invalidate() { this._layout = null; this._pages = null; this.requestDraw(); }
    layout() {
      if (this._layout) return this._layout;
      let t = 0;
      const segs = this.project.clips.map((c) => {
        const dur = Math.max(0.1, c.kind === 'image' ? (c.dur || this.project.imageDuration) : (c.out - c.in));
        const s = { clip: c, start: t, end: t + dur, dur };
        t += dur;
        return s;
      });
      this._layout = { segs, total: t };
      return this._layout;
    }
    get duration() { return this.layout().total; }
    segAt(t) { const { segs } = this.layout(); return segs.find((s) => t >= s.start && t < s.end) || segs[segs.length - 1]; }

    // parole in tempo timeline
    timelineWords() {
      const out = [];
      for (const s of this.layout().segs) {
        const c = s.clip, base = c.kind === 'image' ? 0 : c.in;
        for (const w of c.words || []) {
          if (w.t0 < base - 0.05 || w.t0 >= base + s.dur) continue;
          out.push({ w: w.w, t0: s.start + w.t0 - base, t1: Math.min(s.end, s.start + w.t1 - base), seg: s });
        }
      }
      return out.sort((a, b) => a.t0 - b.t0);
    }
    pages() {
      if (this._pages) return this._pages;
      const words = this.timelineWords(), max = this.project.captions.maxWords || 3, pages = [];
      let cur = null;
      words.forEach((w, i) => {
        const prev = words[i - 1];
        const brk = !cur || cur.words.length >= max || (prev && (w.t0 - prev.t1 > 0.55 || /[.!?;:]$/.test(prev.w) || prev.seg !== w.seg));
        if (brk) { cur = { words: [], t0: w.t0, t1: w.t1 }; pages.push(cur); }
        cur.words.push(w); cur.t1 = w.t1;
      });
      pages.forEach((p, i) => {
        const next = pages[i + 1];
        const hold = next ? Math.min(0.4, Math.max(0, next.t0 - p.t1 - 0.02)) : 0.4;
        p.end = p.t1 + hold;
      });
      this._pages = pages;
      return pages;
    }
    events() {
      // momenti in cui suonare effetti sonori
      const ev = [], p = this.project;
      if (p.captions.enabled && p.captions.sfx && p.captions.sfxType !== 'none') this.pages().forEach((pg) => ev.push({ t: pg.t0, type: p.captions.sfxType }));
      if (p.motion.sfx && p.motion.transition !== 'cut') this.layout().segs.slice(1).forEach((s) => ev.push({ t: s.start - p.motion.transDur / 2, type: 'whoosh' }));
      p.broll.forEach((b) => b.sfx !== false && ev.push({ t: b.start, type: b.motion === 'pop' ? 'pop' : 'whoosh' }));
      return ev.sort((a, b) => a.t - b.t);
    }

    // ---------- media ----------
    mediaFor(key, url, kind, opts = {}) {
      let m = this.media.get(key);
      if (m && m.url === url) return m;
      if (m) this.disposeMedia(key);
      let el;
      if (kind === 'image') {
        el = new Image(); el.src = url;
        el.onload = () => { m.ready = true; this.requestDraw(); };
      } else {
        el = document.createElement('video');
        el.src = url; el.preload = 'auto'; el.playsInline = true; el.crossOrigin = 'anonymous';
        el.muted = !!opts.muted;
        el.addEventListener('loadeddata', () => { m.ready = true; this.requestDraw(); });
        el.addEventListener('seeked', () => this.requestDraw());
        if (!opts.muted) this._routeAudio(el, key);
      }
      m = { el, kind, url, ready: false };
      this.media.set(key, m);
      return m;
    }
    disposeMedia(key) {
      const m = this.media.get(key); if (!m) return;
      if (m.kind === 'video') { m.el.pause(); m.el.removeAttribute('src'); m.el.load(); }
      if (m.gain) m.gain.disconnect();
      this.media.delete(key);
    }
    gc() {
      const keys = new Set(this.project.clips.map((c) => 'clip:' + c.id).concat(this.project.broll.map((b) => 'broll:' + b.id), ['music']));
      for (const k of [...this.media.keys()]) if (!keys.has(k)) this.disposeMedia(k);
    }

    // ---------- audio ----------
    audio() {
      if (this.ac) return this.ac;
      const ac = (this.ac = new (window.AudioContext || window.webkitAudioContext)());
      this.master = ac.createGain();
      this.monitor = ac.createGain();
      this.recDest = ac.createMediaStreamDestination();
      this.master.connect(this.monitor).connect(ac.destination);
      this.master.connect(this.recDest);
      this.voiceBus = ac.createGain(); this.voiceBus.connect(this.master);
      this.analyser = ac.createAnalyser(); this.analyser.fftSize = 1024; this.voiceBus.connect(this.analyser);
      this._abuf = new Float32Array(this.analyser.fftSize);
      this.musicGain = ac.createGain(); this.musicGain.gain.value = 0; this.musicGain.connect(this.master);
      this.sfxBus = ac.createGain(); this.sfxBus.gain.value = 0.7; this.sfxBus.connect(this.master);
      // ri-collega elementi creati prima
      for (const [k, m] of this.media) if (m.kind === 'video' && !m.el.muted && !m.gain) this._routeAudio(m.el, k);
      if (this.musicEl && !this.musicSrc) { this.musicSrc = ac.createMediaElementSource(this.musicEl); this.musicSrc.connect(this.musicGain); }
      return ac;
    }
    _routeAudio(el, key) {
      if (!this.ac) return; // verrà collegato alla prima interazione
      const m = this.media.get(key);
      const src = this.ac.createMediaElementSource(el);
      const g = this.ac.createGain();
      src.connect(g).connect(this.voiceBus);
      if (m) m.gain = g;
    }
    setMusic(url) {
      if (this.musicEl && this.musicEl.dataset.url === url) return;
      if (this.musicEl) { this.musicEl.pause(); if (this.musicSrc) this.musicSrc.disconnect(); this.musicSrc = null; }
      this.musicEl = null;
      if (!url) return;
      const a = new Audio(); a.src = url; a.preload = 'auto'; a.crossOrigin = 'anonymous'; a.dataset.url = url;
      this.musicEl = a;
      if (this.ac) { this.musicSrc = this.ac.createMediaElementSource(a); this.musicSrc.connect(this.musicGain); }
    }
    sfx(type) {
      const ac = this.ac; if (!ac) return;
      const t = ac.currentTime, out = this.sfxBus;
      if (type === 'pop') {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(950, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.09);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.14);
      } else if (type === 'click') {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(2400, t); o.frequency.exponentialRampToValueAtTime(1200, t + 0.03);
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
        o.connect(g).connect(out); o.start(t); o.stop(t + 0.05);
      } else if (type === 'whoosh') {
        const len = 0.5, buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const n = ac.createBufferSource(); n.buffer = buf;
        const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
        f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.22); f.frequency.exponentialRampToValueAtTime(700, t + len);
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + len);
      } else if (type === 'ding') {
        [1318, 1975].forEach((fq, i) => {
          const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = fq;
          g.gain.setValueAtTime(0.0001, t + i * 0.06); g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.06 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.5);
          o.connect(g).connect(out); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.55);
        });
      }
    }
    _updateAudio(t) {
      if (!this.ac) return;
      const p = this.project, now = this.ac.currentTime;
      for (const s of this.layout().segs) {
        const m = this.media.get('clip:' + s.clip.id);
        if (m && m.gain) m.gain.gain.setTargetAtTime(s.clip.muted ? 0 : (s.clip.volume ?? 1), now, 0.02);
      }
      this.voiceBus.gain.setTargetAtTime(p.audio.voiceVol, now, 0.03);
      // ducking: abbassa la musica quando c'è voce
      const mu = p.music;
      let level = 1;
      if (mu.ducking && this.playing) {
        this.analyser.getFloatTimeDomainData(this._abuf);
        let sum = 0; for (let i = 0; i < this._abuf.length; i++) sum += this._abuf[i] * this._abuf[i];
        const rms = Math.sqrt(sum / this._abuf.length);
        const speaking = rms > (mu.threshold || 0.012);
        if (speaking) this._lastVoice = t;
        level = this._lastVoice != null && t - this._lastVoice < 0.35 && t >= this._lastVoice ? mu.duck : 1;
      }
      const total = this.duration;
      const fade = Math.min(mu.fadeIn > 0 ? clamp(t / mu.fadeIn) : 1, mu.fadeOut > 0 ? clamp((total - t) / mu.fadeOut) : 1);
      const target = this.playing ? mu.vol * level * fade : 0;
      this.musicGain.gain.setTargetAtTime(target, now, level < 1 ? 0.06 : 0.25);
      this._duckLevel = level;
    }

    // ---------- trasporto ----------
    async play() {
      if (!this.project || !this.duration) return;
      const ac = this.audio(); if (ac.state === 'suspended') await ac.resume();
      if (this.t >= this.duration - 0.05) this.t = 0;
      this.playing = true;
      this._clock = performance.now() - this.t * 1000;
      this._prevT = this.t;
      this.emit('state', true);
    }
    pause() {
      this.playing = false;
      for (const m of this.media.values()) if (m.kind === 'video') m.el.pause();
      if (this.musicEl) this.musicEl.pause();
      this.emit('state', false);
      this.requestDraw();
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    seek(t) {
      this.t = clamp(t, 0, Math.max(0, this.duration - 0.001));
      this._clock = performance.now() - this.t * 1000;
      this._prevT = this.t;
      this._lastVoice = null;
      this.requestDraw();
      this.emit('time', this.t);
    }
    requestDraw() { this._dirty = true; }

    _syncVideo(m, desired, active) {
      const v = m.el;
      if (!active) { if (!v.paused) v.pause(); return; }
      if (this.playing) {
        if (Math.abs(v.currentTime - desired) > 0.3 && !v.seeking) v.currentTime = desired;
        if (v.paused) v.play().catch(() => {});
      } else {
        if (!v.paused) v.pause();
        if (Math.abs(v.currentTime - desired) > 0.04 && !v.seeking) v.currentTime = desired;
      }
    }
    _syncAll(t) {
      const p = this.project, { segs } = this.layout();
      const cur = this.segAt(t);
      segs.forEach((s, i) => {
        const c = s.clip;
        const m = this.mediaFor('clip:' + c.id, c.url, c.kind);
        if (c.kind !== 'video') return;
        const isCur = s === cur;
        if (isCur) this._syncVideo(m, c.in + (t - s.start), true);
        else {
          if (!m.el.paused) m.el.pause();
          // pre-carica il punto d'ingresso della clip successiva
          if (s.start > t && s.start - t < 2 && Math.abs(m.el.currentTime - c.in) > 0.05 && !m.el.seeking) m.el.currentTime = c.in;
        }
      });
      for (const b of p.broll) {
        if (b.kind !== 'media' || !b.url) continue;
        const m = this.mediaFor('broll:' + b.id, b.url, b.mediaKind, { muted: true });
        if (b.mediaKind !== 'video') continue;
        const active = t >= b.start - 0.5 && t < b.start + b.dur;
        const vd = m.el.duration || b.dur;
        this._syncVideo(m, clamp(t - b.start, 0, b.dur) % Math.max(0.1, vd), active);
      }
      // musica
      if (this.musicEl) {
        const want = (p.music.offset || 0) + t;
        if (this.playing) {
          if (Math.abs(this.musicEl.currentTime - want) > 0.25) this.musicEl.currentTime = want;
          if (this.musicEl.paused) this.musicEl.play().catch(() => {});
        } else if (!this.musicEl.paused) this.musicEl.pause();
      }
    }

    _raf(now) {
      requestAnimationFrame(this._raf);
      if (!this.project) return;
      if (this.playing) {
        let t = (now - this._clock) / 1000;
        // aggancia il clock al video attivo (evita deriva audio/video)
        const s = this.segAt(t);
        if (s && s.clip.kind === 'video') {
          const m = this.media.get('clip:' + s.clip.id);
          if (m && m.ready && !m.el.paused && !m.el.seeking) {
            const vt = s.start + (m.el.currentTime - s.clip.in);
            if (Math.abs(vt - t) < 0.25 && vt >= s.start) { t = lerp(t, vt, 0.5); this._clock = now - t * 1000; }
            else if (m.el.readyState < 3) { this._clock += 16; t = (now - this._clock) / 1000; } // buffering: aspetta
          }
        }
        if (t >= this.duration) { this.t = this.duration; this.pause(); this.emit('time', this.t); this.emit('ended'); return; }
        // effetti sonori
        for (const e of this._events || (this._events = this.events())) if (e.t > this._prevT && e.t <= t) this.sfx(e.type);
        this._prevT = t;
        this.t = t;
        this.emit('time', t);
        this._dirty = true;
      } else this._events = null;
      this._syncAll(this.t);
      this._updateAudio(this.t);
      if (this._dirty) { this._dirty = this.playing; this.draw(this.t); }
    }

    // ---------- disegno ----------
    filterString(extraBlur = 0) {
      const L = this.project.look, f = VRS.FILTERS.find((x) => x.id === L.filter) || VRS.FILTERS[0], k = L.intensity;
      const parts = [
        `brightness(${lerp(1, f.b, k).toFixed(3)})`, `contrast(${lerp(1, f.c, k).toFixed(3)})`,
        `saturate(${lerp(1, f.s, k).toFixed(3)})`,
      ];
      if (f.sep) parts.push(`sepia(${(f.sep * k).toFixed(3)})`);
      if (f.hue) parts.push(`hue-rotate(${(f.hue * k).toFixed(1)}deg)`);
      if (extraBlur > 0.3) parts.push(`blur(${(extraBlur * this.previewScaleNow).toFixed(1)}px)`);
      return parts.join(' ');
    }
    get previewScaleNow() { return this.canvas.width / this.W; }

    drawCover(el, sw, sh, { scale = 1, x = 0, y = 0, fit = 'cover' } = {}) {
      const ctx = this.ctx, W = this.W, H = this.H;
      if (!sw || !sh) return;
      if (fit === 'blur') {
        // sfondo sfocato economico: disegno in piccolo e ingrandisco
        const tmp = this._blurCv || (this._blurCv = document.createElement('canvas'));
        tmp.width = 36; tmp.height = Math.round(36 * H / W);
        const tc = tmp.getContext('2d');
        const s0 = Math.max(tmp.width / sw, tmp.height / sh);
        tc.drawImage(el, (tmp.width - sw * s0) / 2, (tmp.height - sh * s0) / 2, sw * s0, sh * s0);
        ctx.save(); ctx.imageSmoothingQuality = 'low'; ctx.globalAlpha = 0.9; ctx.drawImage(tmp, -W * 0.05, -H * 0.05, W * 1.1, H * 1.1); ctx.restore();
        const s = Math.min(W / sw, H / sh) * scale;
        ctx.drawImage(el, (W - sw * s) / 2 + x * W, (H - sh * s) / 2 + y * H, sw * s, sh * s);
        return;
      }
      const s = Math.max(W / sw, H / sh) * scale;
      ctx.drawImage(el, (W - sw * s) / 2 + x * W, (H - sh * s) / 2 + y * H, sw * s, sh * s);
    }
    mediaSize(m) {
      if (!m || !m.ready) return [0, 0];
      return m.kind === 'image' ? [m.el.naturalWidth, m.el.naturalHeight] : [m.el.videoWidth, m.el.videoHeight];
    }

    // movimento camera della clip principale
    clipMotion(s, t, idx) {
      const p = this.project, mode = p.motion.mode, I = p.motion.intensity ?? 1;
      const u = clamp((t - s.start) / s.dur);
      let scale = 1, x = 0, y = 0;
      if (mode === 'smooth' || (mode !== 'semplice' && s.clip.kind === 'image')) {
        const dir = idx % 2 === 0 ? 1 : -1, e = easeInOut(u);
        scale = 1 + 0.08 * I * (dir > 0 ? e : 1 - e);
        if (s.clip.kind === 'image') x = 0.02 * I * (idx % 3 === 0 ? e - 0.5 : idx % 3 === 1 ? 0.5 - e : 0);
      }
      if (mode === 'dinamico') {
        scale = Math.max(scale, 1 + 0.03 * I * u);
        // punch-in alternati sull'inizio di ogni frase
        const pages = this.pages().filter((pg) => pg.t0 >= s.start - 0.01 && pg.t0 < s.end);
        let k = -1, since = 0;
        if (pages.length) pages.forEach((pg, i) => { if (t >= pg.t0) { k = i; since = t - pg.t0; } });
        else { const step = 2.2; k = Math.floor((t - s.start) / step); since = (t - s.start) % step; }
        if (k >= 0 && k % 2 === 1) scale += 0.12 * I * easeOut(clamp(since / 0.14));
        else if (k >= 0 && k > 0) scale += 0.12 * I * (1 - easeOut(clamp(since / 0.14)));
      }
      return { scale, x, y };
    }
    transitionFx(t) {
      const p = this.project, tr = p.motion.transition, D = p.motion.transDur || 0.35;
      const out = { scale: 1, x: 0, y: 0, blur: 0, black: 0 };
      if (tr === 'cut') return out;
      const { segs } = this.layout();
      for (let i = 1; i < segs.length; i++) {
        const T = segs[i].start, d = t - T; // <0 uscita, >0 entrata
        if (Math.abs(d) > D / 2) continue;
        const k = 1 - Math.abs(d) / (D / 2); // 0 → 1 al taglio
        const sign = d < 0 ? -1 : 1;
        if (tr === 'fade') out.black = easeInOut(k);
        if (tr === 'zoom') { out.scale = 1 + 0.45 * k * k; out.blur = 14 * k; }
        if (tr === 'slide') { out.y = -sign * 0.12 * k * k; out.blur = 10 * k; out.black = 0.25 * k; }
        if (tr === 'whip') { out.x = -sign * 0.22 * k * k; out.blur = 22 * k; }
      }
      return out;
    }

    draw(t) {
      const ctx = this.ctx, p = this.project;
      const sc = this.previewScaleNow, W = this.W, H = this.H;
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const { segs } = this.layout();
      if (!segs.length) { this._drawEmpty(); return; }
      const s = this.segAt(t), idx = segs.indexOf(s);
      const m = this.mediaFor('clip:' + s.clip.id, s.clip.url, s.clip.kind);
      const mo = this.clipMotion(s, t, idx), tr = this.transitionFx(t);
      const [sw, sh] = this.mediaSize(m);
      ctx.save();
      ctx.filter = this.filterString(tr.blur);
      if (sw) this.drawCover(m.el, sw, sh, { scale: mo.scale * tr.scale, x: mo.x + tr.x, y: mo.y + tr.y, fit: s.clip.fit });
      ctx.restore();

      // B-roll sopra il video principale
      for (const b of p.broll) if (t >= b.start && t < b.start + b.dur) this.drawBroll(b, t);

      this.drawLook();
      if (tr.black > 0.001) { ctx.fillStyle = `rgba(0,0,0,${tr.black})`; ctx.fillRect(0, 0, W, H); }
      if (p.captions.enabled) this.drawCaptions(t);
      if (p.watermark.enabled) this.drawWatermark();
    }
    _drawEmpty() {
      const ctx = this.ctx, W = this.W, H = this.H;
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#15182b'); g.addColorStop(1, '#0b0d1a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (this.logo.white.complete && this.logo.white.naturalWidth) {
        const lw = W * 0.34, lh = lw * this.logo.white.naturalHeight / this.logo.white.naturalWidth;
        ctx.globalAlpha = 0.18; ctx.drawImage(this.logo.white, (W - lw) / 2, H * 0.4 - lh / 2, lw, lh); ctx.globalAlpha = 1;
      }
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '600 40px Manrope, Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Trascina qui i tuoi video o foto', W / 2, H * 0.58);
    }

    drawLook() {
      const ctx = this.ctx, W = this.W, H = this.H, L = this.project.look;
      const f = VRS.FILTERS.find((x) => x.id === L.filter) || VRS.FILTERS[0], k = L.intensity;
      ctx.save();
      for (const tint of [f.tint, f.tint2]) {
        if (!tint) continue;
        ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = Math.min(1, tint[1] * k * 4);
        ctx.fillStyle = tint[0]; ctx.fillRect(0, 0, W, H);
      }
      if (f.fade) { ctx.globalCompositeOperation = 'lighten'; ctx.globalAlpha = 1; ctx.fillStyle = `rgba(40,36,32,${f.fade * k * 6})`; ctx.fillRect(0, 0, W, H); }
      const vig = Math.max(L.vignette || 0, (f.vignette || 0) * k);
      if (vig > 0) {
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.55);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      const grain = Math.max(L.grain || 0, (f.grain || 0) * k);
      if (grain > 0) {
        ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = Math.min(1, grain * 3);
        const pat = ctx.createPattern(this.noise, 'repeat');
        ctx.translate(Math.random() * 256, Math.random() * 256);
        ctx.fillStyle = pat; ctx.fillRect(-256, -256, W + 512, H + 512);
      }
      ctx.restore();
    }
    _makeNoise() {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d'), d = x.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); return c;
    }

    // ---------- B-roll ----------
    drawBroll(b, t) {
      const ctx = this.ctx, W = this.W, H = this.H, p = this.project;
      const u = t - b.start, k = clamp(u / b.dur), inK = clamp(u / 0.28), outK = clamp((b.dur - u) / 0.22);
      const vis = easeOut(Math.min(inK, outK));
      const cat = VRS.CATEGORIES.find((c) => c.id === p.category) || VRS.CATEGORIES[0];
      ctx.save();
      // entrata/uscita in base al movimento
      let sc = 1, dx = 0, dy = 0, rot = 0;
      const e = easeInOut(k);
      switch (b.motion) {
        case 'zoom-in': sc = 1 + 0.14 * e; break;
        case 'zoom-out': sc = 1.16 - 0.14 * e; break;
        case 'pan-left': sc = 1.15; dx = 0.06 - 0.12 * e; break;
        case 'pan-right': sc = 1.15; dx = -0.06 + 0.12 * e; break;
        case 'slide-up': dy = (1 - easeOut(inK)) * 0.25; sc = 1.05 + 0.04 * e; break;
        case 'pop': sc = 0.7 + 0.3 * backOut(inK) + 0.03 * e; break;
        case 'float': dy = Math.sin(u * 2.2) * 0.012; rot = Math.sin(u * 1.6) * 0.012; sc = 1.06; break;
      }
      ctx.globalAlpha = vis;
      ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.translate(-W / 2, -H / 2);
      if (b.kind === 'media' && b.url) {
        const m = this.mediaFor('broll:' + b.id, b.url, b.mediaKind, { muted: true });
        const [sw, sh] = this.mediaSize(m);
        ctx.filter = this.filterString();
        if (sw) this.drawCover(m.el, sw, sh, { scale: sc, x: dx, y: dy });
        ctx.filter = 'none';
        if (b.text) {
          const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.65)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
      } else {
        // card grafica in stile Pinterest
        const [c1, c2] = b.colors || gradColors(cat.gradient);
        const g = ctx.createLinearGradient(0, 0, W * (1 + dx), H);
        if (b.bg === 'dark') { g.addColorStop(0, '#0f1222'); g.addColorStop(1, '#1d2140'); }
        else if (b.bg === 'light') { g.addColorStop(0, '#f6f3ee'); g.addColorStop(1, '#e9e4dc'); }
        else { g.addColorStop(0, c1); g.addColorStop(1, c2); }
        ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
        // forme decorative in movimento
        ctx.globalAlpha = vis * 0.18;
        ctx.fillStyle = b.bg === 'light' ? '#000' : '#fff';
        ctx.beginPath(); ctx.arc(W * (0.85 + dx), H * (0.18 + dy) + Math.sin(u * 1.3) * 30, W * 0.32 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W * (0.1 - dx), H * (0.86 - dy) + Math.cos(u) * 24, W * 0.22 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = vis;
        if (this.logo.white.naturalWidth) {
          const lg = b.bg === 'light' ? this.logo.black : this.logo.white;
          const lw = W * 0.14, lh = lw * lg.naturalHeight / lg.naturalWidth;
          ctx.globalAlpha = vis * 0.9; ctx.drawImage(lg, (W - lw) / 2, H * 0.14, lw, lh); ctx.globalAlpha = vis;
        }
      }
      if (b.text || b.sub) this._brollText(b, u, sc, dy, cat);
      ctx.restore();
    }
    _brollText(b, u, sc, dy, cat) {
      const ctx = this.ctx, W = this.W, H = this.H;
      const dark = b.kind !== 'media' && b.bg === 'light';
      const color = b.textColor || (dark ? '#111' : '#fff');
      const isCard = b.kind !== 'media';
      const size = (isCard ? 108 : 86) * (b.textSize || 1);
      ctx.font = `800 ${size}px Montserrat, Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = this._wrap((b.upper !== false ? (b.text || '').toUpperCase() : b.text || ''), W * 0.8);
      const lh = size * 1.08;
      const cy = (isCard ? H * 0.5 : H * 0.72) + dy * H - (lines.length - 1) * lh / 2;
      // parole che entrano scaglionate
      let wi = 0;
      lines.forEach((line, li) => {
        const words = line.split(' ');
        const widths = words.map((w) => ctx.measureText(w + ' ').width);
        let x = W / 2 - widths.reduce((a, c) => a + c, 0) / 2 + ctx.measureText(' ').width / 2;
        words.forEach((w, i) => {
          const k = easeOut(clamp((u - 0.12 - wi * 0.07) / 0.3));
          ctx.save();
          ctx.globalAlpha *= k;
          ctx.translate(x + widths[i] / 2 - ctx.measureText(' ').width / 2, cy + li * lh + (1 - k) * 40);
          if (!isCard) { ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; }
          ctx.fillStyle = color; ctx.fillText(w, 0, 0);
          ctx.restore();
          x += widths[i]; wi++;
        });
      });
      if (b.sub) {
        const k = easeOut(clamp((u - 0.35 - wi * 0.07) / 0.35));
        const subY = cy + lines.length * lh + 10;
        ctx.font = `600 ${size * 0.38}px Manrope, Inter, sans-serif`;
        const tw = ctx.measureText(b.sub).width + 64, th = size * 0.62;
        ctx.globalAlpha *= k;
        ctx.fillStyle = isCard ? (dark ? '#111' : 'rgba(255,255,255,.95)') : cat.accent;
        this._roundRect(W / 2 - tw / 2, subY - th / 2 + (1 - k) * 20, tw, th, th / 2); ctx.fill();
        ctx.fillStyle = isCard ? (dark ? '#fff' : '#111') : (isLight(cat.accent) ? '#111' : '#fff');
        ctx.fillText(b.sub, W / 2, subY + (1 - k) * 20 + 2);
      }
    }

    // ---------- sottotitoli ----------
    _wrap(text, maxW) {
      const ctx = this.ctx, words = String(text).split(/\s+/).filter(Boolean), lines = [];
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
      }
      if (line) lines.push(line);
      return lines;
    }
    _roundRect(x, y, w, h, r) {
      const ctx = this.ctx; r = Math.min(r, h / 2, w / 2);
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    drawCaptions(t) {
      const p = this.project, C = p.captions, ctx = this.ctx, W = this.W, H = this.H;
      const page = this.pages().find((pg) => t >= pg.t0 - 0.03 && t < pg.end);
      if (!page) return;
      const style = VRS.CAPTION_STYLES.find((s) => s.id === C.style) || VRS.CAPTION_STYLES[0];
      const size = 76 * (C.size || 1) * (W / 1080);
      ctx.save();
      ctx.font = style.font.replace('{s}', size.toFixed(1));
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const txt = (w) => (C.uppercase ? w.w.toUpperCase() : w.w);
      const space = ctx.measureText(' ').width * (C.style === 'highlight' ? 1.6 : 1.1);
      // impaginazione righe
      const maxW = W * 0.82, lines = [[]];
      let lw = 0;
      page.words.forEach((w) => {
        const ww = ctx.measureText(txt(w)).width;
        if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
        lines[lines.length - 1].push({ w, ww });
        lw += ww + space;
      });
      const lh = size * (C.style === 'highlight' ? 1.38 : 1.2);
      const y0 = H * C.position - (lines.length - 1) * lh / 2;
      const pageIn = clamp((t - page.t0) / 0.14), pageOut = clamp((page.end - t) / 0.12);
      const accent = C.accent || '#ffd400', base = C.color || '#fff';
      const active = page.words.filter((w) => t >= w.t0 - 0.02).pop() || page.words[0];

      lines.forEach((line, li) => {
        const total = line.reduce((a, x) => a + x.ww, 0) + space * (line.length - 1);
        let x = W / 2 - total / 2;
        const y = y0 + li * lh;
        line.forEach(({ w, ww }) => {
          const cx = x + ww / 2;
          ctx.save();
          let alpha = Math.min(pageIn, pageOut), scale = 1, dy = 0, color = base;
          if (C.style === 'ios') {
            const e = t - w.t0;
            if (e < -0.02) { ctx.restore(); x += ww + space; return; }
            const k = clamp(e / 0.26);
            scale = 0.55 + 0.45 * backOut(k); dy = (1 - easeOut(k)) * 22; alpha = Math.min(clamp(e / 0.08), pageOut);
            scale *= lerp(0.94, 1, pageOut);
            ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 4;
          } else if (C.style === 'highlight') {
            scale = lerp(0.9, 1, easeOut(pageIn));
            if (w === active) {
              const k = clamp((t - w.t0) / 0.12), bs = 0.85 + 0.15 * backOut(k), padX = size * 0.22, padY = size * 0.14;
              ctx.save(); ctx.globalAlpha = alpha;
              ctx.translate(cx, y); ctx.scale(bs * scale, bs * scale); ctx.rotate(-0.025);
              ctx.fillStyle = accent; this._roundRect(-ww / 2 - padX, -size / 2 - padY, ww + padX * 2, size + padY * 2, size * 0.22); ctx.fill();
              ctx.restore();
              color = isLight(accent) ? '#111' : '#fff';
            } else { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 3; }
          } else if (C.style === 'clean') {
            ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
          } else if (C.style === 'karaoke') {
            if (w === active) { color = accent; scale = 1 + 0.12 * backOut(clamp((t - w.t0) / 0.15)); }
            else if (t < w.t0) color = base;
            scale *= lerp(0.85, 1, easeOut(pageIn));
          }
          ctx.globalAlpha = alpha;
          ctx.translate(cx, y + dy); ctx.scale(scale, scale);
          if (C.style === 'karaoke' || C.style === 'clean') {
            ctx.lineJoin = 'round'; ctx.strokeStyle = C.style === 'karaoke' ? '#000' : 'rgba(0,0,0,.6)';
            ctx.lineWidth = C.style === 'karaoke' ? size * 0.17 : size * 0.06;
            ctx.strokeText(txt(w), -ww / 2, 0);
            ctx.shadowColor = 'transparent';
          }
          ctx.fillStyle = color; ctx.fillText(txt(w), -ww / 2, 0);
          ctx.restore();
          x += ww + space;
        });
      });
      ctx.restore();
    }
    drawWatermark() {
      const wm = this.project.watermark, ctx = this.ctx, W = this.W, H = this.H;
      const img = wm.variant === 'black' ? this.logo.black : this.logo.white;
      if (!img.naturalWidth) return;
      const w = W * (wm.size || 0.13), h = w * img.naturalHeight / img.naturalWidth, m = W * 0.05;
      const x = wm.pos.includes('left') ? m : W - w - m;
      const y = wm.pos.includes('top') ? m * 1.6 : H - h - m * 3.2;
      ctx.save(); ctx.globalAlpha = wm.opacity; ctx.drawImage(img, x, y, w, h); ctx.restore();
    }

    // miniatura del frame corrente
    snapshot(w = 240) {
      const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * this.H / this.W);
      c.getContext('2d').drawImage(this.canvas, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.7);
    }

    // ---------- export in tempo reale ----------
    async exportVideo({ onProgress, quality = 1, fps = 30, muteMonitor = true } = {}) {
      if (!this.duration) throw new Error('Aggiungi almeno una clip');
      const ac = this.audio(); if (ac.state === 'suspended') await ac.resume();
      this.pause();
      const oldScale = this.previewScale;
      this.resize(quality);
      // attende che tutti i media siano pronti
      await this.waitReady();
      this.seek(0);
      await new Promise((r) => setTimeout(r, 400));
      const stream = this.canvas.captureStream(fps);
      this.recDest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
      const mimeType = types.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 20e6, audioBitsPerSecond: 256e3 });
      const chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const done = new Promise((r) => (rec.onstop = r));
      if (muteMonitor) this.monitor.gain.value = 0;
      this._exporting = true;
      rec.start(500);
      await this.play();
      await new Promise((resolve) => {
        const tick = () => {
          onProgress && onProgress(this.t / this.duration);
          if (!this.playing || this._abort) return resolve();
          setTimeout(tick, 200);
        };
        tick();
      });
      await new Promise((r) => setTimeout(r, 250));
      rec.stop(); await done;
      this.monitor.gain.value = 1;
      this._exporting = false;
      stream.getVideoTracks().forEach((tr) => tr.stop());
      this.resize(oldScale);
      if (this._abort) { this._abort = false; throw new Error('Export annullato'); }
      return { blob: new Blob(chunks, { type: mimeType }), ext: mimeType.includes('mp4') ? '.mp4' : '.webm' };
    }
    abortExport() { if (this._exporting) { this._abort = true; this.pause(); } }
    waitReady(timeout = 15000) {
      const p = this.project;
      p.clips.forEach((c) => this.mediaFor('clip:' + c.id, c.url, c.kind));
      p.broll.filter((b) => b.kind === 'media' && b.url).forEach((b) => this.mediaFor('broll:' + b.id, b.url, b.mediaKind, { muted: true }));
      const start = performance.now();
      return new Promise((resolve) => {
        const chk = () => {
          const all = [...this.media.values()].every((m) => m.ready);
          if (all || performance.now() - start > timeout) resolve(); else setTimeout(chk, 150);
        };
        chk();
      });
    }
  }
  VRS.Engine = Engine;
  VRS.util = { clamp, lerp, isLight, gradColors };
})();
