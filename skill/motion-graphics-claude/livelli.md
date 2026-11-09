# I tre livelli e gli strumenti

Si parte sempre dal livello più basso che basta. Il flusso in 4 passi è lo stesso per tutti.

## Livello 1: solo Claude
Tutto disegnato in codice: forme, testi, interfacce, telefoni.
- **Dove**: Remotion (`remotion/`), una composizione nuova in `remotion/src/Root.tsx` con file propri (`mg-<nome>.tsx`). Non si toccano `text.tsx` e `video.tsx`.
- **Asset**: logo SVG (si anima tracciato per tracciato), screenshot veri dentro una cornice di telefono disegnata.
- **Esempi del video**: promo Spotify (logo → lettore → playlist → telefono), spot Candy Crush (profondità di campo, call to action).
- In alternativa per pezzi molto "motion design" ci sono le skill `motionmaxxing` e `hyperframes`; il render resta poi in Remotion per unirlo al reel.

## Livello 2: strumenti AI
Si aggiunge quello che Claude non disegna da solo.
- **Voce**: connettore ElevenLabs se è collegato; altrimenti `generate_audio` di Higgsfield. Prima Claude scrive il testo sui tempi dei quadri (tabella tempo → frase), poi genera la voce.
- **Musica**: Claude scrive il prompt per Suno con la durata esatta; Antonio la genera e la mette in `progetti/<nome>/audio/`. In alternativa `generate_audio` di Higgsfield.
- **Immagini esistenti del cliente** (illustrazioni, immagini AI): si scontornano (`remove_background` di Higgsfield o Adobe), si dividono in parti (testa, braccia) e si animano a pupazzo in Remotion: rotazioni di **±3-6°** su un perno, piccoli rimbalzi di respiro.
- **Esempio del video**: spot GenHQ (illustrazioni animate + voce + musica Suno).

## Livello 3: Blender
Per un oggetto fisico che deve sembrare vero. Blender gira in background, Antonio non lo apre mai.
- **Installazione** (già provata in questo ambiente): `pip install bpy` (Python 3.13, Blender 5.2).
- **Kit pronto**: `strumenti/blender/scena_prodotto.py`
  ```bash
  # anteprima veloce di un fotogramma
  python3 strumenti/blender/scena_prodotto.py --modello prodotto.glb --uscita out/prova --anteprima
  # sequenza da 4 s, fondo trasparente da comporre in Remotion
  python3 strumenti/blender/scena_prodotto.py --modello prodotto.glb --uscita remotion/public/3d/scena1 \
      --secondi 4 --fondo trasparente --movimento orbita --campioni 96
  ```
  Una luce principale, profondità di campo f/2, soggetto centrato, camera sempre in movimento (orbita, avvicina, sale).
- **Il modello 3D**: se il cliente ha un file (.glb, .obj, .fbx, .stl) si usa quello; altrimenti Claude lo costruisce in Python partendo dalle foto vere (regola 12: confronto affiancato a ogni versione).
- **Finale sul girato**: l'ultima posa deve combaciare con il fotogramma di riferimento dato da Antonio (sagoma, posizione, scala).
- **Esempio del video**: spot AirPods (custodia, auricolari, "IP54", finale sulla sagoma con l'auricolare all'orecchio).
