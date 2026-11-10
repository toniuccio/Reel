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
3. **Piano frase per frase e storyboard** come pagina con i fotogrammi veri già corretti. Aspetta l'approvazione prima di montare.
4. **Montaggio in Remotion** con i componenti del repository. Renderizza solo quando Antonio lo chiede.
5. **Audio finale**: −14 LUFS, picco −1,5 dBTP. Consegna anche la copertina.

## Regole che Antonio ha corretto: non ripetere gli errori
- **Colore**: morbido e poco saturo (saturazione 0,88, neri leggermente sollevati), uniforme fra le clip. Converti sempre l'HDR dell'iPhone. Schiarisci le clip girate in ombra.
- **Inquadrature**: viso al 34% dell'altezza, zoom massimo 118%, perché si deve vedere bene il soggetto. Testi dal 55% in giù, mai sul viso, mai nel 20% basso.
- **Insert su fondo bianco**: dentro c'è sempre il **soggetto** (card video ritagliata sul viso con il luogo dietro), mai foto di cielo o di edifici vuoti. Foto e testo bilanciati, senza grandi vuoti.
- **Colore del brand sulle scritte**: mai pieno sui toni scuri. La parola chiave nasce colorata e **si accende**: nucleo chiaro con il bagliore del colore intorno. Il colore pieno va bene solo sul bianco.
- **Transizioni**: slide veloci, zoom e film burn **leggero**, mai esagerati. Niente speed ramp sul parlato, niente dissolvenze generiche.
- **Logo**: piccolo, compare solo quando il soggetto nomina il partito o il brand. In chiusura niente nome e niente logo, salvo richiesta.
- **Grafiche ed esempi (b-roll)**: quando il soggetto fa esempi o elenca concetti, le scene sono solo grafica e il soggetto compare **solo ogni tanto** (una card o un cerchio, non in ogni scena). Le grafiche riempiono la zona utile con **equilibrio**, senza grandi vuoti bianchi ma ordinate: elementi grandi, distribuiti dall'alto fino al limite del 20% basso.
- **Tempo per leggere**: ogni grafica con testo deve restare a schermo abbastanza da leggerla. Dove serve si inseriscono pause di lettura (0,5-0,9 s) nei silenzi del parlato, mentre le grafiche coprono il video; ingressi dei testi in ~0,5 s e una sola enfasi per frase, con un piccolo rimbalzo.
- **Transizioni a chevron**: movimento continuo come nel riferimento: entrata che rallenta fino a coprire, uscita lenta (~1 s) che scopre la scena con il retro a freccia; più strati sfalsati. Niente flash di 2 frame né forme tagliate.
- **Suoni vari**: per ogni enfasi un suono di entrata e uno di uscita, ma scelti in base al tipo (pop e bolle per pillole e celle, ting/chime per le spunte, carta e tonfo per gli oggetti, blip per le interfacce, whoosh larghi per i chevron). Non ripetere sempre lo stesso whoosh.
- **Anteprime HTML**: sulle immagini dei fotogrammi metti `max-width:none`, altrimenti la pagina pubblicata le taglia e compare una fascia nera.

## Testi
- Inter Tight 700/800 per i testi e Instrument Serif corsivo per le parole "di valore".
- Parole piccole che entrano con un pop in 4 frame.
- Una sola parola chiave enorme per frase, che si mette a fuoco in 7 frame.
- Liste "Titolo: riga" con la riga che si scrive lettera per lettera, sul modello dei reel "Cheap: / Premium:".
- Ogni scritta entra nel frame in cui viene detta la parola.

## Preset clienti
- **PD Crotone**: rosso #E20612 (dalla "D" del logo), verde #009043 solo per le spunte di conferma.
