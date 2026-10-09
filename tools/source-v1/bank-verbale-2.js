// ═══ EU Prep Suite — Cartuccia: RAGIONAMENTO VERBALE · Batteria 2 ═══
// Formato ESAME EPSO: brano + "quale affermazione è supportata dal brano?" con 4 opzioni.
// Una sola opzione è dimostrabile dal testo; le altre sono contraddette, troppo forti
// o richiedono conoscenze esterne. Contenuti fittizi-plausibili: la verità è solo nel brano.
// Id 1025–1048, batch 2.

registerBank({
  id: 'verbale',
  questions: [
    {
      id: 1025, batch: 2,
      passage: "La piattaforma regionale di prestito digitale consente agli iscritti delle biblioteche aderenti di prendere in prestito libri elettronici e audiolibri. Ogni utente può avere in prestito al massimo tre titoli contemporaneamente, per una durata di quattordici giorni ciascuno, rinnovabile una volta se il titolo non è prenotato da altri. I titoli più richiesti prevedono una lista d'attesa con notifica automatica. Nel primo semestre la piattaforma ha registrato oltre quarantamila prestiti, con gli audiolibri in crescita costante.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La lista d'attesa riguarda tutti i titoli del catalogo." },
        { letter: "B", text: "Un utente non può avere quattro titoli in prestito nello stesso momento." },
        { letter: "C", text: "Il prestito è aperto anche a chi non è iscritto ad alcuna biblioteca aderente." },
        { letter: "D", text: "Il rinnovo del prestito è sempre garantito." }
      ],
      correct: ["B"],
      explanation: "Il limite dichiarato è di tre titoli contemporanei: quattro superano il massimo, quindi B è una conseguenza diretta del testo. A estende a \"tutti\" ciò che il brano attribuisce solo ai titoli più richiesti; C contraddice il requisito dell'iscrizione; D ignora la condizione esplicita (\"se il titolo non è prenotato da altri\"), che rende il rinnovo non garantito.",
      tag: "quantificatore", difficulty: 1
    },
    {
      id: 1026, batch: 2,
      passage: "Il progetto di apicoltura urbana promosso dal comune ha installato arnie su dodici coperture di edifici pubblici, affidandone la gestione a un'associazione di apicoltori. Il miele prodotto viene sottoposto ad analisi mensili presso un laboratorio accreditato. Nel primo anno di attività, nessuno dei campioni analizzati ha superato i limiti di legge per i contaminanti ambientali. I risultati vengono pubblicati sul sito del comune insieme a una relazione sulla salute delle colonie.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Nel primo anno tutti i campioni analizzati sono rimasti entro i limiti di legge." },
        { letter: "B", text: "Le analisi sul miele vengono effettuate ogni settimana." },
        { letter: "C", text: "Il miele prodotto viene venduto nei mercati cittadini." },
        { letter: "D", text: "Il progetto coinvolge anche coperture di edifici privati." }
      ],
      correct: ["A"],
      explanation: "\"Nessun campione ha superato i limiti\" equivale a \"tutti i campioni sono rimasti entro i limiti\": A è la parafrasi logica corretta (da \"nessuno oltre\" a \"tutti entro\"). B contraddice la frequenza mensile; C e D introducono informazioni (vendita, edifici privati) che il brano non fornisce.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1027, batch: 2,
      passage: "Il nuovo terminal del porto commerciale, entrato in funzione questo mese, ha aumentato del 30% la capacità di movimentazione dei container. I lavori sono durati quattro anni e, secondo la relazione conclusiva dell'autorità portuale, sono stati completati nel rispetto del budget approvato. L'occupazione diretta dello scalo è rimasta stabile durante l'intero periodo del cantiere, mentre l'autorità stima ricadute positive sull'indotto nei prossimi anni.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "I lavori sono durati più di cinque anni." },
        { letter: "B", text: "L'occupazione diretta dello scalo è cresciuta del 30% durante il cantiere." },
        { letter: "C", text: "I costi dei lavori non hanno superato il budget approvato." },
        { letter: "D", text: "Il terminal è il più grande del paese." }
      ],
      correct: ["C"],
      explanation: "\"Completati nel rispetto del budget\" significa che i costi non hanno superato quanto approvato: C riformula fedelmente. A contraddice la durata dichiarata (quattro anni); B trasferisce il +30% dalla capacità all'occupazione, che il brano definisce invece stabile; D è un primato che il testo non afferma.",
      tag: "scope", difficulty: 1
    },
    {
      id: 1028, batch: 2,
      passage: "Il programma di screening oncologico invita ogni due anni, con lettera personale, i residenti tra i cinquanta e i sessantanove anni. All'esordio del programma, l'adesione al primo invito è stata del 58%. Tra coloro che hanno aderito, la quota di casi individuati in fase precoce è risultata tripla rispetto a quella osservata, nello stesso periodo, tra i casi diagnosticati al di fuori del programma. L'azienda sanitaria ha annunciato campagne informative per aumentare la partecipazione.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Il programma invita ogni anno i residenti della fascia interessata." },
        { letter: "B", text: "Il programma ha ridotto di tre volte la mortalità della malattia." },
        { letter: "C", text: "Il programma è rivolto a tutti i residenti maggiorenni." },
        { letter: "D", text: "Una parte dei residenti invitati non ha aderito al primo invito." }
      ],
      correct: ["D"],
      explanation: "Se l'adesione è stata del 58%, il restante 42% degli invitati non ha aderito: D è un'inferenza aritmetica sicura. A contraddice la cadenza biennale; B trasforma un dato sulla diagnosi precoce in un effetto sulla mortalità, mai menzionato; C allarga la platea oltre la fascia 50–69 dichiarata.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1029, batch: 2,
      passage: "L'incubatore civico per l'imprenditoria giovanile seleziona ogni anno dieci startup attraverso un bando pubblico. Alle realtà selezionate offre spazi di lavoro gratuiti per dodici mesi, un contributo iniziale a fondo perduto e un percorso di mentoring con professionisti volontari. A differenza di molti incubatori privati, la struttura non richiede quote di partecipazione societaria alle imprese ospitate. Al termine del percorso, le startup presentano i risultati a una platea di investitori.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'incubatore non acquisisce quote delle startup che ospita." },
        { letter: "B", text: "Gli spazi di lavoro sono gratuiti per due anni." },
        { letter: "C", text: "Tutte le startup che presentano domanda vengono ammesse." },
        { letter: "D", text: "Il contributo iniziale viene erogato solo al termine del percorso." }
      ],
      correct: ["A"],
      explanation: "Il brano dichiara che la struttura \"non richiede quote di partecipazione societaria\": A lo riformula correttamente. B raddoppia la durata dichiarata (dodici mesi); C contraddice la selezione di dieci startup tramite bando; D sposta nel tempo un contributo che il testo definisce \"iniziale\".",
      tag: "negazione", difficulty: 1
    },
    {
      id: 1030, batch: 2,
      passage: "La sperimentazione di raccolta dedicata degli abiti usati ha coinvolto sei quartieri della città. Il materiale conferito nei contenitori viene selezionato manualmente in un centro dedicato: la parte in buono stato è destinata ai negozi solidali convenzionati, mentre la parte non riutilizzabile viene avviata agli impianti di riciclo della fibra tessile. Nei primi sei mesi entrambe le filiere hanno ricevuto quantitativi significativi e il comune valuta l'estensione della raccolta ad altri quartieri.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'intero quantitativo raccolto viene avviato al riciclo della fibra." },
        { letter: "B", text: "La selezione del materiale è affidata a macchinari automatici." },
        { letter: "C", text: "Non tutto il materiale raccolto finisce agli impianti di riciclo della fibra." },
        { letter: "D", text: "La sperimentazione copre l'intero territorio comunale." }
      ],
      correct: ["C"],
      explanation: "Il testo divide il raccolto in due destinazioni e attesta che entrambe hanno ricevuto quantitativi significativi: dunque una parte non va al riciclo della fibra, come dice C. A contraddice questa bipartizione; B contraddice la selezione \"manuale\"; D allarga a tutta la città una sperimentazione limitata a sei quartieri.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1031, batch: 2,
      passage: "L'orchestra giovanile regionale apre le candidature a musicisti di età compresa tra i quattordici e i ventuno anni. Le audizioni si terranno in tre città nel mese di settembre. La partecipazione all'orchestra è gratuita; le spese di viaggio per le tournée sono invece a carico delle famiglie, salvo l'assegnazione di borse di copertura previste per i casi di comprovata necessità economica. Il programma della prima stagione comprende musica sinfonica e colonne sonore.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La partecipazione all'orchestra prevede una quota annuale." },
        { letter: "B", text: "In alcuni casi le spese di viaggio possono non ricadere sulle famiglie." },
        { letter: "C", text: "Possono candidarsi soltanto musicisti maggiorenni." },
        { letter: "D", text: "Le borse coprono le spese di viaggio di tutti i partecipanti." }
      ],
      correct: ["B"],
      explanation: "La clausola \"salvo l'assegnazione di borse... per i casi di comprovata necessità\" implica che esistono casi in cui le famiglie non sostengono le spese: B resta dentro il testo. A contraddice la gratuità; C contraddice la fascia 14–21, che include minorenni; D trasforma un'eccezione per casi specifici in una copertura universale.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1032, batch: 2,
      passage: "La ciclovia della valle, un tracciato di sessantadue chilometri che collegherà quattro comuni, ha raggiunto l'ottanta per cento di completamento del fondo. Due tratti, per complessivi ventotto chilometri, sono già aperti e percorribili, mentre l'apertura dell'intero percorso è prevista entro la fine dell'anno. Il progetto è finanziato con fondi regionali ed europei e prevede aree di sosta attrezzate in corrispondenza delle stazioni ferroviarie.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'intero percorso della ciclovia è già percorribile." },
        { letter: "B", text: "Il tracciato complessivo supera i settanta chilometri." },
        { letter: "C", text: "La ciclovia collega tutti i comuni della provincia." },
        { letter: "D", text: "Alcune parti della ciclovia sono già utilizzabili." }
      ],
      correct: ["D"],
      explanation: "Il brano indica due tratti \"già aperti e percorribili\": D lo riprende fedelmente. A anticipa un completamento che il testo colloca a fine anno; B gonfia i sessantadue chilometri dichiarati; C sostituisce i quattro comuni collegati con \"tutti i comuni della provincia\", un ambito che il testo non copre.",
      tag: "tempo", difficulty: 1
    },
    {
      id: 1033, batch: 2,
      passage: "L'impianto di agricoltura verticale inaugurato nella zona industriale coltiva insalate e erbe aromatiche su dodici livelli sovrapposti, con illuminazione LED calibrata sulle diverse fasi di crescita. Secondo i dati del gestore, per ogni chilogrammo di prodotto l'impianto consuma il novanta per cento di acqua in meno rispetto alla coltivazione in campo aperto. Il fabbisogno energetico è coperto in parte dai pannelli fotovoltaici installati sulla copertura dell'edificio.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'impianto è energeticamente autosufficiente grazie ai pannelli fotovoltaici." },
        { letter: "B", text: "A parità di prodotto, l'impianto consuma meno acqua della coltivazione in campo aperto." },
        { letter: "C", text: "L'impianto consuma il novanta per cento di energia in meno rispetto al campo aperto." },
        { letter: "D", text: "L'impianto coltiva dodici varietà di insalata." }
      ],
      correct: ["B"],
      explanation: "Il dato del gestore (−90% di acqua per chilogrammo) supporta B, che ne è la lettura prudente. A trasforma \"in parte\" in autosufficienza totale; C trasferisce il −90% dall'acqua all'energia; D scambia i dodici livelli della struttura per dodici varietà coltivate. Attenzione ai numeri veri agganciati all'attributo sbagliato.",
      tag: "scope", difficulty: 2
    },
    {
      id: 1034, batch: 2,
      passage: "Da questo mese la patente di guida può essere esibita in formato digitale tramite l'app nazionale dei documenti, con validità sull'intero territorio nazionale. Per la guida all'estero resta obbligatorio portare con sé il documento fisico, in attesa del riconoscimento reciproco tra gli Stati. L'attivazione della versione digitale richiede un'identità digitale certificata e la verifica in due passaggi. Nei primi dieci giorni l'hanno attivata oltre nove­centomila automobilisti.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Per guidare all'estero la sola versione digitale non è sufficiente." },
        { letter: "B", text: "Il documento fisico non è più necessario in alcuna circostanza." },
        { letter: "C", text: "L'attivazione della versione digitale è automatica per tutti i patentati." },
        { letter: "D", text: "L'app sostituisce anche la carta d'identità." }
      ],
      correct: ["A"],
      explanation: "Il brano dice che all'estero \"resta obbligatorio\" il documento fisico: quindi la sola versione digitale non basta, come afferma A. B generalizza oltre il territorio nazionale contraddicendo l'obbligo per l'estero; C contraddice i requisiti di attivazione (identità digitale, verifica); D introduce un documento mai menzionato.",
      tag: "negazione", difficulty: 1
    },
    {
      id: 1035, batch: 2,
      passage: "La stazione di ricerca antartica gestita dal consorzio scientifico ospita fino a ventiquattro ricercatori durante la campagna estiva. Nel corso dell'inverno australe la stazione resta operativa con un equipaggio ridotto di sei persone, che garantisce la continuità delle serie di misurazioni atmosferiche. I rifornimenti principali arrivano due volte l'anno via nave, mentre i collegamenti aerei sono possibili solo nella stagione estiva.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Durante l'inverno australe la stazione viene evacuata completamente." },
        { letter: "B", text: "I rifornimenti principali arrivano con cadenza mensile." },
        { letter: "C", text: "La stazione non interrompe l'attività durante l'inverno australe." },
        { letter: "D", text: "L'equipaggio invernale si dedica esclusivamente alla manutenzione." }
      ],
      correct: ["C"],
      explanation: "\"Resta operativa con un equipaggio ridotto\" significa che l'attività non si interrompe: C è la riformulazione corretta. A contraddice direttamente il testo; B contraddice la cadenza semestrale dei rifornimenti; D restringe i compiti dell'equipaggio a \"sola manutenzione\", mentre il brano cita la continuità delle misurazioni.",
      tag: "parafrasi", difficulty: 1
    },
    {
      id: 1036, batch: 2,
      passage: "Il nuovo regolamento dei mercati rionali impone ai banchi alimentari di esporre in modo visibile l'origine dei prodotti freschi. I controlli sono affidati alla polizia annonaria, che può effettuare verifiche senza preavviso. Le violazioni comportano sanzioni pecuniarie; in caso di recidiva è prevista la sospensione della licenza fino a trenta giorni. Il regolamento entrerà pienamente in vigore dopo un periodo informativo di tre mesi rivolto agli operatori.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Ogni violazione comporta la sospensione immediata della licenza." },
        { letter: "B", text: "L'obbligo di esporre l'origine riguarda anche i prodotti confezionati." },
        { letter: "C", text: "Le sanzioni pecuniarie sono state abolite dal nuovo regolamento." },
        { letter: "D", text: "La sospensione della licenza non scatta necessariamente alla prima violazione." }
      ],
      correct: ["D"],
      explanation: "La sospensione è prevista \"in caso di recidiva\": alla prima violazione si applicano le sanzioni pecuniarie, quindi la sospensione non è automatica al primo episodio, come dice D. A contraddice questa gradualità; B estende l'obbligo dai prodotti freschi ai confezionati; C capovolge il testo, che le sanzioni le introduce.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1037, batch: 2,
      passage: "Il teatro comunale ha riaperto dopo tre anni di restauro. L'intervento ha riportato alla luce le decorazioni originali del loggione e ha adeguato gli impianti alle norme di sicurezza; la capienza è passata da quattrocentottanta a cinquecentoventi posti. La stagione inaugurale prevede quindici titoli, dei quali nove sono produzioni proprie del teatro e i restanti ospitalità di compagnie esterne. La campagna abbonamenti si apre la prossima settimana.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La capienza del teatro è diminuita dopo il restauro." },
        { letter: "B", text: "Meno della metà dei titoli della stagione proviene da compagnie esterne." },
        { letter: "C", text: "Tutti i titoli della stagione sono produzioni proprie del teatro." },
        { letter: "D", text: "Il restauro è durato quindici anni." }
      ],
      correct: ["B"],
      explanation: "Su quindici titoli, nove sono produzioni proprie: le ospitalità esterne sono quindi sei, meno della metà (7,5): B segue con un semplice calcolo dai numeri del brano. A contraddice l'aumento da 480 a 520; C contraddice la presenza di ospitalità esterne; D confonde i quindici titoli con la durata del restauro (tre anni).",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1038, batch: 2,
      passage: "Il servizio di car sharing a flusso libero attivo da questo mese opera esclusivamente entro i confini comunali. Le vetture possono essere prelevate e lasciate soltanto nelle aree consentite indicate dall'app, che segnala in tempo reale anche il livello di carica dei veicoli, tutti elettrici. Le tariffe al minuto includono ricarica, assicurazione e parcheggio nelle strisce blu. Nei primi quindici giorni il servizio ha registrato dodicimila noleggi.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Il servizio copre l'intera area metropolitana." },
        { letter: "B", text: "Il costo della ricarica è escluso dalla tariffa." },
        { letter: "C", text: "Non è possibile terminare il noleggio in un punto qualsiasi della città." },
        { letter: "D", text: "Il servizio è gratuito per i residenti." }
      ],
      correct: ["C"],
      explanation: "Le vetture si possono lasciare \"soltanto nelle aree consentite\": dunque non ovunque, come afferma C. A estende l'ambito oltre i confini comunali dichiarati; B contraddice l'inclusione della ricarica in tariffa; D introduce una gratuità che il brano non menziona. Il \"soltanto\" è la parola che decide il quesito.",
      tag: "quantificatore", difficulty: 1
    },
    {
      id: 1039, batch: 2,
      passage: "Il corso di aggiornamento sulla didattica digitale è rivolto ai docenti di ruolo delle scuole secondarie della provincia. Il percorso prevede quaranta ore complessive, per metà in presenza presso il polo formativo e per metà su piattaforma online, con laboratori pratici sulla progettazione di attività interattive. Il completamento del corso dà diritto a crediti formativi riconosciuti. Le iscrizioni chiudono al raggiungimento dei centoventi posti disponibili.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Il corso si svolge interamente online." },
        { letter: "B", text: "Il corso ha una durata di ottanta ore." },
        { letter: "C", text: "Il completamento del corso non dà diritto ad alcun credito." },
        { letter: "D", text: "Una parte del corso non si svolge online." }
      ],
      correct: ["D"],
      explanation: "Metà delle quaranta ore si tiene in presenza: quindi una parte non è online, come dice D (ed è per questo che A è falsa). B raddoppia la durata dichiarata; C nega i crediti che il brano attribuisce esplicitamente al completamento. La coppia A/D mostra la stessa informazione letta nei due versi: solo la versione prudente è sostenibile.",
      tag: "negazione", difficulty: 1
    },
    {
      id: 1040, batch: 2,
      passage: "L'allevamento sperimentale di trote avviato nella valle utilizza un sistema a ricircolo che reimmette in vasca il novantacinque per cento dell'acqua dopo la filtrazione. I reflui residui, ricchi di nutrienti, vengono trattati e ceduti come fertilizzante a un'azienda agricola confinante. La produzione del primo anno, pari a otto tonnellate, è stata destinata interamente ai ristoranti della zona, con consegne bisettimanali a chilometro zero.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'acqua utilizzata viene interamente scaricata dopo ogni ciclo." },
        { letter: "B", text: "Nel primo anno la produzione non è stata venduta alla grande distribuzione." },
        { letter: "C", text: "I reflui dell'allevamento non trovano alcun impiego." },
        { letter: "D", text: "La produzione del primo anno ha superato le dieci tonnellate." }
      ],
      correct: ["B"],
      explanation: "Se la produzione è andata \"interamente ai ristoranti della zona\", nessuna quota è finita ad altri canali, grande distribuzione inclusa: B è il rovescio logico dell'\"interamente\". A contraddice il ricircolo del 95%; C contraddice l'uso dei reflui come fertilizzante; D contraddice le otto tonnellate dichiarate.",
      tag: "quantificatore", difficulty: 2
    },
    {
      id: 1041, batch: 2,
      passage: "Il censimento primaverile dell'avifauna nella riserva ha registrato centoquarantadue specie, sette in più rispetto all'edizione dell'anno precedente. Tra le nuove presenze figurano due specie tipiche delle zone umide, il cui ritorno viene collegato dai curatori al ripristino dei canneti lungo la sponda orientale. Il conteggio è affidato a squadre di volontari appositamente formati, coordinate dal personale scientifico della riserva.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Nell'edizione precedente erano state registrate centotrentacinque specie." },
        { letter: "B", text: "Il numero di specie registrate è diminuito rispetto all'anno precedente." },
        { letter: "C", text: "Il conteggio è svolto esclusivamente da personale scientifico retribuito." },
        { letter: "D", text: "Tutte le nuove presenze sono specie tipiche delle zone umide." }
      ],
      correct: ["A"],
      explanation: "142 specie, \"sette in più\" dell'anno prima: 142 − 7 = 135, come afferma A. B contraddice l'aumento; C contraddice l'affidamento del conteggio ai volontari; D trasforma \"due tra le nuove presenze\" in \"tutte le nuove presenze\", gonfiando il quantificatore. Il calcolo elementare è spesso il ponte tra brano e risposta.",
      tag: "quantificatore", difficulty: 1
    },
    {
      id: 1042, batch: 2,
      passage: "L'ostello di montagna riaperto dopo la ristrutturazione dispone di sessanta posti letto distribuiti in camerate e stanze familiari. L'apertura è stagionale, da aprile a ottobre, in coincidenza con la percorribilità dei sentieri di alta quota. Il piano terra ospita uno spazio comune con caffetteria, aperto durante il giorno anche ai non ospiti, pensato come punto di appoggio per gli escursionisti di passaggio.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'ostello è aperto tutto l'anno." },
        { letter: "B", text: "Nel mese di gennaio l'ostello non accoglie ospiti." },
        { letter: "C", text: "Lo spazio comune è riservato esclusivamente agli ospiti dell'ostello." },
        { letter: "D", text: "L'ostello dispone di centosessanta posti letto." }
      ],
      correct: ["B"],
      explanation: "L'apertura va da aprile a ottobre: gennaio cade fuori dal periodo di attività, quindi in quel mese l'ostello non accoglie ospiti — un'inferenza sicura dal calendario dichiarato. A contraddice la stagionalità; C contraddice l'apertura diurna ai non ospiti; D decuplica la capienza. Le date nel brano vanno proiettate sul caso chiesto.",
      tag: "tempo", difficulty: 1
    },
    {
      id: 1043, batch: 2,
      passage: "La comunità energetica di quartiere riunisce ottantacinque famiglie e tre piccole imprese attorno a un impianto fotovoltaico condiviso installato sul tetto della scuola. Secondo il primo bilancio annuale, l'impianto copre in media il quaranta per cento dei consumi elettrici complessivi dei membri. L'adesione è volontaria e aperta ai residenti del quartiere; l'assemblea dei soci decide ogni anno la destinazione degli incentivi maturati.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'impianto copre l'intero fabbisogno elettrico dei membri." },
        { letter: "B", text: "L'adesione alla comunità è obbligatoria per i residenti del quartiere." },
        { letter: "C", text: "In media, la maggior parte dei consumi dei membri non è coperta dall'impianto condiviso." },
        { letter: "D", text: "Le imprese aderenti sono più numerose delle famiglie." }
      ],
      correct: ["C"],
      explanation: "Se l'impianto copre in media il 40% dei consumi, il restante 60% — la maggior parte — non è coperto: C segue aritmeticamente. A contraddice la copertura parziale; B contraddice l'adesione volontaria; D inverte i numeri (tre imprese contro ottantacinque famiglie). Il complemento a cento è un'inferenza legittima, non un salto.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1044, batch: 2,
      passage: "Lo sportello comunale per i nuovi residenti offre un servizio di traduzione automatica dei documenti informativi in dodici lingue, consultabile dai totem della sede e dal sito. Per gli atti con valore legale resta obbligatoria la traduzione certificata eseguita da professionisti iscritti all'albo. Il servizio automatico è gratuito e, secondo la rilevazione interna, ha ridotto di un terzo i tempi medi di attesa allo sportello.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Per gli atti con valore legale la traduzione automatica non è sufficiente." },
        { letter: "B", text: "Il servizio di traduzione automatica è a pagamento." },
        { letter: "C", text: "Il servizio automatico ha sostituito i traduttori professionisti in ogni ambito." },
        { letter: "D", text: "Il servizio copre tutte le lingue ufficiali dell'Unione europea." }
      ],
      correct: ["A"],
      explanation: "Per gli atti legali \"resta obbligatoria\" la traduzione certificata: quindi l'automatica da sola non basta, come dice A. B contraddice la gratuità; C è smentita proprio dall'obbligo di certificazione negli atti legali; D pretende una corrispondenza tra le dodici lingue del servizio e le lingue ufficiali UE che il brano non stabilisce.",
      tag: "scope", difficulty: 1
    },
    {
      id: 1045, batch: 2,
      passage: "Il prolungamento della linea metropolitana verso il quadrante nord prevede tre nuove stazioni, una delle quali servirà direttamente il policlinico. Lo scavo della galleria procede da nove mesi senza interruzioni e ha superato il primo chilometro. Il completamento dell'opera e l'apertura al servizio viaggiatori sono previsti tra quattro anni, dopo la fase di collaudo degli impianti e delle banchine.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Lo scavo della galleria si è fermato più volte." },
        { letter: "B", text: "Il tratto prolungato è già in esercizio per i viaggiatori." },
        { letter: "C", text: "Tutte le nuove stazioni serviranno direttamente il policlinico." },
        { letter: "D", text: "L'opera non è ancora stata completata." }
      ],
      correct: ["D"],
      explanation: "Il completamento è \"previsto tra quattro anni\": l'opera, oggi, non è finita — D è la conseguenza immediata. A contraddice lo scavo \"senza interruzioni\"; B anticipa un'apertura che il brano colloca dopo collaudo e completamento; C estende a tutte le stazioni un collegamento che riguarda una sola di esse.",
      tag: "tempo", difficulty: 1
    },
    {
      id: 1046, batch: 2,
      passage: "Il premio giornalistico intitolato alla cronista scomparsa è riservato a inchieste già pubblicate nell'anno solare precedente da testate registrate. La giuria, composta da sette membri tra giornalisti e docenti, valuta rigore delle fonti, rilevanza pubblica e qualità della scrittura. Il vincitore non riceve un premio in denaro di libero utilizzo: gli viene assegnato un contributo vincolato alla realizzazione di un nuovo progetto d'inchiesta.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "Possono concorrere anche inchieste non ancora pubblicate." },
        { letter: "B", text: "Il riconoscimento economico è vincolato a un nuovo progetto d'inchiesta." },
        { letter: "C", text: "La giuria è composta da nove membri." },
        { letter: "D", text: "Il vincitore riceve una somma di denaro senza vincoli di utilizzo." }
      ],
      correct: ["B"],
      explanation: "Il contributo è \"vincolato alla realizzazione di un nuovo progetto\": B lo riporta fedelmente. A contraddice il requisito della pubblicazione avvenuta; C altera il numero dei giurati; D afferma l'esatto contrario della clausola sul denaro \"non di libero utilizzo\". Le negazioni nel brano vanno conservate, non dissolte.",
      tag: "negazione", difficulty: 1
    },
    {
      id: 1047, batch: 2,
      passage: "La campagna di vaccinazione antirabbica gratuita promossa dall'azienda sanitaria riguarda cani e gatti dei comuni montani della provincia. Nei primi due mesi è stato vaccinato il settanta per cento dei cani registrati nell'area interessata, con adesioni superiori alle attese. La campagna proseguirà fino a dicembre con ambulatori mobili nei paesi più isolati, per raggiungere anche gli animali dei nuclei rurali sparsi.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "La campagna di vaccinazione si è già conclusa." },
        { letter: "B", text: "La vaccinazione proposta dalla campagna è a pagamento." },
        { letter: "C", text: "Una parte dei cani registrati nell'area non è ancora stata vaccinata." },
        { letter: "D", text: "La campagna riguarda tutte le specie di animali domestici." }
      ],
      correct: ["C"],
      explanation: "Vaccinato il 70% dei cani registrati nei primi due mesi, con campagna ancora in corso: il restante 30% non è ancora stato vaccinato — C segue dal complemento. A contraddice la prosecuzione fino a dicembre; B contraddice la gratuità; D allarga da \"cani e gatti\" a tutte le specie domestiche, oltre l'ambito dichiarato.",
      tag: "inferenza", difficulty: 2
    },
    {
      id: 1048, batch: 2,
      passage: "La funivia che collega il paese alla stazione sciistica copre il dislivello in dodici minuti, con cabine da trentacinque posti. Nella stagione estiva l'impianto trasporta anche le biciclette, a supporto dei percorsi di discesa realizzati sul versante. Ogni anno, nel mese di maggio, l'impianto resta chiuso per la manutenzione programmata delle funi e dei sistemi di sicurezza, come previsto dal piano di esercizio.",
      question: "Quale delle seguenti affermazioni è supportata dal brano?",
      options: [
        { letter: "A", text: "L'impianto è in funzione tutto l'anno senza interruzioni." },
        { letter: "B", text: "Il trasporto delle biciclette è consentito in ogni stagione." },
        { letter: "C", text: "Il tragitto della funivia dura più di mezz'ora." },
        { letter: "D", text: "Nel mese di maggio l'impianto non è in funzione." }
      ],
      correct: ["D"],
      explanation: "Il brano dichiara la chiusura annuale a maggio per manutenzione: D ne è la diretta conseguenza. A contraddice questa chiusura programmata; B estende all'intero anno un servizio che il testo limita alla stagione estiva; C contraddice i dodici minuti dichiarati. Quando il brano fissa un calendario, le eccezioni annunciate valgono quanto la regola.",
      tag: "tempo", difficulty: 1
    }
  ]
});
