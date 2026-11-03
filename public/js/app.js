// Vels Reel Studio — interfaccia
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (t) => { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`; };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('vrs:' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vrs:' + k, JSON.stringify(v)); } catch {} },
  };

  // ---------- API ----------
  async function api(path, { method = 'GET', body, raw } = {}) {
    const opts = { method };
    if (raw) opts.body = raw; else if (body) { opts.body = JSON.stringify(body); opts.headers = { 'Content-Type': 'application/json' }; }
    const r = await fetch(path, opts);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Errore ' + r.status);
    return j;
  }
  async function waitJob(jobId, onProgress) {
    for (;;) {
      const j = await api('/api/job?id=' + jobId);
      onProgress && onProgress(j.progress || 0);
      if (j.status === 'done') return j.result;
      if (j.status === 'error') throw new Error(j.error);
      await new Promise((r) => setTimeout(r, 700));
    }
  }
  function uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('POST', '/api/upload?name=' + encodeURIComponent(file.name));
      x.upload.onprogress = (e) => e.lengthComputable && onProgress && onProgress(e.loaded / e.total);
      x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve(j) : reject(new Error(j.error)); } catch (e) { reject(e); } };
      x.onerror = () => reject(new Error('Upload fallito'));
      x.send(file);
    });
  }
  function toast(msg, err) {
    const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.innerHTML = msg;
    $('#toasts').appendChild(d); setTimeout(() => d.remove(), err ? 7000 : 3800);
  }
  function modal(html) { $('#modal-card').innerHTML = html; $('#modal').classList.add('open'); return $('#modal-card'); }
  function closeModal() { $('#modal').classList.remove('open'); }
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' && !$('#modal').dataset.lock) closeModal(); });

  // ---------- stato ----------
  const S = {
    project: VRS.newProject('medico'),
    view: 'dash', tab: 'stile', selClip: null, selBroll: null,
    walletSel: store.get('walletSel', 'medico'),
    tlZoom: 60, status: {}, uploading: {},
    settings: store.get('settings', { pexelsKey: '', sfxVol: 0.7 }),
    tracks: store.get('tracks', []),
  };
  const engine = new VRS.Engine($('#preview'));
  engine.setProject(S.project);
  const cat = () => VRS.CATEGORIES.find((c) => c.id === S.project.category) || VRS.CATEGORIES[0];

  function getK(obj, k) { return k.split('.').reduce((o, p) => (o == null ? o : o[p]), obj); }
  function setK(obj, k, v) { const ps = k.split('.'), last = ps.pop(); const o = ps.reduce((o, p) => (o[p] = o[p] || {}), obj); o[last] = v; }

  let saveTimer;
  function changed({ panel = false, timeline = true, bin = false } = {}) {
    engine.invalidate();
    engine._events = null;
    if (timeline) renderTimeline();
    if (panel) renderPanel();
    if (bin) renderBin();
    updateTime();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProject(true), 1500);
  }

  // ---------- navigazione ----------
  function go(view) {
    S.view = view;
    $$('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
    if (view === 'dash') renderDash();
    if (view === 'editor') { renderEditor(); setTimeout(fitPreview, 30); }
    if (view === 'music') renderMusic();
    if (view === 'exports') renderExports();
    if (view !== 'editor' && engine.playing) engine.pause();
  }
  $$('#nav button').forEach((b) => (b.onclick = () => go(b.dataset.view)));
  document.addEventListener('click', (e) => { const g = e.target.closest('[data-goto]'); if (g) go(g.dataset.goto); });

  function fitPreview() {
    const ph = $('.phone');
    ph.classList.toggle('f45', S.project.format === '4:5');
    ph.classList.toggle('f11', S.project.format === '1:1');
    const w = ph.clientWidth || 360;
    const scale = Math.min(1, (w * (window.devicePixelRatio || 1)) / engine.W);
    engine.resize(Math.max(0.3, scale));
  }
  window.addEventListener('resize', () => S.view === 'editor' && fitPreview());

  // ================= DASHBOARD =================
  async function renderDash() {
    // wallet categorie
    const order = VRS.CATEGORIES.filter((c) => c.id !== S.walletSel).concat(VRS.CATEGORIES.filter((c) => c.id === S.walletSel));
    $('#wallet').innerHTML = order.map((c, i) => `
      <div class="wcard" data-cat="${c.id}" style="background:${c.gradient};top:${i * 20}px;z-index:${i};transform:scale(${0.9 + i * 0.025})">
        <span class="wico">${c.icon}</span><small>${esc(c.tag)}</small><b>${esc(c.title)}</b>
      </div>`).join('');
    $$('#wallet .wcard').forEach((el) => (el.onclick = () => { S.walletSel = el.dataset.cat; store.set('walletSel', S.walletSel); renderDash(); }));
    const wc = VRS.CATEGORIES.find((c) => c.id === S.walletSel);
    $('#wallet-info').innerHTML = `<h4>${esc(wc.title)}</h4><p>${esc(wc.desc)}</p>
      <button class="btn btn-white" data-new="${wc.id}">Crea reel <span class="btn-ico">＋</span></button>`;

    $('#cat-grid').innerHTML = VRS.CATEGORIES.map((c) => `
      <div class="cat" data-new="${c.id}">
        <div class="cat-ico" style="background:${c.gradient}">${c.icon}</div>
        <span class="tagline">${esc(c.tag)}</span><b>${esc(c.title)}</b><span>${esc(c.desc)}</span>
      </div>`).join('');

    const srcs = VRS.MUSIC_SOURCES;
    $('#src-icons').innerHTML = srcs.map((s) => `<i style="background:${s.color}">${s.name[0]}</i>`).join('');
    $('#src-list').innerHTML = srcs.slice(0, 4).map(srcItem).join('');

    try {
      const [projects, exportsL] = await Promise.all([api('/api/projects'), api('/api/exports')]);
      $('#stat-projects').textContent = projects.length;
      $('#stat-exports').textContent = exportsL.length;
      $('#recent-count').textContent = projects.length;
      $('#recent-list').innerHTML = projects.length ? projects.slice(0, 8).map((p) => {
        const c = VRS.CATEGORIES.find((x) => x.id === p.category) || VRS.CATEGORIES[0];
        return `<div class="recent-row" data-open="${p.id}">
          ${p.thumb ? `<img src="${p.thumb}">` : '<div class="ph"></div>'}
          <div><b>${esc(p.name)}</b><div class="muted small">${p.clips} clip</div></div>
          <span class="status-pill" style="background:${c.gradient}">${esc(c.title)}</span>
          <span class="muted small">${new Date(p.updated).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</span>
          <b>${fmt(p.duration)}</b>
          <button class="link" data-del="${p.id}" title="Elimina">✕</button>
        </div>`;
      }).join('') : '<div class="empty">Nessun progetto ancora. Scegli un format e carica i tuoi video ✨</div>';
    } catch (e) { $('#recent-list').innerHTML = `<div class="empty">Server non raggiungibile: ${esc(e.message)}</div>`; }
  }
  function srcItem(s) {
    return `<a class="src-item" href="${s.url}" target="_blank" rel="noopener">
      <span class="sico" style="background:${s.color}">${s.name[0]}</span>
      <span class="stxt"><b>${esc(s.name)}</b><span>${esc(s.desc)}</span></span><span class="sbadge">${s.badge}</span></a>`;
  }
  document.addEventListener('click', async (e) => {
    const n = e.target.closest('[data-new]'); if (n) { newProject(n.dataset.new); go('editor'); return; }
    const d = e.target.closest('[data-del]');
    if (d) { e.stopPropagation(); if (confirm('Eliminare il progetto?')) { await api('/api/project?id=' + d.dataset.del, { method: 'DELETE' }); renderDash(); } return; }
    const o = e.target.closest('[data-open]'); if (o) { await openProject(o.dataset.open); go('editor'); }
  });
  $('#hero-new').onclick = () => { newProject(S.walletSel); go('editor'); };
  $('#hero-upload').onchange = (e) => { newProject(S.walletSel); go('editor'); addFiles(e.target.files); e.target.value = ''; };
  $('#btn-refresh').onclick = renderDash;

  function newProject(catId) {
    engine.pause();
    S.project = VRS.newProject(catId);
    S.selClip = S.selBroll = null; S.tab = 'stile';
    engine.setProject(S.project); engine.setMusic(null); engine.gc(); engine.seek(0);
  }
  async function openProject(id) {
    const p = await api('/api/project?id=' + id);
    const base = VRS.newProject(p.category);
    for (const k of ['captions', 'motion', 'look', 'audio', 'music', 'watermark']) p[k] = Object.assign(base[k], p[k]);
    S.project = Object.assign(base, p);
    S.selClip = S.selBroll = null;
    engine.setProject(S.project); engine.setMusic(S.project.music.url); engine.gc(); engine.seek(0);
  }
  async function saveProject(silent) {
    const p = S.project;
    if (!p.clips.length && !p.id) return;
    try {
      p.durationCache = engine.duration;
      if (p.clips.length) p.thumb = engine.snapshot(160);
      const r = await api('/api/project', { method: 'POST', body: p });
      p.id = r.id;
      if (!silent) toast('Progetto salvato ✓');
    } catch (e) { if (!silent) toast('Salvataggio fallito: ' + esc(e.message), true); }
  }

  // ================= EDITOR =================
  function renderEditor() {
    $('#proj-name').value = S.project.name;
    $('#proj-format').value = S.project.format;
    const c = cat();
    $('#proj-cat-chip').innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${c.gradient}"></span>${esc(c.title)}`;
    renderBin(); renderPanel(); renderTimeline(); updateTime();
  }
  $('#proj-name').oninput = (e) => { S.project.name = e.target.value; changed({ timeline: false }); };
  $('#proj-format').onchange = (e) => { S.project.format = e.target.value; engine.invalidate(); fitPreview(); changed(); };
  $('#btn-save').onclick = () => saveProject(false);

  // ----- upload & media bin -----
  async function addFiles(files) {
    files = [...files];
    for (const f of files) {
      const tmpId = uid();
      S.uploading[tmpId] = { name: f.name, p: 0 };
      renderBin();
      try {
        const item = await uploadFile(f, (p) => { S.uploading[tmpId].p = p * 0.9; renderUploadProgress(tmpId); });
        if (item.kind === 'audio') { addTrack({ name: item.name, url: item.url }); toast('Audio aggiunto alla libreria musicale'); delete S.uploading[tmpId]; renderBin(); continue; }
        const clip = {
          id: uid(), kind: item.kind, name: item.name, url: item.url, original: item.url, thumb: item.thumb,
          srcDur: item.duration || 0, in: 0, out: item.duration || 0, dur: item.kind === 'image' ? S.project.imageDuration : undefined,
          w: item.width, h: item.height, words: [], volume: 1, muted: false,
          fit: item.width && item.height && item.width / item.height > 0.8 && S.project.format === '9:16' ? 'blur' : 'cover',
        };
        if (item.jobId) {
          S.uploading[tmpId].name = 'Conversione ' + f.name;
          const r = await waitJob(item.jobId, (p) => { S.uploading[tmpId].p = 0.9 + p * 0.1; renderUploadProgress(tmpId); });
          clip.url = clip.original = r.url;
        }
        S.project.clips.push(clip);
        delete S.uploading[tmpId];
        changed({ bin: true });
      } catch (e) { delete S.uploading[tmpId]; renderBin(); toast('Errore caricando ' + esc(f.name) + ': ' + esc(e.message), true); }
    }
  }
  function renderUploadProgress(id) { const el = $(`[data-up="${id}"] .prog i`); if (el) el.style.width = (S.uploading[id].p * 100).toFixed(0) + '%'; }
  function renderBin() {
    const p = S.project;
    const ups = Object.entries(S.uploading).map(([id, u]) => `<div class="clip-item" data-up="${id}"><div class="ph"></div><div class="ci"><b>${esc(u.name)}</b><span>Caricamento…</span><div class="prog"><i style="width:${u.p * 100}%"></i></div></div></div>`).join('');
    $('#clip-list').innerHTML = p.clips.map((c, i) => `
      <div class="clip-item ${S.selClip === c.id ? 'sel' : ''}" draggable="true" data-clip="${c.id}">
        ${c.thumb ? `<img src="${c.thumb}">` : '<div class="ph"></div>'}
        <div class="ci"><b>${i + 1}. ${esc(c.name)}</b>
          <span>${c.kind === 'image' ? 'Foto · ' + (c.dur || p.imageDuration).toFixed(1) + 's' : 'Video · ' + (c.out - c.in).toFixed(1) + 's'}${c.words && c.words.length ? ' · 💬' : ''}${c.url !== c.original ? ' · ✨' : ''}</span>
          ${c._job != null ? `<div class="prog"><i style="width:${c._job * 100}%"></i></div>` : ''}
        </div>
        <button class="x" data-rm="${c.id}" title="Rimuovi">✕</button>
      </div>`).join('') + ups;
    if (!p.clips.length && !ups) $('#clip-list').innerHTML = '<div class="empty">Nessuna clip.<br>Carica uno o più video/foto.</div>';
    let dragId = null;
    $$('#clip-list [data-clip]').forEach((el) => {
      el.onclick = (e) => {
        if (e.target.closest('[data-rm]')) return;
        S.selClip = el.dataset.clip; S.selBroll = null; S.tab = 'clip';
        const seg = engine.layout().segs.find((s) => s.clip.id === S.selClip); if (seg) engine.seek(seg.start + 0.01);
        renderBin(); renderPanel(); renderTimeline();
      };
      el.ondragstart = () => (dragId = el.dataset.clip);
      el.ondragover = (e) => { e.preventDefault(); el.classList.add('dragover'); };
      el.ondragleave = () => el.classList.remove('dragover');
      el.ondrop = (e) => {
        e.preventDefault(); el.classList.remove('dragover');
        if (!dragId || dragId === el.dataset.clip) return;
        const arr = p.clips, from = arr.findIndex((c) => c.id === dragId), to = arr.findIndex((c) => c.id === el.dataset.clip);
        const [m] = arr.splice(from, 1); arr.splice(to, 0, m); changed({ bin: true });
      };
    });
    $$('#clip-list [data-rm]').forEach((b) => (b.onclick = () => {
      p.clips = p.clips.filter((c) => c.id !== b.dataset.rm);
      if (S.selClip === b.dataset.rm) { S.selClip = null; if (S.tab === 'clip') S.tab = 'stile'; }
      engine.gc(); changed({ bin: true, panel: true });
    }));
  }
  $('#bin-upload').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
  function setupDrop(el, onFiles) {
    el.addEventListener('dragover', (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); el.classList.add('over'); } });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', (e) => { if (!e.dataTransfer.files.length) return; e.preventDefault(); el.classList.remove('over'); onFiles(e.dataTransfer.files); });
  }
  setupDrop($('#dropzone'), addFiles);
  setupDrop($('.phone'), addFiles);
  setupDrop($('#clip-list'), addFiles);

  // ----- trasporto -----
  $('#btn-play').onclick = () => engine.toggle();
  $('#btn-back').onclick = () => engine.seek(0);
  engine.on('state', (pl) => ($('#btn-play').textContent = pl ? '❚❚' : '▶'));
  engine.on('time', updateTime);
  function updateTime() {
    $('#timecode').textContent = `${fmt(engine.t)} / ${fmt(engine.duration)}`;
    $('#tl-playhead').style.left = engine.t * S.tlZoom + 'px';
    $('#duck-bar').style.width = ((engine._duckLevel ?? 1) * 100) + '%';
    if (engine.playing) {
      const sc = $('#tl-scroll'), x = engine.t * S.tlZoom;
      if (x > sc.scrollLeft + sc.clientWidth - 60) sc.scrollLeft = x - 60;
    }
  }
  document.addEventListener('keydown', (e) => {
    if (S.view !== 'editor' || e.target.closest('input,textarea,select')) return;
    if (e.code === 'Space') { e.preventDefault(); engine.toggle(); }
    if (e.key === 's' || e.key === 'S') splitAtPlayhead();
    if (e.key === 'ArrowLeft') engine.seek(engine.t - (e.shiftKey ? 1 : 1 / 30));
    if (e.key === 'ArrowRight') engine.seek(engine.t + (e.shiftKey ? 1 : 1 / 30));
  });
  function splitAtPlayhead() {
    const s = engine.segAt(engine.t); if (!s) return;
    const off = engine.t - s.start; if (off < 0.15 || s.dur - off < 0.15) return toast('Sposta la testina dentro una clip', true);
    const c = s.clip, copy = JSON.parse(JSON.stringify(c)); copy.id = uid();
    if (c.kind === 'video') { copy.in = c.in + off; c.out = c.in + off; } else { copy.dur = s.dur - off; c.dur = off; }
    S.project.clips.splice(S.project.clips.indexOf(c) + 1, 0, copy);
    changed({ bin: true }); toast('Clip divisa ✂');
  }

  // ----- timeline -----
  $('#tl-zoom').oninput = (e) => { S.tlZoom = +e.target.value; renderTimeline(); updateTime(); };
  function renderTimeline() {
    const z = S.tlZoom, p = S.project, { segs, total } = engine.layout();
    const width = Math.max((total + 4) * z, $('#tl-scroll').clientWidth);
    $('#tl-inner').style.width = width + 'px';
    const step = z > 90 ? 1 : z > 40 ? 2 : 5;
    let r = ''; for (let t = 0; t <= total + 4; t += step) r += `<span style="left:${t * z}px">${fmt(t).slice(0, 5)}</span>`;
    $('#tl-ruler').innerHTML = r;
    $('#tr-video').innerHTML = segs.map((s) => `<div class="tl-block v ${S.selClip === s.clip.id ? 'sel' : ''}" data-tclip="${s.clip.id}"
      style="left:${s.start * z}px;width:${s.dur * z - 2}px;${s.clip.thumb ? `background-image:url('${s.clip.thumb}')` : ''}">${esc(s.clip.name)}</div>`).join('');
    $('#tr-broll').innerHTML = p.broll.map((b) => `<div class="tl-block b ${S.selBroll === b.id ? 'sel' : ''}" data-tbroll="${b.id}"
      style="left:${b.start * z}px;width:${Math.max(8, b.dur * z - 2)}px">${esc(b.text || (b.kind === 'media' ? 'Media' : 'Card'))}</div>`).join('');
    $('#tr-text').innerHTML = p.captions.enabled ? engine.pages().map((pg) => `<div class="tl-block t" style="left:${pg.t0 * z}px;width:${Math.max(4, (pg.t1 - pg.t0) * z - 1)}px" title="${esc(pg.words.map((w) => w.w).join(' '))}">${esc(pg.words.map((w) => w.w).join(' '))}</div>`).join('') : '';
    $('#tr-music').innerHTML = p.music.url ? `<div class="tl-block m" style="left:0;width:${total * z}px">♪ ${esc(p.music.name || 'Musica')} ${p.music.ducking ? '· ducking' : ''}</div>` : '';
    $$('[data-tclip]').forEach((el) => (el.onclick = () => {
      S.selClip = el.dataset.tclip; S.selBroll = null; S.tab = 'clip'; renderBin(); renderPanel(); renderTimeline();
    }));
    $$('[data-tbroll]').forEach((el) => {
      el.onmousedown = (e) => {
        const b = p.broll.find((x) => x.id === el.dataset.tbroll), x0 = e.clientX, s0 = b.start;
        let moved = false;
        const mv = (ev) => { const d = (ev.clientX - x0) / z; if (Math.abs(ev.clientX - x0) > 3) moved = true; b.start = Math.max(0, +(s0 + d).toFixed(2)); el.style.left = b.start * z + 'px'; engine.requestDraw(); };
        const up = () => {
          document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
          S.selBroll = b.id; S.selClip = null; S.tab = 'broll';
          if (!moved) engine.seek(b.start + 0.3);
          changed({ panel: true });
        };
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
      };
    });
  }
  // scrub cliccando su righello/tracce
  $('#tl-inner').addEventListener('mousedown', (e) => {
    if (e.target.closest('[data-tbroll],[data-tclip]')) return;
    const rect = $('#tl-inner').getBoundingClientRect();
    const seek = (ev) => engine.seek((ev.clientX - rect.left) / S.tlZoom);
    seek(e);
    const up = () => { document.removeEventListener('mousemove', seek); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', seek); document.addEventListener('mouseup', up);
  });

  // ================= PANNELLI =================
  $$('#tabs button').forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; renderPanel(); }));
  const sw = (k, label, sub) => `<label class="switch"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-k="${k}" ${getK(S.project, k) ? 'checked' : ''}></label>`;
  const range = (k, label, min, max, step, f = (v) => v) => {
    const v = getK(S.project, k);
    return `<div class="field"><label>${label}<em data-show="${k}">${f(v)}</em></label><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${v}" data-f="${f.name || ''}"></div>`;
  };
  const pct = (v) => Math.round(v * 100) + '%';
  const sec = (v) => (+v).toFixed(2) + 's';
  const FMT = { pct, sec };
  const optBtn = (k, v, inner, extra = '') => `<button class="opt ${getK(S.project, k) === v ? 'active' : ''}" data-set="${k}" data-v='${JSON.stringify(v)}' ${extra}>${inner}</button>`;
  const select = (k, opts) => `<select class="select" data-k="${k}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${getK(S.project, k) === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;

  function renderPanel() {
    $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === S.tab));
    const P = PANELS[S.tab] || PANELS.stile;
    $('#panel').innerHTML = P();
    bindPanel();
    const after = AFTER[S.tab]; after && after();
  }
  function bindPanel() {
    $$('#panel [data-k]').forEach((el) => {
      const ev = el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'color' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        const k = el.dataset.k;
        let v = el.type === 'checkbox' ? el.checked : el.type === 'range' || el.type === 'number' ? +el.value : el.value;
        setK(S.project, k, v);
        const show = $(`#panel [data-show="${k}"]`);
        if (show) show.textContent = (FMT[el.dataset.f] || ((x) => x))(v);
        if (el.dataset.rerender != null || el.type === 'checkbox' || el.tagName === 'SELECT') changed({ panel: true }); else changed();
      });
    });
    $$('#panel [data-set]').forEach((el) => (el.onclick = () => { setK(S.project, el.dataset.set, JSON.parse(el.dataset.v)); changed({ panel: true }); }));
  }

  const PANELS = {
    stile() {
      const p = S.project;
      return `
      <div class="sec"><h5>Categoria</h5><div class="opt-grid">
        ${VRS.CATEGORIES.map((c) => `<button class="opt ${p.category === c.id ? 'active' : ''}" data-cat-apply="${c.id}">
          <div class="prev" style="background:${c.gradient};color:#111;font-weight:800">${c.icon}</div><b>${esc(c.title)}</b><span>${esc(c.tag)}</span></button>`).join('')}
      </div><div class="note" style="margin-top:10px">Scegliendo una categoria applico i suoi preset (sottotitoli, ritmo, look, volume musica). Puoi cambiare tutto dopo.</div></div>
      <div class="sec"><h5>Durata foto (slideshow)</h5>${range('imageDuration', 'Ogni foto', 0.8, 6, 0.1, sec)}
        <button class="btn-mini ghost" id="apply-imgdur">Applica a tutte le foto</button></div>
      <div class="sec"><h5>Logo Vell's sul video</h5>
        ${sw('watermark.enabled', 'Mostra logo', 'Watermark sul reel')}
        ${p.watermark.enabled ? `<div class="opt-grid" style="margin-bottom:10px">
          ${[['top-left', '↖ Alto sx'], ['top-right', '↗ Alto dx'], ['bottom-left', '↙ Basso sx'], ['bottom-right', '↘ Basso dx']].map(([v, l]) => optBtn('watermark.pos', v, `<b>${l}</b>`)).join('')}
        </div>
        <div class="row" style="margin-bottom:10px">${optBtn('watermark.variant', 'white', '<b>Bianco</b>')}${optBtn('watermark.variant', 'black', '<b>Nero</b>')}</div>
        ${range('watermark.opacity', 'Opacità', 0.2, 1, 0.05, pct)}${range('watermark.size', 'Dimensione', 0.06, 0.3, 0.01, pct)}` : ''}
      </div>`;
    },
    testi() {
      const p = S.project, C = p.captions;
      const swatches = ['#ffd400', '#21d4a7', '#ff4d6d', '#7b61ff', '#ffffff', '#b6f24a', '#ff7a45', '#d9b46a', '#00b4ff'];
      return `
      ${sw('captions.enabled', 'Sottotitoli attivi', 'Caption animate sul video')}
      <div class="sec"><h5>Stile caption</h5><div class="opt-grid">
        ${VRS.CAPTION_STYLES.map((s) => optBtn('captions.style', s.id, `<div class="prev">${capPreview(s.id)}</div><b>${s.name}</b><span>${s.desc}</span>`)).join('')}
      </div></div>
      <div class="sec"><h5>Colori</h5>
        <div class="field"><label>Colore evidenziazione</label><div class="swatches">${swatches.map((c) => `<button style="background:${c}" class="${C.accent === c ? 'active' : ''}" data-set="captions.accent" data-v='"${c}"'></button>`).join('')}<input type="color" data-k="captions.accent" value="${C.accent}" style="width:40px;height:28px"></div></div>
        <div class="field"><label>Colore testo</label><input type="color" data-k="captions.color" value="${C.color}"></div>
      </div>
      <div class="sec"><h5>Impaginazione</h5>
        ${range('captions.size', 'Dimensione', 0.6, 1.6, 0.05, pct)}
        ${range('captions.position', 'Posizione verticale', 0.15, 0.9, 0.01, pct)}
        ${range('captions.maxWords', 'Parole per schermata', 1, 8, 1)}
        ${sw('captions.uppercase', 'TUTTO MAIUSCOLO')}
      </div>
      <div class="sec"><h5>Suoni</h5>
        ${sw('captions.sfx', 'Effetto sonoro sulle frasi', 'Pop/click quando appare il testo')}
        ${C.sfx ? `<div class="opt-grid three">${[['pop', 'Pop'], ['click', 'Click'], ['whoosh', 'Whoosh']].map(([v, l]) => optBtn('captions.sfxType', v, `<b>${l}</b>`)).join('')}</div>` : ''}
      </div>
      <div class="sec"><h5>Genera testo <span class="chip">${S.status.whisper ? 'Whisper ✓' : 'Whisper ✗'}</span></h5>
        ${S.status.whisper ? `<div class="row" style="margin-bottom:8px">
            <select class="select" id="w-model"><option value="base">Veloce (base)</option><option value="small" selected>Bilanciato (small)</option><option value="medium">Preciso (medium)</option></select>
            <select class="select" id="w-lang"><option value="it">Italiano</option><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option></select></div>
            <button class="btn btn-lime" style="width:100%;justify-content:center" id="btn-transcribe-all">🎙 Trascrivi tutte le clip</button>`
          : `<div class="note"><b>Trascrizione automatica non attiva.</b> Installa Whisper sul tuo computer:<br><code>pip install -U openai-whisper</code><br>poi riavvia lo studio. Intanto puoi scrivere il testo qui sotto: lo sincronizzo io.</div>`}
        <label class="btn-mini ghost" style="margin-top:8px"><input type="file" id="srt-in" accept=".srt,.vtt" hidden>Importa .SRT</label>
      </div>
      <div class="sec"><h5>Testo per clip</h5>
        <div class="note">Correggi le parole: se il numero di parole resta uguale mantengo i tempi esatti, altrimenti li ridistribuisco sulla clip.</div>
        ${p.clips.map((c, i) => `<div class="field"><label>${i + 1}. ${esc(c.name)}<em>${(c.words || []).length} parole</em></label>
          <textarea class="input" data-ctext="${c.id}" placeholder="Scrivi qui cosa si dice in questa clip…">${esc((c.words || []).map((w) => w.w).join(' '))}</textarea>
          <button class="btn-mini ghost" data-capply="${c.id}">Sincronizza testo</button></div>`).join('') || '<div class="empty">Carica prima delle clip</div>'}
      </div>`;
    },
    broll() {
      const p = S.project, c = cat();
      return `
      <div class="note"><b>B-roll ${esc(c.title)}</b>: card animate stile Pinterest generate dal tema, oppure clip/foto reali (Pexels o tuoi file). Trascinale sulla timeline per spostarle.</div>
      <div class="row" style="margin-bottom:14px">
        <button class="btn btn-lime" id="btn-gen-broll" style="justify-content:center">✨ Genera dal tema</button>
        <button class="btn btn-ghost" id="btn-add-broll" style="justify-content:center">＋ Alla testina</button>
      </div>
      ${p.broll.length ? '' : '<div class="empty">Nessun B-roll. Premi “Genera dal tema”.</div>'}
      ${p.broll.map((b, i) => brollItem(b, i)).join('')}`;
    },
    movimento() {
      const p = S.project;
      return `
      <div class="sec"><h5>Stile montaggio</h5><div class="opt-grid three">
        ${VRS.MOTION_MODES.map((m) => optBtn('motion.mode', m.id, `<b>${m.name}</b><span>${m.desc}</span>`)).join('')}</div></div>
      ${range('motion.intensity', 'Intensità zoom', 0, 2, 0.05, pct)}
      <div class="sec"><h5>Transizioni tra clip</h5><div class="opt-grid three">
        ${VRS.TRANSITIONS.map((t) => optBtn('motion.transition', t.id, `<b>${t.name}</b>`)).join('')}</div></div>
      ${range('motion.transDur', 'Durata transizione', 0.15, 1, 0.05, sec)}
      ${sw('motion.sfx', 'Whoosh sulle transizioni', 'Suono di passaggio tra le clip')}
      <div class="note">Scorciatoie: <b>Spazio</b> play/pausa · <b>S</b> divide la clip alla testina · <b>← →</b> frame per frame</div>`;
    },
    look() {
      const p = S.project, snap = p.clips.length ? engine.snapshot(140) : '';
      return `
      <div class="sec"><h5>Filtri</h5><div class="opt-grid three">
        ${VRS.FILTERS.map((f) => optBtn('look.filter', f.id, `<div class="filter-thumb" style="${snap ? `background-image:url(${snap});` : 'background:linear-gradient(135deg,#ffb36b,#6b8cff);'}filter:brightness(${f.b}) contrast(${f.c}) saturate(${f.s}) sepia(${f.sep || 0}) hue-rotate(${f.hue || 0}deg)"></div><b>${f.name}</b>`)).join('')}
      </div></div>
      ${range('look.intensity', 'Intensità filtro', 0, 1, 0.05, pct)}
      ${range('look.vignette', 'Vignettatura extra', 0, 0.8, 0.05, pct)}
      ${range('look.grain', 'Grana pellicola extra', 0, 0.3, 0.01, pct)}
      <div class="sec"><h5>Correzione automatica (FFmpeg)</h5>
        ${sw('audio.autoColor', 'Auto colore & esposizione', 'Bilancia livelli, contrasto e saturazione')}
        <div class="field"><label>LUT cinematografica</label>${select('audio.lut', [['none', 'Nessuna']].concat((S.status.luts || []).map((l) => [l, l])))}</div>
        ${p.audio.lut !== 'none' ? range('audio.lutStrength', 'Forza LUT', 0.1, 1, 0.05, pct) : ''}
        <button class="btn btn-lime" style="width:100%;justify-content:center" data-enhance-all>✨ Applica correzione a tutte le clip</button>
        <div class="note" style="margin-top:10px">La correzione crea una copia ottimizzata di ogni clip (l'originale resta intatto). Include anche la pulizia audio se attiva nella scheda Audio.</div>
      </div>`;
    },
    audio() {
      const p = S.project, M = p.music;
      return `
      <div class="sec"><h5>Voce</h5>
        ${range('audio.voiceVol', 'Volume voce', 0, 2, 0.05, pct)}
        ${sw('audio.cleanVoice', 'Pulizia voce', 'Riduzione rumore, filtro, compressione')}
        ${sw('audio.normalize', 'Normalizza volume', 'Loudness costante tra le clip')}
        <button class="btn-mini" data-enhance-all>✨ Applica a tutte le clip</button>
      </div>
      <div class="sec"><h5>Musica</h5>
        <div class="field">${select('music.url', [['', '— Nessuna musica —']].concat(S.tracks.map((t) => [t.url, t.name])))}</div>
        <label class="btn-mini ghost"><input type="file" id="panel-music-up" accept="audio/*" hidden>＋ Carica brano</label>
        <button class="btn-mini ghost" data-goto="music">Trova brani di tendenza ›</button>
        ${M.url ? `<div style="margin-top:12px">
          ${range('music.vol', 'Volume musica', 0, 1, 0.01, pct)}
          ${range('music.offset', 'Inizia il brano da', 0, 120, 0.5, sec)}
          ${range('music.fadeIn', 'Fade in', 0, 5, 0.1, sec)}
          ${range('music.fadeOut', 'Fade out', 0, 6, 0.1, sec)}
        </div>` : ''}
      </div>
      <div class="sec"><h5>Audio ducking</h5>
        ${sw('music.ducking', 'Abbassa la musica quando parli', 'Rilevamento voce automatico')}
        ${M.ducking ? `${range('music.duck', 'Volume musica durante la voce', 0, 0.8, 0.01, pct)}
          ${range('music.threshold', 'Sensibilità (più basso = più sensibile)', 0.003, 0.05, 0.001)}` : ''}
      </div>
      <div class="sec"><h5>Effetti sonori</h5>
        <div class="field"><label>Volume effetti<em>${pct(S.settings.sfxVol)}</em></label><input type="range" id="sfx-vol" min="0" max="1.5" step="0.05" value="${S.settings.sfxVol}"></div>
        <div class="row"><button class="btn-mini ghost" data-sfx="pop">▶ Pop</button><button class="btn-mini ghost" data-sfx="click">▶ Click</button><button class="btn-mini ghost" data-sfx="whoosh">▶ Whoosh</button><button class="btn-mini ghost" data-sfx="ding">▶ Ding</button></div>
      </div>`;
    },
    clip() {
      const c = S.project.clips.find((x) => x.id === S.selClip);
      if (!c) { S.tab = 'stile'; return PANELS.stile(); }
      const i = S.project.clips.indexOf(c);
      const ck = (k) => `clips.${i}.${k}`;
      return `
      <div class="sec"><h5>Clip ${i + 1} <button class="btn-mini ghost" id="clip-close">✕ Chiudi</button></h5>
        <div class="row" style="align-items:flex-start;gap:12px">
          ${c.thumb ? `<img src="${c.thumb}" style="flex:none;width:64px;height:96px;object-fit:cover;border-radius:12px">` : ''}
          <div><b style="font-size:14px">${esc(c.name)}</b><div class="muted small">${c.kind === 'image' ? 'Foto' : 'Video ' + (c.srcDur || 0).toFixed(1) + 's'} · ${c.w || '?'}×${c.h || '?'}</div></div>
        </div></div>
      ${c.kind === 'video' ? `<div class="sec"><h5>Taglio</h5>
        ${range(ck('in'), 'Inizio', 0, Math.max(0.1, c.srcDur - 0.1), 0.05, sec)}
        ${range(ck('out'), 'Fine', 0.1, c.srcDur, 0.05, sec)}
        <div class="row"><button class="btn-mini ghost" id="clip-in-here">Inizio = testina</button><button class="btn-mini ghost" id="clip-out-here">Fine = testina</button></div>
      </div>` : `<div class="sec"><h5>Durata</h5>${range(ck('dur'), 'Durata foto', 0.5, 10, 0.1, sec)}</div>`}
      <div class="sec"><h5>Inquadratura</h5><div class="opt-grid">
        ${optBtn(ck('fit'), 'cover', '<b>Riempi</b><span>Ritaglia per riempire</span>')}
        ${optBtn(ck('fit'), 'blur', '<b>Sfondo sfocato</b><span>Ideale per video orizzontali</span>')}</div></div>
      ${c.kind === 'video' ? `<div class="sec"><h5>Audio clip</h5>${range(ck('volume'), 'Volume', 0, 2, 0.05, pct)}${sw(ck('muted'), 'Muta questa clip')}</div>` : ''}
      <div class="sec"><h5>Correzione automatica</h5>
        <div class="note">Usa le impostazioni di <b>Look</b> (colore/LUT) e <b>Audio</b> (pulizia voce).</div>
        <div class="row"><button class="btn-mini" data-enhance="${c.id}">✨ Correggi questa clip</button>
        ${c.url !== c.original ? `<button class="btn-mini ghost" data-restore="${c.id}">↺ Originale</button>` : ''}</div>
      </div>
      <div class="sec"><h5>Azioni</h5><div class="row">
        <button class="btn-mini ghost" id="clip-split">✂ Dividi alla testina</button>
        <button class="btn-mini ghost" id="clip-dup">⧉ Duplica</button>
        ${c.kind === 'video' && S.status.whisper ? `<button class="btn-mini ghost" id="clip-trans">🎙 Trascrivi</button>` : ''}
      </div></div>`;
    },
  };

  function capPreview(id) {
    const a = S.project.captions.accent;
    if (id === 'ios') return `<span style="font:700 16px -apple-system,Helvetica Neue,Helvetica,sans-serif;color:#fff;text-shadow:0 2px 8px #000">Ciao a tutti</span>`;
    if (id === 'highlight') return `<span style="font:800 13px Montserrat;color:#fff">CIAO <span style="background:${a};color:${VRS.util.isLight(a) ? '#111' : '#fff'};padding:2px 6px;border-radius:5px">TUTTI</span></span>`;
    if (id === 'clean') return `<span style="font:700 15px Inter;color:#fff;text-shadow:0 3px 6px #000">Ciao a tutti</span>`;
    return `<span style="font:900 15px Montserrat;color:#fff;-webkit-text-stroke:1px #000">CIAO <span style="color:${a}">TUTTI</span></span>`;
  }

  function brollItem(b, i) {
    const k = (x) => `broll.${i}.${x}`;
    const sel = S.selBroll === b.id;
    return `<div class="broll-item ${sel ? 'sel' : ''}" data-bid="${b.id}">
      <div class="bh"><b>${i + 1}. ${esc(b.text || (b.kind === 'media' ? 'Clip B-roll' : 'Card'))}</b>
        <button class="btn-mini ghost" data-bgo="${b.id}">▶</button><button class="btn-mini ghost" data-bdel="${b.id}">✕</button></div>
      ${sel ? `
      <div class="row" style="margin-bottom:10px">${optBtn(k('kind'), 'card', '<b>Card grafica</b>')}${optBtn(k('kind'), 'media', '<b>Clip / foto</b>')}</div>
      <div class="field"><label>Titolo</label><input class="input" data-k="${k('text')}" value="${esc(b.text)}"></div>
      <div class="field"><label>Sottotitolo / tag</label><input class="input" data-k="${k('sub')}" value="${esc(b.sub)}"></div>
      <div class="row"><div class="field"><label>Inizio (s)</label><input class="input" type="number" step="0.1" min="0" data-k="${k('start')}" value="${b.start}"></div>
        <div class="field"><label>Durata (s)</label><input class="input" type="number" step="0.1" min="0.3" data-k="${k('dur')}" value="${b.dur}"></div></div>
      <div class="field"><label>Movimento</label>${select(k('motion'), VRS.BROLL_MOTIONS.map((m) => [m.id, m.name]))}</div>
      ${range(k('textSize'), 'Dimensione testo', 0.5, 1.6, 0.05, pct)}
      ${b.kind === 'card' ? `<div class="field"><label>Sfondo</label><div class="opt-grid three">${optBtn(k('bg'), 'cat', '<b>Categoria</b>')}${optBtn(k('bg'), 'dark', '<b>Scuro</b>')}${optBtn(k('bg'), 'light', '<b>Chiaro</b>')}</div></div>` : `
        <div class="field"><label>Cerca su Pexels</label><div class="row"><input class="input" id="px-q" value="${esc(b.query || '')}" placeholder="es. doctor, food…">
          <select class="select" id="px-kind" style="flex:0 0 90px"><option value="video">Video</option><option value="photo">Foto</option></select>
          <button class="btn-mini" id="px-go" style="flex:0 0 auto">Cerca</button></div>
          <div class="res-grid" id="px-res"></div></div>
        <label class="btn-mini ghost"><input type="file" id="broll-file" accept="video/*,image/*" hidden>＋ Usa un mio file</label>
        ${b.url ? '<span class="chip">media impostato ✓</span>' : ''}`}
      ` : ''}
    </div>`;
  }

  // azioni post-render dei pannelli
  const AFTER = {
    stile() {
      $$('[data-cat-apply]').forEach((b) => (b.onclick = () => applyCategory(b.dataset.catApply)));
      const a = $('#apply-imgdur'); if (a) a.onclick = () => { S.project.clips.forEach((c) => c.kind === 'image' && (c.dur = S.project.imageDuration)); changed({ bin: true }); };
    },
    testi() {
      const all = $('#btn-transcribe-all'); if (all) all.onclick = () => transcribe(S.project.clips.filter((c) => c.kind === 'video'));
      $$('[data-capply]').forEach((b) => (b.onclick = () => {
        const c = S.project.clips.find((x) => x.id === b.dataset.capply);
        applyText(c, $(`[data-ctext="${c.id}"]`).value); changed({ panel: true, bin: true }); toast('Testo sincronizzato ✓');
      }));
      const srt = $('#srt-in'); if (srt) srt.onchange = async (e) => { importSrt(await e.target.files[0].text()); changed({ panel: true, bin: true }); };
    },
    broll() {
      $('#btn-gen-broll').onclick = generateBroll;
      $('#btn-add-broll').onclick = () => {
        const c = cat(), t = cat().broll[S.project.broll.length % c.broll.length];
        const b = { id: uid(), kind: 'card', start: +engine.t.toFixed(2), dur: 2, text: t.text, sub: t.sub, motion: t.motion, query: t.query, bg: 'cat', textSize: 1 };
        S.project.broll.push(b); S.selBroll = b.id; changed({ panel: true });
      };
      $$('[data-bid]').forEach((el) => el.addEventListener('click', (e) => {
        if (e.target.closest('input,select,button,label,img')) return;
        S.selBroll = S.selBroll === el.dataset.bid ? null : el.dataset.bid; renderPanel(); renderTimeline();
      }));
      $$('[data-bgo]').forEach((b) => (b.onclick = () => { const x = S.project.broll.find((y) => y.id === b.dataset.bgo); engine.seek(x.start + 0.4); S.selBroll = x.id; renderPanel(); renderTimeline(); }));
      $$('[data-bdel]').forEach((b) => (b.onclick = () => { S.project.broll = S.project.broll.filter((y) => y.id !== b.dataset.bdel); engine.gc(); changed({ panel: true }); }));
      const go = $('#px-go'); if (go) go.onclick = pexelsSearch;
      const bf = $('#broll-file'); if (bf) bf.onchange = async (e) => {
        const f = e.target.files[0]; const b = S.project.broll.find((x) => x.id === S.selBroll);
        toast('Carico ' + esc(f.name) + '…');
        const item = await uploadFile(f);
        let url = item.url; if (item.jobId) url = (await waitJob(item.jobId)).url;
        Object.assign(b, { url, mediaKind: item.kind === 'image' ? 'image' : 'video' }); changed({ panel: true });
      };
    },
    audio() {
      const up = $('#panel-music-up'); if (up) up.onchange = async (e) => { const t = await uploadTrack(e.target.files[0]); useTrack(t); };
      const sel = $('#panel select[data-k="music.url"]');
      if (sel) sel.onchange = () => { const t = S.tracks.find((x) => x.url === sel.value); useTrack(t || null); };
      $('#sfx-vol').oninput = (e) => { S.settings.sfxVol = +e.target.value; store.set('settings', S.settings); engine.audio(); engine.sfxBus.gain.value = S.settings.sfxVol; e.target.previousElementSibling.querySelector('em').textContent = pct(S.settings.sfxVol); };
      $$('[data-sfx]').forEach((b) => (b.onclick = async () => { const ac = engine.audio(); await ac.resume(); engine.sfxBus.gain.value = S.settings.sfxVol; engine.sfx(b.dataset.sfx); }));
    },
    clip() {
      const c = S.project.clips.find((x) => x.id === S.selClip); if (!c) return;
      $('#clip-close').onclick = () => { S.selClip = null; S.tab = 'stile'; renderBin(); renderPanel(); renderTimeline(); };
      $('#clip-split').onclick = splitAtPlayhead;
      $('#clip-dup').onclick = () => { const d = JSON.parse(JSON.stringify(c)); d.id = uid(); S.project.clips.splice(S.project.clips.indexOf(c) + 1, 0, d); changed({ bin: true }); };
      const tr = $('#clip-trans'); if (tr) tr.onclick = () => transcribe([c]);
      const seg = () => engine.layout().segs.find((s) => s.clip === c);
      const ih = $('#clip-in-here'); if (ih) ih.onclick = () => { const s = seg(); if (s) { c.in = Math.min(c.out - 0.1, c.in + (engine.t - s.start)); changed({ panel: true, bin: true }); } };
      const oh = $('#clip-out-here'); if (oh) oh.onclick = () => { const s = seg(); if (s) { c.out = Math.max(c.in + 0.1, c.in + (engine.t - s.start)); changed({ panel: true, bin: true }); } };
      // vincoli in/out
      $$('#panel [data-k$=".in"], #panel [data-k$=".out"]').forEach((el) => el.addEventListener('input', () => {
        if (c.in > c.out - 0.1) { if (el.dataset.k.endsWith('.in')) c.in = c.out - 0.1; else c.out = c.in + 0.1; }
        renderBin();
      }));
    },
  };
  // pulsanti correzione (in più pannelli)
  document.addEventListener('click', (e) => {
    const all = e.target.closest('[data-enhance-all]'); if (all) return enhance(S.project.clips);
    const one = e.target.closest('[data-enhance]'); if (one) return enhance(S.project.clips.filter((c) => c.id === one.dataset.enhance));
    const rs = e.target.closest('[data-restore]');
    if (rs) { const c = S.project.clips.find((x) => x.id === rs.dataset.restore); c.url = c.original; changed({ panel: true, bin: true }); }
  });

  function applyCategory(id) {
    const fresh = VRS.newProject(id), p = S.project;
    p.category = id;
    p.captions = Object.assign(p.captions, fresh.captions);
    p.motion = Object.assign(p.motion, fresh.motion);
    p.look = Object.assign(p.look, fresh.look);
    p.music.vol = fresh.music.vol; p.music.duck = fresh.music.duck;
    p.imageDuration = fresh.imageDuration;
    renderEditor(); changed({ panel: true });
    toast('Preset “' + esc(cat().title) + '” applicato');
  }

  // ----- testo / sottotitoli -----
  function clipSpan(c) { return c.kind === 'image' ? [0, c.dur || S.project.imageDuration] : [c.in, c.out]; }
  function applyText(c, text) {
    const ws = text.trim().split(/\s+/).filter(Boolean);
    if (!ws.length) { c.words = []; return; }
    if (c.words && c.words.length === ws.length) { c.words = c.words.map((w, i) => ({ ...w, w: ws[i] })); return; }
    let [a, b] = clipSpan(c);
    if (c.words && c.words.length) { a = Math.max(a, c.words[0].t0); b = Math.min(b, c.words[c.words.length - 1].t1); }
    else { a += 0.15; b -= 0.2; }
    // tempo proporzionale alla lunghezza delle parole (più naturale)
    const weights = ws.map((w) => w.length + 2), tot = weights.reduce((x, y) => x + y, 0);
    let t = a;
    c.words = ws.map((w, i) => { const d = (b - a) * weights[i] / tot; const o = { w, t0: t, t1: t + d * 0.92 }; t += d; return o; });
  }
  function importSrt(txt) {
    const blocks = txt.replace(/\r/g, '').split(/\n\n+/);
    const toSec = (s) => { const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(s) || /(\d+):(\d+)[,.](\d+)/.exec(s); if (!m) return 0; return m.length === 5 ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000 : +m[1] * 60 + +m[2] + +m[3] / 1000; };
    const { segs } = engine.layout();
    segs.forEach((s) => (s.clip.words = []));
    for (const bl of blocks) {
      const lines = bl.split('\n'), ti = lines.findIndex((l) => l.includes('-->'));
      if (ti < 0) continue;
      const [a, b] = lines[ti].split('-->').map(toSec);
      const text = lines.slice(ti + 1).join(' ').replace(/<[^>]+>/g, '');
      const ws = text.split(/\s+/).filter(Boolean), d = (b - a) / Math.max(1, ws.length);
      ws.forEach((w, i) => {
        const t = a + i * d, s = segs.find((x) => t >= x.start && t < x.end); if (!s) return;
        const base = s.clip.kind === 'image' ? 0 : s.clip.in;
        s.clip.words.push({ w, t0: base + t - s.start, t1: base + t - s.start + d * 0.95 });
      });
    }
    toast('SRT importato ✓');
  }
  async function transcribe(clips) {
    if (!clips.length) return toast('Nessuna clip video da trascrivere', true);
    const model = ($('#w-model') || {}).value || 'small', language = ($('#w-lang') || {}).value || 'it';
    const m = modal(`<h3>🎙 Trascrizione in corso</h3><p class="muted small">Whisper lavora sul tuo computer: la prima volta scarica il modello (può richiedere qualche minuto).</p><div class="big-prog"><i id="tp"></i></div><div class="muted small" id="tl">0 / ${clips.length}</div>`);
    $('#modal').dataset.lock = 1;
    try {
      for (let i = 0; i < clips.length; i++) {
        const c = clips[i];
        $('#tl', m).textContent = `${i + 1} / ${clips.length} · ${c.name}`;
        const { jobId } = await api('/api/transcribe', { method: 'POST', body: { source: c.original, model, language } });
        const r = await waitJob(jobId, (p) => ($('#tp', m).style.width = ((i + p) / clips.length * 100) + '%'));
        c.words = r.words;
      }
      toast('Sottotitoli generati ✓');
    } catch (e) { toast('Trascrizione: ' + esc(e.message), true); }
    delete $('#modal').dataset.lock; closeModal();
    changed({ panel: true, bin: true });
  }

  // ----- correzione automatica -----
  async function enhance(clips) {
    const a = S.project.audio;
    if (!a.autoColor && a.lut === 'none' && !a.cleanVoice && !a.normalize) return toast('Attiva almeno una correzione (Look o Audio)', true);
    for (const c of clips) {
      c._job = 0; renderBin();
      try {
        const r = await api('/api/enhance', { method: 'POST', body: { source: c.original, autoColor: a.autoColor, lut: a.lut, lutStrength: a.lutStrength, cleanVoice: c.kind === 'video' && a.cleanVoice, normalize: c.kind === 'video' && a.normalize } });
        const res = r.jobId ? await waitJob(r.jobId, (p) => { c._job = p; renderBin(); }) : r;
        c.url = res.url;
      } catch (e) { toast('Correzione fallita su ' + esc(c.name) + ': ' + esc(e.message), true); }
      delete c._job; changed({ bin: true });
    }
    toast('Correzione applicata ✨');
  }

  // ----- B-roll -----
  function generateBroll() {
    const total = engine.duration;
    if (!total) return toast('Carica prima le clip', true);
    const c = cat(), p = S.project;
    const n = Math.max(1, Math.min(c.broll.length, Math.floor(total / 6)));
    const pages = engine.pages();
    p.broll = [];
    for (let i = 0; i < n; i++) {
      let start = 2.5 + (total - 4.5) * (i / Math.max(1, n - (n > 1 ? 1 : 0)));
      if (n === 1) start = Math.min(total * 0.35, total - 2.2);
      // aggancia all'inizio della frase più vicina
      const near = pages.reduce((best, pg) => (Math.abs(pg.t0 - start) < Math.abs((best ? best.t0 : 1e9) - start) ? pg : best), null);
      if (near && Math.abs(near.t0 - start) < 1.5) start = near.t0;
      const t = c.broll[i % c.broll.length];
      p.broll.push({ id: uid(), kind: 'card', start: +Math.max(0, start).toFixed(2), dur: 2, text: t.text, sub: t.sub, motion: t.motion, query: t.query, bg: 'cat', textSize: 1 });
    }
    S.selBroll = p.broll[0] && p.broll[0].id;
    changed({ panel: true });
    toast(`${n} B-roll generati dal tema “${esc(c.title)}”`);
  }
  async function pexelsSearch() {
    const b = S.project.broll.find((x) => x.id === S.selBroll); if (!b) return;
    if (!S.settings.pexelsKey) { toast('Aggiungi la API key Pexels in Impostazioni ⚙ (gratis su pexels.com/api)', true); return openSettings(); }
    const q = $('#px-q').value.trim(), kind = $('#px-kind').value; b.query = q;
    $('#px-res').innerHTML = '<span class="muted small">Cerco…</span>';
    try {
      const r = await api('/api/broll/search', { method: 'POST', body: { query: q, kind, key: S.settings.pexelsKey } });
      $('#px-res').innerHTML = r.items.map((it, i) => `<img src="${it.thumb}" data-px="${i}" title="${esc(it.author || '')}">`).join('') || '<span class="muted small">Nessun risultato</span>';
      $$('[data-px]').forEach((img) => (img.onclick = async () => {
        const it = r.items[+img.dataset.px];
        img.style.opacity = 0.4; toast('Scarico il B-roll…');
        try {
          const d = await api('/api/broll/download', { method: 'POST', body: { url: it.url, kind: it.kind } });
          Object.assign(b, { url: d.url, mediaKind: it.kind });
          changed({ panel: true }); engine.seek(b.start + 0.4);
        } catch (e) { toast(esc(e.message), true); }
      }));
    } catch (e) { $('#px-res').innerHTML = ''; toast(esc(e.message), true); }
  }

  // ================= MUSICA =================
  function addTrack(t) { if (!S.tracks.find((x) => x.url === t.url)) { S.tracks.unshift(t); store.set('tracks', S.tracks); } }
  async function uploadTrack(f) { const item = await uploadFile(f); const t = { name: f.name.replace(/\.[^.]+$/, ''), url: item.url }; addTrack(t); toast('Brano aggiunto: ' + esc(t.name)); return t; }
  function useTrack(t) {
    S.project.music.url = t ? t.url : null; S.project.music.name = t ? t.name : null;
    engine.setMusic(S.project.music.url); changed({ panel: true });
  }
  let previewAudio;
  function renderMusic() {
    $('#src-list-big').innerHTML = VRS.MUSIC_SOURCES.map(srcItem).join('');
    $('#mood-list').innerHTML = VRS.CATEGORIES.map((c) => `<div class="mood"><b>${c.icon} ${esc(c.title)}</b><p>${esc(c.musicMood)}</p></div>`).join('') +
      `<div class="note" style="margin-top:6px">💡 <b>Consiglio pro:</b> se usi un suono di tendenza TikTok/IG, esporta il reel con musica bassa o senza, poi aggiungi il suono originale direttamente nell'app: così l'algoritmo ti associa al trend.</div>`;
    $('#track-list').innerHTML = S.tracks.map((t, i) => `<div class="track"><button class="tplay" data-tp="${i}">▶</button><span class="tn">${esc(t.name)}</span>
      <button class="btn-mini" data-tuse="${i}">${S.project.music.url === t.url ? 'In uso ✓' : 'Usa'}</button><button class="btn-mini ghost" data-tdel="${i}">✕</button></div>`).join('') || '<div class="empty">Nessun brano. Carica un mp3.</div>';
    $$('[data-tp]').forEach((b) => (b.onclick = () => {
      const t = S.tracks[+b.dataset.tp];
      if (previewAudio && previewAudio.dataset.u === t.url && !previewAudio.paused) { previewAudio.pause(); b.textContent = '▶'; return; }
      if (previewAudio) previewAudio.pause();
      $$('[data-tp]').forEach((x) => (x.textContent = '▶'));
      previewAudio = new Audio(t.url); previewAudio.dataset.u = t.url; previewAudio.play(); b.textContent = '❚❚';
    }));
    $$('[data-tuse]').forEach((b) => (b.onclick = () => { useTrack(S.tracks[+b.dataset.tuse]); renderMusic(); toast('Musica impostata nel progetto'); }));
    $$('[data-tdel]').forEach((b) => (b.onclick = () => { S.tracks.splice(+b.dataset.tdel, 1); store.set('tracks', S.tracks); renderMusic(); }));
  }
  $('#music-upload').onchange = async (e) => { for (const f of e.target.files) await uploadTrack(f); renderMusic(); e.target.value = ''; };
  setupDrop($('#music-drop'), async (files) => { for (const f of files) await uploadTrack(f); renderMusic(); });

  // ================= EXPORT =================
  async function renderExports() {
    const list = await api('/api/exports').catch(() => []);
    $('#export-list').innerHTML = list.map((x) => `<div class="export-row"><video src="${x.url}" muted preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause()"></video>
      <div class="en"><b>${esc(x.name)}</b><span>${new Date(x.time).toLocaleString('it-IT')}</span></div>
      <a class="btn btn-lime" href="${x.url}?download=1">⬇ Scarica</a></div>`).join('') || '<div class="empty">Nessun export ancora.</div>';
  }
  $('#btn-export').onclick = () => {
    if (!engine.duration) return toast('Aggiungi almeno una clip', true);
    const m = modal(`<h3>Esporta reel</h3><p class="muted small">L'export avviene in tempo reale (${fmt(engine.duration)}): <b>tieni questa scheda aperta e visibile</b> fino alla fine. Poi FFmpeg crea l'MP4 H.264 ottimizzato per Instagram e TikTok.</p>
      <div class="field"><label>Qualità</label><select class="select" id="ex-q"><option value="1">1080p (consigliato)</option><option value="0.6667">720p (più veloce)</option></select></div>
      <label class="switch"><span>Loudness social (-14 LUFS)<small>Volume ottimale per IG/TikTok</small></span><input type="checkbox" id="ex-loud" checked></label>
      <label class="switch"><span>Ascolta durante l'export</span><input type="checkbox" id="ex-mon"></label>
      <div class="big-prog"><i id="ex-p"></i></div><div class="muted small" id="ex-s">Pronto</div>
      <div class="actions"><button class="btn btn-ghost" id="ex-cancel">Annulla</button><button class="btn btn-lime" id="ex-go">Avvia export</button></div>`);
    $('#ex-cancel', m).onclick = () => { engine.abortExport(); delete $('#modal').dataset.lock; closeModal(); };
    $('#ex-go', m).onclick = async () => {
      $('#ex-go', m).disabled = true; $('#modal').dataset.lock = 1;
      const bar = $('#ex-p', m), st = $('#ex-s', m);
      try {
        await saveProject(true);
        st.textContent = 'Preparo i media…';
        const { blob, ext } = await engine.exportVideo({ quality: +$('#ex-q', m).value, muteMonitor: !$('#ex-mon', m).checked, onProgress: (p) => { bar.style.width = p * 80 + '%'; st.textContent = `Registrazione ${Math.round(p * 100)}%`; } });
        st.textContent = 'Invio a FFmpeg…';
        const { jobId } = await api(`/api/export?name=${encodeURIComponent(S.project.name)}&ext=${ext}&loudnorm=${$('#ex-loud', m).checked ? 1 : 0}`, { method: 'POST', raw: blob });
        const r = await waitJob(jobId, (p) => { bar.style.width = 80 + p * 20 + '%'; st.textContent = `Codifica MP4 ${Math.round(p * 100)}%`; });
        bar.style.width = '100%';
        m.innerHTML = `<h3>Reel pronto 🎉</h3><video src="${r.url}" controls style="width:100%;max-height:60vh;border-radius:16px;background:#000;margin:12px 0"></video>
          <div class="actions"><button class="btn btn-ghost" id="ex-close">Chiudi</button><a class="btn btn-lime" href="${r.url}?download=1">⬇ Scarica MP4</a></div>`;
        $('#ex-close', m).onclick = closeModal;
      } catch (e) { st.textContent = 'Errore: ' + e.message; toast(esc(e.message), true); $('#ex-go', m).disabled = false; }
      delete $('#modal').dataset.lock;
    };
  };

  // ================= IMPOSTAZIONI & GUIDA =================
  function openSettings() {
    const m = modal(`<h3>Impostazioni</h3>
      <div class="field" style="margin-top:14px"><label>API key Pexels (B-roll video/foto gratuiti)</label><input class="input" id="set-px" value="${esc(S.settings.pexelsKey)}" placeholder="Incolla la tua chiave"></div>
      <p class="muted small">Ottienila gratis in 1 minuto su <a href="https://www.pexels.com/api/" target="_blank" style="color:var(--lime)">pexels.com/api</a>. Resta salvata solo su questo computer.</p>
      <div class="note">Stato: FFmpeg ${S.status.ffmpeg ? '✓' : '✗'} · Whisper ${S.status.whisper ? '✓' : '✗ (<code>pip install -U openai-whisper</code>)'} · LUT: ${(S.status.luts || []).length}</div>
      <div class="actions"><button class="btn btn-ghost" id="set-x">Chiudi</button><button class="btn btn-lime" id="set-ok">Salva</button></div>`);
    $('#set-x', m).onclick = closeModal;
    $('#set-ok', m).onclick = () => { S.settings.pexelsKey = $('#set-px', m).value.trim(); store.set('settings', S.settings); closeModal(); toast('Impostazioni salvate'); };
  }
  $('#btn-settings').onclick = openSettings;
  $('#btn-help').onclick = () => {
    const m = modal(`<h3>Guida rapida</h3><ol class="muted" style="line-height:1.7;font-size:14px;padding-left:18px">
      <li><b>Dashboard</b> → scegli il format (Camice & Verità, Il Palco, Gusto in Movimento, Luxe Showcase, Momenti in Reel).</li>
      <li><b>Carica</b> uno o più video/foto (trascinali). Riordina trascinando, clicca per tagliare.</li>
      <li><b>Testi</b> → trascrivi con Whisper o scrivi il testo, scegli lo stile caption.</li>
      <li><b>B-roll</b> → “Genera dal tema”, modifica testi e movimenti, oppure cerca clip su Pexels.</li>
      <li><b>Zoom</b> → Semplice / Smooth / Dinamico + transizioni. <b>Look</b> → filtri, auto colore, LUT.</li>
      <li><b>Audio</b> → pulizia voce, musica, ducking automatico, effetti sonori.</li>
      <li><b>Esporta MP4</b> → 1080×1920 pronto per Reels e TikTok.</li></ol>
      <div class="actions"><button class="btn btn-lime" id="h-ok">Ho capito</button></div>`);
    $('#h-ok', m).onclick = closeModal;
  };

  // ================= AVVIO =================
  (async function init() {
    try {
      S.status = await api('/api/status');
      $('#hero-status').textContent = `FFmpeg ${S.status.ffmpeg ? '✓' : '✗'} · Whisper ${S.status.whisper ? '✓' : '✗'}`;
    } catch { $('#hero-status').textContent = 'Server offline'; }
    engine.audio && document.addEventListener('pointerdown', () => { const ac = engine.audio(); ac.resume(); engine.sfxBus.gain.value = S.settings.sfxVol; }, { once: true });
    if (document.fonts) document.fonts.ready.then(() => engine.requestDraw());
    renderDash();
    window.VRS_APP = { S, engine, go }; // debug
  })();
})();
