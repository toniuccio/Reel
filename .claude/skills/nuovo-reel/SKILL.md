---
name: nuovo-reel
description: Avvia un nuovo reel di Antonio con tutto quello che è stato imparato finora. Carica lo stile approvato (scheda G, parlato cinematico), la scheda H (premium con grafiche UI, dal metodo Joseph), le regole corrette da Antonio e il flusso di lavoro completo, poi parte dalla checklist dei materiali. Usala quando Antonio scrive /nuovo-reel, "facciamo un nuovo reel", "monta questo video", o manda clip da montare.
---

# Nuovo reel: tutto quello che sappiamo

Argomento facoltativo: il tema del reel, il cliente o lo stile ("G", "H", "parlato cinematico", "premium UI").

## 1. Leggi prima di tutto (in quest'ordine)
1. `CLAUDE.md`: le regole di Antonio, che vincono sempre.
2. `STILE-REEL.md`: lo stile approvato, con tutti i valori. La sezione 10 contiene i controlli prima della consegna.
3. `skill/reel-parlato-cinematico/SKILL.md` (scheda G): la procedura e le **regole che Antonio ha corretto**.
4. `skill/reel-premium-ui/`: `SKILL.md`, `regolamento.md` e `lookbook.md` della scheda H. Le schede in `riferimenti/` si aprono quando serve una scena di quel tipo.
5. `README.md`: i comandi.
6. Se nella sessione c'è la skill dell'account `reel-stile-remotion-apple`, caricala: ha la checklist dei materiali e le regole su ritmo, audio ed effetti sonori.

Nella risposta non riassumere questi file ad Antonio. Usali.

## 2. Scegli la scheda
- **G, parlato cinematico**: video in esterno, a camminata o in piedi, viso tracciato, insert su fondo bianco, film burn.
- **H, premium UI**: video da scrivania o da studio, contenuto educativo a step, con capitoli a rombi, contatori, notifiche e scene a tutto schermo.
- Si possono mescolare: per esempio un parlato G con i rombi dei capitoli e la scheda dei suoni della H.
- Se non è chiaro, proponi la scheda con una riga di motivazione e chiedi conferma insieme ai materiali.

## 3. Materiali da chiedere
Chiedi solo quelli che mancano:
- clip verticali (.mov dell'iPhone);
- logo del cliente (SVG o PNG) e colore del brand;
- tema e obiettivo del reel, e a chi si rivolge;
- musica, se Antonio ne vuole una precisa;
- libreria SFX (`libreria_sfx_reel.zip`), se c'è.

## 4. Flusso di lavoro
1. **Trascrizione e taglio grezzo**: trascrizione parola per parola, poi via silenzi e prese sbagliate (`strumenti/proponi_tagli.py`, `strumenti/trascrivi_parole.py`). Si misurano luce e colore di ogni clip sul viso.
2. **Hook in tre pezzi** per i primi 2-3 secondi:
   - speaker, con gli occhi sul terzo superiore;
   - testo, cioè la promessa presa dal copione;
   - visual, cioè cosa la dimostra.
3. **Piano frase per frase** come pagina HTML, con il metodo Joseph:
   - per ogni frase il copione, il tempo e una casella "cosa mostro qui?";
   - **4 design proposti**: A consigliato, B, C, D, ognuno preso da un riferimento della scheda con il suo fotogramma d'esempio;
   - la grafica la sceglie il copione: per due cose il prima e dopo, per un software o un evento la notifica, per un numero il contatore, per un elenco il riquadro, per i capitoli i rombi.
   - **Il montaggio lo decide Antonio**: tu proponi e aspetti le sue scelte.
4. **Storyboard con i fotogrammi veri** e **storyboard del colore**, con la striscia di tutte le scene in sequenza. Poi **aspetta l'approvazione**.
5. **Montaggio in Remotion**. Si cambiano `timeline.ts`, `scenes.tsx` e `Reel.tsx`. `text.tsx` e `video.tsx` restano invariati; i componenti nuovi della scheda H vanno in file nuovi.
6. **Revisione**: Antonio manda le correzioni numerate e tu rispondi con la lista spuntata. Ogni correzione che vale in generale va nelle regole: per la G in `skill/reel-parlato-cinematico/SKILL.md`, per la H in `skill/reel-premium-ui/regolamento.md`.
7. **Scheda dei suoni** prima del mix (tempo, a schermo, effetto, livello), poi effetti e musica. Mix a **−14 LUFS**, picco −1,5 dBTP.
8. **Render solo quando Antonio lo chiede**, poi i controlli della sezione 10 di `STILE-REEL.md`:
   - tagli da −2 a +2 frame;
   - safe zone x 90-920, y 250-1440;
   - colore misurato scena per scena;
   - audio.
9. **Copertina** con 2 fotogrammi alternativi.

## 5. Regole che non si toccano
- Un solo look di colore per tutte le clip, l'HDR letto senza tonemap, per clip solo l'esposizione verso il basso.
- Niente testi fuori dalla safe zone. Le didascalie "nel terzo inferiore" della scheda H stanno comunque sopra y = 1440.
- Clip, modelli e `node_modules` non vanno su git.
