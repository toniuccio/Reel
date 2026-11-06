# Traduzione integrale: "How to Edit Premium Instagram Reels Using ONLY Claude (Full Breakdown)"

Tutto quello che dice Joseph, frase per frase (senza le parti di pubblicità del suo corso), con il minuto del video. Tra parentesi quadre le note del traduttore. La trascrizione automatica aveva alcuni errori sui nomi propri: sono stati corretti (Creato Display, Apple Garamond, Opus 5.5, cue sheet).

## Introduzione
- 0:00 Nelle ultime tre settimane ho costruito questa skill di montaggio per video brevi e l'ho usata per creare gli ultimi 12 reel premium che ho pubblicato sul mio Instagram.
- 0:07 E uno di questi ha superato le 90.000 visualizzazioni.
- 0:10 Ora, in molti si chiedono se questi video siano montati con l'IA o da un montatore in carne e ossa.
- 0:14 Quindi oggi vi mostro finalmente come ho allenato Claude a montare i miei video brevi per Instagram.
- 0:19 Per prima cosa vi scompongo le cinque chiavi che formano il mio stile di montaggio virale per video brevi, così potete capirlo.
- 0:24 Poi vi accompagno nel processo di allenamento: come creare una skill di montaggio virale per video brevi in qualsiasi stile, compreso il mio.
- 0:31 E infine prenderò un video breve grezzo e lo monterò con questa skill insieme a voi, passo dopo passo.
- 0:35 E alla fine del video saprete esattamente come allenare Claude su qualsiasi stile di montaggio vogliate, e come usarlo per montare video brevi virali come quelli che vi piacciono.

## Capitolo 1: lo stile
- 0:55 Ma senza ulteriori indugi: prima di imparare come creare la skill che monta i video brevi al posto nostro, capiamo lo stile su cui stiamo per allenarla.
- 1:02 Vedete, pubblico da parecchio tempo, e al mio pubblico è piaciuto moltissimo lo stile dei video che facevamo.
- 1:08 Era pulito, era premium, ed era davvero semplice.
- 1:10 Quindi l'obiettivo della skill che stavo per costruire era molto semplice.
- 1:13 Volevo insegnare a Claude a creare esattamente questi video.
- 1:17 Quindi, prima di farlo, scomponiamo di cosa è fatto davvero il mio stile di montaggio.
- 1:21 La skill di montaggio short-form di Joseph è composta da cinque chiavi.
- 1:24 Se combinate queste cinque chiavi, ottenete montaggi premium e spettacolari come questo.

### Chiave 1: le didascalie
- 1:28 La prima chiave dello stile Joseph sono le didascalie.
- 1:31 Partiamo dal girato principale [A-roll, lo speaker che parla] e dividiamo la scena in terzi.
- 1:34 Poi aggiungiamo uno scurimento e una sfocatura al terzo inferiore, e la nostra didascalia sta in questo riquadro.
- 1:38 La didascalia è fatta di due font diversi: un font sans semplice per il testo normale, per cui usiamo Creato Display, e un font script speciale per il testo evidenziato, per cui usiamo Apple Garamond.
- 1:47 Quando piazziamo il testo, cominciamo mettendo una o due parole in font script, quelle speciali, poi cerchiamo gli spazi intorno dove può stare il resto.
- 1:53 E sistemiamo il resto della frase usando il font sans.
- 1:56 Infine, per l'animazione del testo, è un semplice pop-up con blur e fade in: il testo salta su, entra in dissolvenza partendo da un'opacità bassa e all'inizio ha anche una sfocatura, come tocco in più.

### Chiave 2: i listicle UI
- 2:04 La prima chiave è fatta; passiamo alla seconda, i listicle UI a schermo.
- 2:08 Molti dei nostri video sono divisi in capitoli: accompagniamo lo spettatore attraverso il capitolo uno, poi il due, poi il tre.
- 2:13 Quindi usiamo questi listicle UI per mostrare allo spettatore i tre capitoli già all'inizio del video.
- 2:17 Come design, è un rombo con un leggero gradiente e un contorno sottile all'esterno, con un numero al centro.
- 2:23 Per l'animazione dei capitoli, li introduciamo semplicemente uno per uno con un pop-up fade.
- 2:27 Poi, ogni volta che nominiamo il capitolo nel corso del video, lo riusiamo con un testo accanto che dà il nome al capitolo.

### Chiave 3: pop-up UI e contatori
- 2:32 La chiave tre sono i nostri pop-up UI a schermo e i contatori numerici.
- 2:35 Ce ne sono di tanti tipi diversi, e cambiano tutti in base a ciò che si dice nel copione.
- 2:39 Per esempio, quando parliamo di due elementi o confrontiamo due cose, usiamo un layout prima e dopo come questo.
- 2:44 Oggetto a sinistra, oggetto a destra, collegati da una freccia pulita e semplice.
- 2:48 Quando nominiamo un certo software o un evento, possiamo usare un'animazione pop-up UI come questa, con uno sfondo sfocato, il logo del software e un testo che rappresenta la notifica.
- 2:55 Se nominiamo dei timer o dei contatori, usiamo un'animazione circolare come questa.
- 2:59 Ha uno sfondo con una traccia grigia, una parte colorata in primo piano e un numero al centro che rappresenta la quantità.
- 3:04 E se dobbiamo elencare più cose, facciamo comparire un riquadro sfocato proprio come questo ed elenchiamo ogni elemento in sequenza, così.

### Chiave 4: gli hook
- 3:10 La chiave quattro è come creiamo hook coinvolgenti.
- 3:13 Per i nostri hook usiamo una formula semplice in tre pezzi: speaker, testo e visual.
- 3:17 La prima cosa che facciamo è assicurarci che lo speaker sia visibile: allineando gli occhi dello speaker ai terzi superiori del video, ci assicuriamo che lo spettatore veda subito lo speaker e si colleghi con lui.
- 3:24 Poi, per il testo, tutto comincia guardando il copione e chiedendoci: cosa c'è qui che fa venire voglia allo spettatore di guardare il video?
- 3:30 Una volta che l'avete trovato, dovete metterlo in risalto con il testo.
- 3:33 Infine, per i visual, ci chiediamo semplicemente: cosa possiamo mostrare sullo schermo che aiuti il testo ad agganciare lo spettatore?
- 3:39 Potrebbe essere far comparire gli stili di montaggio di cui stiamo parlando, oppure mostrare un timer se il video parla di quanto poco tempo ci vorrà per insegnare una certa cosa allo spettatore.

### Chiave 5: le animazioni a tutto schermo
- 3:46 Infine, la chiave cinque sono le animazioni a tutto schermo.
- 3:49 Sono il pane quotidiano del video.
- 3:51 Occupano metà del montaggio, ma hanno l'impatto maggiore.
- 3:54 Dipendono completamente da ciò che dice il copione, ma per esempio usiamo animazioni di listicle per accompagnare lo spettatore
- 4:00 da un punto all'altro.
- 4:01 Sono composte da una timeline, card UI dei capitoli, e testi ed elementi che scorrono accanto.
- 4:05 Altre volte usiamo semplici scene a tutto schermo, dove un elemento occupa l'intera scena e mostra uno schermo o un esempio di ciò che vogliamo far vedere.
- 4:12 Usiamo anche animazioni di testo a tutto schermo, in cui sfondo e testo sono in contrasto, per aiutare lo spettatore a leggere il punto che stiamo esponendo.
- 4:17 E infine usiamo gli zoom fuori dallo schermo se vogliamo portare lo spettatore fuori dal girato principale e introdurre elementi nuovi, come altri montaggi e altri esempi.
- 4:24 Ora, tutte e cinque queste chiavi si uniscono per formare lo stile di montaggio che conoscete e amate sul mio Instagram.

## Capitolo 2: allenare Claude sullo stile
- 5:25 Ma ora che avete capito tutte e cinque le chiavi, è il momento di capire come allenare Claude su questo stile di montaggio.
- 5:30 Potreste pensare che allenare Claude su uno stile così complesso sia molto difficile.
- 5:34 Ma la verità è che, quando si allena Claude su qualsiasi stile di montaggio, servono solo due cose semplici.
- 5:38 La prima è una grande cartella di riferimento, una cartella che contiene tutti i video che vogliamo replicare.
- 5:44 Come la raccolgo?
- 5:45 Vado sul mio personal brand [il suo profilo], guardo i montaggi e scelgo quelli che mi piacciono di più.
- 5:49 Alla fine ho scaricato 14 montaggi.
- 5:51 Li metto in una cartella di riferimento, e la prima parte è fatta.
- 5:55 La seconda cosa che mi serve è una scomposizione completa dello stile di montaggio.
- 5:58 Ed è questa la parte che fa davvero la differenza.
- 6:00 Guardate.
- 6:00 Per prima cosa si apre un programma come Figma, poi si divide lo schermo in due, con Figma a destra, e si caricano i video di riferimento a sinistra per guardarli tutti.
- 6:08 Quello che dobbiamo fare è semplice.
- 6:10 Ogni volta che vediamo una scena con un buon design, facciamo uno screenshot e lo mettiamo sulla tavola.
- 6:14 Lo facciamo per le scene di testo, le animazioni a schermo, le animazioni a tutto schermo e tutto ciò che sembra di alta qualità.
- 6:19 Finché non abbiamo una grande tavola di ispirazione con più di 120 immagini.
- 6:24 Questo è molto importante, perché abbiamo appena trasformato i video che vogliamo creare in immagini che possiamo vedere sullo schermo.
- 6:29 Il passo successivo è scomporre lo stile.
- 6:31 Vi ricordate le cinque chiavi di cui abbiamo parlato?
- 6:34 Bene, ora le scomponiamo una per una usando la tavola di ispirazione che abbiamo appena costruito.
- 6:37 Si comincia dalla chiave numero uno: si raccolgono tutte le ispirazioni che mostrano il design dei testi a schermo e si raggruppano qui.
- 6:42 Poi se ne prende una, la si mette di lato e si scompone di cosa è fatta: i font, la posizione e tutto quello che c'è in mezzo.
- 6:47 Poi lo facciamo per ogni singola chiave.
- 6:49 Trascino qui tutte le ispirazioni dei listicle e le scompongo così.
- 6:52 Poi trascino qui le animazioni a schermo e le scompongo in una tabella con ogni design e ogni tipo di animazione.
- 6:57 Poi ho una sezione che parla della chiave 4, come impostiamo gli hook: personaggio, testo e visual. E infine prendo tutte le ispirazioni delle animazioni a tutto schermo e le costruisco qui, dove le divido in tabelle e ne scompongo design e animazioni.
- 7:09 Ora, se facciamo zoom indietro, questa tavola Figma ha 120 immagini di com'è il nostro stile e ne scompone ogni elemento e come si fa da zero.
- 7:17 I design, le animazioni e anche i riferimenti.
- 7:19 Ora che abbiamo sia una cartella di riferimento sia una tavola Figma completa, come creiamo una skill di montaggio short-form?
- 7:24 È qui che le cose si fanno interessanti.
- 7:25 Per prima cosa andiamo in Claude e cominciamo caricando i 14 video di riferimento e la scomposizione Figma completa che abbiamo appena creato.
- 7:30 Poi gli diamo questo prompt.
- 7:32 "Per prima cosa scomponi i 14 video di riferimento in una trascrizione parola per parola e in un'analisi fotogramma per fotogramma.
- 7:37 Poi studierai tre cose principali: i principi di design di ogni scena, cioè i colori, il layout, gli effetti e tutto il resto; la logica delle animazioni, cioè che animazione ha ogni elemento, un pop-up fade in, un blur reveal e così via; e la posizione delle animazioni e il loro tempo rispetto al copione del video.
- 7:51 Poi userai le scomposizioni di Figma come analisi approfondita dei principi di design di questo stile di montaggio.
- 7:57 Quindi studiale e analizza come è fatto lo stile.
- 7:59 Impara tutto quello che c'è da sapere
- 8:00 su questo stile di montaggio, così da poterlo ricreare, e trasforma tutto in una skill."
- 8:03 Claude comincia prendendo tutti e 14 i video e scomponendoli in tutti i fotogrammi che formano le animazioni.
- 8:09 E in trascrizioni parola per parola di ogni video.
- 8:11 Infine guarda il file Figma e studia tutto dall'inizio alla fine, ogni design, come è fatto e come è animato, e formula le regole dello stile video.
- 8:19 Poi combina tutto questo nel pacchetto della skill, la skill di montaggio short-form.
- 8:23 Dentro il pacchetto, per prima cosa c'è un regolamento.
- 8:26 Il regolamento stabilisce tutti i dettagli minuti della skill, come le dimensioni dei font, le spaziature, il layout dei design, le curve di animazione e la velocità del movimento.
- 8:33 Poi crea quello che si chiama un lookbook, un libro che mostra com'è il mio stile di montaggio: le forme, i colori, i gradienti, lo stile delle icone, gli asset usati e tutto quello che c'è in mezzo. E infine crea una cartella di riferimento, dove salva ogni singola animazione dei 14 video di riferimento in questi file.
- 8:48 In ognuno c'è uno screenshot del design, un foglio dei fotogrammi chiave dell'animazione e una scomposizione di come funziona l'animazione.
- 8:54 E lo fa per quasi 200 animazioni.
- 8:57 Tutto questo si unisce per formare la skill di montaggio short-form che crea questi video brevi spettacolari e virali.

## Capitolo 3: il montaggio con la skill
- 10:16 Ma ora che abbiamo allenato Claude sul nostro stile di montaggio, lo capisce in tutto e per tutto e può ricrearlo da zero.
- 10:22 Quindi vediamo come possiamo usare questa skill per creare i montaggi spettacolari che conoscete e amate.
- 10:26 Questo è il video grezzo che monterò.
- 10:28 Comincio aprendo Claude ed entrando in Claude Code, impostando il modello su Opus 5.5 e lo sforzo su extra.
- 10:34 Poi comincio chiedendo a Claude di caricare le mie skill di montaggio short-form, così posso montare un video breve nel mio stile.

### Il taglio grezzo
- 10:40 La prima cosa che voglio fare è trasformare il mio girato grezzo, con silenzi e prese sbagliate, in un taglio grezzo pronto per essere montato.
- 10:45 Per farlo carico il video grezzo in Claude e gli chiedo di fare una trascrizione del video parola per parola, trovare tutti i silenzi e tutte le prese sbagliate e tagliarli tutti con tagli netti.
- 10:55 Poi premo invio.
- 10:56 Claude comincia prendendo il video e trascrivendolo parola per parola in una trascrizione completa, poi analizza la trascrizione, cerca silenzi, prese sbagliate o qualsiasi cosa vada tolta, la toglie e restituisce il video tagliato.
- 11:08 Perfetto!

### La pianificazione
- 11:08 Ora che abbiamo un taglio grezzo, la prossima cosa da fare è pianificare come andrà il montaggio.
- 11:13 Non vogliamo assolutamente che sia l'IA a pianificare cosa mostrare nel montaggio, perché se lo facciamo finirà per creare montaggi da IA scadenti, che fanno proprio brutta figura.
- 11:20 Il vero segreto per ottenere buoni risultati con il montaggio con l'IA è pianificare il montaggio da soli e far fare il lavoro all'IA.
- 11:25 Quindi chiedo a Claude di usare la trascrizione del video per creare un documento di pianificazione, dove posso pianificare come voglio che sia ogni scena.
- 11:31 A destra ci sarà ogni riga del copione, e a sinistra una casella di testo vuota dove posso pianificare il mio montaggio.
- 11:37 Potete anche chiedergli questo:
- 11:38 "In base allo studio che hai fatto sui miei contenuti short-form, consigliami quattro possibili design per ogni scena tra cui scegliere."
- 11:43 Siccome Claude ha studiato i miei video brevi, sa che tipo di animazioni uso.
- 11:47 Quindi può davvero consigliare buone scene in base a quello che dico.
- 11:49 Ora Claude passerà qualche minuto a costruire il documento, e quando ha finito me lo manda.
- 11:54 Potete cliccarci sopra e aprirlo.
- 11:56 Questo documento completo vi permette di vedere le scene a destra e pianificare il montaggio a sinistra.
- 12:00 E questo è il vero trucco.
- 12:01 È qui che passerei circa 15 minuti a ragionare dal punto di vista dello spettatore e a pianificare il montaggio di conseguenza.
- 12:06 Vi faccio vedere come l'ho fatto per il nostro video.
- 12:08 Per primo, l'hook.
- 12:09 Il video comincia con me che dico questo come hook:
- 12:11 "Trovare lavoro come video editor nel 2026 si riduce a tre semplici step."
- 12:15 L'hook di questo video ruota attorno al guadagnare come video editor.
- 12:18 Quindi pianifico un pop-up di notifica di Stripe che mostra un montatore che guadagna.
- 12:22 Poi pianifico un'animazione di listicle a tre capitoli che compare appena nomino i tre step.
- 12:27 Poi continuo a ragionare dal punto di vista dello spettatore.
- 12:29 Il segmento successivo dice questo:
- 12:30 "Il problema è che il 90% dei montatori molla dopo il secondo step."
- 12:34 Siccome rompe un po' lo schema, ho scelto di chiedere a Claude di tracciarmi e tenere la punta del naso al centro dello schermo, desaturare l'immagine e aggiungere una vignettatura.
- 12:41 È lì che cominciamo il capitolo, vedendo questo:
- 12:44 "Step uno: diventa un montatore virale."
- 12:46 Qui chiedo a Claude di creare il listicle del capitolo uno con un testo che descrive il capitolo.
- 12:50 Ora, il primo punto che faccio è questo:
- 12:52 "I titolari di aziende non vogliono più assumere montatori nella media.
- 12:55 Vogliono assumere il montatore che sa trasformare il girato grezzo e noioso in montaggi virali che funzionano davvero.
- 13:01 Per questo oggi è più importante che mai padroneggiare gli stili di montaggio virali del 2026."
- 13:05 Quindi comincio con uno zoom fuori dallo schermo dove scorriamo su montaggi di bassa qualità per mostrarli.
- 13:10 Poi facciamo una panoramica verso una scena in cui lo spettatore vede i video grezzi, mentre la camera continua a scorrere fino alla vetrina dei montaggi finiti.
- 13:16 Questo fa arrivare il mio punto e aiuta lo spettatore a capire esattamente cosa sto dicendo.
- 13:19 Ora continuo semplicemente a lavorare su questo documento, scegliendo i design e compilando le animazioni che voglio, ragionando dal punto di vista dello spettatore, finché non arriviamo a questo.
- 13:26 Il piano completo del montaggio.
- 13:28 Esattamente come voglio che venga.
- 13:29 Di nuovo, questo passaggio è fondamentale perché l'obiettivo non è lasciare che l'IA si inventi il montaggio.
- 13:33 È guidare l'IA a costruire il montaggio che abbiamo in testa.

### La costruzione
- 13:36 E fatto tutto questo, ora basta dare a Claude il piano completo e chiedergli di creare il montaggio usando il piano come guida su cosa deve creare.
- 13:43 E di usare la skill come guida su come deve apparire.
- 13:46 Ed è questa la vera magia.
- 13:47 Ora Claude guarda il piano e vede: ok, l'utente vuole questo qui.
- 13:51 Poi Claude guarda la skill e vede: ok, ecco come lo stile mostra questo tipo di animazione.
- 13:55 Poi usa questa logica per costruire queste animazioni dentro Remotion per noi.
- 13:59 E lo farà per ogni singola scena che abbiamo appena pianificato.
- 14:02 Guarda il piano, stabilisce come può costruirlo con la skill, raccoglie gli asset e lo costruisce.
- 14:07 Questo è il passaggio che richiede più tempo, ma dopo circa 40 minuti dovrebbe avere il video completo pronto da farvi vedere.

### La revisione
- 14:14 E quando la prima bozza è pronta, non esaltatevi troppo: probabilmente resterete a bocca aperta per quanto è bella, ma dovete rivederla almeno una o due volte prima che sia davvero buona.
- 14:21 Ho guardato tutto il montaggio e ho notato che era bellissimo, ma c'erano molte cose che si potevano cambiare per farlo venire meglio.
- 14:27 Quindi ho chiesto a Claude di velocizzare l'animazione di Stripe che scende,
- 14:30 di ingrandire il listicle del capitolo 3, di togliere queste animazioni nella scena col tracciamento, di mostrare un montaggio virale in questa scena, di ammorbidire questo zoom out e di cambiare completamente questo design, in modo che la camera scatti sul personal brand a sinistra e su un montaggio a destra.
- 14:42 Poi gli ho detto di ridurre le icone degli utenti in questa scena, di cambiare il design dei grafici qui con uno che ha una griglia blueprint sullo sfondo, e di trasformare questa scena in una scena di testo su una riga sola, perché in realtà aveva fatto un errore nel costruirla.
- 14:52 Poi ho premuto invio.
- 14:54 Ora sarà un processo molto più veloce, perché Claude ha già il file del progetto: ci metterà circa 10 minuti, farà tutte le modifiche necessarie e vi rimanderà il montaggio finale.
- 15:02 Questo dovrebbe essere molto meglio.
- 15:03 Quindi guardatelo tutto e confermate che va bene.
- 15:06 E poi dite a Claude che ha fatto un ottimo lavoro, così se un giorno l'IA diventa davvero cosciente, non vi darà la caccia per vendicarsi di averla maltrattata.

### Suono e musica
- 15:12 Ma ora che abbiamo il video finale pronto, potete semplicemente chiedere a Claude di fare il sound design e la musica del montaggio.
- 15:18 È qui che Claude crea prima una cue sheet completa del vostro montaggio [una scheda dei suoni], che mostra ogni animazione, tutto ciò che succede sullo schermo, esattamente quando succede e quale effetto sonoro va usato di conseguenza.
- 15:27 Poi aggiunge gli effetti sonori, ricontrolla il volume e chiude con la musica.
- 15:31 Quando vi manda questo, il file master, vuol dire che il video è completo e pronto da guardare.
- 15:36 A questo punto avrete caricato un video completo in Claude, lui ha fatto i tagli, voi avete pianificato il video, lui l'ha animato, ha fatto il sound design, ha aggiunto la musica e vi ha mandato la versione finale montata.
- 15:45 Mi ci è voluta solo un'ora e mezza circa per fare questo montaggio con Claude.

## Il reel finale
- 15:48 E se volete vedere il risultato finale, eccolo.
- 15:50 "Trovare lavoro come video editor nel 2026 si riduce a tre semplici step.
- 15:54 Il problema è che il 90% dei montatori molla dopo il secondo step.
- 15:58 Step uno: diventa un montatore virale.
- 16:00 I titolari di aziende non vogliono più assumere montatori nella media.
- 16:03 Vogliono assumere il montatore che sa trasformare il girato grezzo e noioso in montaggi virali che funzionano davvero.
- 16:08 Per questo oggi è più importante che mai padroneggiare gli stili di montaggio virali del 2026.
- 16:13 Step numero due: costruisci il tuo brand.
- 16:15 Russell Brunson ha detto: non puoi costruire qualcosa di straordinario e aspettarti che la gente lo trovi.
- 16:19 Devi promuovere le tue capacità di montaggio.
- 16:21 Per farlo, devi costruire una pagina social e pubblicare i tuoi lavori migliori per attirare i clienti di qualità più alta.
- 16:27 Infine, step numero tre: tratta i tuoi clienti come dei re.
- 16:30 I soldi veri stanno nei clienti che non vogliono mai andarsene.
- 16:32 Consegna più di quanto promesso e finisci prima delle scadenze.
- 16:34 E fai di tutto, e anche di più, perché i tuoi clienti ti adorino davvero.
- 16:38 E se fai solo queste tre cose, non dovrai mai più cercare clienti."

## Conclusione: l'IA e il lavoro del montatore
- 16:41 Ora, dopo aver visto il montaggio di oggi creato dall'IA, potreste temere che il video editing stia morendo o che il montaggio con l'IA stia per prendersi tutti i lavori.
- 16:48 La verità è che il montaggio di oggi non sarebbe venuto così bene senza i miei otto anni di esperienza nel video editing.
- 16:54 Dovete comunque capire come si fa un buon video per guidare l'IA a fare buoni video per voi.
- 16:58 Quindi, come video editor nel 2027, ci sono due capacità che dovete avere.
- 17:01 Dovete capire la psicologia del contenuto, cioè sapere cosa deve stare dove nel video perché funzioni, e dovete imparare a metterlo in pratica usando l'IA.
- 17:08 E se avete paura che l'IA prenda il sopravvento, probabilmente non sapete creare video spettacolari e non avete idea di come farlo con l'IA.

