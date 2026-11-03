#!/bin/bash
# Doppio clic per avviare Vels Reel Studio su Mac
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Installa Node.js da https://nodejs.org (versione LTS)"; read -p "Premi invio..."; exit 1; fi
if ! command -v ffmpeg >/dev/null; then echo "Installa FFmpeg:  brew install ffmpeg"; read -p "Premi invio..."; exit 1; fi
(sleep 1.5; open "http://localhost:4747") &
node server.js
