# Prompt pronti

Sono i prompt che il video mostra, tradotti e completati con le regole della scheda. Si copiano, si riempiono le parti tra parentesi quadre.

## 1. Ingredienti
> Nella cartella `progetti/[nome]/` ci sono: il logo in alta risoluzione, gli screenshot veri dell'app, [la musica / gli effetti sonori / le illustrazioni]. Il video è uno spot di [durata] s in 9:16 per [cliente], che vende [cosa] a [chi]. La call to action finale è "[azione]". Stile: [M1-M5].

## 2. Storyboard numerato
> Prima di animare qualsiasi cosa, crea uno storyboard numerato che scompone la sequenza di tutto quello che succede nel video. Per ogni quadro: numero, secondi, cosa si vede, il movimento, e **come questo quadro si trasforma nel successivo**. Niente dissolvenze incrociate: ogni passaggio è una forma che diventa un'altra. Il soggetto sta sempre al centro esatto. Mostrami lo storyboard come pagina con i quadri disegnati e aspetta la mia approvazione.

## 3. Animazione (dopo "approvato")
> Anima lo storyboard approvato come un'unica sequenza continua. Ogni quadro si trasforma nel successivo, senza dissolvenze. C'è sempre qualcosa in movimento, almeno la camera. Tutto quello che conta resta al centro. Profondità di campo ridotta sugli sfondi. Testi: ogni parola sale al suo posto una dopo l'altra, niente rimbalzi, niente lettere in dissolvenza. Usa solo il logo e gli screenshot veri della cartella.

## 4. Suono (solo a grafica approvata)
> Guarda gli effetti sonori in `remotion/public/sfx/` e mettili nei momenti esatti delle trasformazioni. Prima mostrami la scheda dei suoni (tempo, cosa succede a schermo, effetto, livello). Musica sotto a −20 LUFS se c'è la voce. Mix finale a −14 LUFS, picco −1,5 dBTP.

## 5. Voce sui tempi (livello 2)
> Questa animazione dura [N] s. Scrivi il testo della voce che sta esattamente dentro i quadri: una tabella con secondo di inizio, secondo di fine e frase. Massimo [2,5] parole al secondo. Poi genera la voce [con ElevenLabs / con il generatore audio] e mettila sui tempi.

## 6. Prompt per la musica (livello 2)
> Scrivi un prompt per Suno per una base strumentale di esattamente [N] secondi, [genere], [BPM], con un accento sul secondo [X] dove entra la call to action.

## 7. Prodotto 3D che finisce nel girato (livello 3, il prompt del minuto 15:30)
> Costruisci l'animazione SaaS per [prodotto] con Blender: storyboard prima, poi l'animazione. Una sola luce principale. Lo sfondo resta [bianco/nero] per tutto il video, perché alla fine l'animazione deve fondersi nel girato. L'ultimo fotogramma dell'animazione deve essere identico al fotogramma di riferimento `[file]`: stessa sagoma, posizione e scala. Dopo ogni versione affianca l'animazione alle foto vere del prodotto e controlla forma, proporzioni e dettagli.
