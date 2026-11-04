#!/usr/bin/env bash
# Prepara le clip per il montaggio: taglio delle pause, HDR->SDR, correzione colore,
# velocità 1,06x a tono invariato, 30 fps, voce pulita.
# uso: prepara_clip.sh <cartella_mov> <cartella_uscita> <tagli.txt> [cartella_lut]
#   tagli.txt: una riga per clip "numero inizio fine" (secondi), nell'ordine del montaggio
#   cartella_lut (facoltativa): se contiene IMG_<numero>.cube, la LUT viene applicata a quella clip
#   prima della correzione colore (serve per pareggiare una clip diversa dalle altre).
#   Le clip HDR (HLG) vengono convertite in SDR; quelle già SDR (es. compresse) no.
set -euo pipefail
IN="$1"; OUT="$2"; TAGLI="$3"; LUTDIR="${4:-}"; mkdir -p "$OUT"
DIR="$(cd "$(dirname "$0")" && pwd)"
SPEED=1.06
TM="zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
VOICE="highpass=f=80,afftdn=nf=-25,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2"

while read -r n a b; do
  f=$(find -L "$IN" -maxdepth 1 -iname "*IMG_${n}*" \( -iname "*.mov" -o -iname "*.mp4" \) | head -1)
  trc=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of default=nw=1:nk=1 "$f" | head -1)
  if [ "$trc" = "arib-std-b67" ] || [ "$trc" = "smpte2084" ]; then PRE="$TM"; else PRE="format=yuv420p"; fi
  if [ -n "$LUTDIR" ] && [ -f "$LUTDIR/IMG_$n.cube" ]; then PRE="$PRE,lut3d=$LUTDIR/IMG_$n.cube"; fi
  d=$(echo "$b - $a" | bc -l)
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" \
    -vf "$PRE,$("$DIR"/grade.sh "$n"),setpts=PTS/$SPEED,fps=30,scale=1080:1920:flags=lanczos,setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
    -an -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -color_range tv -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart "$OUT/$n.mp4"
  ffmpeg -nostdin -v error -y -ss "$a" -t "$d" -i "$f" -vn -af "$VOICE,atempo=$SPEED" -ar 48000 -ac 2 "$OUT/$n.wav"
  echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$n.mp4")"
done < <(grep -v "^#" "$TAGLI" | grep -v "^\s*$")
