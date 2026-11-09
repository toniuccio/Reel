#!/usr/bin/env bash
# Prepara le clip del reel "Sanità e ADI" per Remotion.
# uso: progetti/sanita-adi/prepara.sh <cartella_upload>
# Tutte le clip sono SDR: colori originali + un solo look identico per tutte, velocità 1,06x, voce pulita.
set -euo pipefail
IN="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
OUT="$ROOT/remotion/public/sanita/clips"; mkdir -p "$OUT"
SPEED=1.06
LOOK="eq=contrast=1.03:saturation=1.04"
HDR="colorspace=all=bt709:iall=bt2020:itrc=bt709:fast=1,format=yuv420p"   # solo se una clip fosse HDR
VOICE="highpass=f=80,afftdn=nf=-25,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2,loudnorm=I=-16:TP=-2:LRA=7"

grep -v "^#" "$DIR/tagli.txt" | grep -v "^\s*$" | while read -r n a b; do
  f=$(ls "$IN"/*IMG_"$n".MOV)
  d=$(echo "$b - $a" | bc -l)
  tr=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$f" | head -1)
  pre=""; [ "$tr" = "arib-std-b67" ] && pre="$HDR,"
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" \
    -vf "${pre}$LOOK,setpts=PTS/$SPEED,fps=30,scale=1080:1920:flags=lanczos" \
    -an -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -movflags +faststart "$OUT/$n.mp4"
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" -vn -af "$VOICE,atempo=$SPEED" -ar 48000 -ac 2 "$OUT/$n.wav"
  # durata in frame interi (30 fps): servono per tagli puliti
  fr=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT/$n.mp4")
  echo "$n $fr"
done
