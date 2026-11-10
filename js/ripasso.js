// Ripassone della Parte 1 — namespace App.ripasso
// Tutto in una sezione: per ogni prova i tipi di domanda, il metodo, le trappole, le formule o le regole, cosa fare nel dubbio.
// Una prova per schermata (quattro schede in alto), un blocco aperto alla volta. Testi nostri, coerenti con js/lessons.js
// e con le regole delle trappole di js/banks.js; i tipi di domanda sono quelli dei generatori e della banca verbale.
// Blocchi: steps (sequenza numerata), rows (nome → spiegazione, con esempio facoltativo), list (punti).
// mine: true = errore ricorrente di Andrea (registro del 24–27/10).
window.App = window.App || {};
App.ripasso = (() => {
  'use strict';
  const { el, rich } = App.utils;
  const $ = (id) => document.getElementById(id);

  const T = [
    {
      id: 'strategia', label: 'Strategia', fmt: 'vale per tutte e tre le prove',
      blocks: [
        { h: 'La prova in numeri', rows: [
          ['Verbale', '20 domande in 35′, cioè 1′45″ l\'una. Soglia 10/20. È l\'**unico punteggio che entra in graduatoria**.'],
          ['Numerico', '10 domande in 20′, cioè 2′ l\'una.'],
          ['Astratto', '10 domande in 10′, cioè 1′ l\'una.'],
          ['Soglia N + A', 'Numerico e astratto **insieme** almeno 10/20: uno può compensare l\'altro.'],
          ['Tutte e tre', 'Chi non completa tutte le prove non ha nessuna risposta valutata: si arriva in fondo anche se una va male.'],
        ] },
        { h: 'Come si gioca ogni prova', steps: [
          '**Prima passata**: rispondi a tutte, anche con una risposta provvisoria. In bianco vale zero e non c\'è penalità per gli errori.',
          '**Segnalibro** sulle domande in dubbio, e avanti. Le domande valgono tutte uguale.',
          '**Punti di controllo**: verbale, quando apri l\'11ª restano almeno 17′30″; numerico, alla 6ª almeno 10′; astratto, alla 6ª almeno 5′.',
          '**A 2′ dalla fine**: apri Overview, riempi ogni domanda senza risposta, poi rivedi i segnalibri.',
          '**Consegna**: se TAO avvisa che mancano risposte, scegli «Keep answering». Dopo «Submit and proceed» non contare di poter tornare indietro.',
        ] },
        { h: 'Gli strumenti di TAO', rows: [
          ['Overview', 'Cerchio grigio: domanda non aperta. Solo contorno: aperta senza risposta. Cerchio pieno: risposta data.'],
          ['Answer Elimination', 'Barra un\'opzione scartata. Si accende dall\'icona delle impostazioni, come Answer Masking, che la nasconde.'],
          ['Calcolatrice', 'Decimale con il **punto** (12.5), migliaia **senza punto** (1395). La virgola non funziona.'],
          ['Scratchpad', 'Gli appunti si scrivono solo lì: carta e penna sono vietate.'],
          ['Evidenziatore', 'Segna le parole del brano. Non funziona sulle immagini.'],
        ] },
        { h: 'Vietato durante la prova', list: [
          'Leggere ad alta voce o mormorare le domande.',
          'Coprire la bocca o il viso, anche con la mano sul mento.',
          'Alzarti o uscire dall\'inquadratura.',
          'Uscire dallo schermo intero, cliccare una notifica, aprire una scheda, ricaricare la pagina.',
          'Collegare il caricatore a test iniziato, cambiare rete.',
        ] },
      ],
    },
    {
      id: 'verbale', label: 'Verbale', fmt: '20 domande · 35′ · 1′45″ l\'una',
      blocks: [
        { h: 'Tipi di domanda', rows: [
          ['Quale è corretta', 'Il caso normale. Un brano di circa 150 parole e quattro affermazioni: **una sola** è dimostrata dal testo.'],
          ['Quale è errata', 'Il metodo si rovescia: tre affermazioni hanno una riga che le dimostra, cerchi quella che non ce l\'ha. Rileggi sempre la domanda.'],
          ['Brano con numeri', 'L\'opzione giusta spesso è un piccolo calcolo: se il 70% ha aderito, il 30% no.', 'Attenzione all\'unità: «per abitante» non è «in totale».'],
          ['Brano con più voci', 'Il testo riporta chi dice che cosa (la Commissione, uno studio, i critici). L\'opzione sbagliata attribuisce la frase a un altro, o la presenta come un fatto.'],
          ['Brano tecnico', 'Scientifico o storico, con parole difficili. Non serve capirle tutte: serve trovare la riga.'],
        ] },
        { h: 'Metodo', steps: [
          'Leggi il brano **una volta**, per capire di che cosa parla.',
          'Leggi **tutte e quattro** le opzioni prima di scegliere.',
          'Per ogni opzione cerca **la riga** che la dimostra o la smentisce.',
          'Scarta. Resta quella che puoi indicare con il dito nel testo.',
        ] },
        { h: 'Le sette trappole', rows: [
          ['Ambito e attribuzione', 'Il dato vale solo per chi il brano indica: soggetto, gruppo, luogo. Rileggi **il soggetto** prima di scegliere.', '«Il 70% dei comuni ha aderito» non diventa «la maggior parte dei cittadini è d\'accordo».', true],
          ['Parafrasi ingannevole', 'Quasi copiata dal brano, con una parola cambiata. Confrontala parola per parola.', 'riduce → elimina · può → deve · stimato → misurato · «secondo X» → un fatto.'],
          ['Quantificatori', 'Se il quantificatore dell\'opzione è più forte di quello del brano, l\'opzione cade. Ma «tutti» è giusto se il brano dice «tutti».', '«La maggior parte» non è «tutti». «Alcuni» non è «molti». «Solo» esclude il resto.', true],
          ['Negazioni e condizioni', '«Non tutti» vuol dire almeno uno no. «X solo se Y»: senza Y niente X, ma Y da solo non garantisce X.', '«Spetta solo alle imprese sotto i 50 addetti» non dice che ogni impresa sotto i 50 lo riceve.'],
          ['Sequenze temporali', 'Avvenuto, in corso o previsto? Prima o dopo?', '«Prevede di ridurre» non è «ha ridotto». «Dal 2020» non è «nel 2020».'],
          ['Inferenza oltre il testo', 'Vale solo ciò che segue per forza: un calcolo, una definizione. Niente cause da correlazioni, niente generalizzazioni.', 'Più piste ciclabili e meno incidenti: non vuol dire che le piste li riducono.'],
          ['Conoscenza esterna', 'Vera nel mondo ma assente dal brano: sbagliata. Metti da parte ciò che sai.'],
        ] },
        { h: 'Parole spia', list: [
          '**Quanti**: tutti, nessuno, alcuni, molti, la maggior parte, almeno, solo, esclusivamente.',
          '**Quanto certo**: può, deve, potrebbe, è probabile, si ritiene, secondo.',
          '**Quando**: previsto, proposto, stimato, entro, dal, fino al, già, ancora.',
          '**Di chi**: imprese o cittadini, alcuni Stati o l\'Unione, per abitante o in totale.',
        ] },
        { h: 'Nel dubbio', list: [
          'Due opzioni plausibili: vince quella che riprende il brano con più precisione, senza parole aggiunte.',
          'Anche quando sei sicuro, punta la riga: il 27/10 una risposta su cinque data da «sicuro» era sbagliata.',
          'Oltre 2′ su una domanda: scegli quella che puoi indicare riga per riga, segnalibro, avanti.',
          'In ritardo (meno di 1′ a domanda): cerca nel brano le parole chiave dell\'opzione e leggi solo quelle frasi.',
        ] },
      ],
    },
    {
      id: 'numerico', label: 'Numerico', fmt: '10 domande · 20′ · 2′ l\'una',
      blocks: [
        { h: 'Tipi di domanda', rows: [
          ['Tabella, un indicatore', 'Più Paesi e più anni: variazione %, differenza, quota di un Paese sul totale.'],
          ['Tabella, due indicatori', 'Esportazioni e importazioni, iscritti e laureati: rapporto tra i due, saldo, quota dell\'uno sull\'altro.'],
          ['Grafico a linee', 'Una o due serie su più anni: variazione tra due anni, **aumento medio annuo**, anno con la variazione più grande.'],
          ['Grafico più tabella', 'Il dato sta in due posti, per esempio rifiuti nel grafico e abitanti nella tabella: quasi sempre è un **pro capite**.'],
          ['Composizione', 'Un totale diviso per categorie (bilancio per area, energia per fonte): quota sul totale, punti percentuali tra due anni.'],
          ['Tassi e basi', 'Tassi in % e basi in migliaia (mercato del lavoro): dal tasso al numero di persone e ritorno; tasso di più gruppi insieme.'],
          ['Cambio', 'Paesi fuori dall\'euro, valori in moneta nazionale: converti in euro **prima** di confrontare.'],
          ['Più passaggi', 'La grandezza che serve non è in tabella e va ricavata; oppure il testo dà un\'ipotesi («se il PIL cresce del 4%…»); oppure chiede «approssimativamente».'],
        ] },
        { h: 'Metodo', steps: [
          'Leggi **prima la domanda**.',
          'Trova riga, colonna e anno che servono. Solo quelli.',
          'Controlla le **unità** nell\'intestazione e nella nota: migliaia, milioni, %, valuta.',
          '**Stima** l\'ordine di grandezza e scarta le opzioni impossibili.',
          'Calcola. Arrotonda **solo alla fine**, come chiede la domanda.',
        ] },
        { h: 'Formule di base', rows: [
          ['Variazione %', '(nuovo − vecchio) ÷ vecchio × 100', 'Da 1250 a 1450: 200 ÷ 1250 = 16%. La base è il valore di partenza.'],
          ['Punti percentuali', 'Differenza tra due percentuali.', 'Dal 10% al 12% sono +2 punti, ma +20%.'],
          ['Percentuale inversa', 'valore finale ÷ (1 + tasso)', '690 dopo un +15%: 690 ÷ 1.15 = 600. Non 690 × 0.85.'],
          ['Variazioni successive', 'Si moltiplicano i fattori.', '+10% e poi +10%: 1.1 × 1.1 = 1.21, cioè +21%.'],
          ['Quota %', 'parte ÷ totale × 100', 'Il totale spesso va sommato da tutte le righe.'],
          ['Quante volte', 'A ÷ B', '«A è circa 3 volte B»: dividi, non sottrarre.'],
          ['Pro capite', 'valore ÷ popolazione', '4200 milioni di € ÷ 8.4 milioni di abitanti = 500 € a testa.'],
          ['Dal tasso al numero', 'base × tasso ÷ 100', 'Forza lavoro 2000 migliaia, disoccupazione 15%: 300 migliaia.'],
          ['Cambio', '«25 corone per 1 €»: verso l\'euro si divide.', '5000 corone ÷ 25 = 200 €. Dall\'euro si moltiplica.'],
        ] },
        { h: 'Formule a più passaggi', rows: [
          ['Aumento medio annuo', '(finale − iniziale) ÷ numero di intervalli', 'Gli intervalli sono gli anni meno uno: dal 2019 al 2024 sono 6 anni e 5 intervalli. Si calcola, non si stima.', true],
          ['Media ponderata', 'somma delle parti ÷ somma delle basi', 'A 50 su 1000, B 300 su 2000: 350 ÷ 3000 = 11.7%. Non la media di 5% e 15%.'],
          ['Media pesata inversa', 'parte del gruppo che manca = parte totale − parte del gruppo noto; poi ÷ la sua base', 'Tasso complessivo 12% su 3000, gruppo A 5% su 1000: (360 − 50) ÷ 2000 = 15.5%.'],
          ['Proiezione', 'valore × (1 + tasso), un anno alla volta', '800 al +5% l\'anno: 840, poi 882. Non 880.'],
          ['Grandezza ricavata', 'Se la tabella dà la spesa e la sua quota del PIL: PIL = spesa ÷ quota.', 'Spesa 12 miliardi, pari al 2% del PIL: 12 ÷ 0.02 = 600 miliardi.'],
          ['Prodotto di fattori', 'Se una grandezza è A × B × C, la sua variazione è il prodotto delle variazioni.', 'PIL +4% e quota dal 2% al 2.2% (fattore 1.1): 1.04 × 1.1 = 1.144, cioè +14.4%.'],
          ['Densità', 'abitanti ÷ superficie', 'Per una macroregione somma prima abitanti e km² delle righe che la compongono.'],
        ] },
        { h: 'Le trappole nelle opzioni', rows: [
          ['Base sbagliata', 'Hai diviso per il valore d\'arrivo invece che per quello di partenza.'],
          ['Riga o anno sbagliato', 'La più comune: l\'opzione è il calcolo giusto sulla colonna accanto. Rileggi l\'intestazione prima di confermare.'],
          ['Unità', 'Migliaia contro milioni, tonnellate contro chili. Fissa l\'unità del risultato **prima** del calcolo e converti una volta sola.'],
          ['Punti o percento', 'La domanda chiede i punti percentuali e l\'opzione dà la variazione %, o viceversa.'],
          ['Media semplice', 'Due opzioni vicine: una è la media dei due tassi, l\'altra è la ponderata. Quasi sempre vale la ponderata.'],
          ['Anni o intervalli', 'Aumento medio diviso per 6 invece che per 5.', '', true],
          ['Arrotondamento a metà', 'Con opzioni vicine tieni tutti i decimali fino in fondo.'],
          ['Nessuna di queste', 'A volte è giusta. Sceglila solo dopo aver rifatto il calcolo.'],
        ] },
        { h: 'Nel dubbio', list: [
          'Scrivi la formula nello scratchpad **prima** dei numeri: eviti di dividere per il valore sbagliato.',
          'Usa le opzioni: se la stima dice «circa 13%», le opzioni 5% e 31% sono già fuori.',
          'Oltre 2′30″: segna la stima migliore, segnalibro, avanti.',
        ] },
      ],
    },
    {
      id: 'astratto', label: 'Astratto', fmt: '10 domande · 10′ · 1′ l\'una',
      blocks: [
        { h: 'Tipi di serie', rows: [
          ['Un elemento', 'Cinque figure con una sola cosa che cambia: una freccia che gira, un quadratino lungo il bordo, un poligono, dei pallini.'],
          ['Due o tre elementi', 'Ogni figura contiene più elementi (forma, freccia, pallini, disco a spicchi, griglia) e **ognuno segue la sua regola**. Sono le serie difficili.'],
          ['La domanda', 'Sempre la stessa: quale delle cinque opzioni è la sesta figura.'],
        ] },
        { h: 'Metodo', steps: [
          '**Un elemento alla volta**: quanti sono, dove stanno, come sono orientati, di che colore.',
          'Ricava la regola dal passaggio 1ª → 2ª e **verificala su tutte e cinque**.',
          'Scarta le opzioni che violano quella regola.',
          'Ne restano due o tre: passa al secondo elemento, poi a ciò che nella serie non cambia mai.',
        ] },
        { h: 'Che cosa guardare, elemento per elemento', rows: [
          ['Freccia', 'Gira di 45°, 90° o 135° a ogni passo. Segui solo **la punta**.', 'Varianti: passo che cresce (45°, 90°, 135°…); gira una figura sì e una no.'],
          ['Pallini', 'Aumentano o calano di 1 o 2. Scrivi la sequenza dei numeri.', 'Varianti: +2 e −1 a turno; due serie intrecciate (dispari su, pari giù); tanti quanti gli spicchi colorati.'],
          ['Forma', 'Tipo, colore e misura sono tre regole separate.', 'Tipo in ciclo di tre; colore bianco → grigio → nero; misura che cresce, cala, o va avanti e indietro.'],
          ['Disco a spicchi', 'Gli spicchi colorati aumentano o calano di uno, oppure ruotano tutti insieme, a passo fisso o che cresce.', 'Conta gli spicchi e guarda dove comincia il colore.'],
          ['Griglia', 'Una casella colorata si sposta di 1 o 2 caselle a ogni passo.', 'Lungo il bordo; in diagonale, uscendo da un lato e rientrando da quello opposto; avanti e indietro su una riga.'],
          ['Poligono', 'Un lato in più o in meno a ogni passo: triangolo, quadrato, pentagono…'],
        ] },
        { h: 'Il catalogo delle regole', rows: [
          ['Conteggio', 'Scrivi la sequenza dei numeri e trova il passo. È la più facile da verificare: **comincia da qui**.'],
          ['Rotazione', 'Misura il passo in 45° e il verso tra due figure vicine. Le forme simmetriche ingannano: guarda il dettaglio che si muove.'],
          ['Alternanza', 'Due valori a turno: la 6ª è come la 4ª e la 2ª. Guarda pari e dispari come due serie.'],
          ['Riempimento', 'Tre colori in ciclo: la 6ª copia la 3ª.'],
          ['Posizione', 'Conta di quante caselle si sposta e in che verso.'],
          ['Dimensione', 'Confronta le misure a due a due: cresce, cala, o avanti e indietro.'],
          ['Regole combinate', 'Una regola per elemento: elimina le opzioni **una regola alla volta**.', 'Oltre al passo fisso cerca: passo che cresce, una figura sì e una no, un elemento che dipende da un altro.', true],
          ['Elemento fisso', 'Controlla anche ciò che nella serie non cambia mai: un\'opzione che lo cambia cade.'],
        ] },
        { h: 'Gli schemi del passo', rows: [
          ['Fisso', '+1, +1, +1… oppure 90°, 90°, 90°…'],
          ['Che cresce', '1, 2, 3, 4, 5 caselle; 45°, 90°, 135°, 180°, 225°. La differenza tra i passi è costante.'],
          ['A turno', '+2, −1, +2, −1…'],
          ['Pari e dispari', 'Le figure 1ª, 3ª, 5ª fanno una serie; le 2ª, 4ª, 6ª un\'altra. La risposta continua la serie delle pari.'],
          ['Ciclo', 'Di due: la 6ª è come la 4ª. Di tre: la 6ª è come la 3ª.'],
          ['Avanti e indietro', 'Arriva al massimo o al bordo e torna indietro.'],
          ['Collegato', 'Un elemento dipende da un altro: i pallini sono tanti quanti gli spicchi.'],
        ] },
        { h: 'Le trappole nelle opzioni', list: [
          'L\'opzione **identica alla quinta figura**: quasi sempre sbagliata.',
          '**L\'esca**: l\'opzione più simile a tutte le altre. Non sceglierla per somiglianza, elimina per regola.',
          'Una regola giusta e una sbagliata: per questo si controlla un elemento alla volta.',
          'Il verso opposto, oppure un passo in ritardo o in anticipo.',
          'Tutto giusto, ma è cambiato un elemento che nella serie resta fisso.',
        ] },
        { h: 'Quando non vedi la regola', steps: [
          'A **30″**: un elemento alla volta → conta → il passo cresce? → dispari e pari → un elemento dipende da un altro?',
          'A **50″**: scarta ciò che puoi, rispondi e vai avanti.',
          'In 10′ non si torna indietro: decidi alla prima lettura.',
        ] },
      ],
    },
  ];

  let current = 'strategia';

  function rowNode(r) {
    const [name, text, ex, mine] = r;
    return el('div', { class: `rip-row${mine ? ' is-mine' : ''}` },
      el('p', { class: 'rip-name' }, name, mine ? el('span', { class: 'rip-mine' }, 'tuo errore') : null),
      el('div', { class: 'rip-body' }, el('p', {}, ...rich(text)), ex ? el('p', { class: 'rip-ex' }, ...rich(ex)) : null));
  }

  function blockNode(b, open) {
    const body = b.steps ? el('ol', { class: 'rip-steps' }, ...b.steps.map((s) => el('li', {}, ...rich(s))))
      : b.rows ? el('div', { class: 'rip-rows' }, ...b.rows.map(rowNode))
      : el('ul', { class: 'rip-list' }, ...b.list.map((s) => el('li', {}, ...rich(s))));
    return el('details', { class: 'rip-block', open }, el('summary', {}, b.h), body);
  }

  function paint() {
    const t = T.find((x) => x.id === current) || T[0];
    for (const b of document.querySelectorAll('#rip-tabs .chip')) {
      if (b.dataset.rip === t.id) b.setAttribute('aria-pressed', 'true'); else b.setAttribute('aria-pressed', 'false');
    }
    $('rip-fmt').textContent = t.fmt;
    // Il primo blocco è aperto: la schermata non è mai vuota e non è mai piena.
    $('rip-body').replaceChildren(...t.blocks.map((b, i) => blockNode(b, i === 0)));
  }

  function open(id) {
    if (id && T.some((x) => x.id === id)) current = id;
    $('rip-tabs').replaceChildren(...T.map((t) => el('button', { type: 'button', class: 'chip', dataset: { rip: t.id }, onclick: () => { current = t.id; paint(); window.scrollTo(0, 0); } }, t.label)));
    paint();
    App.ui.show('ripasso', { title: 'Ripassone' });
  }

  return { open, all: () => T.slice() };
})();
