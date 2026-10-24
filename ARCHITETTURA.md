# EU Prep Suite — v1.2 «Percorso» (Parte 1)

Mappa per chi lavora sull'app dopo (persona o AI). Una pagina.

## Che cosa fa
Un solo percorso fino alla Parte 1 (mer 11/11/2026, 14:00), in **quattro schede** (dalla b9): **Oggi** (giorni alla prova, **una sola prossima tappa**, tappe di oggi, una riga di promemoria solo se una scadenza è vicina) · **Allenati** (allenamento libero, ripasso, Micro, schede, simulazione a scelta, test ufficiale) · **Agenda** (calendario, cose da fare fuori dall'app con scadenza: prerequisiti, permesso, portale ogni 3 giorni, reclami; le date) · **Progressi** (soglie, trappole, sessioni, dati). L'app è l'unico punto di contatto con la prova (decisione di Andrea, 24/10).
Fasi:
- **Basi**: 14 tappe. Tappa 1: com'è fatta la prova. Tappa 2: **misura di partenza** nel clone TAO (10 verbali + 5 numeriche + 5 serie, tempi dimezzati). Poi 12 schede con 4–5 domande corrette subito.
- **Allenamento**: ciclo verbale · numerico · verbale · astratto · ripasso, **tarato** sulla misura più recente (misura, poi simulazioni). Dal 27/10, ogni due giorni, un **blocco a tempo** nel clone TAO. Numerico e astratto salgono di livello con almeno 7 risposte giuste su 10 di livello prova.
- **Simulazioni complete** per data: sabato 31/10 (finestra fino al 06/11) e sabato 07/11.
- **Scarico** 08–09/11, riposo 10/11, prova.
- **Recupero**: a 12 giorni o meno dalla prova, le schede delle Basi rimaste si leggono dentro i drill della stessa prova.
- **Obiettivo del giorno**: 3 tappe nei feriali, 6 nel fine settimana; misura e simulazione valgono 3.

## Design
«Registro d'esame»: carta e inchiostro, IBM Plex Sans/Mono/Serif in `fonts/` (OFL, in locale per l'uso offline), il giallo dell'evidenziatore come unico accento, verde e rosso solo per corretto e sbagliato. Brani in serif, numeri e tempi in monospazio, opzioni come bolle del foglio risposte. Tema chiaro e scuro con gli stessi token (`css/style.css`, inizio file). Il **clone TAO** (in fondo al CSS) resta bianco e fedele alla piattaforma, con Answer Elimination e Answer Masking.

## File
| File | Ruolo |
|---|---|
| `js/path.js` | percorso: tappe, date, taratura, blocchi, recupero, prossima tappa, conteggi per giorno |
| `js/ready.js` | stima rispetto alle soglie dalla **prima** risposta agli item di livello prova degli ultimi 10 giorni (ripasso e gemelli esclusi) |
| `js/lessons.js` | 15 schede di studio (testi nostri; regole della prova con la fonte) |
| `js/select.js` | scelta degli item: mai visti prima, trappole più sbagliate, modelli deboli (un terzo della sessione); ripasso Leitner con **gemelli** per numerico e astratto; riserve del verbale per le simulazioni del percorso |
| `js/session.js` | tappe, Micro, allenamento, ripasso: un item per volta, ripresa esatta; regola della trappola sotto ogni errore |
| `js/sim.js` | clone TAO: misura, blocchi, simulazioni; istruzioni con conto alla rovescia |
| `js/gen-numerico.js` | generatore deterministico: tabelle `N…`, grafici `G…`, tabelle eterogenee a più passaggi `M…` (se presenti) |
| `js/gen-astratto.js`, `js/gen-astratto2.js` | serie a una figura `A…`; serie con più elementi per figura `B…` (v2, se presente) |
| `js/store.js` | localStorage (`eps2.*`); ogni voce porta `dev`; un gemello (`twinOf`) conta per l'item originale; la scatola Leitner avanza solo a scadenza raggiunta |
| `js/sync.js` | sincronizzazione tra dispositivi solo quando l'app gira come artifact su claude.ai (capability `db` + `user`); su GitHub Pages i dati restano sul dispositivo |
| `data/bank-verbale.js` | verbale livello base (L1) e vero/falso |
| `data/bank-verbale-l2.js` | verbale livello prova (L2, ~150 parole): generato da `tools/build-l2.js` dai lotti `tools/source-v2/verbale-l2-*.json` |
| `data/bank-numerico.js` | numerico livello base (problemi brevi) |
| `tools/archive-parte2/` | banche UE e digitali della Parte 2, fuori dall'app fino ai risultati della Parte 1 |

Gli id dei generati sono **seme + livello**: lo stesso id ricostruisce lo stesso item ovunque. Non cambiare l'uscita di un modello esistente: si aggiunge un prefisso nuovo.

## Contenuti: come aggiungerne
- **Verbale L2**: nuovo lotto `tools/source-v2/verbale-l2-N.json` (schema in `tools/build-l2.js`), revisione alla cieca di un revisore diverso da chi scrive, poi `node tools/build-l2.js`. Id a blocchi di 20 da 1101; nei lotti 1–4 (1101–1180) la seconda metà di ogni blocco è riservata alle simulazioni; dal lotto 5 tutto va all'allenamento. I lotti 9–10 (1261–1300) sono di **livello alto** (`difficulty: 4`, brani scientifici e storici, distrattori a una parola di distanza): li pesca chi va forte nel verbale.
- **Numerico e astratto**: nuovi modelli o regole nei generatori; i test `tests/gen_*.test.js` controllano chiave unica, ricalcolo indipendente ed euristiche cieche.

## Dati di Andrea
Sulla PWA (GitHub Pages) i dati stanno nel `localStorage` del dispositivo: export e import JSON dallo Stato. Come artifact su claude.ai stanno nel database dell'artifact, area privata `data/users/<id>/` (doc `state` e `log-<AAAAMMGG>-<dispositivo>`).

## Test
`TZ=Europe/Rome node tests/path.test.js` · `node tests/twins.test.js` · `node tests/gen_numerico.test.js` · `node tests/gen_multi.test.js` · `node tests/gen_astratto.test.js` · `node tests/gen_astratto2.test.js` · `python3 tests/percorso.py` (end-to-end sul Fold 8 in 4 posture + PC) · `python3 tests/sync.py`. Versione: `App.main.VERSION` = `VERSION` in `sw.js`.
