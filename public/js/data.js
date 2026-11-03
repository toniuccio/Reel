// Vels Reel Studio — preset, categorie, stili
window.VRS = window.VRS || {};

VRS.CATEGORIES = [
  {
    id: 'medico', keywords: ['medical aesthetic b roll', 'doctor office aesthetic', 'stethoscope close up', 'healthy lifestyle aesthetic', 'laboratory cinematic', 'studio medico estetica'], title: 'Camice & Verità', tag: 'Medico · Salute',
    desc: 'Divulgazione chiara e autorevole: il dottore parla, i concetti chiave restano impressi.',
    gradient: 'linear-gradient(135deg,#5ee7c8 0%,#7cc6ff 100%)', accent: '#21d4a7', icon: '✚',
    defaults: {
      captions: { style: 'highlight', accent: '#21d4a7', uppercase: true, maxWords: 3, position: 0.72, size: 1 },
      motion: { mode: 'smooth', transition: 'fade' },
      look: { filter: 'clinico', intensity: 0.7 },
      music: { duck: 0.18, vol: 0.22 },
    },
    musicMood: 'Piano emozionale, ambient leggero, corporate soft',
    broll: [
      { text: 'Lo sapevi?', sub: 'Il dato che pochi conoscono', motion: 'pop', query: 'doctor hospital' },
      { layout: 'stat', text: '8 su 10', sub: 'lo ignorano', motion: 'zoom-in', query: 'medical research' },
      { layout: 'list', text: 'Sonno | Acqua | Movimento', sub: 'Le basi', motion: 'float', query: 'healthy routine' },
      { text: '3 errori da evitare', sub: 'Salva questo video', motion: 'slide-up', query: 'healthy lifestyle' },
      { text: 'Il parere del medico', sub: 'Scienza, non opinioni', motion: 'zoom-in', query: 'medical research laboratory' },
      { text: 'Prenditi cura di te', sub: 'Prenota una visita', motion: 'float', query: 'wellness morning routine' },
    ],
  },
  {
    id: 'politico', keywords: ['italian city drone', 'crowd rally cinematic', 'parliament italy', 'handshake cinematic', 'italian town square aesthetic', 'comizio piazza'], title: 'Il Palco', tag: 'Politico · Istituzionale',
    desc: 'Messaggi forti, numeri in evidenza, ritmo serrato per comizi, interviste e proposte.',
    gradient: 'linear-gradient(135deg,#7b8cff 0%,#ff6b8b 100%)', accent: '#ffd400', icon: '◆',
    defaults: {
      captions: { style: 'highlight', accent: '#ffd400', uppercase: true, maxWords: 3, position: 0.7, size: 1.05 },
      motion: { mode: 'dinamico', transition: 'zoom' },
      look: { filter: 'contrasto', intensity: 0.7 },
      music: { duck: 0.15, vol: 0.2 },
    },
    musicMood: 'Epico, cinematico, build-up motivazionale',
    broll: [
      { text: 'I numeri parlano', sub: 'Dati ufficiali 2026', motion: 'zoom-in', query: 'city hall italy' },
      { layout: 'stat', text: '+1.200', sub: 'nuovi posti di lavoro', motion: 'zoom-in', query: 'city aerial' },
      { layout: 'quote', text: 'Il futuro si costruisce insieme', sub: 'il candidato', motion: 'float', query: 'crowd rally' },
      { text: 'La nostra proposta', sub: 'Concreta. Realizzabile.', motion: 'slide-up', query: 'crowd rally' },
      { text: 'Cosa cambia per te', sub: 'In 3 punti', motion: 'pop', query: 'italian town square' },
      { text: 'Partecipa', sub: 'Il futuro si decide insieme', motion: 'float', query: 'people community' },
    ],
  },
  {
    id: 'food', keywords: ['food pouring slow motion', 'pasta making aesthetic', 'chef plating close up', 'pizza oven fire', 'restaurant ambience aesthetic', 'cibo estetica video'], title: 'Gusto in Movimento', tag: 'Ristoranti · Food',
    desc: 'Slideshow e clip golose: tagli veloci, colori caldi e ritmo a tempo di musica.',
    gradient: 'linear-gradient(135deg,#ffd36e 0%,#ff8a5b 100%)', accent: '#ff7a45', icon: '◉',
    defaults: {
      captions: { style: 'ios', accent: '#ffb02e', uppercase: false, maxWords: 4, position: 0.75, size: 1 },
      motion: { mode: 'dinamico', transition: 'whip' },
      look: { filter: 'caldo', intensity: 0.8 },
      music: { duck: 0.3, vol: 0.45 },
      imageDuration: 1.8,
    },
    musicMood: 'Funky, lo-fi upbeat, latin house',
    broll: [
      { text: 'Fatto a mano', sub: 'Ogni giorno, da zero', motion: 'pop', query: 'chef cooking pasta' },
      { layout: 'list', text: 'Farina | Pomodoro | Basilico', sub: 'Solo 3 ingredienti', motion: 'float', query: 'fresh ingredients' },
      { layout: 'stat', text: '48 ore', sub: 'di lievitazione', motion: 'zoom-in', query: 'pizza dough' },
      { text: 'Ingredienti freschi', sub: 'Dal mercato alla tavola', motion: 'slide-up', query: 'fresh ingredients market' },
      { text: 'Il piatto del giorno', sub: 'Solo oggi', motion: 'zoom-in', query: 'food plating restaurant' },
      { text: 'Prenota il tuo tavolo', sub: 'Link in bio', motion: 'float', query: 'restaurant dinner table' },
    ],
  },
  {
    id: 'prodotti', keywords: ['perfume bottle aesthetic', 'luxury product shot', 'jewelry macro', 'water splash product', 'perfume commercial cinematic', 'profumo estetica'], title: 'Luxe Showcase', tag: 'Prodotti · Profumi · Oggetti',
    desc: 'Estetica premium per profumi, gioielli e oggetti: movimenti lenti, luci morbide, dettagli.',
    gradient: 'linear-gradient(135deg,#c9a7ff 0%,#ff9ad5 100%)', accent: '#d9b46a', icon: '❖',
    defaults: {
      captions: { style: 'clean', accent: '#d9b46a', uppercase: true, maxWords: 3, position: 0.8, size: 0.9 },
      motion: { mode: 'smooth', transition: 'zoom' },
      look: { filter: 'luxe', intensity: 0.8 },
      music: { duck: 0.25, vol: 0.4 },
      imageDuration: 2.4,
    },
    musicMood: 'Deep house elegante, R&B lento, fashion',
    broll: [
      { text: 'Nuova collezione', sub: 'Edizione limitata', motion: 'zoom-out', query: 'perfume bottle' },
      { layout: 'quote', text: 'L’eleganza è un dettaglio', sub: 'Vell’s', motion: 'float', query: 'luxury detail' },
      { layout: 'list', text: 'Bergamotto | Ambra | Vaniglia', sub: 'Note olfattive', motion: 'slide-up', query: 'perfume ingredients' },
      { text: 'Dettagli che parlano', sub: 'Artigianalità italiana', motion: 'float', query: 'luxury product detail' },
      { text: 'Il regalo perfetto', sub: 'Spedizione in 24h', motion: 'slide-up', query: 'gift box elegant' },
      { text: 'Scopri di più', sub: 'Shop online', motion: 'pop', query: 'fashion boutique' },
    ],
  },
  {
    id: 'slideshow', keywords: ['golden hour friends', 'film photo aesthetic', 'summer memories aesthetic', 'wedding details aesthetic', 'vintage camcorder aesthetic', 'ricordi estate'], title: 'Momenti in Reel', tag: 'Slideshow · Foto · Eventi',
    desc: 'Le tue foto diventano una storia: Ken Burns, dissolvenze e musica che emoziona.',
    gradient: 'linear-gradient(135deg,#d7f56a 0%,#6ee7b0 100%)', accent: '#b6f24a', icon: '▣',
    defaults: {
      captions: { style: 'ios', accent: '#b6f24a', uppercase: false, maxWords: 4, position: 0.78, size: 1 },
      motion: { mode: 'smooth', transition: 'fade' },
      look: { filter: 'film', intensity: 0.7 },
      music: { duck: 0.35, vol: 0.6 },
      imageDuration: 2.6,
    },
    musicMood: 'Indie acustico, pop nostalgico, piano + archi',
    broll: [
      { text: 'Un giorno da ricordare', sub: '', motion: 'zoom-in', query: 'golden hour friends' },
      { layout: 'quote', text: 'I momenti migliori non si programmano', sub: '', motion: 'float', query: 'film photo' },
      { text: 'Dietro le quinte', sub: '', motion: 'slide-up', query: 'behind the scenes' },
      { text: 'Grazie a tutti', sub: '', motion: 'float', query: 'celebration confetti' },
    ],
  },
];

VRS.CAPTION_STYLES = [
  { id: 'ios', name: 'iOS Pop', desc: 'Helvetica/SF, parole che entrano con rimbalzo + suono', font: '700 {s}px -apple-system, "SF Pro Display", "Helvetica Neue", Helvetica, Inter, Arial, sans-serif' },
  { id: 'highlight', name: 'Highlight Pro', desc: 'Montserrat, parola attiva su tab colorata', font: '800 {s}px Montserrat, Arial, sans-serif' },
  { id: 'clean', name: 'Clean Shadow', desc: 'Bianco semplice con ombra, leggibile ovunque', font: '700 {s}px Inter, "Helvetica Neue", Arial, sans-serif' },
  { id: 'karaoke', name: 'Bold Karaoke', desc: 'Contorno nero, parola attiva colorata e più grande', font: '900 {s}px Montserrat, Arial, sans-serif' },
  { id: 'single', name: 'Una parola', desc: 'Stile “Hormozi”: una parola gigante alla volta, parole chiave colorate', font: '900 {s}px Montserrat, Arial, sans-serif' },
  { id: 'typewriter', name: 'Macchina da scrivere', desc: 'Lettere che compaiono su box scuro, cursore lampeggiante', font: '600 {s}px "SF Mono", Menlo, Consolas, "Courier New", monospace' },
  { id: 'minimal', name: 'Minimal', desc: 'minuscolo, piccolo, elegante: luxury e lifestyle', font: '500 {s}px Inter, "Helvetica Neue", Arial, sans-serif' },
];

// filtri: parametri canvas (brightness/contrast/saturate/sepia/hue) + tinta, vignettatura, grana
VRS.FILTERS = [
  { id: 'none', name: 'Originale', b: 1, c: 1, s: 1, sep: 0, hue: 0 },
  { id: 'naturale', name: 'Naturale+', b: 1.03, c: 1.06, s: 1.1, sep: 0, hue: 0 },
  { id: 'caldo', name: 'Caldo', b: 1.04, c: 1.06, s: 1.18, sep: 0.12, hue: -4, tint: ['#ff9a3c', 0.08] },
  { id: 'freddo', name: 'Freddo', b: 1.02, c: 1.05, s: 0.95, sep: 0, hue: 6, tint: ['#3c8dff', 0.08] },
  { id: 'clinico', name: 'Clinico', b: 1.06, c: 1.04, s: 0.92, sep: 0, hue: 4, tint: ['#bfe9ff', 0.06] },
  { id: 'contrasto', name: 'Contrasto', b: 1.0, c: 1.18, s: 1.05, sep: 0, hue: 0, vignette: 0.25 },
  { id: 'film', name: 'Film', b: 1.04, c: 0.94, s: 0.9, sep: 0.18, hue: 0, grain: 0.07, vignette: 0.3, fade: 0.05 },
  { id: 'luxe', name: 'Luxe', b: 0.98, c: 1.16, s: 0.82, sep: 0.06, hue: 0, vignette: 0.45, tint: ['#d9b46a', 0.05] },
  { id: 'teal', name: 'Teal & Orange', b: 1.0, c: 1.12, s: 1.12, sep: 0, hue: 0, tint: ['#008c9e', 0.07], tint2: ['#ff8a3c', 0.06] },
  { id: 'vivid', name: 'Vivid', b: 1.03, c: 1.1, s: 1.35, sep: 0, hue: 0 },
  { id: 'bn', name: 'Bianco & Nero', b: 1.02, c: 1.2, s: 0, sep: 0, hue: 0, grain: 0.05, vignette: 0.3 },
];

VRS.MOTION_MODES = [
  { id: 'semplice', name: 'Semplice', desc: 'Nessun movimento, tagli puliti' },
  { id: 'smooth', name: 'Smooth', desc: 'Ken Burns lento e morbido su ogni clip' },
  { id: 'push', name: 'Push-in', desc: 'Avvicinamento lento e costante: intimo, autorevole' },
  { id: 'dinamico', name: 'Punch-in', desc: 'Zoom 10–15% alternato a ogni frase: ritmo da talking head' },
  { id: 'impact', name: 'Impact', desc: 'Punch-in + scossa sulle frasi: energia massima' },
];
VRS.TRANSITIONS = [
  { id: 'cut', name: 'Taglio netto' },
  { id: 'fade', name: 'Dissolvenza' },
  { id: 'zoom', name: 'Zoom in/out' },
  { id: 'slide', name: 'Scorrimento' },
  { id: 'whip', name: 'Whip blur' },
  { id: 'flash', name: 'Flash bianco' },
  { id: 'spin', name: 'Spin zoom' },
];
VRS.BROLL_LAYOUTS = [
  { id: 'title', name: 'Titolo', desc: 'Titolo grande + tag' },
  { id: 'stat', name: 'Numero', desc: 'Statistica che conta (es. 8 su 10)' },
  { id: 'quote', name: 'Citazione', desc: 'Frase tra virgolette, serif' },
  { id: 'list', name: 'Lista', desc: 'Punti che entrano uno a uno (separa con |)' },
];
VRS.BROLL_MOTIONS = [
  { id: 'zoom-in', name: 'Zoom in' }, { id: 'zoom-out', name: 'Zoom out' }, { id: 'pan-left', name: 'Pan sinistra' },
  { id: 'pan-right', name: 'Pan destra' }, { id: 'slide-up', name: 'Sale dal basso' }, { id: 'pop', name: 'Pop' }, { id: 'float', name: 'Fluttua' },
];

// Fonti musicali: NON si possono includere brani protetti; qui link a trend e librerie libere
VRS.MUSIC_SOURCES = [
  { name: 'TikTok Creative Center', desc: 'Classifica ufficiale dei suoni di tendenza (filtra per Italia)', url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/it', color: '#ff2d6f', badge: 'Trend' },
  { name: 'Instagram Reels Trending', desc: 'Nell’app: Reels → icona audio → “Di tendenza” (freccia ↗)', url: 'https://www.instagram.com/reels/', color: '#c13584', badge: 'Trend' },
  { name: 'Pixabay Music', desc: 'Brani gratuiti, uso commerciale consentito', url: 'https://pixabay.com/music/', color: '#2ec66d', badge: 'Free' },
  { name: 'Uppbeat', desc: 'Musica per creator, piano gratuito', url: 'https://uppbeat.io/', color: '#7b61ff', badge: 'Free' },
  { name: 'YouTube Audio Library', desc: 'Libreria gratuita di YouTube Studio', url: 'https://studio.youtube.com/channel/UC/music', color: '#ff3d3d', badge: 'Free' },
  { name: 'Artlist', desc: 'Catalogo premium con licenza social', url: 'https://artlist.io/', color: '#f5c242', badge: 'Pro' },
];

VRS.FORMATS = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080] };

VRS.newProject = function (categoryId) {
  const cat = VRS.CATEGORIES.find((c) => c.id === categoryId) || VRS.CATEGORIES[0];
  const d = cat.defaults;
  return {
    id: null, name: 'Nuovo reel ' + new Date().toLocaleDateString('it-IT'), category: cat.id, format: '9:16',
    clips: [], broll: [],
    captions: Object.assign({ enabled: true, style: 'ios', accent: cat.accent, color: '#ffffff', uppercase: false, maxWords: 3, position: 0.72, size: 1, sfx: true, sfxType: 'pop' }, d.captions),
    motion: Object.assign({ mode: 'smooth', transition: 'fade', transDur: 0.35, intensity: 1, sfx: true }, d.motion),
    look: Object.assign({ filter: 'none', intensity: 0.8, vignette: 0, grain: 0 }, d.look),
    audio: { voiceVol: 1, cleanVoice: true, normalize: true, autoColor: true, lut: 'none', lutStrength: 1 },
    music: Object.assign({ url: null, name: null, vol: 0.3, ducking: true, duck: 0.22, threshold: 0.012, offset: 0, fadeIn: 1, fadeOut: 2 }, d.music),
    watermark: { enabled: false, pos: 'top-right', opacity: 0.85, variant: 'white', size: 0.13 },
    imageDuration: d.imageDuration || 2.5,
  };
};

// ======================================================================
// CATALOGO TREND (ricerca novembre 2026: blog di settore, guide editor,
// tool di caption). Ogni voce ha le parole chiave per Pinterest/TikTok.
// ======================================================================
VRS.TRENDS = {
  broll: [
    { id: 'talking', name: 'Talking head + B-roll', desc: 'Parli in camera e tagli su immagini che illustrano ciò che dici. Il formato più usato per contenuti educativi e professionali.', use: ['medico', 'politico'], layout: 'title', motion: 'zoom-in', keywords: ['talking head b roll', 'b roll ideas reels', 'educational reel b roll'] },
    { id: 'cinematic', name: 'Cinematic', desc: 'Clip brevi, movimenti morbidi e color grading marcato. Funziona in viaggi, food e lifestyle.', use: ['food', 'prodotti', 'slideshow'], layout: 'title', motion: 'pan-left', keywords: ['cinematic b roll', 'aesthetic b roll', 'b roll cinematografico', 'cinematic reel color grading'] },
    { id: 'macro', name: 'Macro & texture', desc: 'Primissimi piani di materiali, gocce, cuciture, superfici. Perfetto per prodotti premium ed e-commerce.', use: ['prodotti', 'food'], layout: 'title', motion: 'zoom-out', keywords: ['macro product shot', 'texture close up aesthetic', 'product b roll', 'water drops macro aesthetic'] },
    { id: 'hands', name: 'Mani & processo (POV)', desc: 'Mani che lavorano, preparano, impacchettano. Ideale anche per contenuti senza volto.', use: ['food', 'prodotti', 'medico'], layout: 'title', motion: 'float', keywords: ['hands b roll aesthetic', 'pov hands working', 'process video aesthetic', 'asmr hands'] },
    { id: 'foodmotion', name: 'Food motion', desc: 'Versare, impiattare, tagliare, il vapore. Nel food conta il movimento.', use: ['food'], layout: 'title', motion: 'zoom-in', keywords: ['food pouring slow motion', 'plating aesthetic', 'cheese pull', 'steam food close up'] },
    { id: 'mood', name: 'Mood & ambiente', desc: 'Luce dalla finestra, ombre, polvere nel raggio di sole, la location. Crea l’atmosfera e introduce il luogo.', use: ['slideshow', 'prodotti'], layout: 'quote', motion: 'float', keywords: ['window light shadows aesthetic', 'aesthetic morning light', 'cozy aesthetic video', 'golden hour aesthetic'] },
    { id: 'bts', name: 'Dietro le quinte', desc: 'Lo studio, la cucina, il set, la timeline di montaggio: mostra il lavoro invece del volto.', use: ['food', 'politico', 'prodotti'], layout: 'title', motion: 'slide-up', keywords: ['behind the scenes aesthetic', 'studio setup aesthetic', 'bts content creator', 'dietro le quinte'] },
    { id: 'smallwins', name: 'Piccole vittorie (daily)', desc: 'Montaggio di momenti quotidiani (caffè, ordini pronti, clienti) su un audio di tendenza.', use: ['food', 'prodotti', 'slideshow'], layout: 'list', motion: 'pop', keywords: ['day in my life aesthetic', 'coffee aesthetic video', 'packing orders small business', 'small wins'] },
    { id: 'textpov', name: 'Testo su B-roll (POV)', desc: 'Una frase o una “chat finta” sopra una clip d’atmosfera. I trend di formato durano 3–4 settimane, quelli audio 7–10 giorni.', use: ['slideshow', 'food', 'prodotti'], layout: 'title', motion: 'zoom-in', keywords: ['pov text overlay video', 'text on video aesthetic', 'where are you trend', 'pov reel'] },
    { id: 'unboxing', name: 'Unboxing / rotazione', desc: 'Apertura ASMR, prodotto che ruota, angolazioni multiple.', use: ['prodotti'], layout: 'title', motion: 'zoom-out', keywords: ['unboxing asmr aesthetic', 'product turntable video', 'perfume aesthetic video', 'packaging aesthetic'] },
    { id: 'data', name: 'Dati & numeri animati', desc: 'Numeri che contano, statistiche, grafici: rendono concreta una tesi.', use: ['medico', 'politico'], layout: 'stat', motion: 'zoom-in', keywords: ['infographic animation', 'animated statistics reel', 'data visualization aesthetic'] },
    { id: 'kinetic', name: 'Tipografia cinetica', desc: 'Card di solo testo animato: liste, citazioni, “3 errori da evitare”.', use: ['medico', 'politico', 'prodotti'], layout: 'list', motion: 'slide-up', keywords: ['kinetic typography reels', 'minimal text animation', 'typography motion design'] },
  ],
  captions: [
    { id: 'ios', tip: 'Entrata a rimbalzo parola per parola (pop-on): fa colpo, adatto a food e lifestyle.' },
    { id: 'highlight', tip: 'Parola attiva su un box colorato: il più chiaro per contenuti educativi.' },
    { id: 'karaoke', tip: 'La frase intera con la parola detta che cambia colore: aiuta il coinvolgimento e chi riguarda il video.' },
    { id: 'single', tip: 'Stile “Hormozi”: Montserrat Black maiuscolo con contorno nero, una parola alla volta, parole chiave in giallo o verde.' },
    { id: 'clean', tip: 'Bianco con ombra e contorno sottile: si legge su qualsiasi video.' },
    { id: 'typewriter', tip: 'Effetto narrativo, per storie, POV e citazioni.' },
    { id: 'minimal', tip: 'Elegante e discreto: luxury, moda, slideshow emozionali.' },
  ],
  rules: [
    'Oltre l’80% dei video brevi si guarda senza audio (dato dei produttori di tool, da prendere con cautela): le caption sono indispensabili.',
    '2–5 parole per schermata, grassetto senza grazie, nella fascia medio-bassa (zona sicura).',
    'Su Reels e TikTok conviene un taglio ogni 1–2 secondi (8–15 tagli in 30 secondi).',
    'Punch-in del 10–15% su un lato del taglio: nasconde il jump cut e dà enfasi.',
    'Transizioni da 0,2 a 0,4 secondi; whip pan sempre con motion blur e nella stessa direzione.',
    'Non abusare delle transizioni vistose: riservale all’hook e ai momenti chiave.',
    'Speed ramp e whip pan nel 2026 sono la norma, non più una novità.',
  ],
  sources: [
    ['SocialBee — Instagram trends', 'https://socialbee.com/blog/latest-instagram-trends/'],
    ['Later — Reels trends', 'https://later.com/blog/instagram-reels-trends/'],
    ['OpusClip — B-roll & effetti (dati 2026)', 'https://www.opus.pro/research/broll-visual-effects-short-form'],
    ['VFXAI — Caption styles 2026', 'https://www.vfxai.com/blog/trending-caption-styles-for-2026'],
    ['Submagic — Hormozi captions', 'https://www.submagic.co/blog/how-to-make-alex-hormozi-captions'],
    ['ShortGenius — Transizioni', 'https://shortgenius.com/blog/transitions-for-videos'],
    ['Async — 25 esempi di B-roll', 'https://async.com/blog/what-is-b-roll/'],
  ],
};
VRS.searchLinks = (q) => ({
  pinterest: 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(q),
  tiktok: 'https://www.tiktok.com/search?q=' + encodeURIComponent(q),
  pexels: 'https://www.pexels.com/search/videos/' + encodeURIComponent(q) + '/?orientation=portrait',
});
