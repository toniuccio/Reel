#!/usr/bin/env bash
# Prepara le clip per il montaggio: taglio delle pause, HDR->SDR, correzione colore,
# velocità 1,06x a tono invariato, 30 fps, voce pulita.
# uso: prepara_clip.sh <cartella_mov> <cartella_uscita> <tagli.txt>
#   tagli.txt: una riga per clip "numero inizio fine" (secondi), nell'ordine del montaggio
set -euo pipefail
IN="$1"; OUT="$2"; TAGLI="$3"; mkdir -p "$OUT"
DIR="$(cd "$(dirname "$0")" && pwd)"
SPEED=1.06
TM="zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
VOICE="highpass=f=80,afftdn=nf=-25,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2"

while read -r n a b; do
  f=$(ls "$IN"/*IMG_"$n".mov)
  d=$(echo "$b - $a" | bc -l)
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" \
    -vf "$TM,$("$DIR"/grade.sh "$n"),setpts=PTS/$SPEED,fps=30,scale=1080:1920:flags=lanczos" \
    -an -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -movflags +faststart "$OUT/$n.mp4"
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" -vn -af "$VOICE,atempo=$SPEED" -ar 48000 -ac 2 "$OUT/$n.wav"
  echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$n.mp4")"
done < <(grep -v "^#" "$TAGLI" | grep -v "^\s*$")
