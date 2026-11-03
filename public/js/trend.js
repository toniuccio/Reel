// Vels Reel Studio — Trend & Ricerca: catalogo, parole chiave, libreria riferimenti
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let A, lib = [], filterCat = 'all';

  const kwChip = (q) => {
    const L = VRS.searchLinks(q);
    return `<span class="kw"><b>${A.esc(q)}</b><a href="${L.pinterest}" target="_blank" rel="noopener" title="Cerca su Pinterest" class="kp">P</a><a href="${L.tiktok}" target="_blank" rel="noopener" title="Cerca su TikTok" class="kt">T</a><a href="${L.pexels}" target="_blank" rel="noopener" title="Video gratis su Pexels" class="kx">X</a></span>`;
  };
  const catName = (id) => (id === 'all' ? 'Tutte' : (VRS.CATEGORIES.find((c) => c.id === id) || {}).title || id);
  const trendName = (id) => (VRS.TRENDS.broll.find((t) => t.id === id) || {}).name || id;

  async function show() {
    try { lib = await A.api('/api/library'); } catch { lib = []; }
    const T = VRS.TRENDS;
    $('#trend-root').innerHTML = `
      <section class="card">
        <span class="card-label">Come funziona</span>
        <ol class="howto">
          <li>Scegli una categoria o un trend e tocca <b>P</b> (Pinterest), <b>T</b> (TikTok) o <b>X</b> (Pexels, video gratuiti) accanto alle parole chiave.</li>
          <li>Salva sul telefono le clip e le foto che ti piacciono.</li>
          <li>Caricale qui con <b>＋ Riferimenti</b>: le etichetto per categoria e trend.</li>
          <li>Nel passo “Pilota automatico” lo studio le usa come B-roll nei punti giusti.</li>
        </ol>
        <div class="note">⚠️ Usa materiale tuo, libero da diritti (Pexels, Pixabay) o per cui hai il permesso. Le clip prese da Pinterest servono come <b>riferimento di stile</b>: pubblicarle nei tuoi reel può violare i diritti di chi le ha create.</div>
      </section>

      <section class="card">
        <div class="row-between"><span class="card-label">Parole chiave per categoria</span><button class="btn-mini ghost" id="kw-copy">⧉ Copia tutte</button></div>
        <div class="kw-cats">${VRS.CATEGORIES.map((c) => `
          <div class="kw-cat"><div class="kw-head"><span class="cat-ico sm" style="background:${c.gradient}">${c.icon}</span><b>${A.esc(c.title)}</b><span class="muted small">${A.esc(c.tag)}</span></div>
            <div class="kws">${c.keywords.map(kwChip).join('')}</div></div>`).join('')}</div>
      </section>

      <section class="card">
        <span class="card-label">Tipi di B-roll di tendenza <sup>${T.broll.length}</sup></span>
        <div class="trend-grid">${T.broll.map((t) => `
          <div class="trend">
            <div class="row-between"><b>${t.name}</b><label class="btn-mini"><input type="file" multiple accept="video/*,image/*" hidden data-up-trend="${t.id}">＋ Riferimenti</label></div>
            <p>${A.esc(t.desc)}</p>
            <div class="tags">${t.use.map((u) => `<span class="chip">${A.esc(catName(u))}</span>`).join('')}<span class="chip">layout: ${A.esc((VRS.BROLL_LAYOUTS.find((l) => l.id === t.layout) || {}).name)}</span><span class="chip">mov: ${A.esc((VRS.BROLL_MOTIONS.find((m) => m.id === t.motion) || {}).name)}</span></div>
            <div class="kws">${t.keywords.map(kwChip).join('')}</div>
            <div class="muted small">${lib.filter((x) => x.trend === t.id).length} riferimenti in libreria</div>
          </div>`).join('')}</div>
      </section>

      <section class="card">
        <span class="card-label">Caption, zoom e transizioni di tendenza</span>
        <div class="trend-grid">
          ${T.captions.map((c) => { const s = VRS.CAPTION_STYLES.find((x) => x.id === c.id); return `<div class="trend"><b>💬 ${s.name}</b><p>${A.esc(c.tip)}</p></div>`; }).join('')}
          ${VRS.MOTION_MODES.map((m) => `<div class="trend"><b>⤢ ${m.name}</b><p>${A.esc(m.desc)}</p></div>`).join('')}
        </div>
        <h6 class="wh">Regole d’oro</h6>
        <ul class="rules">${T.rules.map((r) => `<li>${A.esc(r)}</li>`).join('')}</ul>
        <div class="muted small">Fonti: ${T.sources.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${A.esc(n)}</a>`).join(' · ')}. Sono blog di settore e produttori di tool: prendi i numeri come indicazioni di massima.</div>
      </section>

      <section class="card">
        <div class="row-between"><span class="card-label">La mia libreria riferimenti <sup>${lib.length}</sup></span>
          <select class="select small" id="lib-cat"><option value="all">Tutte le categorie</option>${VRS.CATEGORIES.map((c) => `<option value="${c.id}" ${filterCat === c.id ? 'selected' : ''}>${A.esc(c.title)}</option>`).join('')}</select></div>
        <div class="lib-grid">${lib.filter((x) => filterCat === 'all' || x.category === filterCat || x.category === 'all').map((x) => `
          <div class="lib-item"><img src="${x.thumb}" loading="lazy"><span class="lt">${x.kind === 'video' ? '▶' : '▣'} ${A.esc(trendName(x.trend))}</span>
            <span class="lc">${A.esc(catName(x.category))}</span><button data-libdel="${x.id}">✕</button></div>`).join('') || '<div class="empty">Ancora nessun riferimento. Usa “＋ Riferimenti” su un trend qui sopra.</div>'}</div>
      </section>`;

    $$('[data-up-trend]').forEach((inp) => (inp.onchange = () => uploadRefs(inp.files, inp.dataset.upTrend)));
    $$('[data-libdel]').forEach((b) => (b.onclick = async () => { await A.api('/api/library?id=' + b.dataset.libdel, { method: 'DELETE' }); show(); }));
    $('#lib-cat').onchange = (e) => { filterCat = e.target.value; show(); };
    $('#kw-copy').onclick = async () => {
      const txt = VRS.CATEGORIES.map((c) => `${c.title}: ${c.keywords.join(', ')}`).concat(VRS.TRENDS.broll.map((t) => `B-roll ${t.name}: ${t.keywords.join(', ')}`)).join('\n');
      try { await navigator.clipboard.writeText(txt); A.toast('Parole chiave copiate ✓'); } catch { A.modal(`<h3>Parole chiave</h3><textarea class="input" style="min-height:300px">${A.esc(txt)}</textarea><div class="actions"><button class="btn btn-lime" onclick="document.getElementById('modal').classList.remove('open')">Chiudi</button></div>`); }
    };
  }

  async function uploadRefs(files, trend) {
    files = [...files]; if (!files.length) return;
    const cats = VRS.CATEGORIES.map((c) => `<button class="opt" data-pickcat="${c.id}"><b>${A.esc(c.title)}</b></button>`).join('');
    const m = A.modal(`<h3>Per quale categoria?</h3><p class="muted small">${files.length} file · trend “${A.esc(trendName(trend))}”</p>
      <div class="opt-grid">${cats}<button class="opt" data-pickcat="all"><b>Tutte</b></button></div>`);
    const category = await new Promise((r) => $$('[data-pickcat]', m).forEach((b) => (b.onclick = () => r(b.dataset.pickcat))));
    m.innerHTML = `<h3>Carico i riferimenti…</h3><div class="big-prog"><i id="ref-p"></i></div><div class="muted small" id="ref-t"></div>`;
    $('#modal').dataset.lock = 1;
    for (let i = 0; i < files.length; i++) {
      $('#ref-t').textContent = `${i + 1} / ${files.length} · ${files[i].name}`;
      try {
        const it = await A.uploadFile(files[i], (p) => ($('#ref-p').style.width = ((i + p) / files.length * 100) + '%'));
        let url = it.url; if (it.jobId) url = (await A.waitJob(it.jobId)).url;
        await A.api('/api/library', { method: 'POST', body: { url, thumb: it.thumb, name: it.name, kind: it.kind === 'image' ? 'image' : 'video', category, trend, duration: it.duration } });
      } catch (e) { A.toast(A.esc(files[i].name) + ': ' + A.esc(e.message), true); }
    }
    delete $('#modal').dataset.lock; A.closeModal(); A.toast('Riferimenti aggiunti alla libreria ✓');
    show();
  }

  // ---------- uso dal telefono (QR) ----------
  async function phoneModal() {
    let urls = [];
    try { urls = (await A.api('/api/lan')).urls; } catch {}
    const here = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
    const m = A.modal(`<h3>📱 Usa lo studio dal telefono</h3>
      ${here ? '<div class="note">Sei già collegato dal telefono ✓</div>' : ''}
      <ol class="howto"><li>Telefono e PC devono essere sulla <b>stessa rete Wi-Fi</b>, e il PC deve restare acceso con lo studio avviato.</li>
      <li>Inquadra il QR code con la fotocamera del telefono.</li>
      <li>Nel browser tocca Condividi → <b>Aggiungi a schermata Home</b>: avrai l’icona Vell’s come un’app.</li></ol>
      ${urls.map((u) => `<div class="qr-box"><div class="qr" data-qr="${u}"></div><a href="${u}" target="_blank">${u}</a></div>`).join('') || '<div class="note">Nessuna rete trovata: collega il PC al Wi-Fi.</div>'}
      <div class="actions"><button class="btn btn-lime" id="qr-ok">Chiudi</button></div>`);
    $('#qr-ok', m).onclick = A.closeModal;
    $$('[data-qr]', m).forEach((el) => {
      if (window.QRCode) new QRCode(el, { text: el.dataset.qr, width: 180, height: 180, colorDark: '#0a0c18', colorLight: '#ffffff' });
      else el.textContent = '(QR non disponibile offline: digita l’indirizzo qui sotto)';
    });
  }

  VRS.views = VRS.views || {};
  VRS.views.trend = show;
  const prevReady = VRS.onAppReady;
  VRS.onAppReady = () => {
    prevReady && prevReady();
    A = window.VRS_APP;
    $('#btn-phone').onclick = phoneModal;
  };
})();
