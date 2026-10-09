# QA — EU Prep Suite v2

Processo (come in un'azienda che funziona):
1. **Build** → commit con versione.
2. **QA parallela** da team indipendenti, ognuno con un mandato e un perimetro:
   - **Funzionale** (E2E, Playwright su 5 viewport: Fold esterno 520×820 e 820×520, Fold interno 930×700 e 700×930, PC 1280×800)
   - **Fedeltà TAO e UX** (confronto con il test di esempio EPSO verificato l'08/10/2026; principi della specifica §2)
   - **Contenuti** (ogni correzione della revisione applicata e verificata; ricalcolo delle chiavi)
   - **Codice** (revisione statica: stato, timer, persistenza, accessibilità, prestazioni)
3. Ogni team apre **ticket** in `tickets.json`: `id`, `severity` (P0 blocca il rilascio · P1 grave · P2 minore · P3 miglioria), `area`, `title`, `steps`, `expected`, `actual`, `evidence`, `suggestion`, `status`.
4. **Triage** del responsabile di rilascio: fix → nuovo commit → **regressione** (round successivo) → chiusura con `fixed_in`.
5. Rilascio solo con **zero P0/P1 aperti**.

Report dei round in `QA-REPORT.md`.
