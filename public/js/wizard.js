// Vels Reel Studio — percorso guidato "a scaletta" (ottimizzato per telefono)
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let A; // API dell'app (VRS_APP)
  const live = []; // motori delle anteprime animate attive

  const STEPS = [
    { id: 'files', n: 1, title: 'I tuoi file', icon: '⬆' },
    { id: 'cat', n: 2, title: 'Categoria', icon: '◆' },
    { id: 'auto', n: 3, title: 'Pilota automatico', icon: '✨' },
    { id: 'captions', n: 4, title: 'Caption', icon: 'Aa' },
    { id: 'broll', n: 5, title: 'B-roll', icon: '▣' },
    { id: 'motion', n: 6, title: 'Zoom & transizioni', icon: '⤢' },
    { id: 'look', n: 7, title: 'Look & correzioni', icon: '◐' },
    { id: 'audio', n: 8, title: 'Musica & audio', icon: '♪' },
    { id: 'export', n: 9, title: 'Esporta', icon: '↗' },
  ];
  const W = { open: 'files', auto: { color: true, voice: true, silence: true, captions: true, broll: true, library: true, music: true }, lib: [] };

  // ---------- utilità ----------
  const getK = (o, k) => k.split('.').reduce((x, p) => (x == null ? x : x[p]), o);
  const setK = (o, k, v) => { const ps = k.split('.'), l = ps.pop(); ps.reduce((x, p) => (x[p] = x[p] || {}), o)[l] = v; };
  const P = () => A.S.project;
  const opt = (k, v, inner, cls = '') => `<button class="opt ${cls} ${getK(P(), k) === v ? 'active' : ''}" data-wset="${k}" data-v='${JSON.stringify(v)}'>${inner}</button>`;
  const sw = (k, label, sub) => `<label class="switch"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-wk="${k}" ${getK(P(), k) ? 'checked' : ''}></label>`;
  const pct = (v) => Math.round(v * 100) + '%';
  const range = (k, label, min, max, step, f = pct) => `<div class="field"><label>${label}<em data-wshow="${k}">${f(getK(P(), k))}</em></label><input type="range" data-wk="${k}" min="${min}" max="${max}" step="${step}" value="${getK(P(), k)}"></div>`;

  // ---------- anteprime animate (motore in miniatura su progetto demo) ----------
  const demoImgs = {};
  function demoImg(variant) {
    if (demoImgs[variant]) return demoImgs[variant];
    const c = document.createElement('canvas'); c.width = 540; c.height = 960;
    const x = c.getContext('2d');
    const pal = [['#3b4a7a', '#c08a6a', '#f2c9a0'], ['#24524d', '#8fbfa4', '#e9e2c8']][variant % 2];
    const g = x.createLinearGradient(0, 0, 540, 960); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); x.fillStyle = g; x.fillRect(0, 0, 540, 960);
    x.globalAlpha = 0.25; x.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) { x.beginPath(); x.arc((i * 97) % 540, (i * 173) % 600, 40 + i * 12, 0, 7); x.fill(); }
    x.globalAlpha = 1; x.fillStyle = pal[2]; // persona stilizzata
    x.beginPath(); x.arc(270, 420, 85, 0, 7); x.fill();
    x.beginPath(); x.ellipse(270, 820, 210, 260, 0, Math.PI, 0); x.fill();
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 780, 540, 180);
    return (demoImgs[variant] = c.toDataURL('image/jpeg', 0.8));
  }
  function demoProject(mut) {
    const cur = P(), p = VRS.newProject(cur.category);
    for (const k of ['captions', 'motion', 'look', 'watermark']) p[k] = JSON.parse(JSON.stringify(cur[k]));
    p.format = '9:16'; p.imageDuration = 1.8;
    const w = (arr, t0) => arr.map((s, i) => ({ w: s, t0: t0 + i * 0.36, t1: t0 + i * 0.36 + 0.33 }));
    p.clips = [
      { id: 'd0', kind: 'image', url: demoImg(0), dur: 1.8, fit: 'cover', words: w(['Ecco', 'come', 'diventare', 'virali'], 0.1) },
      { id: 'd1', kind: 'image', url: demoImg(1), dur: 1.8, fit: 'cover', words: w(['in', 'soli', '30', 'secondi!'], 0.1) },
    ];
    p.broll = [];
    if (mut) mut(p);
    return p;
  }
  function preview(slot, mut) {
    const c = document.createElement('canvas'); c.className = 'pv';
    slot.appendChild(c);
    const e = new VRS.Engine(c, { silent: true, loop: true });
    e.setProject(demoProject(mut)); e.resize(0.25);
    live.push(e); setTimeout(() => e.play(), 60 + live.length * 40);
  }
  function killPreviews() { while (live.length) live.pop().destroy(); }
  const brollDemo = (layout, motion, extra = {}) => (p) => {
    const c = VRS.CATEGORIES.find((x) => x.id === p.category), t = c.broll.find((b) => (b.layout || 'title') === layout) || c.broll[0];
    p.captions.enabled = false;
    p.broll = [Object.assign({ id: 'b0', kind: 'card', layout, start: 0.2, dur: 3.2, text: t.text, sub: t.sub, motion, bg: 'cat', textSize: 1 }, extra)];
  };
  const PREVIEWS = {
    cat: (id) => (p) => {
      const c = VRS.CATEGORIES.find((x) => x.id === id), d = c.defaults;
      p.category = id; Object.assign(p.captions, d.captions); Object.assign(p.motion, d.motion); Object.assign(p.look, d.look);
      p.broll = [{ id: 'b0', kind: 'card', layout: c.broll[0].layout || 'title', start: 2.1, dur: 1.4, text: c.broll[0].text, sub: c.broll[0].sub, motion: c.broll[0].motion, bg: 'cat', textSize: 1 }];
    },
    caption: (id) => (p) => { p.captions.style = id; p.captions.enabled = true; p.motion.mode = 'semplice'; p.motion.transition = 'cut'; },
    motion: (id) => (p) => { p.motion.mode = id; p.motion.transition = 'cut'; p.captions.enabled = false; },
    trans: (id) => (p) => { p.motion.transition = id; p.motion.mode = 'semplice'; p.motion.transDur = 0.5; p.captions.enabled = false; },
    layout: (id) => brollDemo(id, id === 'list' ? 'float' : 'zoom-in', id === 'list' ? { dur: 3.4 } : {}),
    trend: (id) => { const t = VRS.TRENDS.broll.find((x) => x.id === id); return brollDemo(t.layout, t.motion); },
  };

  // ---------- render ----------
  function render() {
    killPreviews();
    const p = P(), cat = A.cat();
    $('#wiz-title').value = p.name;
    $('#wiz-cat').innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${cat.gradient}"></span>${A.esc(cat.title)}`;
    $('#wiz-steps').innerHTML = STEPS.map((s) => {
      const open = W.open === s.id;
      return `<section class="card wstep ${open ? 'open' : ''} ${done(s.id) ? 'done' : ''}" data-step="${s.id}">
        <header class="wstep-h" data-toggle="${s.id}">
          <span class="wnum">${done(s.id) && !open ? '✓' : s.n}</span>
          <div class="wtt"><b>${s.title}</b><span>${A.esc(summary(s.id))}</span></div>
          <span class="wchev">${open ? '–' : '+'}</span>
        </header>
        ${open ? `<div class="wstep-b">${BODY[s.id]()}${s.id !== 'export' ? `<button class="btn btn-white wnext" data-next="${s.id}">Avanti <span class="btn-ico">↓</span></button>` : ''}</div>` : ''}
      </section>`;
    }).join('');
    $$('#wiz-steps .pv-slot').forEach((slot) => { const [kind, id] = slot.dataset.pv.split(':'); preview(slot, PREVIEWS[kind](id)); });
    bind();
    const after = AFTER[W.open]; after && after();
    updateProgress();
  }
  function done(id) {
    const p = P();
    return {
      files: p.clips.length > 0, cat: !!p._catChosen, auto: !!p._autoDone, captions: p.clips.some((c) => (c.words || []).length) || !p.captions.enabled,
      broll: p.broll.length > 0, motion: !!p._motionSeen, look: !!p._lookSeen, audio: !!p.music.url || !!p._audioSeen, export: false,
    }[id];
  }
  function summary(id) {
    const p = P(), cs = VRS.CAPTION_STYLES.find((c) => c.id === p.captions.style);
    const mm = VRS.MOTION_MODES.find((m) => m.id === p.motion.mode), tr = VRS.TRANSITIONS.find((t) => t.id === p.motion.transition);
    const f = VRS.FILTERS.find((x) => x.id === p.look.filter);
    return {
      files: p.clips.length ? `${p.clips.length} file · ${A.fmt(A.engine.duration)}` : 'Carica video e foto dal telefono',
      cat: A.cat().title,
      auto: p._autoDone ? 'Completato ✓' : 'Taglio silenzi, sottotitoli, B-roll, colore, musica',
      captions: p.captions.enabled ? (cs ? cs.name : '') : 'Disattivate',
      broll: p.broll.length ? `${p.broll.length} inserti` : 'Nessun inserto',
      motion: `${mm ? mm.name : ''} · ${tr ? tr.name : ''}`,
      look: `${f ? f.name : ''}${p.clips.some((c) => c.url !== c.original) ? ' · corretto ✨' : ''}`,
      audio: p.music.url ? `♪ ${p.music.name}${p.music.ducking ? ' · ducking' : ''}` : 'Nessuna musica',
      export: 'MP4 1080×1920 pronto per Reels e TikTok',
    }[id];
  }
  function updateProgress() {
    const n = STEPS.filter((s) => done(s.id)).length;
    $('#wiz-prog').style.width = (n / (STEPS.length - 1)) * 100 + '%';
    $('#wiz-prog-t').textContent = `${n}/${STEPS.length - 1}`;
  }

  // ---------- corpi degli step ----------
  const BODY = {
    files() {
      const p = P(), ups = Object.entries(A.S.uploading);
      return `
        <label class="btn btn-lime big-up"><input type="file" id="wz-up" multiple accept="video/*,image/*" hidden>⬆ Scegli dalla galleria</label>
        <div class="dropzone small" id="wz-drop"><b>…oppure trascina qui</b><span>uno o più video e foto</span></div>
        <div class="wfiles" id="wz-files">${filesHtml()}</div>
        ${p.clips.length > 1 ? '<div class="hint">Usa ↑ ↓ per cambiare l’ordine. Per tagli precisi apri l’Editor pro.</div>' : ''}`;
    },
    cat() {
      return `<div class="pv-grid">${VRS.CATEGORIES.map((c) => `
        <button class="pv-card ${P().category === c.id ? 'active' : ''}" data-wcat="${c.id}">
          <div class="pv-slot" data-pv="cat:${c.id}"></div>
          <b>${A.esc(c.title)}</b><span>${A.esc(c.tag)}</span></button>`).join('')}</div>
        <div class="note">La categoria applica i preset (caption, zoom, look, musica e B-roll). Li puoi cambiare nei passi successivi.</div>`;
    },
    auto() {
      const st = A.S.status, a = W.auto;
      const t = (k, l, sub, dis) => `<label class="switch ${dis ? 'dis' : ''}"><span>${l}<small>${sub}</small></span><input type="checkbox" data-auto="${k}" ${a[k] && !dis ? 'checked' : ''} ${dis ? 'disabled' : ''}></label>`;
      return `
        <p class="muted small" style="margin-top:0">Scegli cosa fare e premi il pulsante: monto il reel in automatico. Dopo puoi ritoccare tutto nei passi successivi.</p>
        ${t('silence', '✂ Taglia silenzi e pause', 'Jump cut automatici sui tempi morti')}
        ${t('captions', '💬 Sottotitoli automatici', st.whisper ? 'Trascrizione con Whisper sul PC' : 'Whisper non installato: scrivi il testo al passo 4', !st.whisper)}
        ${t('color', '◐ Correggi colore e luce', 'Esposizione, contrasto, saturazione')}
        ${t('voice', '🎙 Pulisci la voce', 'Riduzione rumore + volume uniforme')}
        ${t('broll', '▣ B-roll dal tema', 'Inserti animati ogni ~5 secondi')}
        ${t('library', '📌 Usa i miei riferimenti', `${W.lib.filter(libMatch).length} file nella tua libreria per questa categoria`, !W.lib.filter(libMatch).length)}
        ${t('music', '♪ Musica dalla libreria', A.S.tracks.length ? `${A.S.tracks.length} brani disponibili · con ducking` : 'Carica un brano al passo 8', !A.S.tracks.length)}
        <button class="btn btn-lime magic" id="wz-magic" ${P().clips.length ? '' : 'disabled'}>✨ Fai tutto tu</button>
        <div class="auto-log" id="wz-log"></div>`;
    },
    captions() {
      const C = P().captions, sws = ['#ffd400', '#21d4a7', '#ff4d6d', '#7b61ff', '#ffffff', '#b6f24a', '#ff7a45', '#d9b46a', '#00b4ff'];
      return `
        ${sw('captions.enabled', 'Sottotitoli attivi')}
        <div class="pv-grid">${VRS.CAPTION_STYLES.map((s) => {
          const tip = (VRS.TRENDS.captions.find((x) => x.id === s.id) || {}).tip || s.desc;
          return `<button class="pv-card ${C.style === s.id ? 'active' : ''}" data-wset="captions.style" data-v='"${s.id}"'>
            <div class="pv-slot" data-pv="caption:${s.id}"></div><b>${s.name}</b><span>${A.esc(tip)}</span></button>`;
        }).join('')}</div>
        <div class="field"><label>Colore evidenziazione</label><div class="swatches">${sws.map((c) => `<button style="background:${c}" class="${C.accent === c ? 'active' : ''}" data-wset="captions.accent" data-v='"${c}"'></button>`).join('')}</div></div>
        ${range('captions.size', 'Dimensione', 0.6, 1.6, 0.05)}
        ${range('captions.position', 'Altezza sullo schermo', 0.15, 0.9, 0.01)}
        ${range('captions.maxWords', 'Parole per schermata', 1, 8, 1, (v) => v)}
        ${sw('captions.uppercase', 'TUTTO MAIUSCOLO')}
        ${sw('captions.sfx', 'Suono quando appare il testo', 'Pop/click/whoosh')}
        <details class="wdet"><summary>✏️ Scrivi o correggi il testo</summary>
          ${P().clips.map((c, i) => `<div class="field"><label>${i + 1}. ${A.esc(c.name)}</label>
            <textarea class="input" data-wtext="${c.id}" placeholder="Cosa si dice in questa clip…">${A.esc((c.words || []).map((w) => w.w).join(' '))}</textarea></div>`).join('')}
          <button class="btn-mini" id="wz-textok">Sincronizza testi</button>
        </details>`;
    },
    broll() {
      const p = P(), cat = A.cat(), trends = VRS.TRENDS.broll.filter((t) => t.use.includes(cat.id));
      return `
        <div class="row" style="margin-bottom:12px"><button class="btn btn-lime" id="wz-genbroll" style="justify-content:center">✨ Genera B-roll</button>
          <button class="btn btn-ghost" id="wz-addbroll" style="justify-content:center">＋ Aggiungi qui</button></div>
        <h6 class="wh">Trend consigliati per ${A.esc(cat.title)}</h6>
        <div class="pv-grid">${trends.map((t) => `<button class="pv-card" data-wtrend="${t.id}"><div class="pv-slot" data-pv="trend:${t.id}"></div><b>${t.name}</b><span>${A.esc(t.desc)}</span></button>`).join('')}</div>
        <h6 class="wh">I tuoi inserti</h6>
        ${p.broll.length ? p.broll.map((b, i) => brollRow(b, i)).join('') : '<div class="empty">Nessun B-roll: tocca “Genera B-roll” o un trend qui sopra.</div>'}`;
    },
    motion() {
      P()._motionSeen = true;
      return `
        <h6 class="wh">Stile zoom</h6>
        <div class="pv-grid">${VRS.MOTION_MODES.map((m) => `<button class="pv-card ${P().motion.mode === m.id ? 'active' : ''}" data-wset="motion.mode" data-v='"${m.id}"'>
          <div class="pv-slot" data-pv="motion:${m.id}"></div><b>${m.name}</b><span>${m.desc}</span></button>`).join('')}</div>
        ${range('motion.intensity', 'Intensità zoom', 0, 2, 0.05)}
        <h6 class="wh">Transizioni</h6>
        <div class="pv-grid">${VRS.TRANSITIONS.map((t) => `<button class="pv-card ${P().motion.transition === t.id ? 'active' : ''}" data-wset="motion.transition" data-v='"${t.id}"'>
          <div class="pv-slot" data-pv="trans:${t.id}"></div><b>${t.name}</b></button>`).join('')}</div>
        ${range('motion.transDur', 'Durata transizione (consigliato 0,2–0,4s)', 0.15, 1, 0.05, (v) => (+v).toFixed(2) + 's')}
        ${sw('motion.sfx', 'Whoosh sulle transizioni')}`;
    },
    look() {
      const p = P(); p._lookSeen = true;
      const snap = p.clips.length ? A.engine.snapshot(140) : '';
      return `
        <div class="pv-grid filters">${VRS.FILTERS.map((f) => `<button class="pv-card ${p.look.filter === f.id ? 'active' : ''}" data-wset="look.filter" data-v='"${f.id}"'>
          <div class="filter-thumb" style="${snap ? `background-image:url(${snap});` : 'background:linear-gradient(135deg,#ffb36b,#6b8cff);'}filter:brightness(${f.b}) contrast(${f.c}) saturate(${f.s}) sepia(${f.sep || 0}) hue-rotate(${f.hue || 0}deg)"></div><b>${f.name}</b></button>`).join('')}</div>
        ${range('look.intensity', 'Intensità filtro', 0, 1, 0.05)}
        ${range('look.vignette', 'Vignettatura', 0, 0.8, 0.05)}
        ${range('look.grain', 'Grana pellicola', 0, 0.3, 0.01)}
        <h6 class="wh">Correzione automatica</h6>
        ${sw('audio.autoColor', 'Auto colore & luce')}
        <div class="field"><label>LUT cinematografica</label><select class="select" data-wk="audio.lut"><option value="none">Nessuna</option>${(A.S.status.luts || []).map((l) => `<option ${p.audio.lut === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <button class="btn btn-lime" data-enhance-all style="width:100%;justify-content:center">✨ Applica correzione a tutte le clip</button>`;
    },
    audio() {
      const p = P(), M = p.music; p._audioSeen = true;
      return `
        <label class="btn btn-ghost" style="width:100%;justify-content:center"><input type="file" id="wz-music" accept="audio/*" hidden>＋ Carica un brano (mp3)</label>
        <div class="track-list">${A.S.tracks.map((t, i) => `<div class="track"><span class="tn">${A.esc(t.name)}</span>
          <button class="btn-mini ${M.url === t.url ? '' : 'ghost'}" data-wtrack="${i}">${M.url === t.url ? 'In uso ✓' : 'Usa'}</button></div>`).join('') || '<div class="empty">Nessun brano. I link ai trend sono nella pagina Musica.</div>'}
          ${M.url ? '<button class="btn-mini ghost" data-wtrack="-1">Togli la musica</button>' : ''}</div>
        ${M.url ? `${range('music.vol', 'Volume musica', 0, 1, 0.01)}${range('music.offset', 'Parti dal secondo', 0, 120, 0.5, (v) => (+v).toFixed(1) + 's')}` : ''}
        ${sw('music.ducking', 'Audio ducking', 'La musica si abbassa quando parli')}
        ${M.ducking ? range('music.duck', 'Volume musica durante la voce', 0, 0.8, 0.01) : ''}
        ${range('audio.voiceVol', 'Volume voce', 0, 2, 0.05)}
        ${sw('audio.cleanVoice', 'Pulizia voce', 'Riduzione rumore e compressione (FFmpeg)')}
        <button class="btn-mini" data-enhance-all>✨ Applica pulizia audio</button>`;
    },
    export() {
      const p = P();
      return `
        <ul class="recap">${STEPS.slice(0, -1).map((s) => `<li class="${done(s.id) ? 'ok' : ''}"><b>${s.title}</b><span>${A.esc(summary(s.id))}</span></li>`).join('')}</ul>
        <div class="field"><label>Formato</label><div class="opt-grid three">${['9:16', '4:5', '1:1'].map((f) => opt('format', f, `<b>${f}</b>`)).join('')}</div></div>
        ${sw('watermark.enabled', 'Logo Vell’s sul video')}
        <button class="btn btn-lime magic" id="wz-export" ${p.clips.length ? '' : 'disabled'}>Esporta MP4 ↗</button>
        <div class="note">Dal telefono tieni lo schermo acceso durante l'export. Alla fine tocca “Scarica”: su iPhone usa Condividi → <b>Salva video</b> per metterlo nel Rullino.</div>`;
    },
  };

  function filesHtml() {
    const p = P(), ups = Object.entries(A.S.uploading);
    return p.clips.map((c, i) => `<div class="wfile">
        ${c.thumb ? `<img src="${c.thumb}">` : '<div class="ph"></div>'}
        <div class="ci"><b>${i + 1}. ${A.esc(c.name)}</b><span>${c.kind === 'image' ? 'Foto' : 'Video'} · ${(c.kind === 'image' ? (c.dur || p.imageDuration) : c.out - c.in).toFixed(1)}s${c._job != null ? ' · elaboro…' : ''}</span></div>
        <button class="mini-ico" data-mv="${i}:-1" ${i ? '' : 'disabled'}>↑</button><button class="mini-ico" data-mv="${i}:1" ${i < p.clips.length - 1 ? '' : 'disabled'}>↓</button>
        <button class="mini-ico x" data-wrm="${c.id}">✕</button></div>`).join('') +
      ups.map(([id, u]) => `<div class="wfile"><div class="ph"></div><div class="ci"><b>${A.esc(u.name)}</b><div class="prog"><i style="width:${u.p * 100}%"></i></div></div></div>`).join('');
  }
  function brollRow(b, i) {
    const k = (x) => `broll.${i}.${x}`, sel = W.selBroll === b.id;
    const libItems = W.lib.filter(libMatch);
    return `<div class="broll-item ${sel ? 'sel' : ''}">
      <div class="bh" data-wbsel="${b.id}"><b>${i + 1}. ${A.esc(b.text || (b.kind === 'media' ? 'Clip' : 'Card'))}</b><span class="muted small">${b.start.toFixed(1)}s</span>
        <button class="btn-mini ghost" data-wbgo="${b.id}">▶</button><button class="btn-mini ghost" data-wbdel="${b.id}">✕</button></div>
      ${sel ? `
        <div class="row" style="margin-bottom:8px">${opt(k('kind'), 'card', '<b>Card</b>')}${opt(k('kind'), 'media', '<b>Clip / foto</b>')}</div>
        ${b.kind === 'card' ? `<div class="opt-grid">${VRS.BROLL_LAYOUTS.map((l) => opt(k('layout'), l.id, `<b>${l.name}</b><span>${l.desc}</span>`)).join('')}</div>` : `
          <div class="lib-pick">${libItems.map((x) => `<img src="${x.thumb}" data-wlib="${x.id}" class="${b.url === x.url ? 'on' : ''}">`).join('') || '<span class="muted small">Libreria vuota: aggiungi riferimenti nella pagina Trend.</span>'}</div>
          <label class="btn-mini ghost"><input type="file" data-wbfile="${b.id}" accept="video/*,image/*" hidden>＋ Carica un file</label>`}
        <div class="field"><label>Testo</label><input class="input" data-wk="${k('text')}" value="${A.esc(b.text)}"></div>
        <div class="field"><label>Sottotitolo / tag</label><input class="input" data-wk="${k('sub')}" value="${A.esc(b.sub)}"></div>
        <div class="row"><div class="field"><label>Inizio</label><input class="input" type="number" step="0.1" min="0" data-wk="${k('start')}" value="${b.start}"></div>
          <div class="field"><label>Durata</label><input class="input" type="number" step="0.1" min="0.3" data-wk="${k('dur')}" value="${b.dur}"></div></div>
        <div class="field"><label>Movimento</label><select class="select" data-wk="${k('motion')}">${VRS.BROLL_MOTIONS.map((m) => `<option value="${m.id}" ${b.motion === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select></div>
        ${b.kind === 'card' ? `<div class="opt-grid three">${opt(k('bg'), 'cat', '<b>Colore</b>')}${opt(k('bg'), 'dark', '<b>Scuro</b>')}${opt(k('bg'), 'light', '<b>Chiaro</b>')}</div>` : ''}
      ` : ''}</div>`;
  }
  const libMatch = (x) => x.category === 'all' || x.category === P().category;

  // ---------- eventi ----------
  function bind() {
    const root = $('#wiz-steps');
    $$('[data-toggle]', root).forEach((h) => (h.onclick = () => { W.open = W.open === h.dataset.toggle ? null : h.dataset.toggle; render(); scrollToStep(); }));
    $$('[data-next]', root).forEach((b) => (b.onclick = () => {
      const i = STEPS.findIndex((s) => s.id === b.dataset.next);
      if (b.dataset.next === 'cat') P()._catChosen = true;
      W.open = STEPS[i + 1].id; render(); scrollToStep();
    }));
    $$('[data-wk]', root).forEach((el) => {
      const ev = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        const k = el.dataset.wk, v = el.type === 'checkbox' ? el.checked : el.type === 'range' || el.type === 'number' ? +el.value : el.value;
        setK(P(), k, v);
        const sh = $(`[data-wshow="${k}"]`, root); if (sh) sh.textContent = el.closest('.field').querySelector('em').textContent = /maxWords/.test(k) ? v : /transDur/.test(k) ? (+v).toFixed(2) + 's' : /offset/.test(k) ? (+v).toFixed(1) + 's' : pct(v);
        A.changed(); if (ev === 'change') render();
      });
    });
    $$('[data-wset]', root).forEach((el) => (el.onclick = () => {
      setK(P(), el.dataset.wset, JSON.parse(el.dataset.v));
      if (el.dataset.wset === 'format') { A.engine.invalidate(); A.fitPreview(); }
      A.changed(); render();
    }));
  }
  function scrollToStep() { const el = $(`[data-step="${W.open}"]`); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }

  const AFTER = {
    files() {
      $('#wz-up').onchange = (e) => { A.addFiles(e.target.files); e.target.value = ''; };
      A.setupDrop($('#wz-drop'), A.addFiles);
      bindFiles();
    },
    cat() {
      $$('[data-wcat]').forEach((b) => (b.onclick = () => { P()._catChosen = true; A.applyCategory(b.dataset.wcat); render(); }));
    },
    auto() {
      $$('[data-auto]').forEach((el) => (el.onchange = () => (W.auto[el.dataset.auto] = el.checked)));
      $('#wz-magic').onclick = runAuto;
    },
    captions() {
      const ok = $('#wz-textok'); if (ok) ok.onclick = () => {
        $$('[data-wtext]').forEach((ta) => { const c = P().clips.find((x) => x.id === ta.dataset.wtext); if (c) A.applyText(c, ta.value); });
        A.changed(); A.toast('Testi sincronizzati ✓'); render();
      };
    },
    broll() {
      $('#wz-genbroll').onclick = () => { autoBroll(W.auto.library); render(); };
      $('#wz-addbroll').onclick = () => addBroll(A.cat().broll[P().broll.length % A.cat().broll.length]);
      $$('[data-wtrend]').forEach((b) => (b.onclick = () => {
        const t = VRS.TRENDS.broll.find((x) => x.id === b.dataset.wtrend), tpl = A.cat().broll.find((x) => (x.layout || 'title') === t.layout) || A.cat().broll[0];
        const media = W.lib.filter((x) => libMatch(x) && x.trend === t.id)[0];
        addBroll(Object.assign({}, tpl, { layout: t.layout, motion: t.motion }), media);
        A.toast(`Aggiunto “${t.name}” alla testina`);
      }));
      $$('[data-wbsel]').forEach((el) => (el.onclick = (e) => { if (e.target.closest('button')) return; W.selBroll = W.selBroll === el.dataset.wbsel ? null : el.dataset.wbsel; render(); }));
      $$('[data-wbgo]').forEach((b) => (b.onclick = () => { const x = P().broll.find((y) => y.id === b.dataset.wbgo); A.engine.seek(x.start + 0.5); }));
      $$('[data-wbdel]').forEach((b) => (b.onclick = () => { P().broll = P().broll.filter((y) => y.id !== b.dataset.wbdel); A.engine.gc(); A.changed(); render(); }));
      $$('[data-wlib]').forEach((img) => (img.onclick = () => {
        const x = W.lib.find((y) => y.id === img.dataset.wlib), b = P().broll.find((y) => y.id === W.selBroll);
        Object.assign(b, { url: x.url, mediaKind: x.kind }); A.changed(); render(); A.engine.seek(b.start + 0.5);
      }));
      $$('[data-wbfile]').forEach((inp) => (inp.onchange = async () => {
        const f = inp.files[0], b = P().broll.find((y) => y.id === inp.dataset.wbfile);
        A.toast('Carico ' + A.esc(f.name) + '…');
        const it = await A.uploadFile(f); let url = it.url; if (it.jobId) url = (await A.waitJob(it.jobId)).url;
        Object.assign(b, { url, mediaKind: it.kind === 'image' ? 'image' : 'video' }); A.changed(); render();
      }));
    },
    audio() {
      $('#wz-music').onchange = async (e) => { const t = await A.uploadTrack(e.target.files[0]); A.useTrack(t); render(); };
      $$('[data-wtrack]').forEach((b) => (b.onclick = () => { const i = +b.dataset.wtrack; A.useTrack(i < 0 ? null : A.S.tracks[i]); render(); }));
    },
    export() { $('#wz-export').onclick = () => $('#btn-export').click(); },
  };
  function bindFiles() {
    $$('[data-mv]').forEach((b) => (b.onclick = () => {
      const [i, d] = b.dataset.mv.split(':').map(Number), arr = P().clips;
      [arr[i], arr[i + d]] = [arr[i + d], arr[i]]; A.changed(); refreshFiles();
    }));
    $$('[data-wrm]').forEach((b) => (b.onclick = () => { P().clips = P().clips.filter((c) => c.id !== b.dataset.wrm); A.engine.gc(); A.changed(); refreshFiles(); }));
  }
  function refreshFiles() {
    const box = $('#wz-files'); if (box) { box.innerHTML = filesHtml(); bindFiles(); }
    const h = $('[data-step="files"] .wtt span'); if (h) h.textContent = summary('files');
    updateProgress();
  }

  // ---------- B-roll ----------
  function addBroll(t, media, start) {
    const b = { id: A.uid(), kind: media ? 'media' : 'card', layout: t.layout || 'title', start: +(start ?? A.engine.t).toFixed(2), dur: t.layout === 'list' ? 3 : 2,
      text: media ? '' : t.text, sub: media ? '' : t.sub, motion: t.motion, query: t.query, bg: 'cat', textSize: 1 };
    if (media) Object.assign(b, { url: media.url, mediaKind: media.kind });
    P().broll.push(b); P().broll.sort((a, c) => a.start - c.start); W.selBroll = b.id; A.changed(); render();
    return b;
  }
  function autoBroll(useLib) {
    const total = A.engine.duration; if (!total) return A.toast('Carica prima i file', true);
    const c = A.cat(), pages = A.engine.pages();
    const media = useLib ? W.lib.filter(libMatch).sort(() => Math.random() - 0.5) : [];
    const n = Math.max(1, Math.min(6, Math.floor((total - 2) / 5)));
    P().broll = [];
    for (let i = 0; i < n; i++) {
      let start = n === 1 ? Math.min(total * 0.4, total - 2.2) : 2 + (total - 4.5) * (i / (n - 1));
      const near = pages.reduce((best, pg) => (!best || Math.abs(pg.t0 - start) < Math.abs(best.t0 - start) ? pg : best), null);
      if (near && Math.abs(near.t0 - start) < 1.5) start = near.t0;
      const t = c.broll[i % c.broll.length], m = i % 2 === 0 && media.length ? media.pop() : null;
      const b = { id: A.uid(), kind: m ? 'media' : 'card', layout: m ? 'title' : t.layout || 'title', start: +Math.max(0, start).toFixed(2), dur: !m && t.layout === 'list' ? 3 : 2,
        text: m ? '' : t.text, sub: m ? '' : t.sub, motion: t.motion, query: t.query, bg: 'cat', textSize: 1 };
      if (m) Object.assign(b, { url: m.url, mediaKind: m.kind });
      P().broll.push(b);
    }
    A.changed();
    return n;
  }

  // ---------- pilota automatico ----------
  async function runAuto() {
    const p = P(), a = W.auto, log = $('#wz-log'), btn = $('#wz-magic');
    btn.disabled = true;
    const line = (txt) => { const d = document.createElement('div'); d.textContent = '⏳ ' + txt; log.appendChild(d); return { ok: (t) => (d.textContent = '✅ ' + (t || txt)), err: (t) => (d.textContent = '⚠️ ' + t) }; };
    try {
      if (a.color || a.voice) {
        const l = line('Correzione colore e audio…');
        Object.assign(p.audio, { autoColor: a.color, cleanVoice: a.voice, normalize: a.voice });
        await A.enhance(p.clips.filter((c) => c.url === c.original)); l.ok('Colore e audio corretti');
      }
      if (a.captions && A.S.status.whisper) {
        const l = line('Trascrizione con Whisper…');
        await A.transcribe(p.clips.filter((c) => c.kind === 'video' && !(c.words || []).length)); l.ok('Sottotitoli generati');
      }
      if (a.silence) {
        const l = line('Cerco silenzi e pause…');
        const cut = await removeSilences(); l.ok(cut ? `Tolti ${cut.toFixed(1)}s di pause` : 'Nessuna pausa da tagliare');
      }
      if (a.broll) { const n = autoBroll(a.library); line('').ok(`${n} B-roll inseriti`); }
      if (a.music && A.S.tracks.length && !p.music.url) {
        const t = A.S.tracks.find((x) => x.category === p.category) || A.S.tracks[0];
        A.useTrack(t); p.music.ducking = true; line('').ok(`Musica: ${t.name} (con ducking)`);
      }
      p._autoDone = true; A.changed();
      line('').ok('Fatto! Controlla l’anteprima e ritocca i passi successivi.');
      A.engine.seek(0);
    } catch (e) { line('').err(e.message); }
    btn.disabled = false;
    setTimeout(render, 1200);
  }
  async function removeSilences() {
    const p = P(), out = []; let removed = 0;
    const cache = {};
    for (const c of p.clips) {
      if (c.kind !== 'video') { out.push(c); continue; }
      let sil = cache[c.original];
      if (!sil) { try { sil = cache[c.original] = (await A.api('/api/silences', { method: 'POST', body: { source: c.original } })).silences; } catch { sil = []; } }
      const pad = 0.1, keep = []; let t = c.in;
      for (const s of sil) {
        const a = Math.max(c.in, s.start + pad), b = Math.min(c.out, s.end - pad);
        if (b - a < 0.3) continue;
        if (a - t > 0.25) keep.push([t, a]);
        t = b;
      }
      if (c.out - t > 0.25) keep.push([t, c.out]);
      if (!keep.length) { out.push(c); continue; }
      removed += (c.out - c.in) - keep.reduce((x, k) => x + k[1] - k[0], 0);
      keep.forEach(([a, b], i) => { const d = i ? JSON.parse(JSON.stringify(c)) : c; if (i) d.id = A.uid(); d.in = a; d.out = b; out.push(d); });
    }
    p.clips = out; A.changed();
    return removed;
  }

  // ---------- vista ----------
  async function show() {
    try { W.lib = await A.api('/api/library'); } catch { W.lib = []; }
    const ph = $('#wiz-phone');
    if (A.engine.canvas.parentElement !== ph) ph.prepend(A.engine.canvas);
    if (!P().clips.length) W.open = 'files';
    render();
    setTimeout(A.fitPreview, 30);
  }
  VRS.views = VRS.views || {};
  VRS.views.crea = show;
  VRS.onChange = () => {
    if (A.S.view !== 'crea') return;
    const t = $('#wiz-time'); if (t) t.textContent = `${A.fmt(A.engine.t)} / ${A.fmt(A.engine.duration)}`;
    STEPS.forEach((s) => { const el = $(`[data-step="${s.id}"]`); if (el) { el.classList.toggle('done', !!done(s.id)); const sp = $('.wtt span', el); if (sp) sp.textContent = summary(s.id); } });
    updateProgress();
  };
  VRS.onBin = () => { if (A.S.view === 'crea' && W.open === 'files') refreshFiles(); };
  VRS.wizard = { autoBroll, killPreviews, render };

  VRS.onAppReady = () => {
    A = window.VRS_APP;
    $('#wiz-play').onclick = () => A.engine.toggle();
    A.engine.on('state', (pl) => ($('#wiz-play').textContent = pl ? '❚❚' : '▶'));
    A.engine.on('time', (t) => { $('#wiz-time').textContent = `${A.fmt(t)} / ${A.fmt(A.engine.duration)}`; $('#wiz-scrub').value = A.engine.duration ? t / A.engine.duration * 1000 : 0; });
    $('#wiz-scrub').oninput = (e) => A.engine.seek(e.target.value / 1000 * A.engine.duration);
    $('#wiz-title').oninput = (e) => { P().name = e.target.value; A.changed(); };
    $('#wiz-collapse').onclick = () => document.body.classList.toggle('pv-mini');
    $('#wiz-pro').onclick = () => A.go('editor');
    // quando il nome categoria cambia dal pannello pro, aggiorna
    document.addEventListener('visibilitychange', () => { if (document.hidden && A.engine.playing && !A.engine._exporting) A.engine.pause(); });
  };
})();
