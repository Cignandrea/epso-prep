// ═══ EU Prep Suite — Cartuccia: DIGITAL SKILLS · Batteria 1 ═══
// Aree DigComp 2.2 n. 1–3: alfabetizzazione su informazioni e dati, comunicazione
// e collaborazione, creazione di contenuti digitali. 24 scenari MCQ a 4 opzioni in
// stile EPSO. Riferimento: DigComp 2.2 (Quadro europeo delle competenze digitali,
// JRC/Commissione europea), su cui si basa il test EPSO di competenze digitali.
// Id 4001–4024, batch 1. Preset esame: 40 domande / 30 minuti (bando EPSO/AD/427/26): ~45 secondi a domanda.

registerBank({
  id: 'digital',
  label: '💻 Digital Skills',
  order: 4,
  exam: { num: 40, totalMin: 30 },
  questions: [
    {
      id: 4001, batch: 1,
      question: "Devi trovare rapidamente documenti ufficiali dell'UE sulla direttiva sui servizi digitali, escludendo articoli di giornale. Quale strategia di ricerca è la più efficace?",
      options: [
        { letter: "A", text: "Digitare una domanda molto lunga e discorsiva nel motore di ricerca" },
        { letter: "B", text: "Usare parole chiave mirate limitando i risultati ai siti istituzionali (ad esempio con l'operatore site: sui domini europa.eu)" },
        { letter: "C", text: "Aprire i primi dieci risultati qualunque essi siano" },
        { letter: "D", text: "Cercare solo sui social network per avere le notizie più recenti" }
      ],
      correct: ["B"],
      explanation: "Parole chiave essenziali più un filtro sulla fonte (operatori come site:, virgolette per le frasi esatte, filtri per data o tipo di file) restituiscono risultati pertinenti e autorevoli. Le domande discorsive diluiscono le parole chiave; aprire risultati a caso o affidarsi ai social non garantisce né pertinenza né affidabilità. Area DigComp 1.1: navigare, ricercare e filtrare dati e informazioni.",
      tag: "informazione", difficulty: 1
    },
    {
      id: 4002, batch: 1,
      question: "Un sito riporta una notizia clamorosa su una nuova normativa europea. Quale comportamento dimostra la migliore competenza di valutazione delle informazioni?",
      options: [
        { letter: "A", text: "Condividerla subito: se è online, è stata verificata" },
        { letter: "B", text: "Considerarla falsa a prescindere, perché le notizie clamorose sono sempre bufale" },
        { letter: "C", text: "Verificarla su fonti indipendenti e autorevoli (sito ufficiale, agenzie, testate affidabili) prima di crederci o condividerla" },
        { letter: "D", text: "Controllare solo il numero di condivisioni: se è alto, è attendibile" }
      ],
      correct: ["C"],
      explanation: "La verifica incrociata su fonti indipendenti e autorevoli è il cuore della valutazione critica: né la presenza online né la viralità sono prove di veridicità, e nemmeno lo scetticismo totale è una strategia (le notizie sorprendenti possono essere vere). Controllare data, autore, fonte primaria e confronto tra testate è il metodo. Area DigComp 1.2: valutare dati, informazioni e contenuti digitali.",
      tag: "informazione", difficulty: 1
    },
    {
      id: 4003, batch: 1,
      question: "Che cos'è una \"bolla di filtraggio\" (filter bubble)?",
      options: [
        { letter: "A", text: "Un antivirus che filtra i contenuti pericolosi" },
        { letter: "B", text: "La condizione in cui gli algoritmi mostrano prevalentemente contenuti in linea con le preferenze passate dell'utente, riducendo l'esposizione a punti di vista diversi" },
        { letter: "C", text: "Una funzione del browser che blocca le finestre pop-up" },
        { letter: "D", text: "Un filtro fotografico dei social network" }
      ],
      correct: ["B"],
      explanation: "Gli algoritmi di raccomandazione personalizzano i contenuti in base al comportamento passato: il rischio è vedere sempre più ciò che conferma le proprie opinioni e sempre meno prospettive alternative. Esserne consapevoli — e diversificare attivamente le fonti — è una competenza informativa chiave, richiamata esplicitamente da DigComp 2.2 sull'influenza degli algoritmi. Area 1.2.",
      tag: "informazione", difficulty: 2
    },
    {
      id: 4004, batch: 1,
      question: "Osservi l'indirizzo https://ec.europa.eu/info/index_it. Che cosa indica la parte \"ec.europa.eu\"?",
      options: [
        { letter: "A", text: "Il protocollo di trasmissione sicura" },
        { letter: "B", text: "Il titolo della pagina visualizzata" },
        { letter: "C", text: "Il nome di dominio del sito, cioè il server della Commissione europea" },
        { letter: "D", text: "La lingua del contenuto" }
      ],
      correct: ["C"],
      explanation: "In un URL, dopo il protocollo (https://) viene il nome di dominio, che identifica il sito: qui \"ec.europa.eu\", il dominio della Commissione europea. Saper leggere un URL — protocollo, dominio, percorso — è essenziale anche per riconoscere i siti contraffatti, che imitano i domini legittimi con piccole variazioni. La lingua è suggerita semmai dal suffisso \"_it\" nel percorso. Area DigComp 1.1.",
      tag: "informazione", difficulty: 1
    },
    {
      id: 4005, batch: 1,
      question: "Qual è la differenza tra un browser e un motore di ricerca?",
      options: [
        { letter: "A", text: "Il browser è il programma per navigare sul web; il motore di ricerca è un servizio che trova pagine e contenuti in base a parole chiave" },
        { letter: "B", text: "Sono la stessa cosa con due nomi diversi" },
        { letter: "C", text: "Il motore di ricerca serve solo per le immagini, il browser per i testi" },
        { letter: "D", text: "Il browser funziona senza internet, il motore di ricerca no" }
      ],
      correct: ["A"],
      explanation: "Il browser (es. Firefox, Chrome, Edge) è l'applicazione con cui si visualizzano le pagine web; il motore di ricerca (es. Google, Bing) è un servizio web, usato attraverso il browser, che indicizza la rete e trova contenuti in base alle query. Confonderli è un errore concettuale frequente che il test intercetta volentieri. Area DigComp 1.1.",
      tag: "informazione", difficulty: 1
    },
    {
      id: 4006, batch: 1,
      question: "Devi conservare in modo ordinato e ritrovabile molti report scaricati per un progetto. Quale pratica è la più efficace?",
      options: [
        { letter: "A", text: "Lasciare tutto nella cartella Download del computer" },
        { letter: "B", text: "Salvare ogni file sul desktop per averlo a portata di mano" },
        { letter: "C", text: "Tenere i file solo come allegati nelle email ricevute" },
        { letter: "D", text: "Organizzare i file in cartelle con criteri coerenti e nomi descrittivi (es. data e argomento), eventualmente in uno spazio cloud condiviso" }
      ],
      correct: ["D"],
      explanation: "Una struttura di cartelle coerente e nomi file descrittivi (per esempio \"2026-08_report-vendite_v2\") rendono i contenuti ritrovabili anche a distanza di tempo e da parte di colleghi; il cloud aggiunge accessibilità e condivisione. Download, desktop e caselle email diventano rapidamente archivi caotici e fragili. Area DigComp 1.3: gestire dati, informazioni e contenuti.",
      tag: "informazione", difficulty: 1
    },
    {
      id: 4007, batch: 1,
      question: "Devi inviare una comunicazione a cinquanta destinatari esterni che non si conoscono tra loro. Come gestisci gli indirizzi email nel rispetto della riservatezza?",
      options: [
        { letter: "A", text: "Tutti nel campo A (To), così ognuno sa chi ha ricevuto il messaggio" },
        { letter: "B", text: "Tutti nel campo CCN (BCC), così gli indirizzi non sono visibili agli altri destinatari" },
        { letter: "C", text: "Tutti nel campo CC, che è pensato per i grandi gruppi" },
        { letter: "D", text: "Metà in A e metà in CC, per bilanciare" }
      ],
      correct: ["B"],
      explanation: "Il campo CCN/BCC (copia carbone nascosta) invia il messaggio senza rivelare gli indirizzi degli altri destinatari: con contatti esterni che non si conoscono è la scelta corretta anche sotto il profilo della protezione dei dati personali (un indirizzo email è un dato personale). A e CC espongono l'intera lista a tutti. Aree DigComp 2.1 (interagire) e 4.2 (protezione dei dati).",
      tag: "comunicazione", difficulty: 1
    },
    {
      id: 4008, batch: 1,
      question: "Quale comportamento rispetta la \"netiquette\" in una discussione di lavoro online?",
      options: [
        { letter: "A", text: "Scrivere in maiuscolo per dare più forza alle proprie idee" },
        { letter: "B", text: "Rispondere a tutti i thread con \"Rispondi a tutti\", sempre" },
        { letter: "C", text: "Mantenere un tono rispettoso, restare sul tema e rispondere solo alle persone realmente interessate" },
        { letter: "D", text: "Inoltrare la discussione a colleghi esterni senza avvisare i partecipanti" }
      ],
      correct: ["C"],
      explanation: "La netiquette richiede tono rispettoso, pertinenza e uso corretto degli strumenti: il maiuscolo equivale a urlare, il \"Rispondi a tutti\" indiscriminato genera rumore, e inoltrare conversazioni all'esterno senza consenso viola riservatezza e fiducia. Comunicare in modo adeguato al contesto e al pubblico è una competenza esplicita del quadro. Area DigComp 2.5: netiquette.",
      tag: "comunicazione", difficulty: 1
    },
    {
      id: 4009, batch: 1,
      question: "Il tuo team deve lavorare sullo stesso documento di testo, con modifiche di più persone e una sola versione finale. Qual è l'approccio più efficiente?",
      options: [
        { letter: "A", text: "Un documento condiviso nel cloud, modificato in co-editing con cronologia delle versioni e commenti" },
        { letter: "B", text: "Inviarsi il file via email a turno, rinominandolo \"finale\", \"finale2\", \"finale-vero\"" },
        { letter: "C", text: "Stampare il documento e raccogliere le correzioni a penna" },
        { letter: "D", text: "Ognuno scrive il proprio file e alla fine si sceglie il migliore" }
      ],
      correct: ["A"],
      explanation: "Il co-editing su un documento cloud condiviso (Google Docs, Word online, ecc.) elimina i conflitti di versione: tutti lavorano sull'unica copia, la cronologia consente di ripristinare versioni precedenti e i commenti tracciano le decisioni. Il giro di allegati via email è l'anti-pattern classico che genera duplicati e perdite di modifiche. Area DigComp 2.4: collaborare attraverso le tecnologie digitali.",
      tag: "collaborazione", difficulty: 1
    },
    {
      id: 4010, batch: 1,
      question: "Durante una videoconferenza di lavoro con molti partecipanti, quale comportamento è più appropriato?",
      options: [
        { letter: "A", text: "Tenere sempre il microfono aperto per essere pronti a intervenire" },
        { letter: "B", text: "Silenziare il microfono quando non si parla e usare la funzione \"alza la mano\" o la chat per chiedere la parola" },
        { letter: "C", text: "Svolgere altre attività e riattivarsi solo se chiamati per nome" },
        { letter: "D", text: "Interrompere subito chi parla, altrimenti l'occasione passa" }
      ],
      correct: ["B"],
      explanation: "Microfono spento quando non si parla (per eliminare rumori di fondo) e uso ordinato degli strumenti della piattaforma (alza la mano, chat) rendono la riunione efficace per tutti. È l'applicazione della netiquette agli strumenti sincroni, sempre più presente nei test pratici. Aree DigComp 2.1 e 2.5.",
      tag: "collaborazione", difficulty: 1
    },
    {
      id: 4011, batch: 1,
      question: "Che cos'è l'identità digitale pubblica (ad esempio SPID/CIE in Italia o l'eID europea)?",
      options: [
        { letter: "A", text: "Il profilo social ufficiale di un cittadino" },
        { letter: "B", text: "L'indirizzo email certificato" },
        { letter: "C", text: "Un sistema di credenziali verificate che consente di autenticarsi in modo sicuro presso i servizi online, in particolare della pubblica amministrazione" },
        { letter: "D", text: "Il nickname scelto per i forum" }
      ],
      correct: ["C"],
      explanation: "L'identità digitale è un sistema di autenticazione con identità verificata che dà accesso sicuro ai servizi online, tipicamente pubblici (fisco, sanità, anagrafe); il regolamento eIDAS e il portafoglio europeo di identità digitale puntano al riconoscimento transfrontaliero nell'UE. Non va confusa con profili social, PEC o pseudonimi. Aree DigComp 2.3 (cittadinanza attraverso le tecnologie) e 2.6 (gestione dell'identità digitale).",
      tag: "cittadinanza-digitale", difficulty: 2
    },
    {
      id: 4012, batch: 1,
      question: "Pubblichi sul sito del tuo ente una foto trovata online senza indicazioni sulla licenza. Quale affermazione è corretta?",
      options: [
        { letter: "A", text: "Se è online, è automaticamente libera da diritti" },
        { letter: "B", text: "Basta citare il sito di provenienza per poterla usare in ogni caso" },
        { letter: "C", text: "Se non c'è il simbolo ©, l'opera non è protetta" },
        { letter: "D", text: "In assenza di una licenza che ne consenta il riuso, l'opera va considerata protetta da diritto d'autore e serve l'autorizzazione" }
      ],
      correct: ["D"],
      explanation: "Il diritto d'autore protegge le opere dalla creazione, senza bisogno del simbolo © né di registrazione: la disponibilità online non equivale a libertà di riuso e la citazione non sostituisce l'autorizzazione. La pratica corretta è usare opere con licenza esplicita di riuso (es. Creative Commons) o chiedere il permesso. Area DigComp 3.3: copyright e licenze.",
      tag: "contenuti", difficulty: 2
    },
    {
      id: 4013, batch: 1,
      question: "Che cosa indica una licenza Creative Commons \"CC BY\"?",
      options: [
        { letter: "A", text: "L'opera può essere riutilizzata, anche con modifiche, a condizione di attribuire la paternità all'autore" },
        { letter: "B", text: "L'opera non può essere usata in alcun modo" },
        { letter: "C", text: "L'opera è di pubblico dominio senza alcuna condizione" },
        { letter: "D", text: "L'opera può essere usata solo pagando una royalty" }
      ],
      correct: ["A"],
      explanation: "CC BY è la licenza Creative Commons più permissiva tra quelle con condizioni: consente riuso, distribuzione e modifica anche a fini commerciali, purché si attribuisca il credito all'autore. Il pubblico dominio senza condizioni corrisponde invece a CC0; altre clausole (NC, ND, SA) aggiungono restrizioni su usi commerciali, opere derivate o condivisione. Area DigComp 3.3.",
      tag: "contenuti", difficulty: 2
    },
    {
      id: 4014, batch: 1,
      question: "Devi inviare la versione definitiva di una relazione, da leggere e stampare con impaginazione identica ovunque, senza che sia facilmente modificabile. Quale formato scegli?",
      options: [
        { letter: "A", text: "PDF" },
        { letter: "B", text: "DOCX" },
        { letter: "C", text: "TXT" },
        { letter: "D", text: "HTML" }
      ],
      correct: ["A"],
      explanation: "Il PDF preserva l'impaginazione su qualsiasi dispositivo ed è lo standard per i documenti finali da distribuire; il DOCX è il formato di lavoro modificabile, il TXT perde ogni formattazione, l'HTML è pensato per il web e si adatta al contenitore. Scegliere il formato in base allo scopo è una competenza di base della creazione di contenuti. Area DigComp 3.1: sviluppare contenuti digitali.",
      tag: "contenuti", difficulty: 1
    },
    {
      id: 4015, batch: 1,
      question: "In un foglio di calcolo, la cella C2 contiene la formula =A2*B2. La copi nella cella C3. Che cosa conterrà C3?",
      options: [
        { letter: "A", text: "=A2*B2, identica all'originale" },
        { letter: "B", text: "=A3*B3, perché i riferimenti relativi si adattano alla nuova riga" },
        { letter: "C", text: "Un messaggio di errore" },
        { letter: "D", text: "Il valore numerico calcolato in C2, senza formula" }
      ],
      correct: ["B"],
      explanation: "I riferimenti relativi (A2, B2) si aggiornano automaticamente quando la formula viene copiata: spostandosi di una riga diventano A3 e B3. Per bloccare un riferimento si usa il simbolo del dollaro (riferimento assoluto, es. $A$2). È il meccanismo fondamentale dei fogli di calcolo, onnipresente nei test pratici. Area DigComp 3.1.",
      tag: "contenuti", difficulty: 2
    },
    {
      id: 4016, batch: 1,
      question: "Sempre nel foglio di calcolo: vuoi moltiplicare tutta la colonna B per il valore fisso contenuto in E1, copiando la formula verso il basso. Come scrivi la formula nella prima cella?",
      options: [
        { letter: "A", text: "=B2*E1" },
        { letter: "B", text: "=B$2*E1" },
        { letter: "C", text: "=B2*$E$1" },
        { letter: "D", text: "=$B$2*$E$1" }
      ],
      correct: ["C"],
      explanation: "Serve che B2 scorra (riferimento relativo) e che E1 resti fisso (riferimento assoluto, $E$1): copiando verso il basso si ottiene B3*$E$1, B4*$E$1 e così via. Con l'opzione A anche E1 scorrerebbe (E2, E3…), producendo risultati errati; con la D nemmeno B scorrerebbe. Il dollaro \"blocca\" riga e colonna davanti a cui compare. Area DigComp 3.1.",
      tag: "contenuti", difficulty: 3
    },
    {
      id: 4017, batch: 1,
      question: "Che cos'è, in termini generali, un algoritmo?",
      options: [
        { letter: "A", text: "Un linguaggio di programmazione" },
        { letter: "B", text: "Una sequenza finita e ordinata di istruzioni per risolvere un problema o svolgere un compito" },
        { letter: "C", text: "Un tipo di computer molto potente" },
        { letter: "D", text: "Un errore del software" }
      ],
      correct: ["B"],
      explanation: "Un algoritmo è una sequenza finita e non ambigua di passi che porta dal problema alla soluzione: una ricetta, prima ancora del codice che la implementa. I linguaggi di programmazione servono a esprimere gli algoritmi in forma eseguibile. Il concetto è la base dell'area \"programmazione\" del quadro europeo. Area DigComp 3.4.",
      tag: "contenuti", difficulty: 1
    },
    {
      id: 4018, batch: 1,
      question: "Un collega ti invia un file \"relazione.zip\". Che cos'è un file ZIP?",
      options: [
        { letter: "A", text: "Un archivio compresso che può contenere uno o più file e cartelle, riducendone l'ingombro" },
        { letter: "B", text: "Un formato video ad alta definizione" },
        { letter: "C", text: "Un file danneggiato e irrecuperabile" },
        { letter: "D", text: "Un documento di testo con formattazione avanzata" }
      ],
      correct: ["A"],
      explanation: "Lo ZIP è un formato di archiviazione e compressione: raggruppa file e cartelle in un unico contenitore più leggero, comodo da trasmettere; per usare i contenuti va \"estratto\". Attenzione parallela alla sicurezza: gli archivi sono anche un veicolo comune di malware negli allegati sospetti. Aree DigComp 1.3 e 3.1.",
      tag: "contenuti", difficulty: 1
    },
    {
      id: 4019, batch: 1,
      question: "Vuoi ritrovare rapidamente una parola specifica all'interno di una lunga pagina web o di un documento. Quale scorciatoia da tastiera usi (Windows)?",
      options: [
        { letter: "A", text: "Ctrl+S" },
        { letter: "B", text: "Ctrl+P" },
        { letter: "C", text: "Ctrl+Z" },
        { letter: "D", text: "Ctrl+F" }
      ],
      correct: ["D"],
      explanation: "Ctrl+F apre la ricerca nel documento o nella pagina (F come \"find\"): digitando il termine si salta direttamente alle occorrenze. Le altre: Ctrl+S salva, Ctrl+P stampa, Ctrl+Z annulla l'ultima azione (e Ctrl+C/Ctrl+V copiano e incollano). Le scorciatoie fondamentali compaiono regolarmente nelle domande operative. Area DigComp 5.1/uso efficiente degli strumenti.",
      tag: "problem-solving", difficulty: 1
    },
    {
      id: 4020, batch: 1,
      question: "Che cosa significa che un servizio è \"in cloud\"?",
      options: [
        { letter: "A", text: "Che funziona solo senza connessione a internet" },
        { letter: "B", text: "Che dati e applicazioni risiedono su server remoti accessibili via internet, invece che solo sul dispositivo locale" },
        { letter: "C", text: "Che è gratuito per definizione" },
        { letter: "D", text: "Che è installato sul disco fisso del computer" }
      ],
      correct: ["B"],
      explanation: "Il cloud computing sposta archiviazione ed elaborazione su server remoti raggiungibili via internet: i dati sono accessibili da più dispositivi, sincronizzati e generalmente protetti da backup del fornitore — con la contropartita della dipendenza dalla connessione e delle valutazioni su privacy e localizzazione dei dati. Aree DigComp 1.3 e 2.4.",
      tag: "collaborazione", difficulty: 1
    },
    {
      id: 4021, batch: 1,
      question: "Devi citare in una relazione un dato statistico trovato in un rapporto online. Qual è la pratica corretta?",
      options: [
        { letter: "A", text: "Copiare il paragrafo senza indicare la fonte: i dati sono di tutti" },
        { letter: "B", text: "Riportare il dato indicando con precisione la fonte (autore/ente, titolo, anno, link), distinguendo le parole altrui dalle proprie" },
        { letter: "C", text: "Cambiare qualche parola del testo originale così la citazione non serve" },
        { letter: "D", text: "Citare genericamente \"internet\" come fonte" }
      ],
      correct: ["B"],
      explanation: "L'integrità informativa richiede l'attribuzione precisa delle fonti: chi ha prodotto il dato, dove e quando, con riferimento verificabile. Parafrasare senza citare resta plagio; \"internet\" non è una fonte. La tracciabilità delle fonti è tanto una questione etica quanto di qualità del lavoro. Aree DigComp 1.2, 3.2 (integrare e rielaborare) e 3.3.",
      tag: "contenuti", difficulty: 1
    },
    {
      id: 4022, batch: 1,
      question: "Che cos'è l'accessibilità digitale di un sito o documento?",
      options: [
        { letter: "A", text: "La velocità con cui la pagina si carica" },
        { letter: "B", text: "La possibilità di accedervi gratuitamente" },
        { letter: "C", text: "La progettazione di contenuti utilizzabili anche da persone con disabilità (es. testi alternativi per le immagini, contrasto adeguato, navigazione da tastiera)" },
        { letter: "D", text: "La compatibilità con i soli dispositivi mobili" }
      ],
      correct: ["C"],
      explanation: "L'accessibilità rende i contenuti digitali fruibili da tutti, incluse le persone con disabilità: testi alternativi per le immagini (letti dagli screen reader), contrasti sufficienti, sottotitoli, struttura navigabile da tastiera. Nell'UE è anche un obbligo normativo per i siti pubblici (direttiva sull'accessibilità del web) e per molti prodotti e servizi (atto europeo sull'accessibilità). DigComp la richiama nella creazione di contenuti e nell'inclusione.",
      tag: "contenuti", difficulty: 2
    },
    {
      id: 4023, batch: 1,
      question: "Che cos'è un'infografica e quando è preferibile a una tabella di numeri?",
      options: [
        { letter: "A", text: "Una rappresentazione visuale di dati e concetti; è preferibile quando serve comunicare a colpo d'occhio tendenze e confronti a un pubblico ampio" },
        { letter: "B", text: "Un documento di solo testo; è preferibile per analisi statistiche dettagliate" },
        { letter: "C", text: "Un formato di stampa fotografica; è preferibile per archiviare dati grezzi" },
        { letter: "D", text: "Un database; è preferibile quando i dati cambiano ogni secondo" }
      ],
      correct: ["A"],
      explanation: "L'infografica traduce dati e concetti in forma visuale (grafici, icone, flussi): è lo strumento giusto quando l'obiettivo è far cogliere rapidamente tendenze, proporzioni e messaggi chiave a un pubblico non specialistico. La tabella resta preferibile quando servono i valori esatti per analisi puntuali. Scegliere la rappresentazione in base a scopo e pubblico è competenza di comunicazione dei dati. Aree DigComp 3.1 e 1.3.",
      tag: "contenuti", difficulty: 1
    },
    {
      id: 4024, batch: 1,
      question: "Su una piattaforma di messaggistica di lavoro, un collega condivide per errore in un canale pubblico un documento con dati personali di utenti. Qual è la reazione corretta?",
      options: [
        { letter: "A", text: "Scaricarlo subito, potrebbe tornare utile" },
        { letter: "B", text: "Ignorare: non è un tuo problema" },
        { letter: "C", text: "Inoltrarlo ad altri colleghi per avvisarli del contenuto" },
        { letter: "D", text: "Segnalarlo immediatamente al collega (e ai referenti competenti) perché venga rimosso, senza scaricarlo né diffonderlo" }
      ],
      correct: ["D"],
      explanation: "Un'esposizione accidentale di dati personali va contenuta, non amplificata: la condotta corretta è avvisare subito chi può rimuovere il contenuto e i referenti interni (per esempio il responsabile della protezione dei dati), astenendosi dal copiare o inoltrare. Scaricare o diffondere aggraverebbe la violazione. Aree DigComp 2.5/2.6 e 4.2 (protezione dei dati personali).",
      tag: "comunicazione", difficulty: 2
    }
  ]
});
