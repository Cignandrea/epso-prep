# EU Prep Suite — v1.2 «Percorso» (Parte 1)

Mappa per chi lavora sull'app dopo (persona o AI). Una pagina.

## Che cosa fa
Un solo percorso fino alla Parte 1 (mer 11/11/2026, 14:00): la home ha un pulsante, «Continua», che riprende ciò che è in pausa o avvia la prossima tappa (~10′). Fasi: **Basi** (14 tappe: scheda di studio + 3–5 domande con correzione subito; la 14ª è il test di esempio ufficiale su TAO) → **Allenamento** (ciclo verbale 5 · numerico 5 · verbale 5 · astratto 10 · ripasso errori; più difficile dal 03/11) con **due simulazioni complete** (dal 31/10 e dal 07/11) → **Scarico** (08–09/11) → riposo (10/11) → prova.

## File
| File | Ruolo |
|---|---|
| `js/path.js` | percorso: tappe, date, prossima tappa, conteggi del giorno |
| `js/lessons.js` | 14 schede di studio (testi nostri; regole della prova con la fonte) |
| `js/select.js` | scelta degli item: ripassi (Leitner), mai visti, trappole più sbagliate; riserva del verbale per le simulazioni |
| `js/session.js` | tappe, Micro, allenamento, ripasso: un item per volta, ripresa esatta |
| `js/sim.js` | clone della piattaforma TAO: verbale 35′ → numerico 20′ → astratto 10′ |
| `js/gen-numerico.js`, `js/gen-astratto.js` | generatori deterministici: l'id (`N2-48213`, `A2-90417`) = seme + livello, quindi lo stesso item si ricostruisce ovunque |
| `js/store.js` | localStorage (`eps2.*`); ogni voce porta `dev` (dispositivo) |
| `js/sync.js` | sincronizzazione tra dispositivi quando l'app gira come artifact su claude.ai (capability `db` + `user`) |
| `data/bank-verbale.js` | verbale livello base (L1) e vero/falso: generato da `tools/build-data.js` |
| `data/bank-verbale-l2.js` | verbale livello prova (L2, ~150 parole): generato da `tools/build-l2.js` dai lotti `tools/source-v2/verbale-l2-*.json` |
| `data/bank-numerico.js` | numerico livello base (problemi brevi) |
| `tools/archive-parte2/` | banche UE e digitali della Parte 2, fuori dall'app fino ai risultati della Parte 1 |

## Contenuti: come aggiungerne
- **Verbale L2**: nuovo lotto `tools/source-v2/verbale-l2-N.json` (schema in `tools/build-l2.js`), verifica cieca da un revisore diverso da chi scrive, poi `node tools/build-l2.js`. Id: blocchi da 20 a partire da 1101; la seconda metà di ogni blocco (…11–…20) è riservata alle simulazioni.
- **Numerico e astratto**: nuovi modelli o regole nei generatori; i test `tests/gen_*.test.js` controllano chiave unica, ricalcolo indipendente ed euristiche cieche.

## Dati di Andrea (sincronizzati)
Su claude.ai i progressi stanno nel database dell'artifact, nell'area privata `data/users/<id>/`:
- doc `state`: `current` (tappa in pausa), `sim`, `settings`, `path` (`done` per id di tappa, `p2.i` indice del ciclo), con `stamps`;
- doc `log-<AAAAMMGG>-<dispositivo>`: `log` (una voce per risposta: `bank`, `id`, `ok`, `sec`, `tag` = trappola dell'opzione scelta) e `sessions` (riepiloghi).
Claude li legge con `ArtifactData` → `list` sulla collezione `data/users/me`: non serve più «Copia riepilogo».

## Test
`node tests/path.test.js` · `node tests/gen_numerico.test.js` · `node tests/gen_astratto.test.js` · `python3 tests/percorso.py` (end-to-end, 3 schermi). Versione: `App.main.VERSION` = `VERSION` in `sw.js`.
