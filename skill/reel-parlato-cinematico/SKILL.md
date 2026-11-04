---
name: reel-parlato-cinematico
description: Stile e procedura approvati da Antonio per i reel parlati in esterno (scheda G, nata dal reel "Due vertenze" per il PD di Crotone). Usala per ogni nuovo reel parlato a camminata o in piedi, per montarlo, pianificarlo, fare lo storyboard, la copertina o il render, e quando Antonio chiede "lo stesso stile dell'ultimo reel", "come il video delle vertenze", "stile G".
---

# Reel parlato cinematico (scheda G)

Stile approvato da Antonio dopo diverse revisioni. Il progetto completo e funzionante è nel repository GitHub `toniuccio/Reel`:
- `STILE-REEL.md`: tutti i valori;
- `strumenti/`: gli script;
- `remotion/`: le animazioni.

Se il repository è disponibile, riparti da lì invece di riscrivere da zero.

## Procedura
1. **Materiali**: clip verticali `.mov` dell'iPhone, logo del cliente (meglio SVG o PNG), `libreria_sfx_reel.zip` se c'è, e il colore del brand.
2. **Analisi**: trascrivi il parlato con i tempi parola per parola (Parakeet TDT v3 in sherpa-onnx). Proponi i tagli delle pause e misura luce e colore di ogni clip sul viso.
3. **Piano frase per frase e storyboard** come pagina con i fotogrammi veri già corretti, più lo **storyboard del colore** con la striscia di tutte le scene in sequenza. Aspetta l'approvazione prima di montare.
4. **Montaggio in Remotion** con i componenti del repository. Renderizza solo quando Antonio lo chiede.
5. **Controlli prima di consegnare** (sezione 10 di `STILE-REEL.md`): tagli frame per frame, safe zone, colore misurato scena per scena, audio a −14 LUFS e picco −1,5 dBTP. Consegna anche la copertina, con 2 fotogrammi alternativi.

## Regole che Antonio ha corretto: non ripetere gli errori
- **Colore omogeneo, mai clip per clip**: lo stesso soggetto deve avere la stessa pelle e gli stessi vestiti in tutte le scene. L'HDR dell'iPhone si legge senza tonemap (`colorspace=all=bt709:iall=bt2020:itrc=bt709:fast=1`), si parte dai colori originali e si applica **un solo look identico** a tutto il video. Per clip si regola solo l'esposizione, e solo per abbassare le clip sovraesposte. Niente LUT di uniformazione, niente bilanciamenti o saturazioni diverse per clip: hanno sempre creato scene con look diversi.
- **Non sovraesporre**: soggetto tra 119 e 130 di luce media su 255, b-roll al massimo circa 145.
- **Tagli puliti**: nessun fotogramma della scena sbagliata ai cambi. Le clip si tagliano su frame interi; b-roll, insert e testi iniziano e finiscono esattamente sul frame del taglio. Prima di consegnare si guardano i fotogrammi da −2 a +2 intorno a ogni taglio.
- **Safe zone Reels e TikTok**: testi, schemi e card sempre nel riquadro x 90-920, y 250-1440 su 1080×1920. Restano liberi 250 px in alto, 480 px in basso e 160 px a destra per le icone. Le parole grandi non superano 830 px di larghezza.
- **Inquadrature**: viso al 34% dell'altezza, zoom massimo 118%, perché si deve vedere bene il soggetto. Testi sotto il mento, mai sul viso.
- **Insert su fondo bianco**: dentro c'è sempre il **soggetto** (card video ritagliata sul viso con il luogo dietro), mai foto di cielo o di edifici vuoti. Foto e testo bilanciati, senza grandi vuoti.
- **Colore del brand sulle scritte**: mai pieno sui toni scuri. La parola chiave nasce colorata e **si accende**: nucleo chiaro con il bagliore del colore intorno. Il colore pieno va bene solo sul bianco.
- **Transizioni**: slide veloci, zoom e film burn **leggero**, mai esagerati. Niente speed ramp sul parlato, niente dissolvenze generiche.
- **Logo**: piccolo, compare solo quando il soggetto nomina il partito o il brand. In chiusura niente nome e niente logo, salvo richiesta.
- **Copertina**: un fotogramma naturale (bocca chiusa o espressione serena, sguardo in camera) con il tema del video come scritta più grande. Solo la copertina può essere più vivida del video.
- **Testi bianchi su sfondi chiari**: metti sempre dietro al testo un'ombreggiatura scura leggera che compare e sparisce con il testo.
- **Anteprime HTML**: sulle immagini dei fotogrammi metti `max-width:none`, altrimenti la pagina pubblicata le taglia e compare una fascia nera.

## Testi
- Inter Tight 700/800 per i testi e Instrument Serif corsivo per le parole "di valore".
- Parole piccole che entrano con un pop in 4 frame.
- Una sola parola chiave enorme per frase, che si mette a fuoco in 7 frame.
- Liste "Titolo: riga" con la riga che si scrive lettera per lettera, sul modello dei reel "Cheap: / Premium:".
- Ogni scritta entra nel frame in cui viene detta la parola.

## Preset clienti
- **PD Crotone**: rosso #E20612 (dalla "D" del logo), verde #009043 solo per le spunte di conferma.
