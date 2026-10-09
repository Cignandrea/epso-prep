// ═══ EU Prep Suite — Cartuccia: DIGITAL SKILLS · Batteria 2 ═══
// Aree DigComp 2.2 n. 4–5: sicurezza, protezione dei dati, benessere digitale,
// risoluzione di problemi; più i fondamenti di IA richiamati da DigComp 2.2.
// 24 scenari MCQ a 4 opzioni. Id 4025–4048, batch 2.
// NOTA D'ESAME (bando EPSO/AD/427/26): la prova reale è 40 domande in 30 minuti
// (~45 secondi a domanda) e si svolge nella LINGUA 2 del candidato.

registerBank({
  id: 'digital',
  questions: [
    {
      id: 4025, batch: 2,
      question: "Ricevi un'email: \"Il suo account sarà sospeso entro 24 ore. Clicchi qui per verificare le credenziali\" da un mittente \"assistenza@bancaa-sicura.info\". Quali elementi indicano un probabile tentativo di phishing?",
      options: [
        { letter: "A", text: "Il tono urgente, la richiesta di credenziali tramite link e il dominio del mittente che non corrisponde a quello ufficiale" },
        { letter: "B", text: "La presenza di un oggetto nell'email" },
        { letter: "C", text: "Il fatto che l'email sia scritta in italiano" },
        { letter: "D", text: "Nessuno: le banche chiedono normalmente le credenziali via email" }
      ],
      correct: ["A"],
      explanation: "La triade classica del phishing: pressione temporale (\"entro 24 ore\"), richiesta di credenziali tramite link e dominio contraffatto che imita quello legittimo. Gli istituti seri non chiedono mai le credenziali via email: in caso di dubbio si accede al sito digitando l'indirizzo ufficiale, mai dal link. Area DigComp 4.1: proteggere i dispositivi (riconoscere rischi e minacce).",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4026, batch: 2,
      question: "Quale tra queste è la password più robusta?",
      options: [
        { letter: "A", text: "andrea1980" },
        { letter: "B", text: "Password123!" },
        { letter: "C", text: "Trave-Lumaca-92-Ottone!" },
        { letter: "D", text: "qwerty" }
      ],
      correct: ["C"],
      explanation: "Una passphrase lunga composta da parole non correlate, con numeri e simboli, offre entropia elevata ed è memorizzabile. Nome+anno di nascita e sequenze di tastiera sono tra le prime cose provate dagli attacchi; \"Password123!\" rispetta formalmente le regole ma è in tutti i dizionari di attacco. Buona pratica complementare: password uniche per ogni servizio, gestite con un password manager. Area DigComp 4.1/4.2.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4027, batch: 2,
      question: "Che cos'è l'autenticazione a due fattori (2FA)?",
      options: [
        { letter: "A", text: "L'uso di due password diverse per lo stesso account" },
        { letter: "B", text: "Un metodo che richiede, oltre alla password, un secondo elemento di verifica (es. codice temporaneo su app, SMS o chiave fisica)" },
        { letter: "C", text: "Il cambio della password due volte all'anno" },
        { letter: "D", text: "L'accesso consentito da due soli dispositivi" }
      ],
      correct: ["B"],
      explanation: "La 2FA combina due fattori di natura diversa: qualcosa che sai (password) più qualcosa che hai (codice temporaneo, app di autenticazione, chiave hardware) o che sei (biometria). Anche se la password viene rubata, l'accesso resta bloccato senza il secondo fattore: è la singola misura più efficace per proteggere gli account. Area DigComp 4.1/4.2.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4028, batch: 2,
      question: "Il lucchetto e il prefisso https:// nella barra del browser garantiscono che…",
      options: [
        { letter: "A", text: "Il sito è gestito da un'azienda affidabile e i contenuti sono veritieri" },
        { letter: "B", text: "Il sito non contiene virus" },
        { letter: "C", text: "La connessione tra il tuo dispositivo e il sito è cifrata" },
        { letter: "D", text: "Il sito è approvato dalle autorità europee" }
      ],
      correct: ["C"],
      explanation: "HTTPS garantisce solo che la comunicazione è cifrata (nessuno può leggerla in transito): non dice nulla sull'affidabilità del gestore o sulla veridicità dei contenuti — anche i siti di phishing usano HTTPS. La trappola è scambiare la sicurezza del canale per la legittimità dell'interlocutore. Area DigComp 4.1.",
      tag: "sicurezza", difficulty: 2
    },
    {
      id: 4029, batch: 2,
      question: "Sei connesso al Wi-Fi gratuito di un aeroporto. Quale comportamento è più prudente?",
      options: [
        { letter: "A", text: "Approfittarne per accedere all'home banking e fare bonifici" },
        { letter: "B", text: "Evitare operazioni sensibili, oppure proteggere il traffico con una VPN affidabile" },
        { letter: "C", text: "Disattivare l'antivirus per velocizzare la connessione" },
        { letter: "D", text: "Condividere la cartella documenti per collaborare più facilmente" }
      ],
      correct: ["B"],
      explanation: "Le reti Wi-Fi pubbliche possono essere intercettate o contraffatte (reti \"gemelle\"): la prudenza impone di rinviare le operazioni sensibili o di cifrare il traffico con una VPN, mantenendo attive le protezioni e la condivisione file disattivata. Area DigComp 4.1: proteggere i dispositivi e i dati nelle reti non fidate.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4030, batch: 2,
      question: "Perché è importante installare tempestivamente gli aggiornamenti del sistema operativo e delle applicazioni?",
      options: [
        { letter: "A", text: "Solo per avere nuove funzioni grafiche" },
        { letter: "B", text: "Non è importante: se tutto funziona, meglio non toccare nulla" },
        { letter: "C", text: "Per obbligo di legge" },
        { letter: "D", text: "Perché correggono vulnerabilità di sicurezza note, che altrimenti restano sfruttabili dagli attaccanti" }
      ],
      correct: ["D"],
      explanation: "Gli aggiornamenti contengono in gran parte correzioni di vulnerabilità già note e documentate: rimandare significa lasciare aperte porte che gli attaccanti conoscono. Molti attacchi su larga scala sfruttano proprio sistemi non aggiornati. Impostare gli aggiornamenti automatici è la pratica raccomandata. Area DigComp 4.1.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4031, batch: 2,
      question: "Che cos'è un ransomware?",
      options: [
        { letter: "A", text: "Un programma che velocizza il computer" },
        { letter: "B", text: "Un malware che cifra i file della vittima e chiede un riscatto per restituirne l'accesso" },
        { letter: "C", text: "Un filtro antispam avanzato" },
        { letter: "D", text: "Un componente hardware per il backup" }
      ],
      correct: ["B"],
      explanation: "Il ransomware cifra i dati (o blocca il sistema) e chiede un riscatto, spesso in criptovaluta; si diffonde tipicamente tramite allegati, link malevoli o vulnerabilità non corrette. La difesa più efficace non è pagare (sconsigliato: non garantisce nulla) ma prevenire: backup regolari e scollegati, aggiornamenti, prudenza con gli allegati. Area DigComp 4.1.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4032, batch: 2,
      question: "In cosa consiste la strategia di backup \"3-2-1\"?",
      options: [
        { letter: "A", text: "Tre copie dei dati, su due supporti diversi, di cui una conservata fuori sede (o offline)" },
        { letter: "B", text: "Tre backup al giorno, due alla settimana, uno al mese" },
        { letter: "C", text: "Tre password, due antivirus, un firewall" },
        { letter: "D", text: "Tre dispositivi collegati, due accesi, uno spento" }
      ],
      correct: ["A"],
      explanation: "La regola 3-2-1: almeno tre copie dei dati, su due tipi di supporto diversi, con una copia fuori sede o offline — così un singolo evento (guasto, furto, ransomware, incendio) non può distruggere tutto. Un backup sempre collegato al computer può essere cifrato dal ransomware insieme all'originale: la copia \"fredda\" è ciò che salva. Area DigComp 4.1/1.3.",
      tag: "sicurezza", difficulty: 2
    },
    {
      id: 4033, batch: 2,
      question: "Ai sensi del GDPR, quale dei seguenti è un dato personale?",
      options: [
        { letter: "A", text: "La temperatura media di una città" },
        { letter: "B", text: "Il numero totale di dipendenti di un'azienda" },
        { letter: "C", text: "L'indirizzo email nominativo di una persona (es. nome.cognome@dominio.it)" },
        { letter: "D", text: "Il prezzo di listino di un prodotto" }
      ],
      correct: ["C"],
      explanation: "È dato personale qualsiasi informazione relativa a una persona fisica identificata o identificabile: un indirizzo email nominativo identifica una persona, quindi rientra pienamente (come nome, foto, ID online, dati di localizzazione). Statistiche aggregate e dati su cose o aziende in quanto tali non sono dati personali. Area DigComp 4.2: proteggere i dati personali e la privacy.",
      tag: "sicurezza", difficulty: 2
    },
    {
      id: 4034, batch: 2,
      question: "Vuoi che un servizio online cancelli i dati personali che ti riguardano, non più necessari. In base al GDPR, che cosa puoi fare?",
      options: [
        { letter: "A", text: "Nulla: una volta forniti, i dati appartengono al servizio" },
        { letter: "B", text: "Esercitare il diritto alla cancellazione (\"diritto all'oblio\") presso il titolare del trattamento e, in caso di mancata risposta, rivolgerti all'autorità per la protezione dei dati" },
        { letter: "C", text: "Denunciare direttamente il servizio alla polizia postale, unico canale previsto" },
        { letter: "D", text: "Cancellare l'app dal telefono: questo elimina automaticamente i dati dai server" }
      ],
      correct: ["B"],
      explanation: "Il GDPR attribuisce alle persone diritti azionabili: accesso, rettifica, cancellazione (oblio), portabilità, opposizione. La richiesta va al titolare del trattamento (il servizio), che deve rispondere entro i termini; in caso di inerzia ci si può rivolgere all'autorità garante nazionale. Disinstallare un'app non tocca i dati sui server. Area DigComp 4.2.",
      tag: "sicurezza", difficulty: 2
    },
    {
      id: 4035, batch: 2,
      question: "Che cos'è l'\"impronta digitale\" (digital footprint) di una persona?",
      options: [
        { letter: "A", text: "L'insieme delle tracce e dei contenuti che una persona lascia online, attivamente o passivamente, e che ne formano la reputazione digitale" },
        { letter: "B", text: "La scansione del dito usata per sbloccare il telefono" },
        { letter: "C", text: "Il numero di follower sui social" },
        { letter: "D", text: "Un virus che ruba l'identità" }
      ],
      correct: ["A"],
      explanation: "L'impronta digitale comprende ciò che pubblichiamo (post, commenti, foto) e le tracce passive (cronologie, dati di navigazione, tag altrui): è persistente, ricercabile e concorre alla reputazione, anche professionale. Gestirla — impostazioni di privacy, riflessione prima di pubblicare, ricerca periodica del proprio nome — è parte della gestione dell'identità digitale. Aree DigComp 2.6 e 4.2.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4036, batch: 2,
      question: "Ti accorgi che le notifiche continue frammentano la tua concentrazione durante il lavoro. Quale approccio riflette una buona gestione del benessere digitale?",
      options: [
        { letter: "A", text: "Tenere tutte le notifiche attive: potrebbero essere urgenti" },
        { letter: "B", text: "Configurare modalità di concentrazione o \"non disturbare\", disattivando le notifiche non essenziali in fasce orarie dedicate al lavoro profondo" },
        { letter: "C", text: "Eliminare ogni strumento digitale dal lavoro" },
        { letter: "D", text: "Controllare il telefono più spesso, così le notifiche non si accumulano" }
      ],
      correct: ["B"],
      explanation: "Il benessere digitale non è rinuncia alla tecnologia ma governo intenzionale: modalità di concentrazione, notifiche selettive e fasce protette riducono il costo cognitivo delle interruzioni preservando la reperibilità per ciò che conta. DigComp 2.2 include salute e benessere tra le competenze dell'area sicurezza. Area 4.3: proteggere la salute e il benessere.",
      tag: "benessere", difficulty: 1
    },
    {
      id: 4037, batch: 2,
      question: "Quale comportamento riduce l'impatto ambientale dell'uso delle tecnologie digitali?",
      options: [
        { letter: "A", text: "Sostituire lo smartphone ogni anno per avere sempre l'ultimo modello" },
        { letter: "B", text: "Tenere acceso il computer anche di notte per evitare l'usura dell'accensione" },
        { letter: "C", text: "Prolungare la vita dei dispositivi (riparazione, aggiornamento), spegnere ciò che non si usa e fare pulizia dei dati archiviati inutilmente nel cloud" },
        { letter: "D", text: "Stampare le email importanti per conservarle senza consumare server" }
      ],
      correct: ["C"],
      explanation: "La quota maggiore dell'impronta ambientale dei dispositivi sta nella produzione: allungarne la vita è la leva principale, insieme a spegnere gli apparecchi inutilizzati e limitare l'archiviazione superflua (i data center consumano energia). L'UE spinge in questa direzione con il diritto alla riparazione e l'ecodesign. Area DigComp 4.4: proteggere l'ambiente.",
      tag: "benessere", difficulty: 1
    },
    {
      id: 4038, batch: 2,
      question: "Il tuo computer non si connette a internet, mentre il telefono sulla stessa rete Wi-Fi funziona. Qual è la sequenza di verifica più razionale?",
      options: [
        { letter: "A", text: "Reinstallare subito il sistema operativo" },
        { letter: "B", text: "Verificare i passaggi di base sul computer: Wi-Fi attivo, modalità aereo, riavvio, poi eventualmente le impostazioni di rete — isolando così il problema al dispositivo" },
        { letter: "C", text: "Sostituire il router, che è certamente guasto" },
        { letter: "D", text: "Chiamare l'assistenza dicendo solo \"non funziona niente\"" }
      ],
      correct: ["B"],
      explanation: "Il telefono che funziona esclude router e linea: il problema è isolato al computer. La diagnosi procede dal semplice al complesso (interruttore Wi-Fi, modalità aereo, riavvio, impostazioni di rete) cambiando una variabile alla volta. Reinstallare o sostituire hardware prima di aver isolato il guasto spreca tempo e denaro; all'assistenza si arriva con la descrizione precisa di cosa si è già verificato. Area DigComp 5.1: risolvere problemi tecnici.",
      tag: "problem-solving", difficulty: 1
    },
    {
      id: 4039, batch: 2,
      question: "Un documento inviato alla stampante di rete non viene stampato. Quale primo controllo è più sensato?",
      options: [
        { letter: "A", text: "Verificare la coda di stampa e lo stato della stampante (accesa, in rete, carta e toner presenti)" },
        { letter: "B", text: "Formattare il computer" },
        { letter: "C", text: "Inviare il documento altre venti volte" },
        { letter: "D", text: "Cambiare il formato del documento da DOCX a PDF" }
      ],
      correct: ["A"],
      explanation: "Prima i controlli a costo zero e alta probabilità: coda di stampa (documenti bloccati?), stato del dispositivo (accesa, connessa, carta, toner, errori sul display). Reinviare molte volte intasa la coda; le soluzioni drastiche vengono per ultime, solo a diagnosi fatta. È il metodo generale del troubleshooting: osservare, isolare, escludere. Area DigComp 5.1.",
      tag: "problem-solving", difficulty: 1
    },
    {
      id: 4040, batch: 2,
      question: "Devi raccogliere le preferenze di 80 colleghi per la data di un evento. Quale strumento è il più adatto?",
      options: [
        { letter: "A", text: "Telefonare a ciascuno annotando le risposte su carta" },
        { letter: "B", text: "Chiedere le preferenze a voce in corridoio" },
        { letter: "C", text: "Un modulo/sondaggio online (es. Forms) che raccoglie e aggrega automaticamente le risposte" },
        { letter: "D", text: "Una catena di email in cui ognuno risponde a tutti" }
      ],
      correct: ["C"],
      explanation: "Scegliere lo strumento adeguato al bisogno è una competenza in sé: per raccogliere dati strutturati da molte persone, un modulo online aggrega le risposte in tempo reale, evita trascrizioni ed errori e produce direttamente il riepilogo. Telefonate e catene di email scalano malissimo e generano caos. Area DigComp 5.2: individuare bisogni e risposte tecnologiche.",
      tag: "problem-solving", difficulty: 1
    },
    {
      id: 4041, batch: 2,
      question: "Ti rendi conto di non saper usare le tabelle pivot, sempre più richieste nel tuo lavoro. Quale approccio riflette la competenza di \"colmare i divari digitali\" del quadro DigComp?",
      options: [
        { letter: "A", text: "Evitare tutti i compiti che le richiedono" },
        { letter: "B", text: "Riconoscere il divario e attivarsi per colmarlo: tutorial, corsi, pratica guidata, aiuto di colleghi esperti" },
        { letter: "C", text: "Delegare per sempre a un collega" },
        { letter: "D", text: "Aspettare che l'azienda organizzi un corso obbligatorio" }
      ],
      correct: ["B"],
      explanation: "L'ultima competenza del quadro (5.4) è riconoscere i propri divari di competenza digitale e attivarsi per colmarli, in autonomia o con supporto: individuare il gap, scegliere risorse di apprendimento adeguate, esercitarsi, tenersi aggiornati. L'evitamento e la delega permanente consolidano il divario; l'attesa passiva lo affida al caso. Area DigComp 5.4.",
      tag: "problem-solving", difficulty: 1
    },
    {
      id: 4042, batch: 2,
      question: "Che cosa fa, in sostanza, un modello linguistico di grandi dimensioni (LLM) come quelli alla base dei chatbot di IA generativa?",
      options: [
        { letter: "A", text: "Consulta in tempo reale un archivio certificato di verità ufficiali" },
        { letter: "B", text: "Copia le risposte da un database di domande e risposte scritte da operatori umani" },
        { letter: "C", text: "Genera testo producendo la continuazione più probabile in base ai modelli statistici appresi da grandi quantità di testi" },
        { letter: "D", text: "Comprende il mondo esattamente come un essere umano" }
      ],
      correct: ["C"],
      explanation: "Un LLM genera testo prevedendo, parola dopo parola, la continuazione più probabile secondo i modelli statistici appresi in addestramento su enormi corpora. Non consulta un archivio di verità né \"comprende\" come un umano: da qui la possibilità di risposte fluenti ma errate. DigComp 2.2 include esempi espliciti su conoscenza e uso consapevole dei sistemi di IA.",
      tag: "ai", difficulty: 2
    },
    {
      id: 4043, batch: 2,
      question: "Chiedi a un chatbot di IA i riferimenti normativi di una direttiva europea e ottieni una risposta dettagliata e sicura di sé. Qual è l'atteggiamento corretto?",
      options: [
        { letter: "A", text: "Verificare i riferimenti sulle fonti ufficiali (es. EUR-Lex) prima di usarli: i modelli possono generare informazioni plausibili ma inesatte (\"allucinazioni\")" },
        { letter: "B", text: "Fidarsi: il tono sicuro indica che la risposta è corretta" },
        { letter: "C", text: "Usare i riferimenti solo se la risposta è lunga e ben formattata" },
        { letter: "D", text: "Chiedere allo stesso chatbot se è sicuro: se conferma, è verificato" }
      ],
      correct: ["A"],
      explanation: "I modelli generativi possono produrre citazioni, numeri e riferimenti inventati con lo stesso tono sicuro delle informazioni corrette: fluenza e formattazione non sono indizi di verità, e l'autoconferma non è una verifica. Per dati fattuali critici la validazione va fatta su fonti autorevoli indipendenti. È l'estensione all'IA della competenza di valutazione critica. Aree DigComp 1.2 e uso responsabile dell'IA.",
      tag: "ai", difficulty: 1
    },
    {
      id: 4044, batch: 2,
      question: "Stai preparando una relazione che contiene dati personali di utenti e vuoi farti aiutare da un chatbot di IA pubblico. Quale comportamento è corretto?",
      options: [
        { letter: "A", text: "Incollare tutto il documento: i chatbot sono riservati per definizione" },
        { letter: "B", text: "Non inserire dati personali o informazioni riservate in strumenti non autorizzati dall'organizzazione; lavorare su versioni anonimizzate o usare solo strumenti approvati" },
        { letter: "C", text: "Inserire i dati ma chiedere al chatbot di dimenticarli alla fine" },
        { letter: "D", text: "Sostituire solo i cognomi con le iniziali: così i dati non sono più personali" }
      ],
      correct: ["B"],
      explanation: "I dati inseriti in servizi esterni escono dal perimetro di controllo dell'organizzazione e possono essere conservati o trattati dal fornitore: la regola è non immettere dati personali o riservati in strumenti non autorizzati, usando anonimizzazione vera (le iniziali spesso non bastano: la persona resta identificabile) o piattaforme approvate. Chiedere al modello di \"dimenticare\" non è una garanzia. Aree DigComp 4.2 e uso responsabile dell'IA.",
      tag: "ai", difficulty: 2
    },
    {
      id: 4045, batch: 2,
      question: "Ricevi sui social un video in cui un noto politico europeo fa dichiarazioni clamorose, ma nessuna testata ne parla. Che cosa devi considerare?",
      options: [
        { letter: "A", text: "I video non si possono falsificare: va condiviso subito" },
        { letter: "B", text: "Se il video è in alta definizione, è autentico" },
        { letter: "C", text: "Potrebbe essere un deepfake generato con l'IA: prima di crederci o condividerlo, verificare su fonti affidabili e strumenti di fact-checking" },
        { letter: "D", text: "L'assenza di notizie conferma che i media nascondono la verità" }
      ],
      correct: ["C"],
      explanation: "L'IA generativa rende possibile creare video e audio sintetici realistici (deepfake): il silenzio delle fonti affidabili su una dichiarazione clamorosa è un segnale d'allarme, non una conferma di complotto. Verifica: fonti autorevoli, fact-checker, ricerca dell'origine del filmato, incongruenze visive. Condividere senza verificare alimenta la disinformazione. Aree DigComp 1.2 e consapevolezza sull'IA.",
      tag: "ai", difficulty: 2
    },
    {
      id: 4046, batch: 2,
      question: "Che cosa sono i cookie di un sito web?",
      options: [
        { letter: "A", text: "Programmi installati per riparare il browser" },
        { letter: "B", text: "Piccoli file che il sito salva sul dispositivo per ricordare informazioni (sessione, preferenze) e, nel caso dei cookie di profilazione, tracciare la navigazione" },
        { letter: "C", text: "Virus mascherati da biscotti digitali" },
        { letter: "D", text: "Le immagini memorizzate nella cache" }
      ],
      correct: ["B"],
      explanation: "I cookie sono piccoli file di testo salvati dal browser: quelli tecnici servono al funzionamento (login, carrello, preferenze), quelli di profilazione tracciano la navigazione a fini pubblicitari e per questo richiedono il consenso — il banner che accetta o rifiuta deriva dalle norme UE su privacy e dati. Saperli gestire (rifiuto selettivo, pulizia) è parte della tutela della propria privacy. Area DigComp 4.2.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4047, batch: 2,
      question: "Ricevi da un mittente sconosciuto un allegato \"fattura_urgente.xlsm\" che, all'apertura, chiede di \"abilitare le macro\". Che cosa fai?",
      options: [
        { letter: "A", text: "Abiliti le macro: altrimenti il file non si legge" },
        { letter: "B", text: "Inoltri il file ai colleghi per sapere se lo hanno ricevuto anche loro" },
        { letter: "C", text: "Non abiliti le macro e non apri oltre: segnali l'email come sospetta al supporto IT ed elimini il messaggio" },
        { letter: "D", text: "Rispondi al mittente chiedendo se il file è sicuro" }
      ],
      correct: ["C"],
      explanation: "Le macro nei documenti Office sono un vettore classico di malware: la combinazione mittente sconosciuto + urgenza + richiesta di abilitare le macro è un segnale d'allarme da manuale. La condotta corretta: non abilitare, non diffondere, segnalare all'IT (che può bloccare la campagna per tutti) ed eliminare. Chiedere conferma al mittente malevolo non ha valore. Area DigComp 4.1.",
      tag: "sicurezza", difficulty: 1
    },
    {
      id: 4048, batch: 2,
      question: "Ti accorgi di aver inserito la password aziendale in un sito che ora riconosci come phishing. Qual è la reazione corretta?",
      options: [
        { letter: "A", text: "Cambiare immediatamente la password (e ovunque fosse riutilizzata), attivare/verificare la 2FA e avvisare subito il supporto IT dell'accaduto" },
        { letter: "B", text: "Non dirlo a nessuno per evitare figuracce e sperare che non succeda nulla" },
        { letter: "C", text: "Spegnere il computer per una settimana" },
        { letter: "D", text: "Creare un nuovo account email e abbandonare quello vecchio" }
      ],
      correct: ["A"],
      explanation: "Dopo una compromissione conta la velocità: cambio immediato della password (e di ogni account dove era riutilizzata — per questo le password vanno differenziate), verifica della 2FA e segnalazione tempestiva all'IT, che può monitorare accessi anomali e proteggere l'organizzazione. Il silenzio per imbarazzo è l'errore più dannoso: trasforma un incidente contenibile in una violazione estesa. Aree DigComp 4.1/4.2 e 5.1.",
      tag: "sicurezza", difficulty: 1
    }
  ]
});
