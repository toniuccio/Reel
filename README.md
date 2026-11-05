# Reel: modello di montaggio

Questo repository contiene il modello di montaggio per i reel parlati. Ci sono:
- **lo stile** (`STILE-REEL.md`): colore, inquadrature, testi, transizioni, audio e copertina;
- **gli script** (`strumenti/`): preparano le clip, ricavano i tempi delle parole, tracciano il viso e generano gli effetti sonori;
- **il progetto video** (`remotion/`): le animazioni in Remotion, modificabili anche da Remotion Studio;
- **il primo reel fatto con questo modello**: `due-vertenze-reel.mp4`, con storyboard e copertina.

## Installazione sul computer (una volta sola)

Servono quattro programmi:

| Programma | Mac (Terminale) | Windows |
|---|---|---|
| Git | già presente, oppure `xcode-select --install` | [git-scm.com](https://git-scm.com) (include Git Bash) |
| Node.js 20 o più recente | `brew install node` | [nodejs.org](https://nodejs.org) |
| FFmpeg completo | `brew install ffmpeg` | build "full" da [gyan.dev](https://www.gyan.dev/ffmpeg/builds/), da aggiungere al PATH |
| Python 3.11 o più recente | `brew install python` | [python.org](https://www.python.org) |

Su Windows esegui i comandi in **Git Bash**, perché gli script `.sh` sono per bash.

Poi scarica il progetto e installa le dipendenze:

```bash
git clone https://github.com/toniuccio/Reel.git
cd Reel
git checkout claude/devona-reel-recovery-qux2de   # finché il branch non viene unito a main
cd remotion && npm install && cd ..
pip install sherpa-onnx soundfile opencv-python-headless numpy pillow
```

Infine scarica i due modelli che servono e mettili in `strumenti/modelli/` (questa cartella non va su GitHub):
- **trascrizione con i tempi parola per parola**: `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2` dalle release di [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models), da estrarre nella cartella;
- **rilevamento del viso**: `face_detection_yunet_2023mar.onnx` da [opencv_zoo](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet), da salvare come `strumenti/modelli/yunet.onnx`.

## Come fare un nuovo reel

1. **Copia le clip** `.mov` dell'iPhone in una cartella, per esempio `~/Reel-nuovo/girato`.
2. **Proponi i tagli**:
   ```bash
   python strumenti/proponi_tagli.py ~/Reel-nuovo/girato > tagli.txt
   ```
   Controlla `tagli.txt`: una riga per clip (`numero inizio fine`), nell'ordine del montaggio.
3. **Prepara le clip**: conversione HDR, colore, tagli, velocità 1,06× e voce pulita.
   ```bash
   strumenti/prepara_clip.sh ~/Reel-nuovo/girato remotion/public/clips tagli.txt
   ```
   Se una clip va corretta nel colore, aggiungi una riga in `strumenti/grade.sh` e rilancia.
4. **Ricava i tempi delle parole e la posizione del viso**:
   ```bash
   python strumenti/trascrivi_parole.py remotion/public/clips strumenti/modelli/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 remotion/src/data/words.json
   python strumenti/traccia_viso.py remotion/public/clips strumenti/modelli/yunet.onnx remotion/src/data/faces.json
   ```
5. **Monta le scene**:
   - in `remotion/src/timeline.ts` aggiorna l'elenco `CLIPS` (numero, durata, eventuale taglio iniziale);
   - in `remotion/src/scenes.tsx` scrivi una scena per clip con i testi agganciati alle parole, per esempio `<Word at={L('basta')} text="basta." size="xl" glow />`;
   - in `remotion/src/Reel.tsx` scegli le transizioni (`IN`) e gli effetti sonori.

   I componenti `text.tsx` (testi, bagliore, liste che si scrivono) e `video.tsx` (inquadratura sul viso, card degli insert) non vanno toccati: sono lo stile.
6. **Guarda l'anteprima** in Remotion Studio, dove puoi scorrere il video fotogramma per fotogramma:
   ```bash
   cd remotion && npm run studio
   ```
7. **Renderizza e normalizza l'audio**:
   ```bash
   cd remotion
   npx remotion render src/index.ts DueVertenze out/raw.mp4 --crf=17
   ffmpeg -i out/raw.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
     -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 256k out/reel-finale.mp4
   ```

## Effetti sonori
In `remotion/public/sfx/` ci sono effetti generati da `strumenti/genera_sfx.py`. Per usare quelli di `libreria_sfx_reel.zip`, copia i WAV in quella cartella con gli stessi nomi (`short_whoosh.wav`, `boom_sub.wav`, …) e renderizza di nuovo.

Effetti estratti dal pacchetto "Cinematic Sound Effect" (Riser, Hit, Swoosh), nominati con i titoli del video:

| File | Durata | Uso tipico |
|---|---|---|
| `suspense_riser.wav` | 1,8 s | tensione che sale prima di una rivelazione |
| `slow_down.wav` | 2,3 s | rallentamento, nastro che si ferma |
| `charge.wav` | 2,5 s | carica che cresce verso un colpo |
| `snap.wav` | 0,3 s | schiocco secco su un taglio |
| `radio_beep.wav` | 0,5 s | bip su un dato o un'etichetta |
| `flash.wav` | 1,9 s | lampo, flash bianco di transizione |
| `metallic_hit.wav` | 2,3 s | colpo metallico sulla parola chiave |

## Usarlo con Claude
Per lavorare con Claude sul computer (Claude Code o l'app desktop) apri questa cartella: Claude legge `STILE-REEL.md` e il progetto e riparte da qui. La skill in `skill/reel-parlato-cinematico/` porta lo stesso stile in tutte le chat (vedi sotto).
