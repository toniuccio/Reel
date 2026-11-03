// Vels Reel Studio — preset, categorie, stili
window.VRS = window.VRS || {};

VRS.CATEGORIES = [
  {
    id: 'medico', title: 'Camice & Verità', tag: 'Medico · Salute',
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
      { text: '3 errori da evitare', sub: 'Salva questo video', motion: 'slide-up', query: 'healthy lifestyle' },
      { text: 'Il parere del medico', sub: 'Scienza, non opinioni', motion: 'zoom-in', query: 'medical research laboratory' },
      { text: 'Prenditi cura di te', sub: 'Prenota una visita', motion: 'float', query: 'wellness morning routine' },
    ],
  },
  {
    id: 'politico', title: 'Il Palco', tag: 'Politico · Istituzionale',
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
      { text: 'La nostra proposta', sub: 'Concreta. Realizzabile.', motion: 'slide-up', query: 'crowd rally' },
      { text: 'Cosa cambia per te', sub: 'In 3 punti', motion: 'pop', query: 'italian town square' },
      { text: 'Partecipa', sub: 'Il futuro si decide insieme', motion: 'float', query: 'people community' },
    ],
  },
  {
    id: 'food', title: 'Gusto in Movimento', tag: 'Ristoranti · Food',
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
      { text: 'Ingredienti freschi', sub: 'Dal mercato alla tavola', motion: 'slide-up', query: 'fresh ingredients market' },
      { text: 'Il piatto del giorno', sub: 'Solo oggi', motion: 'zoom-in', query: 'food plating restaurant' },
      { text: 'Prenota il tuo tavolo', sub: 'Link in bio', motion: 'float', query: 'restaurant dinner table' },
    ],
  },
  {
    id: 'prodotti', title: 'Luxe Showcase', tag: 'Prodotti · Profumi · Oggetti',
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
      { text: 'Dettagli che parlano', sub: 'Artigianalità italiana', motion: 'float', query: 'luxury product detail' },
      { text: 'Il regalo perfetto', sub: 'Spedizione in 24h', motion: 'slide-up', query: 'gift box elegant' },
      { text: 'Scopri di più', sub: 'Shop online', motion: 'pop', query: 'fashion boutique' },
    ],
  },
  {
    id: 'slideshow', title: 'Momenti in Reel', tag: 'Slideshow · Foto · Eventi',
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
  { id: 'dinamico', name: 'Dinamico', desc: 'Punch-in sulle frasi, zoom alternati, energia' },
];
VRS.TRANSITIONS = [
  { id: 'cut', name: 'Taglio netto' },
  { id: 'fade', name: 'Dissolvenza' },
  { id: 'zoom', name: 'Zoom in/out' },
  { id: 'slide', name: 'Scorrimento' },
  { id: 'whip', name: 'Whip blur' },
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
