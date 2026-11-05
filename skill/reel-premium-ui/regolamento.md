# Regolamento (scheda H)

Valori per un fotogramma 1080×1920 a 30 fps. Quelli segnati con [J] sono letti dal regolamento di Joseph (`joseph-rules.md`, minuto 8:30 del video); gli altri vengono dalla misura dei suoi fotogrammi o dalle regole di Antonio. Ogni correzione di Antonio che vale in generale si aggiunge qui, con la data.

## 0. Le tre domande (prima di ogni scena)
1. Cosa sta dicendo lo speaker in questa frase?
2. Cosa può mostrare lo schermo per dimostrarlo?
3. Quale riferimento della cartella `riferimenti/` lo fa già?

## 1. Movimento
- **Curva unica** [J]: lento-veloce-lento, `cubic-bezier(0.7, 0, 0.3, 1)`. In Remotion si scrive `Easing.bezier(0.7, 0, 0.3, 1)`.
- **Spostamenti grandi** (zoom fuori schermo, pan, slide di card) [J]: circa 1,5 s, cioè 45 frame.
- **Entrate di testo e piccoli elementi**: pop + fade + blur in 8-10 frame. Scala 0,92→1, opacità 0→1, blur 12→0 px, con la stessa curva.
- **Titoli a parole**: le parole entrano una per volta, sfalsate di 12-15 frame, ognuna con il blur che si toglie (riferimenti R03 e R04).
- **Velocità** [J]: niente di veloce, niente di rigido, niente che lo spettatore non riesca a seguire.

## 2. Didascalie e testo
- **Dimensioni** [J]: testo normale circa 48 px, parole in grassetto o evidenziate 66-73 px. Su 1080 px di larghezza si arriva a 52/76 px se la clip è piena.
- **Interlinea** [J]: stretta ovunque, la seconda riga sta subito sotto la prima (`line-height` 1,0-1,05).
- **Due font**: sans (Inter Tight 600/700, al posto di Creato Display) e serif corsivo (Instrument Serif italic, al posto di Apple Garamond). Il corsivo va su 1-2 parole per frase, non di più.
- **Fascia**: scurimento + sfocatura dal 55% al 75% dell'altezza (y 1056-1440). Gradiente verso il nero al 55%, blur 18 px solo nella fascia.
- Le parole entrano nel frame in cui vengono dette, con i tempi presi dalla trascrizione.

## 3. Capitoli e step
- Rombo: quadrato ruotato di 45° con angoli arrotondati di 14 px. Lato 120 px se ce ne sono tre in fila, 180 px se è uno solo.
- Fila di tre rombi con 36 px di spazio, centrati sul riquadro sicuro (x = 505).
- Il capitolo citato torna con il nome a destra (etichetta piccola in maiuscolo + titolo 66 px).

## 4. Disposizione
- [J] Il design si centra su ciò che conta: i blocchi principali stanno al **centro vero** del fotogramma. In verticale vale il centro del riquadro sicuro, (505, 845).
- Occhi dello speaker sulla linea del terzo superiore (y ≈ 640). Viso al 34% dell'altezza come nella scheda G.
- Card e telefoni: angoli arrotondati di 36-44 px, contorno di 1,5 px bianco al 18%, ombra morbida.

## 5. Numeri e soldi
- I contatori salgono con la curva unica, in 30-45 frame, e si fermano sul numero detto nel frame in cui viene pronunciato.
- Cerchio: traccia grigia al 25%, arco colorato con bagliore, numero al centro in sans 700.

## 6. Suono
- **Scheda dei suoni** prima del mix, con le colonne: tempo, a schermo, effetto, livello.
- Livelli tipici (dal video): pop della didascalia −6 dB, notifica UI −9 dB, cassa/kaching −6 dB, whoosh di zoom −9 dB, vento di pan −10 dB. Tutti gli effetti di un ulteriore −2 dB alla fine.
- Musica 17-22 dB sotto la voce, con il drop che cade sul primo capitolo.
- Consegna a **−14 LUFS, picco −1,5 dBTP** (regola di Antonio).

## 7. Correzioni di Antonio a questa scheda
(nessuna ancora)
