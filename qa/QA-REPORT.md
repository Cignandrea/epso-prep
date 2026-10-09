# QA Report — EU Prep Suite v2

Stato al 09/10/2026, build **1.1.0-b4**. Dettaglio dei ticket in `tickets.json` (90 voci).

## Riepilogo per round

| Round | Build | Team | Ticket aperti | Esito |
|---|---|---|---|---|
| 1 | b1 → b2 | Funzionale (E2E, 5 viewport) | T-001…T-023 | 23 corretti in b2; regressione `tests/regress.py` 23/23 |
| 1 | b2 → b3 | Fedeltà TAO & UX | T-024…T-050 | 21 corretti, 6 parziali/rinviati (contenuti L2, piega del Fold) |
| 1 | b2 → b3 | Contenuti | T-051…T-058 | 6 corretti in `tools/build-data.js`, 2 rinviati ai contenuti L2 |
| 1 | b3 → b4 | Codice (revisione statica + riproduzioni) | T-059…T-090 | **32 corretti in b4**; regressione `tests/regress2.py` 48/48 |

Aperti: **0**. Parziali (roadmap, non difetti bloccanti): T-024 (evidenza nel brano: campo `evidence` con i contenuti L2), T-038 (livello L1 nel simulatore), T-041 (piega a 700×930), T-044 (distribuzione dei tempi nello Stato), T-056/T-057 (statistiche dei distrattori sui contenuti L2).

## Che cosa ha cambiato il round Codice (b4)

- **Stato e tempo**: la pausa esce davvero dalla memoria (niente tempo gonfiato in background, niente «zombie» dopo l'azzeramento); il tempo in secondo piano non entra più nell'item; la simulazione ripresa oltre la scadenza si consegna per tempo scaduto come in TAO; una simulazione a cavallo della mezzanotte prosegue (conta la scadenza, non il giorno).
- **Selezione**: il ripasso Leitner avanza anche da Micro/Allenamento; ogni Micro ha almeno un numerico; gli item di una simulazione in sospeso non compaiono altrove; Micro/Ripasso/Sim sopra uno stato in corso chiedono sempre conferma.
- **Simulatore**: segnalibro senza perdita di tempo; evidenziatore con unione e rimozione al click; overview con fuoco e Escape; uscita sempre raggiungibile (logo = pulsante); copy corretto per il numerico.
- **Dati**: chiavi corrotte messe da parte con avviso, mai sovrascritte in silenzio; due schede non si perdono voci; import validato; export con `version`.
- **Igiene**: service worker con cache legata alla versione (test statico), nessuna risposta 404 in cache; CSP `default-src 'self'`; codice morto rimosso; un solo renderer per i brani.

## Suite automatiche

| Suite | Copre | Esito b4 |
|---|---|---|
| `tests/smoke.py` | percorso felice: home, Micro, Allenamento, esterna, sim completa, Stato | 26/26 |
| `tests/regress.py` | ticket round 1 Funzionale | 23/23 |
| `tests/regress2.py` | ticket round 2 Codice (pausa/background, scadenza, Leitner, composizione Micro, stati in corso, tempo per item, evidenziatore, tastiera, mezzanotte, bianche, chiavi corrotte, due schede, import, esterna, Fold 475 px, copy, service worker) | 48/48 |
| `tools/validate.js` | schema e qualità dei contenuti | ok |

Procedura di rilascio: `node tools/validate.js` → `python3 tests/smoke.py` → `python3 tests/regress.py` → `python3 tests/regress2.py` → bump `VERSION` in `js/main.js` **e** `sw.js` → commit → pubblicazione.

## Da verificare a mano sul Fold (non riproducibile in headless)

1. Calcolatrice nell'allenamento numerico: la tastiera di sistema non deve aprirsi toccando i tasti del widget (T-076).
2. Schermo esterno: logo «EPSO» come uscita dalla simulazione; evidenziatore con selezione a tocco (T-068, T-084).
3. Sessione in secondo piano per qualche minuto e ritorno: il tempo dell'item non deve crescere (T-066).
