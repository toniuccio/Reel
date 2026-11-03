# Vels Reel Studio

Una dashboard che gira sul tuo computer (localhost) per montare reel verticali.
Carichi i video, scegli il format, e lo studio si occupa di sottotitoli animati, B-roll, zoom, filtri, LUT, pulizia audio, musica con ducking ed export in MP4.

## Requisiti (una volta sola)
| | Mac | Windows |
|---|---|---|
| **Node.js 18+** | [nodejs.org](https://nodejs.org) (LTS) | [nodejs.org](https://nodejs.org) (LTS) |
| **FFmpeg** | `brew install ffmpeg` | `winget install Gyan.FFmpeg` |
| *Whisper (facoltativo, sottotitoli automatici)* | `pip install -U openai-whisper` | `pip install -U openai-whisper` |

Non serve `npm install`: non ci sono dipendenze da installare.

## Avvio
- **Mac**: doppio clic su `avvia-mac.command`. La prima volta: tasto destro → Apri.
- **Windows**: doppio clic su `avvia-windows.bat`.
- Oppure da terminale: `node server.js`, poi apri <http://localhost:4747> in **Chrome**.

## Dal telefono 📱
Il PC fa da "motore" (FFmpeg e Whisper). Il telefono lo usi come app:
1. Avvia lo studio sul PC. Telefono e PC devono essere sulla **stessa rete Wi-Fi**.
2. Sul PC tocca 📱 in alto a destra e inquadra il QR code con il telefono. In alternativa, digita l'indirizzo che compare nel terminale (es. `http://192.168.1.20:4747`).
3. Nel browser del telefono tocca Condividi → **Aggiungi a schermata Home**.
4. Da lì carichi i video dalla galleria, monti ed esporti. Alla fine scarichi l'MP4 sul telefono. Su iPhone: Condividi → Salva video.

> Lo studio è visibile a chiunque sia sulla stessa rete Wi-Fi. Per usarlo solo sul PC avvialo con `HOST=127.0.0.1 node server.js`.

## Percorso guidato (Crea)
1. **File**: carichi dalla galleria e riordini.
2. **Categoria**: scegli guardando le anteprime animate.
3. **Pilota automatico**: un pulsante **✨ Fai tutto tu** taglia silenzi e pause (jump cut), genera i sottotitoli, corregge colore e voce, inserisce i B-roll (anche i tuoi riferimenti) e la musica con ducking.
4. **Caption**: 7 stili con anteprima animata; qui puoi anche correggere il testo.
5. **B-roll**: i trend consigliati per la tua categoria, layout Titolo, Numero, Citazione o Lista, clip della tua libreria.
6. **Zoom e transizioni**: 5 stili di zoom e 7 transizioni, tutti con anteprima.
7. **Look e correzioni**: filtri sul tuo fotogramma, auto colore, LUT.
8. **Musica e audio**: brano, ducking, pulizia voce.
9. **Esporta**.

## Trend & Ricerca
Contiene il catalogo dei trend (B-roll, caption, zoom, transizioni) con le **parole chiave** per categoria: accanto a ognuna ci sono i pulsanti diretti per Pinterest (P), TikTok (T) e Pexels (X).
Le clip che scarichi le carichi come **riferimenti**, etichettati per categoria e trend, e il pilota automatico le usa come B-roll.
La ricerca completa è in [`docs/TREND.md`](docs/TREND.md).

## Cosa fa
- **5 format**: Camice & Verità (medico), Il Palco (politico), Gusto in Movimento (food), Luxe Showcase (prodotti/profumi), Momenti in Reel (slideshow foto). Ognuno imposta i propri preset.
- **Media**: carichi uno o più video e foto, li riordini, li tagli e li dividi (tasto `S`). I video HEVC dell'iPhone vengono convertiti in automatico. I video orizzontali possono usare lo sfondo sfocato.
- **Sottotitoli**: iOS Pop (Helvetica, entrata con rimbalzo e suono), Highlight Pro (Montserrat con la parola su una tab colorata), Clean Shadow, Bold Karaoke. Il testo arriva da Whisper, lo scrivi tu (lo sincronizzo io) oppure importi un file .SRT.
- **B-roll**: card animate stile Pinterest generate dal tema della categoria, con testi e movimenti modificabili. In alternativa, clip e foto reali da Pexels (serve una API key gratuita, da inserire in ⚙) o tuoi file.
- **Zoom e transizioni**: modalità Semplice, Smooth (Ken Burns) o Dinamico (punch-in sulle frasi). Transizioni: taglio, dissolvenza, zoom, scorrimento, whip blur, con suono di passaggio.
- **Look**: 11 filtri con intensità regolabile, vignettatura, grana. Correzione colore automatica e 6 LUT cinematografiche fatte con FFmpeg.
- **Audio**: pulizia della voce (riduzione rumore, compressione), volume uniforme, musica con fade, **ducking automatico** (la musica si abbassa quando parli), effetti sonori.
- **Export**: MP4 H.264 1080×1920 a 30 fps, volume a −14 LUFS per Instagram e TikTok.

## Dove finiscono i file
Tutto resta nella cartella `data/` (upload, file elaborati, export, progetti), sul tuo computer.

## Note
- L'export avviene in tempo reale: tieni la scheda **aperta e visibile** finché non finisce.
- Musica di tendenza: per i diritti d'autore non è possibile scaricare i brani da TikTok o Instagram. Usa i link nella sezione Musica. Un consiglio: se usi un suono di tendenza, aggiungilo direttamente nell'app social, così l'algoritmo associa il tuo reel al trend.
