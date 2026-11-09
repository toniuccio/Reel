---
name: motion-graphics
description: Crea uno spot o una grafica animata con il metodo della scheda M (motion graphics con Claude): logo che si costruisce, interfaccia che si trasforma, illustrazioni animate con voce, prodotto 3D con Blender, animazione che finisce nel girato. Usala quando Antonio scrive /motion-graphics, chiede uno spot, una promo di app o prodotto, un'animazione del logo, una "SaaS animation", o grafiche animate per un reel.
---

# Motion graphics (scheda M)

Argomento facoltativo: cliente, prodotto o stile (M1-M5).

## 1. Leggi (in quest'ordine, senza riassumerli ad Antonio)
1. `CLAUDE.md`: le regole di Antonio vincono sempre.
2. `skill/motion-graphics-claude/SKILL.md`, poi `regolamento.md`, `livelli.md` e `prompt.md`.
3. Se l'animazione entra in un reel parlato: anche `/nuovo-reel` e `STILE-REEL.md`.

## 2. Ingredienti
Chiedi solo quello che manca:
- logo in alta risoluzione (SVG o PNG grande);
- screenshot veri o foto vere del prodotto; modello 3D se c'è;
- contesto: cosa si vende, a chi, durata, call to action, dove esce;
- stile (M1-M5): proponi tu i 2-3 più adatti, il consigliato per primo;
- musica, voce, effetti sonori se Antonio ne ha di suoi.
Tutto in `progetti/<nome>/` (asset pesanti in `progetti/<nome>/video/`, che non va su git).

## 3. Storyboard → approvazione
Pagina HTML `progetti/<nome>/storyboard.html` con i quadri numerati: per ognuno cosa si vede, il movimento e **la trasformazione nel quadro successivo**. Aspetta "approvato".

## 4. Animazione
Remotion, composizione nuova e file nuovi. Livello 3: render 3D con `strumenti/blender/scena_prodotto.py` (prima `--anteprima`, poi la sequenza) e composizione in Remotion. Anteprima in Remotion Studio, render solo su richiesta.

## 5. Suono per ultimo
Scheda dei suoni, poi effetti, musica, voce sui tempi (livello 2). Mix a −14 LUFS.

## 6. Controlli e correzioni
Controlli della scheda M e sezione 10 di `STILE-REEL.md`. Correzioni numerate di Antonio con la lista spuntata; quelle generali vanno in `skill/motion-graphics-claude/regolamento.md`.
