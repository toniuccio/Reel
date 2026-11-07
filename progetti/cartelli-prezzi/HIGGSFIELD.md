# Sfondi con Higgsfield: procedura per avere immagini omogenee

Il collegamento Higgsfield di Claude **non può generare** (legge solo modelli, crediti e immagini già fatte).
Le immagini si generano a mano su higgsfield.ai seguendo questa procedura, poi si passano a Claude, che le monta nei cartelli.

## Impostazioni (uguali per tutte le immagini)
- **Modello:** Nano Banana 2.1 (accetta immagini di riferimento e il formato 1:4). In alternativa Nano Banana Pro con 9:16.
- **Formato:** **1:4** (il cartello è 1:2,83: Claude ritaglia sopra e sotto, senza perdere nulla di importante).
- **Risoluzione:** 4k.
- **Seed:** fisso, sempre lo stesso numero per tutte (es. **240611**): aiuta a tenere luce e stile coerenti.
- **Riferimenti:** (1) la foto del prodotto, (2) dalla seconda immagine in poi, anche la **prima immagine generata** come riferimento di stile.

## Stile comune (incollalo all'inizio di ogni prompt)
> Vertical food photography for a deli price sign, top-down view, the whole frame densely filled edge to edge with many pieces of the product, abundant and repeated, rustic light wooden surface barely visible between pieces, soft warm natural daylight from the upper left, gentle shadows, rich appetizing colors, sharp focus everywhere, same lighting and color grading as the style reference, no text, no labels, no packaging, no people, no hands, no plates.

## Prompt per prodotto (dopo lo stile comune)
| Cartello | Riferimento prodotto | Prompt |
|---|---|---|
| 03 'Nduja | `riferimenti-prodotti/nduja.jpg` | *Many Calabrian 'nduja sausages exactly like the reference: deep red natural casing, some cut into thick slices showing the soft bright red spreadable paste with chili flecks.* |
| 01 Salsiccia calabrese | foto del cliente o una salsiccia calabrese stagionata | *Many Calabrian cured sausages tied in a U shape, dark red with chili, rustic twine, a few cut showing coarse red meat with fat.* |
| 02 Soppressata calabrese | foto della soppressata | *Many Calabrian soppressata salami, flattened oval shape, dark red casing tied with string, a few sliced showing red meat with white fat.* |
| 04 Salsiccia San Vincenzo | foto del prodotto | *Many thin dry cured Italian sausages in short links, reddish brown, tied with string.* |
| 05/06 Pancetta calabrese | foto della pancetta | *Many slabs of Calabrian pancetta, flat cured pork belly with a red chili crust, some sliced showing white and pink layers.* |
| 07 Spianata calabrese | foto della spianata | *Many Calabrian spianata salami, long flat pressed salami, some sliced showing red meat with chili flakes and white fat.* |
| 12 Formaggio, pezzo intero | foto del formaggio del cliente | *Many whole wheels of aged Italian hard cheese with golden rind, stacked.* |

Facoltativo, per provola e pecorino (oggi hanno lo sfondo moltiplicato da scontorno): stessa procedura con `foto-cliente/provola.jpg` e `foto-cliente/pecorino.jpg`.

## Ordine consigliato
1. Genera prima la **'nduja** (2–4 varianti) e scegli la migliore: diventa il **riferimento di stile** per tutte le altre.
2. Genera gli altri prodotti, mettendo come riferimenti la foto del prodotto e la 'nduja scelta.
3. Manda le immagini a Claude: le salva in `sfondi/`, aggiorna `dati.json` e genera i cartelli.
