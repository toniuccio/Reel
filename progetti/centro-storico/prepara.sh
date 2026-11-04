#!/usr/bin/env bash
# Prepara le clip del reel "Centro storico" per Remotion.
# uso: progetti/centro-storico/prepara.sh <cartella_upload>
#   parlati: taglio pause, colori originali (solo lettura HDR->SDR), 1,06x, voce pulita
#   b-roll:  solo video, colori originali, velocità normale
#   vecchio reel: pezzo 19,9-27,75 s con audio originale, nessuna correzione colore
set -euo pipefail
IN="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/remotion/public/centro"; mkdir -p "$OUT/clips" "$OUT/broll" "$OUT/old"
GRADE="$ROOT/strumenti/grade.sh"
SPEED=1.06
# più vivido e meno pallido (richiesta di Antonio dopo la prima versione)
VIVO="eq=saturation=1.24:contrast=1.08,curves=master='0/0 0.06/0.03 0.25/0.22 0.5/0.5 0.78/0.81 1/1',vibrance=intensity=0.15"
# HDR (HLG) letto come video normale, come lo esporta l'iPhone in SDR: nessun tonemap, nessuna correzione
TM="colorspace=all=bt709:iall=bt2020:itrc=bt709:fast=1,format=yuv420p"
VOICE="highpass=f=80,afftdn=nf=-25,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2,loudnorm=I=-16:TP=-2:LRA=7"

src() { ls "$IN"/*IMG_"$1".MOV; }
tonemap() { # stampa il tonemap solo per le clip HDR
  local tr; tr=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$1" | head -1)
  if [ "$tr" = "arib-std-b67" ]; then echo "$TM,"; fi
}

# parlati: clip inizio fine
while read -r n a b; do
  f=$(src "$n"); d=$(echo "$b - $a" | bc -l)
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" \
    -vf "$(tonemap "$f")setpts=PTS/$SPEED,fps=30,scale=1080:1920:flags=lanczos" \
    -an -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -movflags +faststart "$OUT/clips/$n.mp4"
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" -vn -af "$VOICE,atempo=$SPEED" -ar 48000 -ac 2 "$OUT/clips/$n.wav"
  echo "parlato $n $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/clips/$n.mp4")"
done <<'EOF'
0389 0.92 5.98
0370 0.40 2.78
0374 10.55 18.15
0380 0.22 10.15
0381 0.52 15.25
0383 0.60 6.45
EOF

# b-roll: clip inizio fine
while read -r n a b; do
  f=$(src "$n"); d=$(echo "$b - $a" | bc -l)
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" \
    -vf "$(tonemap "$f")fps=30,scale=1080:1920:flags=lanczos" \
    -an -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -movflags +faststart "$OUT/broll/$n.mp4"
  echo "b-roll $n $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/broll/$n.mp4")"
done <<'EOF'
0366 3.40 6.50
0367 1.00 4.40
0385 0.30 4.30
0388 0.20 3.80
0386 1.20 5.20
0387 0.20 6.20
0384 0.80 4.80
EOF

# vecchio reel del 10 maggio
OLD=$(ls "$IN"/*snapgram*.mp4)
ffmpeg -nostdin -v error -y -ss 19.9 -t 7.85 -i "$OLD" -an -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p "$OUT/old/old.mp4"
ffmpeg -nostdin -v error -y -ss 19.9 -t 7.85 -i "$OLD" -vn -af "highpass=f=70,loudnorm=I=-16:TP=-2:LRA=7" -ar 48000 -ac 2 "$OUT/old/old.wav"
echo "vecchio reel $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/old/old.mp4")"
