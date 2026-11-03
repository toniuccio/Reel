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
