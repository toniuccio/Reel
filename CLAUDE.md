# Istruzioni per Claude in questo repository

- Questo è il modello di montaggio dei reel di Antonio. Lo stile approvato è in `STILE-REEL.md` e va seguito per ogni nuovo reel. Le correzioni già fatte sono elencate in `skill/reel-parlato-cinematico/SKILL.md`, alla sezione "Regole che Antonio ha corretto".
- Rispondi in italiano.
- Prima di montare: piano frase per frase e storyboard con i fotogrammi veri, poi aspetta l'approvazione. Renderizza solo su richiesta.
- La procedura e i comandi sono in `README.md`. I componenti di stile (`remotion/src/text.tsx`, `remotion/src/video.tsx`) si riusano senza cambiarli; per ogni video cambiano `timeline.ts`, `scenes.tsx` e le transizioni o gli effetti sonori in `Reel.tsx`.
- Non caricare su git le clip (`remotion/public/clips`), i modelli (`strumenti/modelli`) o `node_modules`.
