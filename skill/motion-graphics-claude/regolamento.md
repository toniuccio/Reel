# Regolamento della scheda M

Le 12 regole del video, con il minuto in cui le spiega. I numeri in **grassetto** sono valori di partenza scelti da noi (il video non dà numeri): si tarano con le correzioni di Antonio.

## Le 12 regole

| # | Regola | Min. | Come si applica |
|---|---|---|---|
| 1 | **Asset veri e di qualità** | 03:07 | Logo SVG o PNG ≥ 2000 px, screenshot veri dell'app. Senza, Claude inventa un'app finta o ridisegna il logo male. Se manca un asset, lo si chiede, non lo si improvvisa. |
| 2 | **Storyboard numerato prima di animare** | 03:55 | Nessuna animazione senza storyboard approvato: si sprecano crediti e tempo. Lo storyboard è il momento in cui si dirige. |
| 3 | **Ogni quadro si trasforma nel successivo** | 04:33 | Vietata la dissolvenza incrociata ("sembra economica"). Per ogni coppia di quadri si scrive "come diventa questa forma quella forma" (es. tre linee → cerchio → quadrato → lettore musicale). Durata di una trasformazione: **0,5-0,8 s**, curva **ease-in-out cubica**. |
| 4 | **Tutto al centro esatto** | 06:13 | Il punto d'interesse sta al centro del quadro, l'occhio non deve rimbalzare. Gli effetti girano intorno. Nel 9:16 il centro è **x 540, y 845** (centro della safe zone), non y 960. |
| 5 | **C'è sempre movimento** | 06:37 | Anche nei quadri fermi: camera che avanza (**scala 1,00 → 1,04 in 3 s**) o elementi che respirano. Niente quadri statici oltre **0,5 s**. |
| 6 | **Prima la grafica, il suono per ultimo** | 08:27 | Se si cambia l'animazione dopo il suono, il suono si rompe. Il suono si fa solo a grafica approvata. |
| 7 | **Profondità di campo ridotta** | 09:34 | Sfondo sfocato come in una ripresa vera. In Remotion: livelli di sfondo con **blur 12-24 px** e leggera scala; in Blender: **f/2, lente 85 mm**. |
| 8 | **Call to action chiara alla fine** | 09:50 | Ultimi **2-3 s**: logo + azione ("Scarica l'app", "Prenota", "Scrivici"). Una sola azione. |
| 9 | **Testo: ogni parola sale al suo posto** | 10:49 | Niente rimbalzi, niente lettere in dissolvenza. Ogni parola sale da sotto una maschera: **translateY 100% → 0, 0,35 s, ease-out cubica, una parola ogni 0,07 s**. |
| 10 | **La voce la scrive chi ha fatto il video** | 11:22 | Claude conosce la durata di ogni quadro: scrive il testo della voce sui tempi esatti, poi la genera (connettore ElevenLabs o generatore audio). Lo stesso per la musica: prompt per Suno della durata esatta. |
| 11 | **Una sola luce** (3D) | 15:18 | In Blender una sorgente principale, non luce ovunque: è quello che fa sembrare vero il prodotto. Riempimento al massimo al **5%** della principale. |
| 12 | **Confronta con il prodotto vero** | 16:32 | Ogni versione si controlla affiancata alle foto vere: forma, proporzioni, dettagli (nel video: custodia sbagliata, stelo che attraversa la custodia, auricolare nell'orecchio sbagliato). |

Regola in più (15:30): per passare dall'animazione al girato vero, si dà a Claude **il fotogramma esatto** su cui l'animazione deve finire. L'ultimo quadro dell'animazione coincide con quel fotogramma e il taglio è invisibile.

Principio generale (16:55): prompt corto e generico = risultato generico. Servono direzione artistica, idee nello storyboard e transizioni pensate.

## Suono
- Effetti: si usano quelli veri della libreria (`remotion/public/sfx/`, tabella nel `README.md`), messi sui momenti di trasformazione. Il video consiglia librerie a pagamento (Ocular Sound, Artlist): se Antonio ne compra una, va in quella cartella.
- Musica: **−20/−22 LUFS** sotto la voce, **−16** senza voce; poi il mix finale a −14.
- Voce: entra dopo il primo movimento (**≥ 0,3 s**) e finisce prima della call to action o sopra di essa.

## Correzioni di Antonio
(vuota: si riempie a ogni revisione, una riga per correzione con la data)
