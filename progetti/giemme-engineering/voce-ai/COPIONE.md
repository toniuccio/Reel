# Voce rigenerata (Higgsfield · Text to Speech V2 · motore ElevenLabs)

Voce clonata: **"Giemme DVR - voce relatore"** (voice_id `60f023cc-a79c-4247-8986-9a04dd1071e1`, tipo element),
dal campione `campione_voce.mp3` (49 s del parlato originale, ripulito).
"DVR" scritto come «di vu erre» perché venga letto all'italiana.

| Pezzo | Testo generato | Pezzi del montaggio |
|---|---|---|
| 1 | Il DVR non è solamente un documento che un'azienda deve tenere nel cassetto, affinché possa essere in regola. | 0103a + 0103b |
| 2 | Sai che cos'è realmente un DVR? | 0103c |
| 3 | Tale documento deve essere presente, attivo e visionabile da parte di tutta l'azienda, da parte di tutti i lavoratori. | 0104 |
| 4 | All'interno del documento vengono analizzate le singole attività lavorative, vengono correlati i vari rischi a queste attività lavorative, e infine si vanno a strutturare quelle che sono le misure di prevenzione, **tecniche e organizzative**, per mitigare e ridurre l'esposizione al rischio. | 0109 |
| 5 | Il DVR, quindi, deve rappresentare realmente l'azienda e il suo ciclo lavorativo. E tu? Sapevi cosa fosse un DVR? **Fammelo sapere.** | 0110 |

Allineamento al labiale: `strumenti/allinea_voce.py` (parola per parola, rubberband a tono invariato).
Risultato: scarto medio 0,05 s dalla parola originale, 94% delle parole entro 0,15 s.
Audio pronto per Remotion in `remotion/public/giemme/voce_ai/` (stessi nomi dei pezzi).
