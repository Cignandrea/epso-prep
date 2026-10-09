// ═══ EU Prep Suite — Cartuccia: RAGIONAMENTO VERBALE · Batteria 3 ═══
// Formato ESAME EPSO a 4 opzioni, con consegne variate: affermazione supportata,
// conclusione deducibile e domande in forma negativa ("NON è supportata"), tra le
// più insidiose in sede d'esame. Id 1049–1072, batch 3.

registerBank({
  id: 'verbale',
  questions: [
    {
      id: 1049, batch: 3,
      passage: "L'osservatorio astronomico dell'altopiano ha inaugurato un programma di aperture pubbliche serali nei fine settimana, con prenotazione obbligatoria e gruppi di massimo venticinque persone. Le osservazioni si svolgono solo in condizioni di cielo sereno: in caso di maltempo la serata viene convertita in una visita guidata alla strumentazione, senza rimborso del biglietto. Il ricavato finanzia il progetto di divulgazione nelle scuole della provincia.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "In caso di maltempo i visitatori ricevono il rimborso del biglietto." },
        { letter: "B", text: "Le serate pubbliche possono svolgersi anche senza osservazione del cielo." },
        { letter: "C", text: "L'accesso alle serate è libero e senza prenotazione." },
        { letter: "D", text: "Il ricavato finanzia l'acquisto di nuovi telescopi." }
      ],
      correct: ["B"],
      explanation: "Con il maltempo la serata \"viene convertita in una visita guidata\": l'evento si tiene comunque, senza osservazione — è ciò che dice B. A contraddice il \"senza rimborso\"; C contraddice la prenotazione obbligatoria; D sostituisce la destinazione dichiarata del ricavato (divulgazione nelle scuole) con una plausibile ma non scritta.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1050, batch: 3,
      passage: "Il piano per la banda ultralarga nelle aree rurali della regione prevede il collegamento in fibra ottica di trecentoquaranta frazioni entro tre anni. Nel primo anno sono state raggiunte novanta frazioni, un ritmo che l'assessorato definisce \"in linea con il cronoprogramma\". Gli interventi privilegiano le località sedi di scuole o presidi sanitari. Per le case sparse non raggiungibili dalla fibra è previsto un contributo per soluzioni satellitari.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Il piano prevede una soluzione alternativa per le abitazioni non raggiungibili dalla fibra." },
        { letter: "B", text: "Tutte le frazioni della regione sono già collegate in fibra." },
        { letter: "C", text: "Il piano è in ritardo rispetto al cronoprogramma." },
        { letter: "D", text: "Gli interventi escludono le località con presidi sanitari." }
      ],
      correct: ["A"],
      explanation: "Per le case sparse fuori portata della fibra il piano \"prevede un contributo per soluzioni satellitari\": A lo riporta fedelmente. B anticipa un traguardo triennale ancora lontano (90 su 340); C contraddice il giudizio \"in linea con il cronoprogramma\"; D capovolge il criterio di priorità dichiarato.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1051, batch: 3,
      passage: "Il distretto della ceramica artistica conta sessantadue laboratori attivi, in calo rispetto agli ottanta di dieci anni fa. Il consorzio di tutela ha lanciato un marchio di origine che certifica le lavorazioni realizzate interamente nel distretto. Nel primo anno hanno aderito al marchio trentacinque laboratori. Secondo il consorzio, il marchio ha contribuito a un aumento medio del dodici per cento del fatturato degli aderenti.",
      question: "Quale delle seguenti affermazioni NON è supportata dal brano?",
      options: [
        { letter: "A", text: "Il numero di laboratori attivi è diminuito nell'arco di dieci anni." },
        { letter: "B", text: "Nel primo anno oltre la metà dei laboratori attivi ha aderito al marchio." },
        { letter: "C", text: "La maggioranza dei laboratori attivi non ha aderito al marchio nel primo anno." },
        { letter: "D", text: "Il marchio certifica lavorazioni realizzate interamente nel distretto." }
      ],
      correct: ["C"],
      explanation: "Consegna al negativo: si cerca l'affermazione NON supportata. I laboratori attivi sono 62 e gli aderenti 35: poiché 35 supera la metà (31), la maggioranza HA aderito — quindi C, che afferma il contrario, è contraddetta dai numeri del brano. A è supportata (da 80 a 62), B è supportata (35 > 31), D riprende la definizione del marchio. Trappola doppia: la consegna negativa più il confronto aritmetico 35 contro 62, dove l'istinto \"35 sembra poco\" inganna chi non calcola la metà esatta.",
      tag: "quantificatore", difficulty: 3
    },
    {
      id: 1052, batch: 3,
      passage: "Il bando regionale per il servizio civile ambientale mette a disposizione duecento posti per giovani tra i diciotto e i ventotto anni. I progetti durano dodici mesi e prevedono un rimborso mensile. Le attività spaziano dalla manutenzione dei sentieri al monitoraggio della qualità delle acque, sotto la supervisione degli enti gestori delle aree protette. La partecipazione al servizio civile non costituisce rapporto di lavoro subordinato.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La partecipazione al servizio configura un contratto di lavoro subordinato." },
        { letter: "B", text: "I progetti hanno una durata di ventiquattro mesi." },
        { letter: "C", text: "Un cittadino di trent'anni non rientra nella fascia d'età prevista dal bando." },
        { letter: "D", text: "Le attività si svolgono senza alcuna supervisione." }
      ],
      correct: ["C"],
      explanation: "La fascia dichiarata è 18–28 anni: trent'anni cade fuori dal requisito, quindi C è una conseguenza diretta. A contraddice l'esclusione esplicita del rapporto subordinato; B raddoppia la durata; D contraddice la supervisione degli enti gestori. Applicare il requisito a un caso concreto è un'inferenza legittima.",
      tag: "inferenza", difficulty: 1
    },
    {
      id: 1053, batch: 3,
      passage: "Il progetto degli orti condivisi ha trasformato un'area dismessa di ottomila metri quadrati in centoventi lotti coltivabili assegnati tramite graduatoria, con precedenza ai residenti del municipio e alle famiglie con figli minori. Ogni assegnatario versa un canone annuo simbolico che copre i consumi idrici. Venti lotti sono riservati alle scuole del quartiere per attività didattiche; l'assegnazione dura tre anni ed è rinnovabile una sola volta.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Un assegnatario può mantenere il lotto per più di sei anni consecutivi." },
        { letter: "B", text: "L'assegnazione dei lotti avviene per ordine di arrivo delle domande." },
        { letter: "C", text: "L'uso dei lotti è completamente gratuito." },
        { letter: "D", text: "Non tutti i lotti sono destinati ai privati cittadini." }
      ],
      correct: ["D"],
      explanation: "Venti lotti sono riservati alle scuole: quindi una parte dei centoventi non va ai privati — D segue direttamente. A supera il massimo consentito (3 anni + un solo rinnovo = 6); B contraddice la graduatoria con criteri di precedenza; C contraddice il canone annuo, per quanto simbolico.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1054, batch: 3,
      passage: "La funicolare storica, in servizio dal 1908, ha riaperto dopo due anni di lavori di ammodernamento che hanno conservato le cabine in legno originali, ora dotate di nuovi sistemi frenanti. La corsa dura sei minuti e collega il centro alla collina del castello. Il servizio è integrato nel sistema tariffario urbano: i possessori di abbonamento ai mezzi pubblici viaggiano senza costi aggiuntivi, mentre per i turisti è disponibile un biglietto dedicato.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Le cabine originali in legno sono state sostituite con cabine moderne." },
        { letter: "B", text: "Chi ha l'abbonamento ai mezzi pubblici non paga un costo aggiuntivo per la funicolare." },
        { letter: "C", text: "La funicolare è entrata in servizio nel dopoguerra." },
        { letter: "D", text: "Il biglietto dedicato ai turisti è stato abolito." }
      ],
      correct: ["B"],
      explanation: "Il brano dice che gli abbonati \"viaggiano senza costi aggiuntivi\": B è la riformulazione fedele. A contraddice la conservazione delle cabine originali; C colloca nel dopoguerra un servizio attivo dal 1908; D nega un biglietto che il testo dichiara disponibile. L'integrazione tariffaria è il punto informativo chiave del brano.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1055, batch: 3,
      passage: "La rete regionale di monitoraggio sismico è stata potenziata con dodici nuove stazioni, che portano il totale a quarantotto. I dati confluiscono in tempo reale nel centro di elaborazione, dove un sistema automatico localizza gli eventi entro pochi secondi; la revisione manuale da parte dei sismologi avviene per tutti gli eventi sopra la soglia di magnitudo due. I bollettini mensili sono pubblici e consultabili online.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Prima del potenziamento la rete contava trentasei stazioni." },
        { letter: "B", text: "Tutti gli eventi registrati vengono revisionati manualmente." },
        { letter: "C", text: "I bollettini della rete sono riservati agli enti di ricerca." },
        { letter: "D", text: "La localizzazione automatica richiede alcune ore." }
      ],
      correct: ["A"],
      explanation: "48 stazioni totali dopo l'aggiunta di 12: prima erano 48 − 12 = 36, come dice A. B estende la revisione manuale, prevista solo sopra magnitudo due, a tutti gli eventi; C contraddice la natura pubblica dei bollettini; D contraddice la localizzazione \"entro pochi secondi\". Il calcolo inverso sul totale è il ponte richiesto.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1056, batch: 3,
      passage: "Il nuovo hub logistico alle porte della città opererà come piattaforma di smistamento per le consegne dell'ultimo miglio, servite esclusivamente da furgoni elettrici e cargo bike. La struttura, realizzata su un'area ferroviaria dismessa, riceverà le merci in prevalenza su rotaia. Il gestore stima una riduzione del venticinque per cento dei chilometri percorsi dai veicoli commerciali nel centro urbano rispetto allo scenario attuale.",
      question: "Quale conclusione è supportata dal brano?",
      options: [
        { letter: "A", text: "Le consegne dell'ultimo miglio dall'hub non utilizzeranno veicoli diesel." },
        { letter: "B", text: "La riduzione dei chilometri nel centro urbano è un risultato già misurato." },
        { letter: "C", text: "Tutte le merci arriveranno all'hub su rotaia." },
        { letter: "D", text: "L'hub è stato costruito su un terreno agricolo." }
      ],
      correct: ["A"],
      explanation: "Se le consegne sono servite \"esclusivamente da furgoni elettrici e cargo bike\", i veicoli diesel sono esclusi: A è la conseguenza del quantificatore. B scambia una stima del gestore per un dato misurato; C trasforma \"in prevalenza\" in \"tutte\"; D contraddice l'area ferroviaria dismessa. Distinguere stime da risultati è una trappola ricorrente.",
      tag: "scope", difficulty: 2
    },
    {
      id: 1057, batch: 3,
      passage: "L'azienda vinicola a conduzione familiare ha convertito l'intero vigneto, dodici ettari, alla coltivazione biologica certificata. La resa per ettaro è diminuita del quindici per cento rispetto al metodo convenzionale, ma il prezzo medio di vendita per bottiglia è cresciuto in misura maggiore, portando a un aumento complessivo dei ricavi. L'azienda vende in prevalenza tramite enoteche indipendenti e spedizioni dirette ai privati.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La conversione al biologico ha aumentato la resa per ettaro." },
        { letter: "B", text: "Solo una parte del vigneto è coltivata con metodo biologico." },
        { letter: "C", text: "I ricavi complessivi dell'azienda sono aumentati dopo la conversione." },
        { letter: "D", text: "L'azienda vende esclusivamente alla grande distribuzione." }
      ],
      correct: ["C"],
      explanation: "Il brano afferma un \"aumento complessivo dei ricavi\" nonostante la minore resa: C lo riporta senza aggiunte. A contraddice il calo del 15% della resa; B contraddice la conversione dell'intero vigneto; D contraddice i canali dichiarati (enoteche e vendita diretta). Il quesito premia chi separa i tre indicatori: resa, prezzo, ricavi.",
      tag: "parafrasi", difficulty: 2
    },
    {
      id: 1058, batch: 3,
      passage: "Il corso gratuito di alfabetizzazione digitale per gli over sessantacinque, organizzato nelle biblioteche di quartiere, ha formato nell'ultimo anno millequattrocento partecipanti sull'uso dello smartphone, dei servizi pubblici online e della posta elettronica. Le lezioni sono tenute da volontari formati, affiancati nei moduli sulla sicurezza da personale della polizia postale. Al termine, a ogni partecipante viene proposto un incontro individuale di consolidamento.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Il corso prevede il pagamento di una quota di iscrizione." },
        { letter: "B", text: "I moduli sulla sicurezza vedono la partecipazione della polizia postale." },
        { letter: "C", text: "Il corso è riservato a chi possiede già competenze digitali avanzate." },
        { letter: "D", text: "Gli incontri individuali sostituiscono le lezioni di gruppo." }
      ],
      correct: ["B"],
      explanation: "Il testo dice che nei moduli sulla sicurezza i volontari sono \"affiancati da personale della polizia postale\": B lo riformula correttamente. A contraddice la gratuità; C contraddice la natura di alfabetizzazione del corso; D descrive gli incontri individuali come sostitutivi mentre il brano li propone \"al termine\", come consolidamento.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1059, batch: 3,
      passage: "Il parco fluviale urbano si estende per nove chilometri lungo entrambe le sponde. Il regolamento consente la navigazione solo a imbarcazioni non a motore e vieta la pesca nel tratto compreso tra i due ponti storici, dove è in corso un intervento di ripopolamento. Nelle aree attrezzate è consentito il picnic, mentre i fuochi liberi sono vietati ovunque. I cani possono accedere senza guinzaglio esclusivamente nelle tre aree recintate dedicate.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La pesca è vietata in tutto il parco fluviale." },
        { letter: "B", text: "Le imbarcazioni a motore possono navigare nel tratto centrale." },
        { letter: "C", text: "Fuori dalle aree recintate dedicate, i cani non possono stare senza guinzaglio." },
        { letter: "D", text: "I fuochi liberi sono consentiti nelle aree attrezzate." }
      ],
      correct: ["C"],
      explanation: "\"Esclusivamente nelle tre aree recintate\" delimita l'unico spazio in cui il cane può stare libero: fuori da lì, il guinzaglio è necessario — C è il rovescio corretto dell'\"esclusivamente\". A estende a tutto il parco un divieto limitato al tratto tra i ponti; B contraddice il permesso alle sole imbarcazioni non a motore; D contraddice il divieto dei fuochi \"ovunque\".",
      tag: "scope", difficulty: 2
    },
    {
      id: 1060, batch: 3,
      passage: "La cooperativa dei pescatori del lago ha ottenuto la certificazione di sostenibilità per la pesca del coregone, la specie che rappresenta i due terzi del pescato annuale. Il disciplinare impone maglie delle reti più larghe, il fermo biologico di sei settimane in primavera e la registrazione giornaliera delle catture. Il prezzo riconosciuto ai pescatori per il coregone certificato è aumentato del venti per cento rispetto alla stagione precedente.",
      question: "Quale delle seguenti affermazioni NON è supportata dal brano?",
      options: [
        { letter: "A", text: "Il coregone costituisce la maggioranza del pescato annuale della cooperativa." },
        { letter: "B", text: "Il disciplinare prevede un periodo di fermo biologico in primavera." },
        { letter: "C", text: "La certificazione riguarda tutte le specie pescate dalla cooperativa." },
        { letter: "D", text: "Il prezzo del coregone certificato è cresciuto rispetto alla stagione precedente." }
      ],
      correct: ["C"],
      explanation: "Consegna al negativo: si cerca l'affermazione che il brano NON sostiene. La certificazione è stata ottenuta \"per la pesca del coregone\": estenderla a tutte le specie (C) va oltre il testo. A è supportata (due terzi = maggioranza), B e D riprendono clausole esplicite. Nelle domande \"NON\", tre opzioni vere fanno da esca: serve trovare l'unica che eccede il brano.",
      tag: "scope", difficulty: 3
    },
    {
      id: 1061, batch: 3,
      passage: "Il museo della scienza per l'infanzia apre la nuova ala dedicata all'acqua, con vasche interattive e un percorso sul ciclo idrico. L'accesso all'ala è incluso nel biglietto ordinario ma richiede la prenotazione di una fascia oraria, per limitare l'affollamento. I bambini sotto i sei anni entrano gratuitamente in tutto il museo se accompagnati da un adulto pagante. Le scolaresche accedono su prenotazione con tariffa ridotta dedicata.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'accesso alla nuova ala comporta un biglietto aggiuntivo." },
        { letter: "B", text: "Un bambino di cinque anni accompagnato da un adulto pagante non paga l'ingresso." },
        { letter: "C", text: "Le scolaresche pagano la tariffa intera." },
        { letter: "D", text: "La prenotazione della fascia oraria non è necessaria per la nuova ala." }
      ],
      correct: ["B"],
      explanation: "Il caso concreto (cinque anni, adulto pagante) soddisfa entrambe le condizioni della gratuità dichiarata: B applica la regola correttamente. A contraddice l'inclusione nel biglietto ordinario; C contraddice la tariffa ridotta dedicata; D contraddice l'obbligo di prenotazione oraria. Verificare che TUTTE le condizioni della regola siano soddisfatte è il cuore del quesito.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1062, batch: 3,
      passage: "Il piano di riqualificazione della rete sentieristica ha censito quattrocentoventi chilometri di percorsi, di cui il sessanta per cento giudicato in buone condizioni. Gli interventi prioritari riguardano i tratti danneggiati dalle piogge dell'autunno scorso, per i quali sono già stati appaltati i lavori. La nuova segnaletica, uniforme per tutta la rete, sarà installata a partire dai percorsi più frequentati, individuati tramite i contatori di passaggio.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Una parte dei percorsi censiti non è in buone condizioni." },
        { letter: "B", text: "La segnaletica sarà diversa da zona a zona." },
        { letter: "C", text: "I lavori sui tratti danneggiati devono ancora essere appaltati." },
        { letter: "D", text: "I percorsi più frequentati sono stati individuati tramite un sondaggio online." }
      ],
      correct: ["A"],
      explanation: "Se il 60% è in buone condizioni, il restante 40% non lo è: A segue dal complemento aritmetico. B contraddice la segnaletica \"uniforme per tutta la rete\"; C contraddice l'appalto già avvenuto; D sostituisce i contatori di passaggio con un sondaggio mai menzionato. Ancora una volta, il complemento a cento è un'inferenza pienamente legittima.",
      tag: "inferenza", difficulty: 1
    },
    {
      id: 1063, batch: 3,
      passage: "L'impianto di compostaggio di comunità installato nel quartiere tratta gli scarti organici di quattrocento famiglie aderenti, trasformandoli in ammendante distribuito gratuitamente agli orti urbani e ai giardini condominiali dei partecipanti. Il conferimento avviene con tessera personale nei tre punti di raccolta. Nel primo anno l'impianto ha trattato novantadue tonnellate di scarti, con una riduzione stimata del dodici per cento dell'organico avviato al servizio di raccolta ordinario del quartiere.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'ammendante prodotto viene venduto ai partecipanti." },
        { letter: "B", text: "Il conferimento degli scarti è consentito solo con tessera personale." },
        { letter: "C", text: "L'impianto serve tutte le famiglie del quartiere." },
        { letter: "D", text: "La riduzione dell'organico nella raccolta ordinaria è un dato misurato con esattezza." }
      ],
      correct: ["B"],
      explanation: "Il conferimento \"avviene con tessera personale\": B ne è la lettura fedele. A contraddice la distribuzione gratuita; C estende il servizio dalle quattrocento famiglie aderenti a tutto il quartiere; D promuove una \"riduzione stimata\" a misura esatta. Il vocabolario del brano (gratuito, aderenti, stimata) contiene già tutte le risposte.",
      tag: "scope", difficulty: 1
    },
    {
      id: 1064, batch: 3,
      passage: "Il programma di borse per giovani ricercatori finanzia venti progetti biennali nelle discipline ambientali. Possono candidarsi ricercatori che abbiano conseguito il dottorato da non più di cinque anni. Ogni borsa copre lo stipendio del ricercatore e un fondo per le attività sperimentali; non sono ammesse spese per il personale aggiuntivo. La valutazione è affidata a un panel internazionale e prevede un colloquio per i soli candidati preselezionati.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Chi ha conseguito il dottorato da sette anni rientra tra i possibili candidati." },
        { letter: "B", text: "La borsa può finanziare l'assunzione di un assistente di ricerca." },
        { letter: "C", text: "Non tutti i candidati sostengono il colloquio di valutazione." },
        { letter: "D", text: "I progetti finanziati hanno durata quadriennale." }
      ],
      correct: ["C"],
      explanation: "Il colloquio è previsto \"per i soli candidati preselezionati\": chi non supera la preselezione non lo sostiene, quindi C è corretta. A viola il limite dei cinque anni dal dottorato; B contraddice l'esclusione delle spese per personale aggiuntivo; D raddoppia la durata biennale. \"Per i soli\" è il quantificatore che regge l'intero quesito.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1065, batch: 3,
      passage: "Lo sportello unico per il lavoro inaugurato in stazione riunisce in un solo luogo i servizi per l'impiego, l'orientamento formativo e la consulenza per l'avvio di attività autonome. L'accesso è libero negli orari di apertura, dal lunedì al venerdì; i colloqui di orientamento approfonditi richiedono invece un appuntamento. Nei primi tre mesi lo sportello ha registrato seimila accessi, un terzo dei quali per la consulenza sulle attività autonome.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Lo sportello è aperto anche il sabato." },
        { letter: "B", text: "Duemila accessi hanno riguardato la consulenza per le attività autonome." },
        { letter: "C", text: "Tutti i servizi dello sportello richiedono un appuntamento." },
        { letter: "D", text: "I colloqui approfonditi sono accessibili senza appuntamento." }
      ],
      correct: ["B"],
      explanation: "Un terzo di seimila accessi fa duemila: B traduce in numero la frazione del brano. A aggiunge un giorno di apertura non dichiarato; C generalizza l'appuntamento, richiesto solo per i colloqui approfonditi; D afferma l'esatto contrario di quella clausola. Convertire frazioni in valori assoluti è un passaggio che l'esame dà per scontato.",
      tag: "inferenza", difficulty: 1
    },
    {
      id: 1066, batch: 3,
      passage: "Il progetto di ripopolamento ittico del torrente prevede l'immissione graduale di trentamila avannotti di trota marmorata, specie autoctona, nell'arco di tre anni. Le immissioni avvengono solo nei tratti in cui i campionamenti hanno confermato una qualità dell'acqua adeguata. Nei primi due anni sono stati immessi ventiduemila avannotti. Il divieto di pesca nei tratti interessati resterà in vigore fino al termine del progetto.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Le immissioni del terzo anno riguarderanno ottomila avannotti." },
        { letter: "B", text: "Le immissioni avvengono in tutti i tratti del torrente." },
        { letter: "C", text: "La trota marmorata è una specie estranea al torrente." },
        { letter: "D", text: "Il divieto di pesca è già stato revocato." }
      ],
      correct: ["A"],
      explanation: "30.000 previsti meno 22.000 già immessi lasciano 8.000 avannotti per il terzo anno: A completa il piano dichiarato con una sottrazione. B ignora la condizione sulla qualità dell'acqua; C contraddice \"specie autoctona\"; D contraddice il divieto \"in vigore fino al termine del progetto\". Il piano triennale rende il calcolo una conseguenza, non un'ipotesi.",
      tag: "tempo", difficulty: 2
    },
    {
      id: 1067, batch: 3,
      passage: "Lo spazio di coworking pubblico ricavato nell'ex mercato coperto offre ottanta postazioni prenotabili online, sale riunioni e una zona eventi. Le postazioni sono gratuite per gli studenti universitari e per i primi sei mesi di attività delle imprese neonate; per tutti gli altri utenti è prevista una tariffa giornaliera o mensile. Gli incassi coprono i costi di gestione, mentre le utenze restano a carico del comune.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Tutti gli utenti dello spazio pagano una tariffa." },
        { letter: "B", text: "Le utenze dello spazio sono pagate con gli incassi delle tariffe." },
        { letter: "C", text: "Un'impresa neonata paga la tariffa piena fin dal primo giorno." },
        { letter: "D", text: "Per alcuni utenti l'uso delle postazioni non comporta costi." }
      ],
      correct: ["D"],
      explanation: "Studenti e imprese neonate (nei primi sei mesi) usano le postazioni gratuitamente: quindi per alcuni utenti non ci sono costi — D. A ignora proprio queste eccezioni; B contraddice la ripartizione dichiarata (incassi per la gestione, utenze al comune); C contraddice la gratuità iniziale delle imprese neonate. Le eccezioni annunciate valgono quanto la regola tariffaria.",
      tag: "quantificatore", difficulty: 1
    },
    {
      id: 1068, batch: 3,
      passage: "Il restauro degli affreschi della sala capitolare, durato ventidue mesi, ha rimosso le ridipinture ottocentesche riportando alla luce la stesura originale del ciclo trecentesco. Le indagini diagnostiche hanno individuato tre mani di autori diversi, ipotesi che i documenti d'archivio non consentono per ora di attribuire con certezza a nomi specifici. La sala riapre alle visite guidate su prenotazione, con un massimo di quindici persone per gruppo.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'identità dei tre autori degli affreschi è stata stabilita con certezza." },
        { letter: "B", text: "Le indagini indicano che al ciclo lavorarono più autori." },
        { letter: "C", text: "Le ridipinture ottocentesche sono state conservate." },
        { letter: "D", text: "La sala è visitabile liberamente senza prenotazione." }
      ],
      correct: ["B"],
      explanation: "Le indagini hanno individuato \"tre mani di autori diversi\": più autori, come dice B — senza pretendere i nomi, che il brano dichiara non attribuibili con certezza (ed è per questo che A eccede il testo). C contraddice la rimozione delle ridipinture; D contraddice la prenotazione obbligatoria. B resta esattamente dentro il perimetro delle evidenze.",
      tag: "fuori-testo", difficulty: 2
    },
    {
      id: 1069, batch: 3,
      passage: "La rete dei bus notturni attiva nei fine settimana copre sei linee radiali con partenze ogni trenta minuti dalla piazza centrale, dall'una alle cinque del mattino. Il biglietto ordinario urbano è valido anche sulle corse notturne; l'acquisto a bordo comporta un sovrapprezzo. Il servizio, sperimentale per un anno, sarà confermato se la media dei passeggeri supererà la soglia fissata dal contratto con il gestore.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La conferma del servizio dopo l'anno di prova non è garantita." },
        { letter: "B", text: "Il servizio notturno è attivo tutte le notti della settimana." },
        { letter: "C", text: "Le corse notturne richiedono un biglietto speciale dedicato." },
        { letter: "D", text: "L'acquisto del biglietto a bordo non comporta costi aggiuntivi." }
      ],
      correct: ["A"],
      explanation: "La conferma è subordinata al superamento di una soglia di passeggeri: è condizionata, quindi non garantita — A legge correttamente la clausola. B estende ai giorni feriali un servizio dei fine settimana; C contraddice la validità del biglietto ordinario; D contraddice il sovrapprezzo a bordo. Una condizione sospensiva non è una promessa.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1070, batch: 3,
      passage: "La sperimentazione di consegna con droni di farmaci urgenti collega l'ospedale principale al presidio dell'isola lacustre, riducendo a otto minuti un trasporto che via traghetto ne richiede quaranta. I voli, autorizzati su un corridoio dedicato sopra lo specchio d'acqua, trasportano esclusivamente materiale sanitario e si interrompono in caso di vento oltre la soglia di sicurezza. Nei primi quattro mesi sono state completate centodieci consegne.",
      question: "Quale delle seguenti affermazioni NON è supportata dal brano?",
      options: [
        { letter: "A", text: "Il trasporto con drone è più rapido del traghetto." },
        { letter: "B", text: "I voli si svolgono con qualunque condizione di vento." },
        { letter: "C", text: "I droni della sperimentazione non trasportano passeggeri." },
        { letter: "D", text: "Le consegne completate nei primi quattro mesi sono state più di cento." }
      ],
      correct: ["B"],
      explanation: "Consegna al negativo. Il brano dice che i voli \"si interrompono\" oltre la soglia di vento: B, che li vuole operativi con qualunque vento, contraddice il testo ed è la NON supportata. A (8 contro 40 minuti), C (\"esclusivamente materiale sanitario\" esclude i passeggeri) e D (110 > 100) sono tutte sostenute. Nelle domande \"NON\", cercare la contraddizione o l'eccesso.",
      tag: "negazione", difficulty: 3
    },
    {
      id: 1071, batch: 3,
      passage: "La scuola di circo contemporaneo trasferita nel capannone ristrutturato propone corsi per bambini, adolescenti e adulti, dall'acrobatica aerea alla giocoleria. L'iscrizione ai corsi per minori richiede il certificato medico per l'attività sportiva non agonistica. Gli allievi del corso avanzato partecipano allo spettacolo di fine anno, aperto al pubblico con ingresso a offerta libera. La scuola ospita inoltre residenze per compagnie professionali.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Lo spettacolo di fine anno prevede un biglietto a prezzo fisso." },
        { letter: "B", text: "Per iscrivere un minore ai corsi serve un certificato medico." },
        { letter: "C", text: "I corsi sono riservati esclusivamente agli adulti." },
        { letter: "D", text: "Le residenze ospitano soltanto gli allievi della scuola." }
      ],
      correct: ["B"],
      explanation: "L'iscrizione dei minori \"richiede il certificato medico\": B è la lettura diretta del requisito. A contraddice l'ingresso a offerta libera; C contraddice l'offerta per bambini e adolescenti; D attribuisce le residenze agli allievi, mentre il brano le destina alle compagnie professionali. La corretta è spesso la frase meno vistosa e più aderente.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1072, batch: 3,
      passage: "La torrefazione artigianale aperta nel borgo lavora esclusivamente caffè acquistati tramite contratti diretti con sei cooperative di produttori, ai quali riconosce un prezzo superiore alle quotazioni di mercato. La tostatura avviene in piccoli lotti settimanali e la vendita si concentra nel punto vendita annesso e nell'e-commerce; una quota minore rifornisce le caffetterie della zona. L'azienda pubblica ogni anno l'elenco dei prezzi pagati ai produttori.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'azienda acquista il caffè anche alle aste internazionali." },
        { letter: "B", text: "Il prezzo riconosciuto ai produttori è inferiore alle quotazioni di mercato." },
        { letter: "C", text: "La tostatura avviene in grandi lotti mensili." },
        { letter: "D", text: "L'azienda rende noti i prezzi pagati ai produttori." }
      ],
      correct: ["D"],
      explanation: "L'azienda \"pubblica ogni anno l'elenco dei prezzi pagati\": D corrisponde al testo. A contraddice l'\"esclusivamente\" dei contratti diretti; B capovolge il prezzo \"superiore\" alle quotazioni; C contraddice i piccoli lotti settimanali. Quesito di chiusura sul metodo: la risposta giusta non aggiunge nulla e non toglie nulla al brano.",
      tag: "quantificatore", difficulty: 1
    }
  ]
});
