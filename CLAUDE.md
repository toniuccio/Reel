# Istruzioni per Claude in questo repository

- Questo è il modello di montaggio dei reel di Antonio. Lo stile approvato è in `STILE-REEL.md` e va seguito per ogni nuovo reel. Le correzioni già fatte sono elencate in `skill/reel-parlato-cinematico/SKILL.md`, alla sezione "Regole che Antonio ha corretto".
- Per i reel "premium con grafiche UI" (capitoli a rombi, contatori, notifiche, scene a tutto schermo) c'è la scheda H in `skill/reel-premium-ui/` (regolamento, lookbook, riferimenti). Le regole di Antonio qui sotto valgono anche lì. Per imparare un nuovo stile da video di riferimento si segue `skill/allena-stile-montaggio/SKILL.md`.
- Per iniziare un nuovo reel si usa `/nuovo-reel` (`.claude/skills/nuovo-reel/SKILL.md`): carica le schede G e H, le regole corrette e il flusso completo. Dal metodo Joseph valgono sempre: hook in tre pezzi (speaker, testo, visual), piano frase per frase con 4 design proposti e scelti da Antonio, correzioni numerate che diventano regole, scheda dei suoni prima del mix. La guida è in `progetti/guida-joseph-skill/`.
- Per spot e grafiche animate (logo che si costruisce, interfacce, prodotto 3D con Blender, voce e musica sui tempi) c'è la scheda M: `/motion-graphics` (`skill/motion-graphics-claude/`). Analisi e guida in `progetti/motion-graphics-claude/`.
- Quando Antonio manda un video (link Drive, file o clip), si parte da `/analizza-video`: scarica, analizza, capisce che video è e chiede solo contesto e stile.
- Rispondi in italiano.
- Prima di montare: piano frase per frase, storyboard con i fotogrammi veri e storyboard del colore, poi aspetta l'approvazione. Renderizza solo su richiesta.
- Prima di consegnare un video fai sempre i controlli della sezione 10 di `STILE-REEL.md`: tagli puliti frame per frame, safe zone Reels/TikTok (x 90-920, y 250-1440), colore omogeneo misurato scena per scena, audio a −14 LUFS.
- Colore: un solo look identico per tutte le clip, l'HDR letto senza tonemap, per clip solo l'esposizione. Mai correzioni di colore clip per clip.
- La procedura e i comandi sono in `README.md`. I componenti di stile (`remotion/src/text.tsx`, `remotion/src/video.tsx`) si riusano senza cambiarli; per ogni video cambiano `timeline.ts`, `scenes.tsx` e le transizioni o gli effetti sonori in `Reel.tsx`.
- Non caricare su git le clip (`remotion/public/clips`), i modelli (`strumenti/modelli`) o `node_modules`.
