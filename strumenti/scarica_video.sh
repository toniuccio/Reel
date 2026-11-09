#!/usr/bin/env bash
# Scarica un video da un link Google Drive (o copia un file locale) in una cartella.
# uso: strumenti/scarica_video.sh <link_drive | percorso_file> <cartella_uscita> [nome.mp4]
# Il file su Drive deve essere condiviso con "Chiunque abbia il link".
set -euo pipefail
src="$1"; out="$2"; name="${3:-}"
mkdir -p "$out"

if [[ -f "$src" ]]; then
  dest="$out/${name:-$(basename "$src")}"
  cp "$src" "$dest"; echo "$dest"; exit 0
fi

# ricava l'ID da /file/d/<ID>/..., ?id=<ID> o open?id=<ID>
id=$(printf '%s' "$src" | sed -nE 's#.*/file/d/([A-Za-z0-9_-]+).*#\1#p')
[[ -z "$id" ]] && id=$(printf '%s' "$src" | sed -nE 's#.*[?&]id=([A-Za-z0-9_-]+).*#\1#p')
if [[ -z "$id" ]]; then echo "ERRORE: non riconosco il link: $src" >&2; exit 1; fi

tmp="$out/.scarico-$id"
curl -sSL -o "$tmp" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t" || {
  echo "ERRORE: Drive non raggiungibile. Serve drive.usercontent.google.com tra gli host consentiti." >&2; exit 2; }

if file "$tmp" | grep -qi 'HTML'; then
  if grep -q 'Sign-in' "$tmp"; then
    echo "ERRORE: il file è privato. Su Drive: Condividi > Accesso generale > 'Chiunque abbia il link'." >&2
  else
    echo "ERRORE: Drive ha risposto con una pagina invece del video (quota o link sbagliato)." >&2
  fi
  rm -f "$tmp"; exit 3
fi

# nome: quello passato, altrimenti l'estensione dal contenuto
if [[ -z "$name" ]]; then
  case "$(file -b "$tmp")" in
    *QuickTime*) name="$id.mov" ;;
    *) name="$id.mp4" ;;
  esac
fi
mv "$tmp" "$out/$name"
echo "$out/$name"
