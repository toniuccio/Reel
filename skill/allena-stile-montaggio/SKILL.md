---
name: allena-stile-montaggio
description: Procedura per creare una nuova skill di montaggio partendo da video di riferimento (metodo Joseph). Usala quando Antonio dice "impara questo stile", "crea una skill da questi video", "voglio montare come questo creator", oppure manda una serie di reel da studiare. Produce una skill con regolamento, lookbook e cartella di riferimento, come `skill/reel-premium-ui/`.
---

# Allenare Claude su uno stile di montaggio

Servono solo due cose: **una cartella di video di riferimento** e **una scomposizione completa dello stile**. Il risultato è una skill fatta come `skill/reel-premium-ui/`, che è l'esempio da copiare.

## 1. Cartella di riferimento
- Antonio sceglie i video che gli piacciono di più. Joseph ne usa 14, quindi si punta a 10-15 video, tutti dello stesso stile.
- Vanno in `progetti/<nome-stile>/video/` e **non si caricano su git**. Su git vanno solo i fotogrammi e i testi che ne ricaviamo.
- Se arrivano da un link (Drive), il file deve essere condiviso con "Chiunque abbia il link". YouTube dal cloud è bloccato.

## 2. Scomposizione di ogni video
Per ogni video:
- **trascrizione parola per parola**: `python3 strumenti/trascrivi_parole.py <cartella_wav> strumenti/modelli/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 <uscita.json>`. Il modello si scarica dalle release di k2-fsa/sherpa-onnx. Un video lungo si spezza in blocchi da 4 minuti;
- **provini**: un fotogramma ogni 1-5 s in griglia con il tempo scritto sopra (`ffmpeg ... fps=1/5,drawtext=...,tile=5x4`);
- **fogli dei fotogrammi chiave** per ogni animazione: 2 s a 8 fps in griglia 4×4, con il numero di frame a 30 fps.

## 3. Tavola di ispirazione (al posto della tavola Figma)
- Si scattano gli screenshot di ogni scena di design buono: testi, animazioni a schermo, scene a tutto schermo. Joseph arriva a oltre 120 immagini.
- Si raggruppano per **chiavi**, cioè le 4-6 famiglie che compongono lo stile (per Joseph: didascalie, capitoli, grafiche UI, hook, scene a tutto schermo).
- Per ogni chiave se ne prende un esempio e lo si scompone: font, posizione, colori, effetti, animazione. Le animazioni vanno in una tabella.
- La tavola si consegna come pagina HTML con le immagini vere, da far vedere ad Antonio.

## 4. Lo studio (il prompt che usa Joseph, tradotto)
> Scomponi i video di riferimento in trascrizione parola per parola e analisi fotogramma per fotogramma. Studia tre cose:
> 1. i **principi di design** di ogni scena: colori, layout, effetti e tutto il resto;
> 2. la **logica delle animazioni**: che animazione ha ogni elemento (pop-up, fade-in, blur reveal...);
> 3. la **posizione e il tempo** delle animazioni rispetto al copione.
>
> Poi usa la tavola di scomposizione come analisi profonda dei principi di design. Impara tutto di questo stile per poterlo ricreare e trasformarlo in una skill.

La terza domanda è la più importante: per ogni grafica bisogna chiedersi **quale parola del copione la fa partire**.

## 5. Cosa produrre
Una cartella `skill/<nome-stile>/` con:
- `SKILL.md`: quando si usa, le chiavi, il flusso di lavoro e le regole di Antonio che vincono sempre (safe zone, −14 LUFS, colore, approvazione prima del montaggio);
- `regolamento.md`: tutti i numeri, cioè dimensioni dei font, interlinea, layout, curve di animazione, durate, velocità e livelli audio. Più una sezione "Correzioni di Antonio" che cresce a ogni revisione;
- `lookbook.md`: colori, sfondi, forme, font, icone e asset;
- `riferimenti/R<NN>-<TIPO>-<nome>/`: `screenshot.jpg`, `fotogrammi-chiave.jpg` e `scheda.md` (quando si usa, design, animazione, regole). Joseph ne ha circa 200; per partire bastano 10-20 ben scelti.

## 6. Verifica
- Si confrontano i valori con `STILE-REEL.md`. Dove lo stile studiato contraddice le regole di Antonio, vincono le regole di Antonio, e lo si scrive nella skill.
- Si mostra ad Antonio una pagina con gli esempi animati ricostruiti nello stile nuovo, da approvare prima di usarla su un reel vero.
- Dopo ogni reel montato con la skill, le correzioni di Antonio entrano nel regolamento.
