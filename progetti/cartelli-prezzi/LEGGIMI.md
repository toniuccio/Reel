# Cartelli prezzo – Outlet della Casa (salumi e formaggi calabresi)

Linguette prezzo da esposizione, formato **10,5 × 29,7 cm** (mezzo A4 verticale), 300 dpi = 1240 × 3508 px.
Lavoro avviato in una sessione cloud e spostato qui per continuare sul desktop.

## Stato

| # | Cartello | Prezzo | Sfondo | Stato |
|---|---|---|---|---|
| 01 | Salsiccia calabrese, dolce o piccante, 1 pezzo | €3,90 | Stock 233998282 + espansione Adobe | **fatto** |
| 02 | Soppressata calabrese, dolce o piccante, 1 pezzo | €3,90 | Stock 238145433 + espansione | **fatto** |
| 03 | 'Nduja calabrese, al pezzo | €3,99 | Higgsfield (rif. `riferimenti-prodotti/nduja.jpg`) | **fatto** |
| 04 | Salsiccia San Vincenzo, 3 pezzi | €5,90 | Higgsfield | **fatto** |
| 05 | Pancetta calabrese, dolce o piccante | €5,90 | Higgsfield | fatto, **dubbio prezzo** |
| 06 | Pancetta calabrese, dolce o piccante | €4,90 | come 05 | fatto, **dubbio prezzo** |
| 07 | Spianata calabrese, dolce o piccante | €5,90 | Higgsfield | **fatto** |
| 08 | Provola bianca o affumicata, 3 pezzi | €10,00 | Higgsfield (rif. foto cliente) | **fatto** |
| 09 | Provola bianca o affumicata, 1 kg | €5,99 | Higgsfield (rif. foto cliente) | **fatto** |
| 10 | Provola bianca o affumicata, 1,8 kg | €12,90 | Higgsfield (rif. foto cliente) | **fatto** |
| 11 | Pecorino, pezzo intero | €14,90 | Higgsfield (rif. foto cliente) | **fatto** |
| 12 | Formaggio, pezzo intero | €10,00 | Stock 479675608 | **fatto** |

Sfondi Stock: foto gratuite di Adobe Stock prese in licenza dall'account Adobe di Antonio (7 novembre 2026), estese in verticale con l'espansione generativa di Adobe Photoshop (`image_generative_expand`) e ritagliate a 1240×3508. Le foto Stock originali non sono nel repository: solo gli sfondi finiti in `sfondi/`.
**Regola del cliente:** solo prodotti da salumeria (stagionati, secchi), mai carne cruda da macelleria. Per questo 'nduja, San Vincenzo, pancetta e spianata, e poi anche provola e pecorino (per omogeneità), sono stati rigenerati con Higgsfield (9/11/2026): modello `nano_banana_2_1`, formato 1:4, 2k, seed 240611, riferimento di stile `sfondi/salsiccia-multi.jpg`, scena comune "stanza di stagionatura con tanti salumi appesi". Prompt in `HIGGSFIELD.md`.

Anteprima di tutti i cartelli: `anteprime/tutti-12.png`.

I PDF finiti sono in `finiti/`. Anteprima in `anteprime/finiti.png`.
Le richieste originali del cliente (screenshot WhatsApp) sono in `riferimenti/chat-cliente-*.jpg`.

## Cosa ha deciso Antonio (regole)

1. Si parte dalla versione **con immagini** dei cartelli originali (`riferimenti/originale-2/3`), non da quella solo logo.
2. **Testi grandi e leggibili**: sono linguette da esposizione. **Poco spazio tra il nome e il prezzo.**
3. Restano le **nuvole bianche** e il **rosso** per il prezzo (rosso `#E41D25`, bordo nuvole `#F14624`, ombra prezzo `#F9B056`, ombra del nome `#434444`).
4. Nome e prezzo stanno **sempre nella stessa posizione**, nella metà alta del cartello.
5. L'immagine **copre tutto lo sfondo, dall'alto al basso**.
6. Lo sfondo deve mostrare il prodotto **moltiplicato** (tanti pezzi), **non un solo pezzo gigante**.
7. Se lo sfondo sembra troppo un collage, meglio un'immagine generata (Higgsfield) a tutto sfondo.
8. Prima si fa una base, Antonio la approva, poi si applica a tutti. La base approvata è la provola 1 kg.

## Correzioni ai testi del cliente
- "NDUJIA" → **'NDUJA**
- "3 PROVOLE … 10€" → nome PROVOLA, fascetta **3 PEZZI**, prezzo **€10,00**
- "1 SALSICCIA / 1 SOPPRESSATA" → fascetta **1 PEZZO** (da confermare col cliente)

## Domande aperte per il cliente
- **Pancetta calabrese** compare due volte, a **5,90** e a **4,90**: cosa cambia (peso, formato, intera o a fette)? Va scritto sul cartello.
- Va bene la dicitura "1 PEZZO" per salsiccia e soppressata?

## Grafica (modello.html)
- In alto c'è una nuvola bianca con il **nome** (rosso, contorno bianco, ombra grigia) e la **variante** su una fascetta rossa inclinata con il testo bianco.
- Subito sotto c'è la nuvola del **prezzo**: la **quantità** su una fascetta rossa e il prezzo grande (€ e centesimi piccoli, intero grande, ombra oro). Il prezzo si rimpicciolisce da solo se non entra.
- Font: **Archivo Black Italic** (Google Fonts), al posto dell'originale *Adelle Sans Heavy Italic*, che è commerciale. Se il cliente fornisce Adelle Sans, sostituirlo nel CSS.

## Come si genera

```bash
# dalla cartella progetti/cartelli-prezzi
node strumenti/genera.js "$PWD/modello.html" "$PWD/dati.json" "$PWD/finiti"
```
- Per ogni voce di `dati.json` crea un PNG e un PDF (10,5×29,7 cm). Servono Playwright e la rete per il font Google.
- Campi di `dati.json`: `file`, `nome` (righe), `variante`, `qta`, `euro`, `cent`, `foto` (percorso dello sfondo, relativo a `modello.html`).
- Per generare solo alcune voci, fai un JSON con solo quelle.

### Sfondo "moltiplicato"
```bash
python3 strumenti/moltiplica.py sfondi/NOME-multi.jpg --cut scontorni/NOME.png [--tw 330 --step 390 --dx 0.86 --rot 9 --bg 3a2214 --affumica]
```
- Prende uno scontorno PNG trasparente e lo ripete fitto su tutto il cartello, con ombre e piccole rotazioni.
- `--affumica` alterna pezzi bianchi e affumicati (usato per la provola).
- Valori usati: provola `--affumica` (gli altri di default), pecorino `--tw 420 --step 230 --dx 0.82 --rot 5 --bg 2a1a10`.
- Scontorni: provola con `rembg` (modello u2net) e pulizia della macchia bianca in basso; pecorino con una maschera a cilindro fatta a mano (rembg falliva).

## Prossimi passi
1. **Sfondi dei salumi e del formaggio**. Due strade:
   - **Higgsfield** (preferita se il collage non piace): Antonio genera le immagini con i prompt qui sotto e le usa a tutto sfondo, senza scontorno.
   - **Foto libere** da Wikimedia Commons, poi scontorno e `moltiplica.py`. Candidati CC0 già trovati: *Salsiccia di Calabria 1-4* (CC0), *Soppressata calabrese tagliata* (CC0), *La nduja – Morelli Zorelli 2024* (CC0), *'Nduja.JPG*, *Pancetta affumicata.JPG*, *Pancetta (2581780257)*, *Grana Padano cheese (7027509235)*. Nella sessione cloud Wikimedia rispondeva 429 (troppe richieste): scaricare con calma.
2. Chiarire la pancetta col cliente, poi generare tutti e 12 i cartelli.
3. Controllo finale: testi dentro le nuvole, prezzi corretti, PDF a 105×297 mm.

### Prompt per Higgsfield (formato verticale 9:16)
Base: *Top-down food photography, vertical 9:16, the entire frame densely filled edge to edge with many [PRODOTTO], abundant and repeated like a market display, warm natural light, rich appetizing colors, sharp focus everywhere, no text, no labels, no people, no plates*

- Salsiccia calabrese: *Calabrian cured sausages tied in U-shape, deep red with chili, rustic twine*
- Soppressata: *Calabrian soppressata salami, flattened oval shape, dark red, tied with string*
- 'Nduja: *'nduja Calabrian spreadable salami in natural casing, bright red, some cut open showing soft red paste*
- Salsiccia San Vincenzo: *thin dry cured Italian sausages in short links, reddish brown*
- Pancetta: *slabs of Calabrian pancetta, flat cured pork belly with red chili crust, some sliced showing white and pink layers*
- Spianata: *Calabrian spianata salami, long flat pressed salami, sliced pieces showing red meat with chili flakes*
- Formaggio: *whole wheels of aged Italian hard cheese, golden rind, stacked on wooden shelves*
