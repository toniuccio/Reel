# Stile reel "parlato cinematico" (scheda G)

Impostazione nata dal reel *Due vertenze* (Crotone, novembre 2026) e approvata da Antonio.
Da usare come base per tutti i prossimi reel parlati in esterno. I valori tra parentesi sono quelli usati nel progetto.

## 1. Montaggio e ritmo
- Si tagliano le pause in testa e in coda a ogni clip: 0,08 s di margine prima della prima parola e 0,12 s dopo l'ultima.
- La voce viene accelerata a **1,06×** senza cambiarne il tono (`atempo`), e il video alla stessa velocità.
- Il video esce a **30 fps**, 1080×1920, H.264 (CRF 18), con l'audio AAC a 256 kbps.
- Qualcosa di nuovo a schermo ogni 1-2 s.

## 2. Colore: un solo look, omogeneo, automatico
Lezione del reel *Centro storico*: le correzioni clip per clip e i tonemap HDR hanno prodotto scene con look diversi. D'ora in poi la procedura è questa, sempre uguale.

1. **Lettura HDR senza tonemap.** Le clip iPhone in HLG si leggono come le esporta l'iPhone in SDR:
   `colorspace=all=bt709:iall=bt2020:itrc=bt709:fast=1`. **Mai** tonemap *hable/mobius* né LUT di "uniformazione": schiariscono, spengono il colore e cambiano il contrasto da clip a clip.
2. **Un solo look identico per tutte le clip** del video (parlati e b-roll): nessun bilanciamento, nessuna saturazione o curva diversa per clip. Il look di partenza sono i **colori originali**. Se serve un ritocco, è **uno solo e uguale per tutto il video** (esempio: `eq=contrast=1.04:saturation=1.06`).
3. **Unica regolazione ammessa per clip: l'esposizione**, solo verso il basso, quando una clip è sovraesposta. Si fa con `eq=gamma` calcolata dalla luce media misurata. Obiettivo: soggetto 119-130 di luce media su 255, b-roll al massimo circa 145. Il colore non si tocca.
4. **Misurare sempre** prima e dopo: luce media, contrasto e intensità del colore di ogni scena, e la pelle del soggetto, che deve restare uguale in tutte le scene ("è lo stesso ragazzo").
5. **Prima di renderizzare**: storyboard del colore con la **striscia di tutte le scene in sequenza** (prima/dopo), da far approvare. Le scene si confrontano tra loro, non una per una.
6. **Copertina**: unica eccezione, può avere più vividezza del video (saturazione 1,35, contrasto 1,12, vibrance 0,2), perché deve risaltare nella griglia.
- Vignettatura leggera (circa −25% ai bordi) **centrata sul viso**, uguale in tutte le scene.
- Clip vecchie o di repertorio (es. un vecchio reel): restano con i loro colori originali, così si riconoscono come video del passato.

## 3. Inquadratura e safe zone Instagram/TikTok
- Il viso viene tracciato in automatico (YuNet) e l'inquadratura lo segue in modo morbido. Il viso sta al **34% dell'altezza** e lo zoom non supera mai il **118%**.
- **Safe zone valida per Reels e TikTok insieme** (fotogramma 1080×1920):

  | Bordo | Area da lasciare libera | Cosa copre |
  |---|---|---|
  | alto | 250 px (13%) | nome account, "Reels", pulsanti in alto |
  | basso | 480 px (25%): niente testi sotto y = 1440 | didascalia, audio, barra di avanzamento (TikTok è il più alto) |
  | destra | 160 px: niente testi oltre x = 920 | colonna con like, commenti, condividi, profilo |
  | sinistra | 90 px | margine e piccole icone |

  Quindi **tutti i testi, gli schemi e le card devono stare nel riquadro x 90-920, y 250-1440** (830×1190 px).
- **I testi grandi non superano 830 px di larghezza**: se una parola chiave è più larga si riduce la dimensione, non si lascia uscire. Le righe sono centrate sul riquadro sicuro (centro x = 505), non sul fotogramma.
- I testi partono sotto il mento (circa 55% dell'altezza) e finiscono sopra y = 1440.
- Prima del render si controllano i fotogrammi chiave con la **griglia della safe zone sovrapposta**.
- **Punch-in** solo sulle parole chiave (+4-13% in 4 frame, con un leggero rimbalzo). **Push-in** lento nelle camminate (+3-6%). **Zoom out** morbido sulla chiusura.

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

### Tagli puliti: nessun fotogramma "scappato"
Antonio ha notato più volte, ai cambi di scena, qualche fotogramma della scena sbagliata. Regole:
- **Tagli sul frame esatto.** Le clip si tagliano su numeri di frame interi (a 30 fps), non su secondi arrotondati. La fine di una clip coincide al frame con l'inizio della successiva: niente sovrapposizioni o vuoti di 1 frame.
- **B-roll e insert** iniziano e finiscono esattamente al frame del taglio, mai 1-2 frame prima o dopo il parlato che coprono. Se una ripresa è più corta del tratto da coprire, si accorcia il tratto, non si lascia vedere la clip sotto.
- **Niente fotogrammi neri, bianchi o congelati** tra due scene, se non sono voluti.
- **Le transizioni a due clip** (slide, zoom) usano l'ultimo fotogramma della clip uscente e il primo di quella entrante. Nessun fotogramma deve comparire due volte.
- **Uscita dei testi**: i testi della scena precedente spariscono **prima** del taglio (entro l'ultimo frame), mai sopra la scena nuova.
- **Controllo obbligatorio**: per ogni taglio si estraggono i fotogrammi da taglio −2 a taglio +2 e si guardano uno per uno. Si consegna solo se ogni taglio è pulito.

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
- La foto è un fotogramma **naturale**: bocca chiusa o espressione serena, sguardo in camera, posa rilassata. Si cerca nei momenti tra una frase e l'altra, all'inizio o alla fine delle clip, e si propongono 2 alternative.
- Il **tema del video** (es. "CENTRO STORICO") è la scritta più grande, in maiuscolo bold. Poi una riga piccola e la parola chiave in serif corsivo con il bagliore.
- Il titolo parte sotto il mento e ha un'ombra decisa, così si legge sia su sfondi chiari sia su sfondi scuri.

## 9. Preset cliente
| Cliente | Colore principale | Secondario | Note |
|---|---|---|---|
| PD Crotone | rosso **#E20612** (dalla "D" del logo) | verde **#009043**, solo nelle spunte | logo su targhetta bianca o in `multiply` sul bianco |

## 10. Controlli prima di consegnare il video
1. **Tagli**: fotogrammi da −2 a +2 intorno a ogni taglio, nessun fotogramma estraneo (§6).
2. **Safe zone**: fotogrammi chiave con la griglia sovrapposta, nessun testo fuori dal riquadro x 90-920, y 250-1440 (§3).
3. **Colore**: luce media e colore di ogni scena misurati sul video finale, tutte nello stesso intervallo, pelle del soggetto uguale (§2).
4. **Audio**: −14 LUFS, picco −1,5 dBTP.
5. **Testi**: ogni scritta entra sulla parola giusta ed esce prima del taglio.

