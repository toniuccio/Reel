---
name: analizza-video
description: Punto d'ingresso per qualsiasi video che Antonio carica o linka (Google Drive, file, cartella di clip). Scarica, analizza in automatico (formato, tagli, parlato, provini, trascrizione), capisce che video è e propone il percorso e gli stili; ad Antonio chiede solo contesto e stile. Usala ogni volta che arriva un link Drive, un .mp4/.mov o una cartella di clip, anche senza istruzioni, o quando Antonio scrive /analizza-video, "guarda questo video", "analizza questo".
---

# Analizza un video appena arrivato

Argomento: link Drive, percorso di un file o di una cartella. Più link = un'analisi per ciascuno.

## 1. Scarica (automatico)
```bash
strumenti/scarica_video.sh "<link o file>" progetti/_in-arrivo/<nome-breve>/video
```
- Il video **non va su git** (`progetti/*/video/` è escluso).
- Errore "file privato": chiedi ad Antonio di condividere con "Chiunque abbia il link" e fermati.
- Errore di rete: Drive deve essere tra gli host consentiti (`drive.google.com`, `drive.usercontent.google.com`).
- Il modello di trascrizione si scarica una volta sola in `strumenti/modelli/` (vedi `README.md`); se manca e non c'è rete, lancia l'analisi con `--no-trascrizione`.

## 2. Analizza (automatico, 1-4 minuti)
```bash
python3 strumenti/analizza_video.py <video> progetti/_in-arrivo/<nome-breve>
```
Escono `analisi.md`, `analisi.json`, `provino_NN.jpg`, `trascrizione.txt`, `parole.json`.
Poi **guarda tu i provini** (Read sulle immagini) e leggi la trascrizione: l'ipotesi dello script è solo un indizio.

## 3. Capisci che video è
| Tipo | Segnali | Percorso |
|---|---|---|
| **girato** | verticale, iPhone/HDR, parlato continuo, pochi tagli | `/nuovo-reel` (G o H); grafiche animate con `/motion-graphics` |
| **riferimento-reel** | verticale, montato, molti tagli, testi a schermo | `skill/allena-stile-montaggio` |
| **riferimento-motion** | spot breve, animazioni, poca voce | `/motion-graphics` modalità "studia": scomponi le trasformazioni |
| **tutorial** | lungo, orizzontale, parlato, registrazioni di schermo | estrai il metodo: guida HTML in `progetti/<nome>/` + regole nella skill giusta o skill nuova |

## 4. Rispondi ad Antonio (breve)
1. **Cosa ho capito** in 3-5 righe: tipo, durata, di cosa parla, cosa c'è di riutilizzabile.
2. **Percorso consigliato** in una riga.
3. **Due domande sole**, con AskUserQuestion e opzioni già pronte (la prima è quella consigliata):
   - **Contesto**: per chi è, cosa si vende o si racconta, dove esce, durata. Proponi tu una bozza dal parlato.
   - **Stile**: 2-3 stili dal menu, con il consigliato per primo.
     - Reel parlato: **G** parlato cinematico, **H** premium UI, **G+H**.
     - Animazione/spot: **M1** brand che si costruisce, **M2** interfaccia viva, **M3** illustrato animato, **M4** prodotto 3D, **M5** animazione → girato.
     - Esempi visivi di tutti gli stili: `progetti/motion-graphics-claude/guida.html`.
4. Con le risposte, sposta la cartella da `progetti/_in-arrivo/` a `progetti/<nome-progetto>/` e passa alla skill del percorso. Da lì valgono le sue regole: piano, storyboard, approvazione prima di montare, render solo su richiesta.

## Regole
- Non riassumere ad Antonio i file delle skill. Usali.
- Non montare e non renderizzare in questa fase.
- Rispondi in italiano.
