// Schede di studio della Parte 1 — namespace App.lessons
// Una scheda = una schermata: 3–7 punti, un esempio, un consiglio per la prova. Contenuti nostri (nessun testo Maggioli).
// Le regole della prova vengono dagli atti e dalle istruzioni EPSO (fonte in calce a ogni scheda).
window.App = window.App || {};
App.lessons = (() => {
  'use strict';
  const { el, rich } = App.utils;
  const $ = (id) => document.getElementById(id);

  const L = [
    {
      id: 'prova', test: 'Parte 1', title: 'Come funziona la Parte 1',
      points: [
        'Tre prove in italiano, una dopo l\'altra: **verbale** 20 domande in 35′, **numerico** 10 in 20′, **astratto** 10 in 10′.',
        'Per passare alla Parte 2 servono **verbale ≥ 10/20** e **numerico + astratto insieme ≥ 10/20**.',
        'In graduatoria entra **solo il verbale** (40%, poi 35%): numerico e astratto servono a superare la soglia.',
        'Rispondi **sempre**: una domanda in bianco è un punto perso, e il bando non prevede penalità per le risposte sbagliate.',
        'Dentro ogni prova puoi saltare e tornare: **segnalibro**, panoramica, poi consegna della parte.',
        'Calcolatrice e appunti sono **a schermo**, niente carta. In calcolatrice il decimale è il **punto** (12,5 → 12.5) e il punto delle migliaia **non si scrive** (1.395 → 1395).',
      ],
      tip: 'Ritmo da tenere: verbale 1′45″ a domanda, numerico 2′, astratto 1′. Allenati in silenzio: in prova leggere ad alta voce è vietato.',
      src: 'Lettera d\'invito del 19/10 · avviso C/2026/3362 · bando §4.3 · istruzioni TAO §6 · policy antifrode v1.3',
    },
    {
      id: 'v-metodo', test: 'Verbale', title: 'Il metodo',
      points: [
        'La domanda è quasi sempre **quale affermazione è corretta in base al brano**: conta solo ciò che il testo dice o implica per forza. Leggila comunque: se chiede quella errata, il metodo si rovescia.',
        '1) Leggi il brano una volta, per capire di che cosa parla. 2) Leggi le quattro opzioni. 3) Per ognuna cerca **la frase che la dimostra o la smentisce**. 4) Scarta: resta quella con una prova nel testo.',
        '**Plausibile non basta**: un\'affermazione vera nel mondo ma assente dal brano è sbagliata.',
        'Decidono le parole piccole: «tutti» o «alcuni», «può» o «deve», «previsto» o «avvenuto», «stimato» o «misurato».',
      ],
      example: [
        'Brano: «Il 70% dei comuni ha aderito al progetto.»',
        '✓ «Non tutti i comuni hanno aderito»: segue per forza, il 30% no.',
        '✗ «La maggior parte dei cittadini sostiene il progetto»: il brano parla di comuni, non di cittadini.',
      ],
      tip: 'Se dopo 2′ restano due opzioni, scegli quella che puoi indicare riga per riga, metti il segnalibro e vai avanti.',
    },
    {
      id: 'v-quant', test: 'Verbale', title: 'Quantificatori e negazioni',
      points: [
        '«La maggior parte» non è «tutti»; «alcuni» non è «molti»; «solo» esclude tutto il resto.',
        'Un\'opzione con «tutti» o «sempre» **non è sbagliata per forza**: è giusta se il brano lo dice. Controlla, non indovinare.',
        '«Non tutti» vuol dire che **almeno uno no**, non che nessuno sì.',
        '«X solo se Y»: senza Y niente X, ma **Y da solo non garantisce X**.',
      ],
      example: [
        'Brano: «Il contributo spetta solo alle imprese con meno di 50 addetti.»',
        '✓ «A un\'impresa con 80 addetti il contributo non spetta.»',
        '✗ «Ogni impresa con meno di 50 addetti riceve il contributo»: «solo» pone una condizione necessaria, non sufficiente.',
      ],
      tip: 'Per ogni quantificatore dell\'opzione cerca il suo gemello nel brano: se manca o è diverso, l\'opzione cade.',
    },
    {
      id: 'v-infer', test: 'Verbale', title: 'Inferenza e conoscenza esterna',
      points: [
        'Inferenza **lecita**: segue per forza (un calcolo sui dati, una definizione, una conseguenza logica). **Illecita**: probabile, causale, generalizzata.',
        '**Correlazione non è causa**: «dove c\'è più A c\'è più B» non dice che A produce B.',
        'Un piano o una previsione **non sono un fatto**: «prevede di ridurre» non è «ha ridotto».',
        '**Conoscenza esterna**: se l\'opzione è vera ma il brano non la dice, è sbagliata. Metti da parte ciò che sai.',
      ],
      example: [
        'Brano: «Nelle città con più piste ciclabili si registrano meno incidenti stradali per abitante.»',
        '✗ «Le piste ciclabili riducono gli incidenti»: è una causa, il brano dà solo un\'associazione.',
        '✗ «Le città con più piste ciclabili registrano meno incidenti stradali»: il brano parla di incidenti per abitante, non del loro numero.',
        '✓ «Nelle città con più piste ciclabili il rapporto tra incidenti e abitanti è più basso»: stessa cosa, altre parole.',
      ],
      tip: 'Chiediti: «Potrei indicare la riga che lo dimostra?» Se no, non è la risposta.',
    },
    {
      id: 'v-tempo', test: 'Verbale', title: 'Tempo, ambito, parafrasi',
      points: [
        '**Tempo**: avvenuto, in corso o previsto? Prima o dopo? «Dal 2020» non è «nel 2020».',
        '**Ambito**: chi fa che cosa, a chi, per quale gruppo (le imprese o i cittadini, alcuni Stati o tutta l\'Unione).',
        '**Parafrasi ingannevole**: quasi identica al brano, con una parola cambiata (riduce → elimina, può → deve, stimato → misurato). È la trappola più pericolosa, perché «suona» giusta.',
      ],
      example: [
        'Brano: «Il ministero ha stimato un calo del 12% delle emissioni.»',
        '✗ «Le emissioni sono calate del 12%»: una stima diventa un fatto misurato.',
      ],
      tip: 'Davanti a un\'opzione che sembra copiata dal brano, confrontala parola per parola.',
    },
    {
      id: 'n-metodo', test: 'Numerico', title: 'Il metodo',
      points: [
        'Leggi **prima la domanda**, poi cerca nella tabella solo riga, colonna e anno che servono.',
        'Controlla le **unità** nell\'intestazione e nella nota: migliaia, milioni, %, valuta.',
        '**Stima** l\'ordine di grandezza prima di calcolare: scarti subito le opzioni impossibili.',
        'Calcola con la calcolatrice a schermo: decimale con il **punto**, migliaia **senza punto** (1.395 → 1395); arrotonda **solo alla fine**, come chiede la domanda.',
        '«Nessuna di queste risposte» a volte è giusta: sceglila solo dopo aver ricontrollato il calcolo.',
      ],
      example: [
        'Esportazioni, milioni di €: Paese A 1.240 nel 2023 e 1.395 nel 2024; Paese B 860 e 903. Domanda: variazione % di A?',
        '1) Riga A, colonne 2023 e 2024. 2) È un rapporto: i milioni si semplificano. 3) Stima: +155 su circa 1.200, quasi +13%. 4) Calcolatrice: (1395 − 1240) / 1240 × 100 = 12.5 → 12,5%.',
        'Trappole: 155 ÷ 1.395 = 11,1% (base sbagliata); +5,0% è la riga B.',
      ],
      tip: '2′ a domanda. Oltre 2′30″: segna la stima migliore, segnalibro e avanti: le domande valgono tutte uguale.',
    },
    {
      id: 'n-perc', test: 'Numerico', title: 'Percentuali e variazioni',
      points: [
        'Variazione % = (nuovo − vecchio) ÷ vecchio × 100. La **base è il valore di partenza**.',
        '**Punti percentuali** e percentuale sono diversi: da 10% a 12% sono +2 punti, ma +20%.',
        '**Percentuale inversa**: se dopo un aumento del 15% il valore è 690, prima era 690 ÷ 1,15 = 600 (non 690 × 0,85).',
        'Variazioni successive **si moltiplicano**: +10% e poi +10% fanno +21%, non +20%.',
      ],
      example: [
        'Abbonati da 1.250 a 1.450: (1.450 − 1.250) ÷ 1.250 × 100 = 16%.',
        'Trappola: 200 ÷ 1.450 = 13,8% (base sbagliata).',
      ],
      tip: 'Negli appunti scrivi la formula prima dei numeri: eviti di dividere per il valore sbagliato.',
    },
    {
      id: 'n-tab', test: 'Numerico', title: 'Quote, pro capite, unità',
      points: [
        '**Quota %** = parte ÷ totale × 100; spesso il totale va calcolato sommando le righe.',
        '**Pro capite** = valore ÷ popolazione, con le unità allineate: 4.200 milioni di € ÷ 8,4 milioni di abitanti = 500 € a testa.',
        '**Conversioni**: migliaia × 1.000, milioni × 1.000.000. Convertire una volta sola, all\'inizio o alla fine.',
        'Stesso indicatore, anni diversi: **la colonna sbagliata** è la trappola più comune.',
      ],
      example: [
        'Rifiuti raccolti, migliaia di t: Nord 2.400, Centro 1.100, Sud 1.500. Abitanti del Nord: 12,0 milioni.',
        'Quota del Nord: 2.400 ÷ (2.400 + 1.100 + 1.500) × 100 = 48%. Trappola: 2.400 ÷ 3.500 = 68,6% (manca una riga nel totale).',
        'Pro capite: 2.400 ÷ 12 = 200 migliaia di t per milione di abitanti, cioè 200 kg a testa (1.000 t ÷ 1 milione = 1 kg). Trappola: «200 t a testa».',
      ],
      tip: 'Prima del calcolo fissa l\'unità del risultato: «euro per abitante», «punti percentuali».',
    },
    {
      id: 'n-medie', test: 'Numerico', title: 'Medie, proiezioni, cambi',
      points: [
        '**Media semplice** = somma ÷ numero. **Media ponderata**: ogni valore pesa per la sua base (tasso medio = totale disoccupati ÷ totale forza lavoro).',
        '**Proiezione allo stesso tasso**: valore × (1 + tasso), non valore + la stessa differenza.',
        '**Cambio** «X unità per 1 €»: per passare in euro si **divide** per il cambio; per passare dall\'euro si moltiplica.',
      ],
      example: [
        'Disoccupati su forza lavoro, migliaia: A 50 su 1.000 (5%), B 300 su 2.000 (15%).',
        'A e B insieme: (50 + 300) ÷ (1.000 + 2.000) × 100 = 11,7%. Trappola: (5 + 15) ÷ 2 = 10%, media semplice.',
        'Proiezione: 800 nel 2024, +5% l\'anno: 800 × 1,05 = 840 nel 2025; 840 × 1,05 = 882 nel 2026 (non 880).',
        'Cambio, 25 corone per 1 €: 5.000 corone ÷ 25 = 200 €; 200 € × 25 = 5.000 corone.',
      ],
      tip: 'Se due opzioni sono vicine, spesso una è la media semplice al posto di quella ponderata.',
    },
    {
      id: 'a-metodo', test: 'Astratto', title: 'Il metodo',
      points: [
        'Cinque figure in fila: scegli **la sesta** tra cinque. 1′ a domanda: si guarda, non si ragiona a lungo.',
        'Isola **un elemento alla volta**: quanti sono? dove stanno? come sono orientati? di che colore?',
        'Trova la regola più visibile e **verificala su tutte e cinque** le figure.',
        'Usa le opzioni: **scarta** quelle che violano la regola; se ne restano due, cerca la seconda regola.',
        'Un\'opzione identica alla quinta figura è quasi sempre una trappola.',
      ],
      tip: 'Dopo 1′ senza regola: scarta ciò che puoi, scegli tra le rimaste, segnalibro e avanti.',
    },
    {
      id: 'a-cont', test: 'Astratto', title: 'Conteggio e rotazione',
      points: [
        '**Conteggio**: gli elementi aumentano o diminuiscono di 1 o 2 a ogni passo; oppure crescono i lati (triangolo → quadrato → pentagono).',
        '**Rotazione**: un elemento gira di 45°, 90° o 135° a ogni passo. Il verso (orario o antiorario) si legge confrontando due figure vicine.',
        'Le forme simmetriche ingannano: un quadrato girato di 90° sembra uguale. Guarda il dettaglio che si muove (la punta, il punto, il lato pieno).',
      ],
      tip: 'Ricava la regola dal passaggio 1ª → 2ª, verificala su 2ª → 3ª e 4ª → 5ª, poi applicala alla 6ª.',
    },
    {
      id: 'a-alt', test: 'Astratto', title: 'Alternanza, riempimento, posizione',
      points: [
        '**Alternanza**: un attributo cambia tra due valori (bianco/nero, cerchio/quadrato, piccolo/grande): la 6ª figura è come la 4ª e la 2ª.',
        '**Riempimento**: il colore gira in ciclo (bianco → grigio → nero → bianco), quindi la 6ª è come la 3ª; oppure il pieno passa da un elemento al successivo.',
        '**Posizione**: un elemento si sposta lungo il bordo della griglia di 1 o 2 caselle a ogni passo, sempre nello stesso verso.',
      ],
      tip: 'Per l\'alternanza guarda separatamente le figure pari e quelle dispari.',
    },
    {
      id: 'a-comb', test: 'Astratto', title: 'Regole combinate',
      points: [
        'Nelle serie difficili valgono **2 o 3 regole insieme**, su elementi diversi: la freccia gira e intanto i punti aumentano.',
        'Le opzioni sbagliate sbagliano **una cosa sola**, a volte un elemento che nella serie resta fisso. Elimina **per regola**: la prima su tutte e cinque, la seconda sulle rimaste, poi gli elementi fissi.',
        'Comincia dalla regola più facile da verificare (di solito il conteggio), poi le altre.',
      ],
      tip: 'Trovate due regole? Bastano quasi sempre due controlli per opzione.',
    },
    {
      id: 'strategia', test: 'Parte 1', title: 'Strategia in prova',
      points: [
        'Ogni prova ha il suo timer: guarda **quanto resta**.',
        'Punti di controllo: verbale, quando apri l\'11ª restano almeno **17′30″**; numerico, alla 6ª almeno **10′**; astratto, alla 6ª almeno **5′**.',
        'Domanda difficile: **segna comunque una risposta**, metti il segnalibro, vai avanti. In bianco vale zero, e il bando non prevede penalità per le risposte sbagliate.',
        'Per scartare usa gli strumenti di TAO, che si attivano dall\'icona delle impostazioni: **Answer Elimination** barra un\'opzione, **Answer Masking** la nasconde.',
        'A 2′ dalla fine apri **Overview** e riempi ogni domanda senza risposta; poi, se resta tempo, i segnalibri. Se alla consegna TAO avvisa che ci sono domande senza risposta, scegli **Keep answering**.',
        'Astratto: in 10′ di solito non si torna indietro: decidi alla prima lettura.',
      ],
      tip: 'In simulazione prova tutta la sequenza: prima passata con risposte provvisorie, poi Overview.',
      src: 'Istruzioni TAO §6.3.1–6.3.6, §6.4.5–6.4.6 · bando §4.3',
    },
    {
      id: 'fine', test: 'Parte 1', title: 'Prima della prova',
      points: [
        '**PC personale** (non quello aziendale), Chrome o Edge aggiornati, estensione Proctorio, webcam e microfono, caricatore collegato, **un solo schermo**.',
        'Prima di iniziare: **antivirus, firewall, VPN e proxy disattivati**.',
        'Sulla scrivania **solo** il documento, una bevanda in un contenitore trasparente senza etichetta e al massimo 2 fazzoletti bianchi.',
        '**Nessun\'altra persona** nella stanza, neanche udibile; telefono lontano, solo per chiamare il supporto.',
        '**Non leggere ad alta voce** le domande; non uscire dall\'inquadratura né dallo schermo intero.',
        '**Problema tecnico**: chiama subito il supporto TAO (+351 211 554 559, lunedì–venerdì 9–18, in inglese e francese) e annota ora e accaduto; il reclamo si fa dall\'account EPSO entro **sabato 14/11**.',
        'Durante la prova **non aprire quest\'app né Claude**: copiare o condividere il contenuto delle prove, anche in strumenti di AI, è vietato.',
      ],
      tip: 'Il giorno prima niente esercizi nuovi: prepara il posto e dormi.',
      src: 'Istruzioni TAO 427-26 · policy antifrode EPSO v1.3',
    },
  ];
  const byId = new Map(L.map((x) => [x.id, x]));
  const get = (id) => byId.get(id) || null;

  // Mostra una scheda. onGo: pulsante principale (alle domande); onBack: indietro. Ritorna false se la scheda non esiste.
  function show(id, { goText = 'Alle domande', onGo = null, onBack = null, kicker = '' } = {}) {
    const x = get(id);
    if (!x) return false;
    $('lesson-kicker').textContent = kicker || x.test;
    $('lesson-title').textContent = x.title;
    $('lesson-points').replaceChildren(...x.points.map((p) => el('li', {}, ...rich(p))));
    const ex = $('lesson-example');
    ex.hidden = !x.example;
    ex.replaceChildren(...(x.example ? [el('p', { class: 'lesson-ex-head' }, 'Esempio'), ...x.example.map((l) => el('p', {}, l))] : []));
    $('lesson-tip').replaceChildren(el('strong', {}, 'In prova: '), x.tip);
    $('lesson-src').textContent = x.src ? `Fonti: ${x.src}` : '';
    $('lesson-src').hidden = !x.src;
    $('lesson-go').textContent = goText;
    $('lesson-go').onclick = onGo || (() => App.main.home());
    $('lesson-back').onclick = onBack || (() => App.main.home());
    $('lesson-back').hidden = !onBack;
    App.ui.show('lesson', { title: 'Scheda' });
    setTimeout(() => $('lesson-go').focus({ preventScroll: true }), 30);
    return true;
  }

  // Indice delle schede (dal menu «Altro»): lettura libera, senza domande.
  function openIndex() {
    const groups = {};
    for (const x of L) (groups[x.test] = groups[x.test] || []).push(x);
    $('lessons-list').replaceChildren(...Object.entries(groups).map(([test, list]) => el('div', { class: 'lessons-group' },
      el('h2', {}, test),
      ...list.map((x) => el('button', { type: 'button', class: 'alt-card', onclick: () => show(x.id, { goText: 'Chiudi', onGo: openIndex, kicker: x.test }) },
        el('span', { class: 'alt-title' }, x.title),
        el('span', { class: 'alt-sub' }, x.tip))))));
    App.ui.show('lessons', { title: 'Schede' });
  }

  return { get, show, openIndex, all: () => L.slice() };
})();
