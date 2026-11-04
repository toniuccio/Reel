# Stile reel "parlato cinematico" (scheda G)

Impostazione nata dal reel *Due vertenze* (Crotone, novembre 2026) e approvata da Antonio.
Da usare come base per tutti i prossimi reel parlati in esterno. I valori tra parentesi sono quelli usati nel progetto.

## 1. Montaggio e ritmo
- Si tagliano le pause in testa e in coda a ogni clip: 0,08 s di margine prima della prima parola e 0,12 s dopo l'ultima.
- La voce viene accelerata a **1,06×** senza cambiarne il tono (`atempo`), e il video alla stessa velocità.
- Il video esce a **30 fps**, 1080×1920, H.264 (CRF 18), con l'audio AAC a 256 kbps.
- Qualcosa di nuovo a schermo ogni 1-2 s.

## 2. Colore
- Le clip iPhone sono **HDR (HLG)** e vanno sempre convertite in SDR con tonemap *hable*, altrimenti su Instagram escono slavate.
- Look generale **morbido e poco saturo**: saturazione 0,88, curva leggera con i neri un po' sollevati (`0/0.045 … 1/0.95`).
- Si bilancia il bianco clip per clip **sulla pelle**: si toglie il freddo del nuvoloso, la dominante verde sotto gli alberi e il rosso del sole duro.
- Le clip girate in ombra si schiariscono alzando ombre e medi, proteggendo le alte luci. Il viso deve finire a circa 90-110 di luminosità media su 255.
- Vignettatura leggera (circa −25% ai bordi) **centrata sul viso**, che lo segue.
- Con il cielo coperto o la luce piatta il look morbido diventa **pallido**. In quel caso aggiungi vividezza: saturazione ×1,24, contrasto 1,08, neri non sollevati, vibrance 0,15 (vedi `VIVO` in `progetti/centro-storico/prepara.sh`). È questa la versione approvata da Antonio.
- I valori sono in `strumenti/grade.sh`: una riga per clip.

## 3. Inquadratura
- Il viso viene tracciato in automatico (YuNet) e l'inquadratura lo segue in modo morbido.
- Il viso sta al **34% dell'altezza** e lo zoom non supera mai il **118%**, così si vede bene il soggetto.
- I testi partono dal **55% dell'altezza** (sotto il mento) e non scendono nel 20% in basso coperto dalla didascalia di Instagram.
- **Punch-in** solo sulle parole chiave (+4-13% in 4 frame, con un leggero rimbalzo). **Push-in** lento nelle camminate (+3-6% su tutta la clip). **Zoom out** morbido sulla chiusura.

## 4. Testi (stile "parola per parola")
- Font: **Inter Tight** 700/800 per i testi, **Instrument Serif corsivo** per i concetti "di valore" (uniti, la faccia).
- Ogni parola entra **nel frame in cui viene detta**: i tempi vengono dalla trascrizione con timestamp.
- **Parole piccole** (50 px): pop in 4 frame.
- **Parola chiave** (170-240 px): entra enorme, sfocata e trasparente e si mette a fuoco in 7 frame. Ce n'è **una sola per frase**.
- **Parola chiave sul video**: nasce nel colore del brand e in 0,3 s **si accende**. Il nucleo diventa chiaro (#FFF4F2) e il colore resta come bagliore intorno. Non va mai usato il colore pieno sui toni scuri, perché si legge poco.
- **Liste "Titolo: riga"**: titolo bold con il bagliore, e la riga sotto che si scrive lettera per lettera con il cursore.
- **Sugli sfondi bianchi**: testo nero, e la parola chiave nel colore pieno del brand.
- Ombra doppia sotto il testo bianco: `0 2px 6px rgba(0,0,0,.35), 0 4px 24px rgba(0,0,0,.5)`.
- **Ombreggiatura dietro i testi** (`scrimFrom` in `Stack`): un alone scuro ellittico, leggero (opacità 0,55-0,7), che compare insieme al testo e sparisce con lui. Va sempre messo su b-roll e sfondi chiari, così il bianco non si perde.

## 5. Insert
- **Fondo bianco** (#F4F4F2) con **card del soggetto**: il video continua dentro la card, ritagliato sul viso, con il luogo che si vede dietro. Non si mettono mai foto vuote di cielo o facciate.
- Si entra nell'insert con uno **zoom out**: il video a schermo intero si rimpicciolisce fino a diventare la card. Si esce con uno **zoom in**: la card cresce fino a schermo intero.
- **Schemi**: elementi collegati da una linea tratteggiata, con le spunte che compaiono quando il soggetto le nomina. Foto e testo vanno bilanciati, senza grandi vuoti bianchi.
- **Fondo nero**: una parola alla volta al centro, piccola, per la frase più dura del video.
- **Loghi**: compaiono piccoli solo quando il soggetto li nomina (scala 90→100% e dissolvenza in 6 frame). In chiusura non vanno messi né nome né logo, se non richiesti.
- **"Mostrare, non dire"**: per esempio la freccia che clicca e la pillola "richiesta inviata", con una spunta verde piccola.

## 6. Transizioni
- **Slide veloce** (laterale o verso l'alto) e **zoom** con sfocatura di movimento: 6 frame.
- **Film burn leggero** rosso-arancio dai bordi, opacità massima 0,45-0,6, 12 frame. Solo in 2-3 punti più il finale.
- **Stacco secco con flash di colore di 2 frame** sulla parola più forte, e **taglio netto** tra due clip girate nello stesso luogo.
- **Niente** speed ramp sul parlato (perde la sincronia con la voce), niente dissolvenze generiche, niente flare esagerati.

## 7. Audio
- Catena voce: passa-alto 80 Hz → riduzione rumore → de-esser → compressione 3:1 → +1,5 dB a 220 Hz → +2 dB a 3,2 kHz.
- Mix finale: **−14 LUFS**, picco **−1,5 dBTP** (`loudnorm`).
- Effetti sonori sotto la voce (volume 0,1-0,6):
  - whoosh su ogni transizione;
  - `boom_sub` sulle parole chiave;
  - `tick_rapido` sulle parole piccole e sulla scrittura;
  - `doppio_click` sulle spunte;
  - `riser_tonale` che finisce sul picco emotivo.
- Il picco dell'effetto cade **sul frame** del taglio o della parola.

## 8. Copertina
- 1080×1920, con foto e titolo **dentro la fascia centrale 1080×1350**, così si vedono anche nella griglia del profilo.
- La foto è un fotogramma a bocca chiusa con lo sguardo in camera, con lo stesso colore del video.
- Il titolo usa lo stesso stile dei sottotitoli: riga piccola, riga bold e parola chiave in serif corsivo con il bagliore.

## 9. Preset cliente
| Cliente | Colore principale | Secondario | Note |
|---|---|---|---|
| PD Crotone | rosso **#E20612** (dalla "D" del logo) | verde **#009043**, solo nelle spunte | logo su targhetta bianca o in `multiply` sul bianco |
