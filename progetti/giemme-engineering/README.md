# Giemme Engineering – reel "Il tuo DVR è in un cassetto?"

Reel 9:16 (42 s) sul Documento di Valutazione dei Rischi, montato con lo stile di `STILE-REEL.md`
più i b-roll animati sul modello del video di riferimento (griglia tecnica, box titolo, riquadri con le maniglie).

## File
| File | Cosa contiene |
|---|---|
| `ANALISI.md` | argomento, testo parlato, arco narrativo, idee b-roll |
| `CLIENTE.md` | scheda cliente, colori (#E50210), logo |
| `RIFERIMENTO-BROLL.md` | cosa riprendiamo dal video di riferimento |
| `tagli.txt` | i 6 pezzi del montaggio (l'hook è riordinato) |
| `lut/IMG_0109.cube` | pareggio colore della clip 0109 |
| `storyboard-giemme-dvr.html` | storyboard approvato (sorgenti in `storyboard-sorgente/`) |
| `copertina-*.png` | copertina 1080×1920 e ritaglio griglia 1080×1350 |
| `materiali/` | logo in versione chiara e scura |

Il montaggio è in `remotion/src/giemme/` (composizione **GiemmeDVR**): i file di "Due vertenze" non sono toccati.

## Rifare il video
```bash
# 1. clip (originali in una cartella, es. ~/Giemme/girato)
strumenti/prepara_clip.sh ~/Giemme/girato remotion/public/giemme/clips progetti/giemme-engineering/tagli.txt progetti/giemme-engineering/lut
# 2. tempi delle parole e viso
python strumenti/trascrivi_parole.py remotion/public/giemme/clips strumenti/modelli/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 remotion/src/giemme/data/words.json
python strumenti/traccia_viso.py remotion/public/giemme/clips strumenti/modelli/yunet.onnx remotion/src/giemme/data/faces.json
# 3. anteprima e render
cd remotion && npm run studio            # composizione GiemmeDVR
npx remotion render src/index.ts GiemmeDVR out/giemme-raw.mp4 --crf=17
ffmpeg -i out/giemme-raw.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 256k out/giemme-dvr-reel.mp4
```
Nota: la trascrizione scrive "DBR" al posto di "DVR" nella domanda della 0103c; in `Reel.tsx` la parola è cercata così.
