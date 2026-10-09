# QA Report — EU Prep Suite v2

Stato al 09/10/2026, build **1.1.0-b5**. Dettaglio dei ticket in `tickets.json` (103 voci).

## Riepilogo per round

| Round | Build | Team | Ticket aperti | Esito |
|---|---|---|---|---|
| 1 | b1 → b2 | Funzionale (E2E, 5 viewport) | T-001…T-023 | 23 corretti in b2; regressione `tests/regress.py` 23/23 |
| 1 | b2 → b3 | Fedeltà TAO & UX | T-024…T-050 | 21 corretti, 6 parziali/rinviati (contenuti L2, piega del Fold) |
| 1 | b2 → b3 | Contenuti | T-051…T-058 | 6 corretti in `tools/build-data.js`, 2 rinviati ai contenuti L2 |
| 1 | b3 → b4 | Codice (revisione statica + riproduzioni) | T-059…T-090 | **32 corretti in b4**; regressione `tests/regress2.py` 48/48 |
| 2 | b4 → b5 | Funzionale (regressione indipendente: 11 suite, 563 controlli, 5 viewport) | T-091…T-103 (alias F2-01…F2-13: 5 P2, 8 P3, nessun P0/P1) | **13 corretti in b5**; regressione `tests/regress3.py` 37/37. Le 32 correzioni del round Codice sono state riverificate nell'uso reale: reggono tutte. |

Aperti: **0** (97 corretti, 6 parziali di roadmap). Parziali (roadmap, non difetti bloccanti): T-024 (evidenza nel brano: campo `evidence` con i contenuti L2), T-038 (livello L1 nel simulatore), T-041 (piega a 700×930), T-044 (distribuzione dei tempi nello Stato), T-056/T-057 (statistiche dei distrattori sui contenuti L2).

## Che cosa ha cambiato il round Codice (b4)

- **Stato e tempo**: la pausa esce davvero dalla memoria (niente tempo gonfiato in background, niente «zombie» dopo l'azzeramento); il tempo in secondo piano non entra più nell'item; la simulazione ripresa oltre la scadenza si consegna per tempo scaduto come in TAO; una simulazione a cavallo della mezzanotte prosegue (conta la scadenza, non il giorno).
- **Selezione**: il ripasso Leitner avanza anche da Micro/Allenamento; ogni Micro ha almeno un numerico; gli item di una simulazione in sospeso non compaiono altrove; Micro/Ripasso/Sim sopra uno stato in corso chiedono sempre conferma.
- **Simulatore**: segnalibro senza perdita di tempo; evidenziatore con unione e rimozione al click; overview con fuoco e Escape; uscita sempre raggiungibile (logo = pulsante); copy corretto per il numerico.
- **Dati**: chiavi corrotte messe da parte con avviso, mai sovrascritte in silenzio; due schede non si perdono voci; import validato; export con `version`.
- **Igiene**: service worker con cache legata alla versione (test statico), nessuna risposta 404 in cache; CSP `default-src 'self'`; codice morto rimosso; un solo renderer per i brani.

## Che cosa ha cambiato il round 2 Funzionale (b5)

- **Tempo e date**: sessioni di una simulazione chiusa come stantia datate alla consegna (non alla riapertura: il lunedì non risulta «fatto» per un verbale di sabato); pausa dopo mezzanotte di una sessione appena iniziata resta riprendibile.
- **Strumenti in allenamento**: su due colonne calcolatrice e appunti si agganciano sotto la tabella, senza coprire nulla; sul telefono un widget per volta, sopra i pulsanti; barra di sessione sempre libera.
- **Simulatore**: «…» della barra delle bolle funziona dall'item 1; bersagli 44 px e testo a sinistra sul telefono; breadcrumb intero a 475 px; evidenziatore e filtro dell'overview ripartono puliti a ogni simulazione.
- **Dati**: voci malformate nel registro o nelle sessioni non fanno più cadere la home (copia `.corrupt`, avviso, porto sicuro verso Stato); stati in corso incoerenti scartati; più avvisi insieme restano leggibili.
- **Tastiera**: dopo un click col mouse su un'opzione, Invio conferma la risposta scelta.

## Suite automatiche

| Suite | Copre | Esito b5 |
|---|---|---|
| `tests/smoke.py` | percorso felice: home, Micro, Allenamento, esterna, sim completa, Stato | 26/26 |
| `tests/regress.py` | ticket round 1 Funzionale | 23/23 |
| `tests/regress2.py` | ticket round 2 Codice (pausa/background, scadenza, Leitner, composizione Micro, stati in corso, tempo per item, evidenziatore, tastiera, mezzanotte, bianche, chiavi corrotte, due schede, import, esterna, Fold 475 px, copy, service worker) | 48/48 |
| `tests/regress3.py` | ticket round 2 Funzionale (bolle «…», date della sim stantia, Invio dopo click, widget agganciati su 4 viewport, 7 forme di dati malformati, stati incoerenti, reset UI del simulatore, pausa a mezzanotte, esito sotto la topbar, avvisi multipli, esterna) | 37/37 |
| `tools/validate.js` | schema e qualità dei contenuti | ok |

Procedura di rilascio: `node tools/validate.js` → `python3 tests/smoke.py` → `python3 tests/regress.py` → `python3 tests/regress2.py` → `python3 tests/regress3.py` → bump `VERSION` in `js/main.js` **e** `sw.js` → commit → pubblicazione.

## Da verificare a mano sul Fold (non riproducibile in headless)

1. Calcolatrice nell'allenamento numerico: la tastiera di sistema non deve aprirsi toccando i tasti del widget (T-076).
2. Schermo esterno: logo «EPSO» come uscita dalla simulazione; evidenziatore con selezione a tocco (T-068, T-084).
3. Sessione in secondo piano per qualche minuto e ritorno: il tempo dell'item non deve crescere (T-066).
