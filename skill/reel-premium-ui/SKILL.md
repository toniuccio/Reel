---
name: reel-premium-ui
description: Stile "premium con grafiche UI" (scheda H) per i reel parlati da studio o da scrivania di Antonio, ricavato dallo studio del metodo Joseph. Usala quando Antonio chiede un reel "premium", "pulito", "con le grafiche", "stile Joseph", "con i capitoli/rombi/contatori/notifiche", o un reel educativo a step. Contiene regolamento, lookbook, cartella di riferimento e il flusso di lavoro in 7 passi con il documento di pianificazione.
---

# Reel premium con grafiche UI (scheda H)

Stile ricavato dallo studio del video "How to Edit Premium Instagram Reels Using ONLY Claude" (guida completa in `progetti/guida-joseph-skill/`). Si somma alle regole di Antonio, non le sostituisce.

La skill è fatta di tre parti, come la costruisce Joseph:
- `regolamento.md`: i valori numerici, cioè dimensioni, spaziature, curve, velocità e audio;
- `lookbook.md`: com'è fatto lo stile, cioè colori, forme, font, icone e sfondi;
- `riferimenti/`: una cartella per ogni animazione di riferimento, con `screenshot.jpg`, `fotogrammi-chiave.jpg` e `scheda.md`.

Prima di creare una scena, apri la scheda del riferimento più vicino e rifalla con quei valori.

## Regole di Antonio che valgono sempre (vincono su tutto)
- Safe zone Reels/TikTok: testi, card e grafiche nel riquadro **x 90-920, y 250-1440**. Le didascalie "nel terzo inferiore" di Joseph vanno quindi **sopra y = 1440**, mai nella fascia bassa coperta dall'interfaccia.
- Audio finale a **−14 LUFS**, picco −1,5 dBTP. Joseph consegna a −18,3 LUFS, ma si usa il nostro valore.
- Colore: un solo look per tutte le clip, l'HDR letto senza tonemap, per clip solo l'esposizione.
- Tagli puliti frame per frame, testi che escono prima del taglio.
- Prima di montare: piano frase per frase, storyboard con i fotogrammi veri e storyboard del colore, poi si aspetta l'approvazione. Si renderizza solo su richiesta.
- Controlli della sezione 10 di `STILE-REEL.md` prima di consegnare.

## Le 5 chiavi dello stile
1. **Didascalie** nella fascia sotto il viso, con scurimento e sfocatura dietro. Due font: sans per il testo normale, serif corsivo per 1-2 parole speciali. Prima si piazzano le parole in corsivo, poi il resto della frase negli spazi intorno. Entrata pop + fade + blur.
2. **Rombi dei capitoli**: rombo con gradiente blu/viola leggero, contorno sottile esterno e numero al centro. Si presentano tutti insieme all'inizio, poi ognuno torna con il nome del capitolo accanto.
3. **Grafiche UI scelte dal copione**:
   - per due cose si usa il prima e dopo con la freccia;
   - per un software o un evento, la notifica UI;
   - per tempi, numeri o percentuali, il cerchio contatore;
   - per un elenco, il riquadro sfocato con le voci in sequenza.
4. **Hook in tre pezzi**: speaker (occhi sulla linea del terzo superiore), testo (la promessa del copione) e visual (ciò che la dimostra).
5. **Scene a tutto schermo** (circa metà del montaggio):
   - timeline dei capitoli;
   - scena con un solo elemento grande;
   - testo a tutto schermo con fondo e testo in contrasto;
   - zoom fuori dallo schermo verso altre clip.

## Flusso di lavoro
1. **Materiali**: video grezzo, logo, colore del brand, la clip musicale scelta da Antonio e la libreria SFX.
2. **Taglio grezzo**: trascrizione parola per parola (`strumenti/trascrivi_parole.py`), poi si tolgono silenzi e prese sbagliate (`strumenti/proponi_tagli.py`). Si consegna il taglio con la trascrizione.
3. **Documento di pianificazione** (pagina HTML). Per ogni frase del copione, a destra c'è la frase con il suo tempo e a sinistra una casella vuota "Cosa animo qui?". Sotto ci sono **4 design proposti** presi dai riferimenti: A consigliato, B, C e D alternative, ognuno con un fotogramma d'esempio. **Il montaggio lo decide Antonio**, Claude propone e basta. Si aspetta il documento compilato.
4. **Costruzione in Remotion**: per ogni scena si legge cosa vuole il piano, si apre la scheda del riferimento e si costruisce con i valori del regolamento. I componenti stanno in file nuovi; `text.tsx` e `video.tsx` restano invariati.
5. **Revisione**: Antonio guarda la prima versione e manda una lista di correzioni numerate. Si applicano tutte, poi si risponde con la lista spuntata. Le correzioni che valgono in generale vanno aggiunte al `regolamento.md`.
6. **Suono**: prima la **scheda dei suoni**, una tabella con tempo, cosa succede a schermo, effetto e livello per ogni animazione. Poi si inseriscono gli effetti, si mette la musica con il drop sul momento chiave e si misura il mix.
7. **Master** e controlli finali (§10 di `STILE-REEL.md`), più la copertina.

## Cosa non fare
- Non far inventare il montaggio all'IA: senza un piano scelto da Antonio vengono fuori grafiche a caso.
- Non mettere grafiche dove il copione non le giustifica. Ogni grafica dimostra ciò che si sta dicendo.
- Non usare animazioni veloci o rigide. Tutto si muove lento-veloce-lento e lo spettatore deve poterlo seguire.
