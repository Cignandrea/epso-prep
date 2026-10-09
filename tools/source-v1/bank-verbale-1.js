// ═══ EU Prep Suite — Cartuccia: RAGIONAMENTO VERBALE · Batteria 1 ═══
// 24 quesiti in stile EPSO (Vero / Falso / Non si può dire).
// Regola d'oro incorporata in ogni quesito: la risposta è dimostrabile SOLO dal brano.
// I contenuti dei brani sono costruiti ad hoc (scenari plausibili, non fatti reali):
// l'unico "mondo" che conta è il testo. Risposte bilanciate: 8 Vero · 8 Falso · 8 NSP.
// Id 1001–1024. Per aggiungere la Batteria 2: nuovo file data/bank-verbale-2.js
// con batch: 2 e id 1025+ — nessun'altra modifica necessaria.

registerBank({
  id: 'verbale',
  label: '🧠 Ragionamento Verbale',
  order: 1,
  exam: { num: 20, totalMin: 35 },
  questions: [
    {
      id: 1001,
      batch: 1,
      passage: "Nell'ambito di un programma regionale di teleriscaldamento, quarantadue comuni hanno sottoscritto un protocollo per la riduzione dei consumi energetici degli edifici pubblici. Al termine del primo anno di monitoraggio, la maggior parte dei comuni aderenti ha registrato una riduzione dei consumi compresa tra il 6% e il 14%. Tre comuni, tuttavia, hanno riportato un aumento dei consumi, attribuito dagli uffici tecnici all'ampliamento degli orari di apertura delle strutture sportive. L'ente regionale ha annunciato che i risultati del secondo anno saranno pubblicati insieme a una revisione dei criteri di monitoraggio.",
      question: "Tutti i comuni aderenti al protocollo hanno ridotto i consumi energetici nel primo anno.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il brano afferma esplicitamente che tre comuni hanno riportato un aumento dei consumi: questo contraddice direttamente il quantificatore \"tutti\". Trappola classica: il testo dice \"la maggior parte\", l'affermazione lo trasforma in \"tutti\". Quando compare un quantificatore universale, cerca nel brano anche una sola eccezione esplicita: se c'è, la risposta è Falso.",
      tag: "quantificatore",
      difficulty: 1
    },
    {
      id: 1002,
      batch: 1,
      passage: "Un'indagine condotta da un istituto di ricerca sul lavoro da remoto ha coinvolto milleduecento dipendenti di aziende del settore assicurativo. Il 62% degli intervistati dichiara di sentirsi più produttivo lavorando da casa, mentre il 21% riferisce difficoltà di concentrazione legate agli spazi domestici. Gli autori dell'indagine sottolineano che i questionari sono stati somministrati su base volontaria e che i risultati completi, suddivisi per fascia d'età, saranno diffusi nei prossimi mesi.",
      question: "La maggioranza dei dipendenti del settore assicurativo è più produttiva quando lavora da casa.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Due salti indebiti: primo, il 62% riguarda i milleduecento intervistati (per di più volontari), non tutti i dipendenti del settore; secondo, gli intervistati \"dichiarano di sentirsi\" più produttivi, il che non equivale a esserlo. Il brano non consente né di confermare né di smentire l'affermazione generalizzata. Trappola: estendere un dato campionario e soggettivo a un'intera popolazione come fatto oggettivo.",
      tag: "quantificatore",
      difficulty: 3
    },
    {
      id: 1003,
      batch: 1,
      passage: "Una nuova normativa sugli imballaggi stabilisce che, a partire dal 2027, i produttori dovranno includere almeno il 30% di materiale riciclato negli imballaggi in plastica immessi sul mercato. Il testo prevede controlli documentali annuali e sanzioni proporzionate al fatturato in caso di inadempienza. Sono esclusi dall'obbligo gli imballaggi che entrano in contatto diretto con i farmaci, per i quali restano in vigore le regole precedenti. Le associazioni di categoria hanno chiesto un periodo transitorio più lungo per le piccole imprese.",
      question: "La soglia minima di contenuto riciclato non si applicherà agli imballaggi a contatto diretto con i farmaci.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Il brano dice che gli imballaggi a contatto diretto con i farmaci sono \"esclusi dall'obbligo\": l'affermazione è una parafrasi fedele di questa esclusione. Nota il meccanismo: non tutte le riformulazioni sono trappole — saper riconoscere una parafrasi corretta è importante quanto smascherare quelle ingannevoli, altrimenti si finisce per rispondere sempre \"Non si può dire\" per eccesso di prudenza.",
      tag: "parafrasi",
      difficulty: 1
    },
    {
      id: 1004,
      batch: 1,
      passage: "La diga di Kervalen, completata due anni fa sul fiume Doria, alimenta una centrale idroelettrica con una capacità installata di 340 megawatt. Secondo il gestore, nell'ultimo anno l'impianto ha coperto circa il 9% del fabbisogno elettrico nazionale, con punte del 15% nei mesi primaverili grazie allo scioglimento delle nevi. Il piano industriale prevede l'installazione di due turbine aggiuntive entro cinque anni, subordinata all'esito della valutazione di impatto ambientale attualmente in corso.",
      question: "L'energia idroelettrica è la fonte rinnovabile più diffusa nel paese.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Il brano parla di un singolo impianto e della sua quota sul fabbisogno nazionale, ma non confronta l'idroelettrico con le altre fonti rinnovabili del paese. L'affermazione può sembrare plausibile, ma la plausibilità non è una prova: se l'informazione non è nel testo, la risposta è \"Non si può dire\". Trappola: farsi completare il quadro dalla conoscenza (o dall'intuizione) esterna al brano.",
      tag: "fuori-testo",
      difficulty: 2
    },
    {
      id: 1005,
      batch: 1,
      passage: "Al termine di una seduta durata oltre quattro ore, il consiglio comunale ha discusso l'ipotesi di introdurre un pedaggio urbano per i veicoli privati nelle ore di punta. Il consiglio non ha escluso l'introduzione della misura, ma ha rinviato ogni decisione a dopo la conclusione della consultazione pubblica, prevista per l'autunno. Nel frattempo, gli uffici della mobilità sono stati incaricati di predisporre tre scenari tariffari alternativi da sottoporre ai cittadini.",
      question: "Il consiglio comunale ha escluso l'introduzione del pedaggio urbano.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il brano afferma il contrario esatto: il consiglio \"non ha escluso\" la misura, limitandosi a rinviare la decisione. L'affermazione elimina la negazione e capovolge il significato. Trappola: sotto pressione di tempo, l'occhio cattura \"escluso l'introduzione\" e salta il \"non\" che lo precede. Con le negazioni, rileggi sempre la frase completa del brano prima di rispondere.",
      tag: "negazione",
      difficulty: 1
    },
    {
      id: 1006,
      batch: 1,
      passage: "Il programma sperimentale di consegna dei farmaci a domicilio per i pazienti cronici è stato avviato in quattro province. La fase pilota si è conclusa a marzo, con oltre diciottomila consegne effettuate. Il rapporto di valutazione indipendente è stato pubblicato ad aprile e ha evidenziato un tasso di soddisfazione dell'89% tra gli utenti. L'estensione del servizio all'intero territorio nazionale è iniziata a giugno dello stesso anno, accompagnata da una campagna informativa nelle farmacie.",
      question: "Il rapporto di valutazione è stato pubblicato dopo l'avvio dell'estensione nazionale del servizio.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. La sequenza nel brano è: conclusione della fase pilota (marzo) → pubblicazione del rapporto (aprile) → avvio dell'estensione nazionale (giugno). Il rapporto è quindi arrivato prima, non dopo, l'estensione. Trappola: l'affermazione inverte l'ordine di due eventi entrambi presenti nel testo. Con date e sequenze, ricostruisci mentalmente la linea del tempo prima di rispondere.",
      tag: "tempo",
      difficulty: 2
    },
    {
      id: 1007,
      batch: 1,
      passage: "Nel corso dell'ultimo esercizio, l'azienda ha aumentato del 40% il budget destinato alla formazione interna, introducendo percorsi personalizzati per i neoassunti e un catalogo di corsi tecnici accessibile a tutto il personale. Nello stesso periodo, il tasso di turnover volontario è sceso dal 14% al 9%, il valore più basso registrato negli ultimi sette anni. La direzione del personale ha definito i risultati \"incoraggianti\" e ha confermato il rinnovo del programma per il prossimo triennio.",
      question: "L'aumento del budget per la formazione è stato la causa del calo del turnover volontario.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Il brano registra due fatti avvenuti \"nello stesso periodo\" ma non stabilisce alcun nesso causale tra loro: il calo del turnover potrebbe dipendere da altri fattori non menzionati. Trappola: trasformare una correlazione temporale in una relazione di causa-effetto. Perché la risposta fosse \"Vero\", il testo dovrebbe affermare esplicitamente il legame causale (\"grazie a\", \"per effetto di\").",
      tag: "inferenza",
      difficulty: 2
    },
    {
      id: 1008,
      batch: 1,
      passage: "Con un'ordinanza entrata in vigore questa settimana, l'amministrazione ha introdotto nuove regole sulla vendita di bevande energetiche. Il divieto riguarda esclusivamente la vendita ai minori di sedici anni, sia nei negozi sia nei distributori automatici, e prevede sanzioni per gli esercenti fino a cinquemila euro. La vendita ai maggiori di sedici anni resta consentita senza limitazioni. Le associazioni dei consumatori hanno accolto favorevolmente la misura, chiedendo però controlli più frequenti.",
      question: "L'ordinanza vieta la vendita di bevande energetiche a tutti i minorenni.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il brano delimita il divieto \"esclusivamente\" ai minori di sedici anni e precisa che la vendita ai maggiori di sedici è consentita: i sedicenni e i diciassettenni, pur minorenni, non rientrano nel divieto. L'affermazione allarga l'ambito della norma oltre i suoi confini dichiarati. Trappola: confondere una categoria specifica (under 16) con una più ampia che la contiene (tutti i minorenni), ignorando l'\"esclusivamente\".",
      tag: "scope",
      difficulty: 2
    },
    {
      id: 1009,
      batch: 1,
      passage: "Uno studio triennale ha analizzato la presenza di microplastiche in ventisei laghi alpini, prelevando campioni a diverse quote. Nei campioni raccolti nei laghi situati sotto i duemila metri di altitudine, la concentrazione media di microplastiche superava la soglia di riferimento adottata dallo studio. I ricercatori hanno collegato i valori più elevati alla vicinanza di aree turistiche e infrastrutture stradali. I risultati completi, comprensivi delle analisi sui sedimenti, saranno presentati a un convegno internazionale.",
      question: "Lo studio ha rilevato concentrazioni superiori alla soglia di riferimento in tutti i ventisei laghi analizzati.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Il superamento della soglia è riferito ai campioni dei laghi sotto i duemila metri: sui laghi a quota superiore il brano tace, senza dire né che superano né che rispettano la soglia. L'affermazione (\"tutti i ventisei\") va oltre l'ambito coperto dal testo, ma non è nemmeno contraddetta. Trappola: un dato vero per un sottoinsieme viene esteso all'insieme completo; il testo non basta né per confermare né per smentire.",
      tag: "scope",
      difficulty: 3
    },
    {
      id: 1010,
      batch: 1,
      passage: "Il bando per la riqualificazione degli spazi verdi scolastici si è chiuso con centoquaranta domande presentate. La commissione tecnica ha verificato preliminarmente il rispetto dei termini di presentazione: nessuna delle domande arrivate fuori termine è stata ammessa alla fase di valutazione. Le domande ammesse saranno esaminate da un panel di esperti secondo i criteri pubblicati nell'avviso, con priorità ai progetti che prevedono il coinvolgimento diretto degli studenti nella manutenzione.",
      question: "Le domande ammesse alla fase di valutazione sono state presentate entro il termine.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Se nessuna domanda fuori termine è stata ammessa, allora ogni domanda ammessa è necessariamente arrivata entro il termine: è la lettura \"al contrario\" (contronominale) della stessa regola, perfettamente equivalente sul piano logico. Questo quesito allena il passaggio da \"nessun A è B\" a \"tutti i B sono non-A\": un'inferenza valida che sotto pressione può sembrare un salto, ma non lo è.",
      tag: "quantificatore",
      difficulty: 2
    },
    {
      id: 1011,
      batch: 1,
      passage: "Il regolamento del fondo per la mobilità sostenibile stabilisce i requisiti di accesso al contributo per l'acquisto di biciclette a pedalata assistita. Per accedere al contributo è necessario aver completato il corso base di sicurezza stradale organizzato dai comuni aderenti e risiedere in uno dei comuni stessi. Le domande vengono esaminate in ordine di arrivo fino a esaurimento delle risorse. Marta, dipendente di un'azienda del capoluogo, ha ricevuto il contributo nella prima finestra utile.",
      question: "Marta ha completato il corso base di sicurezza stradale.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Il corso base è indicato come condizione necessaria per accedere al contributo (\"per accedere è necessario aver completato\"): poiché Marta ha ricevuto il contributo, deve aver soddisfatto la condizione. È un'inferenza valida, non un salto: quando il testo pone un requisito obbligatorio e attesta il risultato, il requisito è dimostrato. Confronta con il caso opposto — dedurre il percorso dal risultato quando il requisito NON è dichiarato necessario — che invece non è concludente.",
      tag: "inferenza",
      difficulty: 2
    },
    {
      id: 1012,
      batch: 1,
      passage: "L'accademia di formazione professionale rilascia la certificazione di operatore ambientale a chi completa il corso avanzato di novanta ore, comprensivo di tirocinio pratico presso gli impianti convenzionati. La certificazione è richiesta da diverse aziende del settore come titolo preferenziale nelle assunzioni. Nell'ultima sessione, l'accademia ha registrato il numero più alto di iscrizioni dalla sua fondazione. Luca ha ottenuto la certificazione di operatore ambientale lo scorso autunno.",
      question: "Luca ha completato il corso avanzato di novanta ore presso l'accademia.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Il brano afferma che completare il corso porta alla certificazione, ma non che sia l'unico modo per ottenerla: potrebbero esistere altri canali (equipollenze, altri enti) di cui il testo semplicemente non parla. Dedurre il percorso dal risultato è l'errore logico dell'\"affermazione del conseguente\". Confronta con il quesito su Marta: lì il requisito era dichiarato \"necessario\", qui no — è questa parola a fare tutta la differenza.",
      tag: "inferenza",
      difficulty: 3
    },
    {
      id: 1013,
      batch: 1,
      passage: "In risposta alle preoccupazioni sollevate da alcune associazioni, l'agenzia per i servizi digitali ha pubblicato una nota sul trattamento dei dati raccolti attraverso la nuova piattaforma di prenotazione. L'agenzia ha chiarito che i dati degli utenti non saranno condivisi con soggetti privati senza il consenso esplicito degli interessati e che ogni richiesta di accesso verrà tracciata in un registro consultabile. La nota annuncia inoltre un audit indipendente sulla sicurezza dell'infrastruttura entro fine anno.",
      question: "In assenza del consenso esplicito degli interessati, l'agenzia non condividerà i dati degli utenti con soggetti privati.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. \"I dati non saranno condivisi con soggetti privati senza consenso esplicito\" e \"senza consenso esplicito, i dati non saranno condivisi con soggetti privati\" sono la stessa regola espressa in due ordini diversi. Le doppie negazioni e le riformulazioni con \"senza\" e \"in assenza di\" vanno smontate con calma: qui la trasformazione preserva esattamente il significato, quindi l'affermazione è dimostrata dal testo.",
      tag: "negazione",
      difficulty: 2
    },
    {
      id: 1014,
      batch: 1,
      passage: "Il museo civico di arti decorative ha riaperto al pubblico dopo un intervento di restauro durato tre anni. I lavori, completati con quattro mesi di anticipo rispetto al cronoprogramma approvato, hanno interessato le coperture, gli impianti e l'allestimento delle sale del piano nobile. La direzione ha annunciato un programma di aperture serali estive e una mostra dedicata ai depositi mai esposti. Nel primo fine settimana di riapertura sono stati registrati oltre seimila visitatori.",
      question: "I lavori di restauro sono durati più del previsto.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il brano dice che i lavori sono stati completati \"con quattro mesi di anticipo rispetto al cronoprogramma approvato\": sono quindi durati meno del previsto, non di più. L'affermazione contraddice un'informazione presente nel testo. Trappola: la durata assoluta (\"tre anni\") cattura l'attenzione e può sembrare \"lunga\", ma il confronto richiesto è con il previsto, e su quello il testo è esplicito.",
      tag: "tempo",
      difficulty: 2
    },
    {
      id: 1015,
      batch: 1,
      passage: "La sonda Meridia, sviluppata da un consorzio di agenzie spaziali, è stata lanciata con successo dalla base equatoriale di Kourou. La missione ha l'obiettivo di mappare la composizione minerale di tre asteroidi della fascia principale utilizzando uno spettrometro di nuova concezione e una fotocamera ad alta risoluzione. Il viaggio verso il primo obiettivo durerà circa quattro anni. Il centro di controllo ha confermato il corretto dispiegamento dei pannelli solari sei ore dopo il lancio.",
      question: "Meridia è la prima missione al mondo dedicata alla mappatura mineralogica degli asteroidi.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. Il brano descrive obiettivi e strumenti della missione ma non fa alcun confronto con missioni precedenti: il primato mondiale non è né affermato né escluso. Trappola: le affermazioni con \"il primo\", \"l'unico\", \"il più grande\" invitano a completare il testo con conoscenze o supposizioni esterne. Se il primato non è scritto nel brano, per il test non esiste.",
      tag: "fuori-testo",
      difficulty: 1
    },
    {
      id: 1016,
      batch: 1,
      passage: "Il nuovo regolamento sui servizi turistici, approvato al termine di un lungo negoziato, interviene sulle tutele per i viaggiatori in caso di cancellazione dei pacchetti. Tra le novità principali, il regolamento riduce da novanta a sessanta giorni il termine massimo entro cui gli operatori devono completare il rimborso, introduce un modulo standard per le richieste e affida la vigilanza alle autorità nazionali per il consumo. Le nuove regole si applicheranno ai contratti conclusi a partire dal prossimo anno.",
      question: "Il nuovo regolamento estende il termine massimo entro cui gli operatori devono completare il rimborso.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il regolamento \"riduce da novanta a sessanta giorni\" il termine: lo accorcia, mentre l'affermazione parla di estensione. È la trappola dell'antonimo travestito da parafrasi: la frase ricalca la struttura del testo (stesso soggetto, stesso oggetto) cambiando solo il verbo chiave, e sotto pressione l'occhio convalida la somiglianza complessiva senza verificare la direzione del cambiamento.",
      tag: "parafrasi",
      difficulty: 1
    },
    {
      id: 1017,
      batch: 1,
      passage: "Alla sessione autunnale dell'esame di abilitazione per guide escursionistiche si sono presentati duecentoquaranta candidati. Secondo i dati diffusi dall'ente organizzatore, almeno la metà dei partecipanti ha superato la prova pratica al primo tentativo, un risultato definito in linea con le sessioni precedenti. L'ente ha inoltre annunciato che dalla prossima sessione la prova pratica includerà un modulo dedicato all'orientamento notturno, già sperimentato in due sessioni pilota.",
      question: "Alcuni partecipanti non hanno superato la prova pratica al primo tentativo.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. \"Almeno la metà\" fissa solo un limite inferiore: i promossi al primo tentativo potrebbero essere il 50%, il 70% o anche il 100%. Se fossero tutti, nessuno sarebbe stato bocciato — quindi il testo non garantisce che \"alcuni non hanno superato\". Trappola sottile: l'istinto legge \"almeno la metà\" come \"circa la metà\" e deduce che l'altra metà ha fallito, ma il limite inferiore non esclude affatto il totale.",
      tag: "quantificatore",
      difficulty: 3
    },
    {
      id: 1018,
      batch: 1,
      passage: "La società ferroviaria Altavia ha annunciato a gennaio la fusione con il principale operatore logistico del paese, un'operazione valutata oltre due miliardi. L'autorità per la concorrenza ha aperto un'istruttoria approfondita, raccogliendo osservazioni da clienti e concorrenti. Il via libera è arrivato sette mesi dopo l'annuncio, subordinato alla cessione di due stabilimenti di manutenzione e all'impegno a mantenere invariate le tariffe sulle tratte regionali per un triennio.",
      question: "L'autorità per la concorrenza si è pronunciata dopo l'annuncio della fusione.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Il brano colloca l'annuncio a gennaio e il via libera \"sette mesi dopo l'annuncio\": la pronuncia dell'autorità è quindi successiva all'annuncio per esplicita indicazione del testo. Quesito di calibrazione: non tutte le affermazioni temporali nascondono un'inversione — qui la sequenza richiesta coincide con quella scritta, e la risposta corretta è semplicemente Vero.",
      tag: "tempo",
      difficulty: 1
    },
    {
      id: 1019,
      batch: 1,
      passage: "Il rapporto commissionato dal ministero valuta l'impatto occupazionale del programma di incentivi per le imprese della filiera ittica nelle regioni costiere, analizzando i dati di tremiladuecento aziende beneficiarie. Gli autori precisano che per le aree interne, dove il programma opera con criteri diversi, saranno necessarie analisi separate, previste per il prossimo anno. Nelle regioni esaminate, il rapporto stima un incremento occupazionale medio del 4% nelle imprese beneficiarie rispetto alle non beneficiarie.",
      question: "Le conclusioni del rapporto non coprono le aree interne.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Il brano delimita esplicitamente l'oggetto del rapporto alle regioni costiere e afferma che per le aree interne \"saranno necessarie analisi separate\", ancora da svolgere: le conclusioni attuali quindi non le coprono. Questo quesito allena la lettura dell'ambito (scope) nella direzione \"corretta\": riconoscere i confini che il testo stesso dichiara, senza restringerli né allargarli.",
      tag: "scope",
      difficulty: 2
    },
    {
      id: 1020,
      batch: 1,
      passage: "Interpellato dai giornalisti al termine della riunione preparatoria, il portavoce della presidenza ha risposto ad alcune domande sul vertice intergovernativo in calendario per il mese prossimo. Il portavoce non ha confermato l'ipotesi di un rinvio del vertice, circolata nelle ultime ore su alcuni organi di stampa, e ha rimandato ogni comunicazione ufficiale alla nota congiunta attesa entro la settimana. Ha inoltre precisato che l'ordine del giorno resta in fase di definizione.",
      question: "Il portavoce ha smentito l'ipotesi di un rinvio del vertice.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["C"],
      explanation: "Non si può dire. \"Non ha confermato\" non equivale a \"ha smentito\": tra la conferma e la smentita esiste una terza posizione — non pronunciarsi — ed è esattamente quella descritta dal brano. Il testo non dice che il portavoce abbia negato il rinvio, quindi l'affermazione non è dimostrata; ma non la contraddice nemmeno. Trappola: trattare l'assenza di conferma come una negazione attiva.",
      tag: "negazione",
      difficulty: 3
    },
    {
      id: 1021,
      batch: 1,
      passage: "Il bando per l'innovazione agroalimentare mette a disposizione dieci milioni di euro. Il regolamento riserva il 20% dei fondi ai progetti presentati da imprenditori sotto i trentacinque anni, come misura di sostegno al ricambio generazionale. I fondi restanti sono assegnati tramite graduatoria unica, senza vincoli anagrafici, sulla base della qualità tecnica dei progetti. Ogni impresa può presentare una sola domanda e le graduatorie saranno pubblicate entro novanta giorni dalla chiusura del bando.",
      question: "I progetti presentati da imprenditori sotto i trentacinque anni possono ottenere al massimo il 20% dei fondi complessivi.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. Il 20% è riservato agli under 35, ma i fondi restanti sono assegnati \"senza vincoli anagrafici\": la graduatoria unica è aperta anche a loro, che possono quindi ottenere quota della parte restante oltre alla riserva. L'affermazione trasforma una quota minima garantita in un tetto massimo. Trappola: confondere \"riservato a\" (protezione, pavimento) con \"limitato a\" (esclusione, soffitto) — il testo stabilisce il primo, l'affermazione pretende il secondo.",
      tag: "scope",
      difficulty: 3
    },
    {
      id: 1022,
      batch: 1,
      passage: "La commissione di garanzia ha esaminato il ricorso presentato da un'impresa esclusa dalla gara per la fornitura di arredi scolastici. Dopo aver acquisito la documentazione integrativa e ascoltato le parti, la commissione ha giudicato insufficienti le prove presentate a sostegno della richiesta di riammissione e ha confermato l'esclusione. L'impresa potrà impugnare la decisione davanti al tribunale amministrativo entro i termini di legge. Gli esiti delle altre valutazioni saranno notificati separatamente.",
      question: "Secondo la commissione, le prove presentate a sostegno della richiesta non erano sufficienti.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. \"Ha giudicato insufficienti le prove\" e \"le prove non erano sufficienti secondo la commissione\" esprimono lo stesso giudizio: la riformulazione sostituisce l'aggettivo con la sua negazione equivalente (\"insufficienti\" = \"non sufficienti\") e attribuisce correttamente la valutazione alla commissione, non a un fatto oggettivo. Riconoscere le parafrasi legittime evita l'errore opposto alla credulità: il sospetto sistematico che porta a rispondere sempre \"Non si può dire\".",
      tag: "parafrasi",
      difficulty: 1
    },
    {
      id: 1023,
      batch: 1,
      passage: "Lo statuto dell'assemblea di quartiere disciplina la partecipazione alle votazioni sulle proposte di bilancio partecipativo. Solo i residenti iscritti al registro civico possono votare in assemblea; l'iscrizione è gratuita e va perfezionata almeno dieci giorni prima della seduta. Alla votazione di martedì sulle nuove aree gioco hanno preso parte centododici persone. Tra i votanti figura anche Ivan, che ha sostenuto la proposta di destinare parte dei fondi all'illuminazione del parco.",
      question: "Ivan non è iscritto al registro civico.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["B"],
      explanation: "Falso. La regola \"solo gli iscritti possono votare\" rende l'iscrizione una condizione necessaria per il voto; poiché il brano attesta che Ivan ha votato, Ivan deve essere iscritto — e l'affermazione, che lo nega, contraddice questa conseguenza necessaria del testo. Trappola: il \"solo\" definisce chi può, e da chi ha effettivamente fatto si risale con certezza al requisito. Attenzione a non confonderlo con il caso inverso (essere iscritti non prova aver votato).",
      tag: "quantificatore",
      difficulty: 3
    },
    {
      id: 1024,
      batch: 1,
      passage: "La compagnia aerea regionale Vireo ha presentato l'orario invernale, confermando l'impianto della stagione precedente con alcune novità sulle frequenze. Tutti i voli della compagnia diretti alle isole prevedono uno scalo intermedio nell'hub costiero, dove è garantita la coincidenza entro novanta minuti. Il volo VR218 della compagnia, operato quattro volte a settimana, è diretto alle isole ed è tra i più utilizzati dai pendolari del comparto turistico durante la stagione invernale.",
      question: "Il volo VR218 prevede uno scalo intermedio.",
      options: [
        { letter: "A", text: "Vero" },
        { letter: "B", text: "Falso" },
        { letter: "C", text: "Non si può dire" }
      ],
      correct: ["A"],
      explanation: "Vero. Il brano stabilisce una regola generale (tutti i voli della compagnia verso le isole prevedono uno scalo) e attesta che il VR218 appartiene a quella categoria (è un volo della compagnia diretto alle isole): la conclusione segue necessariamente. È il sillogismo nella sua forma pulita — regola universale + caso particolare incluso — e va riconosciuto come inferenza legittima, non come salto oltre il testo.",
      tag: "inferenza",
      difficulty: 1
    }
  ]
});
