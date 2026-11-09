---
name: motion-graphics-claude
description: Scheda M, motion graphics e spot animati fatti da Claude (logo che si costruisce, interfaccia di un'app che si trasforma, prodotto in 3D con Blender, voce e musica sui tempi). Ricavata dal tutorial "Claude è ora un motion graphics designer" (progetti/motion-graphics-claude/). Usala quando Antonio chiede uno spot, un'animazione del logo, una promo di app o prodotto, una "SaaS animation", grafiche animate dentro un reel, o un'animazione che finisce nel suo girato.
---

# Motion graphics con Claude (scheda M)

Metodo ricavato dal video in `progetti/motion-graphics-claude/` (analisi, trascrizione, fotogrammi). Si somma alle regole di Antonio, non le sostituisce.

File della scheda:
- `regolamento.md`: le 12 regole del video con i valori di partenza, più le correzioni di Antonio;
- `livelli.md`: cosa serve per il livello 1 (solo Claude), 2 (voce, musica, immagini esistenti) e 3 (Blender);
- `prompt.md`: i prompt pronti, in italiano, per ogni passo.

## Regole di Antonio (vincono su tutto)
- Formato di default **1080×1920**. Testi e grafiche nella safe zone **x 90-920, y 250-1440**. Se Antonio chiede un 16:9 si usa 1920×1080 con margini del 5%.
- Audio finale a **−14 LUFS**, picco −1,5 dBTP.
- **Prima di animare**: storyboard numerato con i fotogrammi, poi si aspetta l'approvazione. Si renderizza solo su richiesta.
- Correzioni numerate: ogni correzione che vale in generale entra in `regolamento.md`, sezione "Correzioni di Antonio".
- Se l'animazione entra in un reel parlato (G o H), il colore del girato resta quello del look unico: si adatta l'animazione al girato, non il contrario.

## Il flusso in 4 passi (dal video)
1. **Ingredienti** in una cartella di progetto `progetti/<nome>/`:
   - logo ad alta risoluzione (SVG o PNG grande), mai ritagliato da uno screenshot;
   - screenshot veri dell'app o foto vere del prodotto, colori del brand, font;
   - eventuali asset già fatti (illustrazioni, immagini AI), effetti sonori e musica;
   - **contesto**: cosa si vende, a chi, durata (15 s, 30 s) e call to action finale.
2. **Storyboard numerato** (`prompt.md` §2): 6-10 quadri, per ognuno cosa si vede, il movimento e **come diventa il quadro dopo**. Pagina HTML con i quadri disegnati, poi si itera con Antonio finché non dice "approvato".
3. **Animazione** in Remotion (`remotion/src/`, composizione nuova, file nuovi): un'unica sequenza in cui ogni forma si trasforma nella successiva. Livello 3: le parti 3D si renderizzano con `strumenti/blender/scena_prodotto.py` e si compongono in Remotion.
4. **Suono per ultimo**: effetti sonori dalla libreria (`remotion/public/sfx/`), musica, voce. Prima la scheda dei suoni (tempo, a schermo, effetto, livello), poi il mix.

## Come scelgo lo stile
Propongo sempre 2-3 stili dal menu e consiglio il primo. Il menu completo, con esempi, è nella pagina `progetti/motion-graphics-claude/guida.html`.

| Stile | Quando | Livello |
|---|---|---|
| **M1 Brand che si costruisce** | app o servizio con un logo forte: logo → interfaccia → telefono | 1 |
| **M2 Interfaccia viva** (SaaS) | software, sito, gestionale: screenshot veri che si trasformano, zoom sui click | 1 |
| **M3 Illustrato animato** | il cliente ha già illustrazioni o immagini AI: personaggi ritagliati e animati a pupazzo, voce | 2 |
| **M4 Prodotto 3D** | oggetto fisico: Blender, una luce, fondo nero o bianco, testi minimi | 3 |
| **M5 Animazione → girato** | apertura o chiusura di un reel di Antonio: l'animazione finisce sul fotogramma esatto del girato | 1-3 |

## Controlli prima di consegnare
- Nessuna dissolvenza incrociata tra quadri; c'è sempre qualcosa in movimento.
- Il punto d'interesse resta al centro (tolleranza ±8% della larghezza).
- Logo e interfaccia confrontati con gli originali; prodotto 3D confrontato con le foto vere (proporzioni, dettagli, colore).
- Durata uguale a quella chiesta (±2 frame), call to action negli ultimi 2-3 s.
- Sezione 10 di `STILE-REEL.md`: tagli, safe zone, colore, −14 LUFS.
