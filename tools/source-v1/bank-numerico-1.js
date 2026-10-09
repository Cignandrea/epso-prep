// ═══ EU Prep Suite — Cartuccia: RAGIONAMENTO NUMERICO · Batteria 1 ═══
// 24 quesiti in stile EPSO, 5 opzioni. GENERATI E VERIFICATI via Python:
// ogni risposta corretta è il risultato di un calcolo eseguito, ogni distrattore
// riproduce un errore tipico (base sbagliata, %% sommate, fattori di 10, inversioni).
// Nota EPSO: il numerico è pass/fail (peso 0 nel ranking) — allenarsi alla soglia, non oltre.
// Id 2001–2024. Batterie future: data/bank-numerico-2.js con batch: 2 e id 2025+.
registerBank({
  "id": "numerico",
  "label": "🔢 Ragionamento Numerico",
  "order": 2,
  "exam": {
    "num": 10,
    "totalMin": 20
  },
  "questions": [
    {
      "id": 2001,
      "batch": 1,
      "passage": "Un rivenditore applica uno sconto del 15% su un monitor professionale il cui prezzo di listino è 1.840 €.",
      "question": "Quanto costa il monitor dopo lo sconto?",
      "options": [
        {
          "letter": "A",
          "text": "1.564 €"
        },
        {
          "letter": "B",
          "text": "276 €"
        },
        {
          "letter": "C",
          "text": "1.524 €"
        },
        {
          "letter": "D",
          "text": "2.116 €"
        },
        {
          "letter": "E",
          "text": "1.825 €"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Sconto = 1.840 × 15% = 276 €; prezzo finale = 1.840 − 276 € = 1.564 €. Distrattori tipici: il solo valore dello sconto (276 €) e il prezzo aumentato anziché scontato.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2002,
      "batch": 1,
      "passage": "Gli abbonati di una rivista digitale sono passati da 1.250 a 1.450 in un anno.",
      "question": "Qual è stata la variazione percentuale degli abbonati?",
      "options": [
        {
          "letter": "A",
          "text": "11,6 %"
        },
        {
          "letter": "B",
          "text": "12,5 %"
        },
        {
          "letter": "C",
          "text": "16 %"
        },
        {
          "letter": "D",
          "text": "20 %"
        },
        {
          "letter": "E",
          "text": "13,79 %"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Variazione = (1.450 − 1.250) / 1.250 × 100 = 200 / 1.250 × 100 = 16 %. Trappola principale: dividere per il valore finale (200/1.450 ≈ 13,8%) invece che per quello iniziale.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2003,
      "batch": 1,
      "passage": "Dopo un aumento del 15%, il canone mensile di un servizio è di 690 €.",
      "question": "Quanto costava il canone prima dell'aumento?",
      "options": [
        {
          "letter": "A",
          "text": "600 €"
        },
        {
          "letter": "B",
          "text": "586,5 €"
        },
        {
          "letter": "C",
          "text": "610 €"
        },
        {
          "letter": "D",
          "text": "675 €"
        },
        {
          "letter": "E",
          "text": "621 €"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Prezzo iniziale × 1,15 = 690 → iniziale = 690 / 1,15 = 600 €. Trappola classica: togliere il 15% dal valore finale (690 × 0,85 = 586,50 €) — sbagliato perché il 15% era calcolato sulla base iniziale, più piccola.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2004,
      "batch": 1,
      "passage": "Bilancio annuale di un centro sportivo (migliaia di €):\nPersonale: 480\nEnergia: 130\nManutenzione: 90\nComunicazione: 60\nAltro: 40",
      "question": "Quale percentuale del bilancio totale è destinata all'Energia?",
      "options": [
        {
          "letter": "A",
          "text": "18,25 %"
        },
        {
          "letter": "B",
          "text": "16,25 %"
        },
        {
          "letter": "C",
          "text": "13 %"
        },
        {
          "letter": "D",
          "text": "27,08 %"
        },
        {
          "letter": "E",
          "text": "19,40 %"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Totale = 480+130+90+60+40 = 800 mila €. Energia = 130 / 800 × 100 = 16,25 %. Trappole: rapportare all'importo maggiore (130/480 ≈ 27,1%) o al totale al netto della voce stessa.",
      "tag": "lettura-dati",
      "difficulty": 2
    },
    {
      "id": 2005,
      "batch": 1,
      "passage": "In un'agenzia il rapporto tra tecnici e amministrativi è 7 : 3. Gli amministrativi sono 84.",
      "question": "Quanti sono i tecnici?",
      "options": [
        {
          "letter": "A",
          "text": "196"
        },
        {
          "letter": "B",
          "text": "58,8"
        },
        {
          "letter": "C",
          "text": "105"
        },
        {
          "letter": "D",
          "text": "36"
        },
        {
          "letter": "E",
          "text": "168"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Ogni \"parte\" vale 84 / 3 = 28 persone; tecnici = 28 × 7 = 196. Trappola: invertire il rapporto (84/7×3 = 36) o applicare il 7 su 10 come se fosse una frazione del totale.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2006,
      "batch": 1,
      "passage": "Un corso ha due gruppi: il gruppo A conta 18 partecipanti con punteggio medio 24; il gruppo B conta 12 partecipanti con punteggio medio 30.",
      "question": "Qual è il punteggio medio complessivo dei 30 partecipanti?",
      "options": [
        {
          "letter": "A",
          "text": "15"
        },
        {
          "letter": "B",
          "text": "28"
        },
        {
          "letter": "C",
          "text": "26,4"
        },
        {
          "letter": "D",
          "text": "26"
        },
        {
          "letter": "E",
          "text": "27"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Media ponderata = (18×24 + 12×30) / 30 = (432 + 360) / 30 = 792 / 30 = 26,4. Trappola: la media semplice delle medie (27) ignora che i gruppi hanno pesi diversi.",
      "tag": "media",
      "difficulty": 2
    },
    {
      "id": 2007,
      "batch": 1,
      "passage": "Il fatturato di un laboratorio è cresciuto del 10% il primo anno e del 20% il secondo anno, partendo da 2.000 migliaia di €.",
      "question": "Qual è il fatturato al termine del secondo anno (migliaia di €)?",
      "options": [
        {
          "letter": "A",
          "text": "2.400"
        },
        {
          "letter": "B",
          "text": "2.420"
        },
        {
          "letter": "C",
          "text": "2.640"
        },
        {
          "letter": "D",
          "text": "2.600"
        },
        {
          "letter": "E",
          "text": "2.040"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Crescite in cascata: 2.000 × 1,10 = 2.200; poi 2.200 × 1,20 = 2.640. Trappola principale: sommare le percentuali (10%+20% = 30% → 2.600), che ignora la base cresciuta del secondo anno.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2008,
      "batch": 1,
      "passage": "Un comune di 27.000 abitanti ha una spesa annua per i servizi ambientali di 3.240.000 €.",
      "question": "Qual è la spesa per abitante?",
      "options": [
        {
          "letter": "A",
          "text": "1.200 €"
        },
        {
          "letter": "B",
          "text": "12 €"
        },
        {
          "letter": "C",
          "text": "135 €"
        },
        {
          "letter": "D",
          "text": "120 €"
        },
        {
          "letter": "E",
          "text": "108 €"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Spesa pro capite = 3.240.000 / 27.000 = 120 €. Le trappole qui sono gli ordini di grandezza: uno zero in più o in meno nella divisione produce 1.200 € o 12 €.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2009,
      "batch": 1,
      "passage": "Un treno regionale percorre 216 km a una velocità media di 90 km/h.",
      "question": "Quanto dura il viaggio?",
      "options": [
        {
          "letter": "A",
          "text": "2,4 minuti"
        },
        {
          "letter": "B",
          "text": "126 minuti"
        },
        {
          "letter": "C",
          "text": "144 minuti"
        },
        {
          "letter": "D",
          "text": "2 ore e 24 minuti (in tutto 150 minuti)"
        },
        {
          "letter": "E",
          "text": "160 minuti"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Tempo = 216 / 90 = 2,4 ore = 2,4 × 60 = 144 minuti (cioè 2 h 24 min). Trappola: leggere 2,4 ore come \"2 ore e 40 minuti\" o confondere il totale in minuti (144) con 150.",
      "tag": "unita-misura",
      "difficulty": 2
    },
    {
      "id": 2010,
      "batch": 1,
      "passage": "Un'azienda agricola vende 12,5 ettolitri di succo a 0,24 € al litro.",
      "question": "Qual è il ricavo totale della vendita?",
      "options": [
        {
          "letter": "A",
          "text": "275 €"
        },
        {
          "letter": "B",
          "text": "3 €"
        },
        {
          "letter": "C",
          "text": "3.000 €"
        },
        {
          "letter": "D",
          "text": "300 €"
        },
        {
          "letter": "E",
          "text": "525 €"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "12,5 hl = 12,5 × 100 = 1.250 litri; ricavo = 1.250 × 0,24 = 300 €. Trappola: dimenticare la conversione ettolitri→litri (12,5 × 0,24 = 3 €) o sbagliare di un fattore 10.",
      "tag": "unita-misura",
      "difficulty": 1
    },
    {
      "id": 2011,
      "batch": 1,
      "passage": "Visitatori di un circuito museale per area (migliaia):\nArea — Anno 1 — Anno 2\nNord — 400 — 460\nCentro — 250 — 295\nSud — 180 — 216\nIsole — 120 — 138",
      "question": "Quale area ha registrato la crescita percentuale maggiore tra l'Anno 1 e l'Anno 2?",
      "options": [
        {
          "letter": "A",
          "text": "Nord e Sud a pari merito"
        },
        {
          "letter": "B",
          "text": "Sud (+20 %)"
        },
        {
          "letter": "C",
          "text": "Isole (+15 %)"
        },
        {
          "letter": "D",
          "text": "Centro (+18 %)"
        },
        {
          "letter": "E",
          "text": "Nord (+15 %)"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Crescite: Nord +60/400 = 15 %; Centro +45/250 = 18 %; Sud +36/180 = 20 %; Isole +18/120 = 15 %. Vince il Sud. Trappola: scegliere il Nord perché ha l'aumento assoluto maggiore (+60), confondendo valore assoluto e percentuale.",
      "tag": "lettura-dati",
      "difficulty": 2
    },
    {
      "id": 2012,
      "batch": 1,
      "passage": "Su un arredo da 900 € vengono applicati in sequenza uno sconto del 20% e un ulteriore sconto del 10% sul prezzo già scontato.",
      "question": "Qual è il prezzo finale?",
      "options": [
        {
          "letter": "A",
          "text": "792 €"
        },
        {
          "letter": "B",
          "text": "660 €"
        },
        {
          "letter": "C",
          "text": "640 €"
        },
        {
          "letter": "D",
          "text": "630 €"
        },
        {
          "letter": "E",
          "text": "648 €"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "900 × 0,80 = 720 €; poi 720 × 0,90 = 648 €. Lo sconto complessivo è del 28%, non del 30%: sommare gli sconti (900 × 0,70 = 630 €) è la trappola classica delle riduzioni in cascata.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2013,
      "batch": 1,
      "passage": "In un anno si vendono 640.000 biciclette in un paese. Il produttore Alfa detiene il 35% del mercato.",
      "question": "Quante biciclette ha venduto Alfa?",
      "options": [
        {
          "letter": "A",
          "text": "224.000"
        },
        {
          "letter": "B",
          "text": "416.000"
        },
        {
          "letter": "C",
          "text": "22.400"
        },
        {
          "letter": "D",
          "text": "230.000"
        },
        {
          "letter": "E",
          "text": "18.285,71"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "640.000 × 35% = 640.000 × 0,35 = 224.000 biciclette. Trappole: calcolare il complemento (65% = 416.000), sbagliare l'ordine di grandezza o dividere per 35.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2014,
      "batch": 1,
      "passage": "Dopo quattro prove, un candidato ha una media di 79 punti. Vuole chiudere le cinque prove con una media di almeno 82 punti.",
      "question": "Quanti punti deve ottenere almeno nella quinta prova?",
      "options": [
        {
          "letter": "A",
          "text": "85"
        },
        {
          "letter": "B",
          "text": "94"
        },
        {
          "letter": "C",
          "text": "82"
        },
        {
          "letter": "D",
          "text": "88"
        },
        {
          "letter": "E",
          "text": "91"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Totale richiesto: 5 × 82 = 410; già ottenuti: 4 × 79 = 316; quinta prova ≥ 410 − 316 = 94. Trappola: rispondere \"85\" ragionando su +3 punti \"di recupero\" senza pesare che i 3 punti mancano su ognuna delle 4 prove già fatte.",
      "tag": "media",
      "difficulty": 3
    },
    {
      "id": 2015,
      "batch": 1,
      "passage": "Un premio di 45.000 € viene diviso tra due progetti nel rapporto 5 : 4.",
      "question": "Quanto riceve il progetto con la quota maggiore?",
      "options": [
        {
          "letter": "A",
          "text": "27.000 €"
        },
        {
          "letter": "B",
          "text": "22.500 €"
        },
        {
          "letter": "C",
          "text": "9.000 €"
        },
        {
          "letter": "D",
          "text": "20.000 €"
        },
        {
          "letter": "E",
          "text": "25.000 €"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Le parti totali sono 5+4 = 9; una parte vale 45.000/9 = 5.000 €; la quota maggiore = 5 × 5.000 = 25.000 €. Trappole: assegnare la quota minore (20.000 €) o dividere per 5 come se il rapporto fosse una frazione.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2016,
      "batch": 1,
      "passage": "Un'università ha 12.000 iscritti. Il 40% frequenta corsi dell'area scientifica; di questi, il 25% è iscritto a Ingegneria.",
      "question": "Quanti studenti sono iscritti a Ingegneria?",
      "options": [
        {
          "letter": "A",
          "text": "1.200"
        },
        {
          "letter": "B",
          "text": "7.800"
        },
        {
          "letter": "C",
          "text": "1.800"
        },
        {
          "letter": "D",
          "text": "4.800"
        },
        {
          "letter": "E",
          "text": "3.000"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Area scientifica: 12.000 × 0,40 = 4.800; Ingegneria: 4.800 × 0,25 = 1.200. Trappola: sommare le percentuali (65%) o applicare il 25% direttamente al totale (3.000) — il 25% va calcolato sulla quota, non sull'intero.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2017,
      "batch": 1,
      "passage": "Produzione trimestrale di due stabilimenti (tonnellate):\nStabilimento Est: 340\nStabilimento Ovest: 425",
      "question": "Di quale percentuale la produzione dello stabilimento Ovest supera quella dello stabilimento Est?",
      "options": [
        {
          "letter": "A",
          "text": "15 %"
        },
        {
          "letter": "B",
          "text": "30 %"
        },
        {
          "letter": "C",
          "text": "20 %"
        },
        {
          "letter": "D",
          "text": "25 %"
        },
        {
          "letter": "E",
          "text": "22,5 %"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Differenza = 425 − 340 = 85; rispetto a Est: 85/340 × 100 = 25 %. Trappola: usare come base il valore maggiore (85/425 = 20%) — \"supera del…\" richiede la base del valore superato.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2018,
      "batch": 1,
      "passage": "Confezioni di cartucce compatibili:\nConfezione A: 12 pezzi a 43,20 €\nConfezione B: 8 pezzi a 30,40 €",
      "question": "Qual è il costo per pezzo della confezione più conveniente?",
      "options": [
        {
          "letter": "A",
          "text": "2,53 €"
        },
        {
          "letter": "B",
          "text": "3,6 €"
        },
        {
          "letter": "C",
          "text": "3,8 €"
        },
        {
          "letter": "D",
          "text": "3,75 €"
        },
        {
          "letter": "E",
          "text": "5,4 €"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "A: 43,20/12 = 3,6 € al pezzo; B: 30,40/8 = 3,8 € al pezzo. La più conveniente è la A, con 3,6 €. Trappola: fermarsi al prezzo totale più basso (B) senza calcolare il costo unitario, o riportare il costo unitario della confezione sbagliata.",
      "tag": "lettura-dati",
      "difficulty": 2
    },
    {
      "id": 2019,
      "batch": 1,
      "passage": "Le domande presentate a uno sportello sono state 5.500. L'8% è stato respinto per documentazione incompleta.",
      "question": "Quante domande sono state respinte per documentazione incompleta?",
      "options": [
        {
          "letter": "A",
          "text": "4.400"
        },
        {
          "letter": "B",
          "text": "550"
        },
        {
          "letter": "C",
          "text": "5.060"
        },
        {
          "letter": "D",
          "text": "480"
        },
        {
          "letter": "E",
          "text": "440"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "5.500 × 8% = 5.500 × 0,08 = 440 domande. Trappole: il complemento (92% = 5.060), la confusione tra 8% e 80%, o l'approssimazione al 10% (550).",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2020,
      "batch": 1,
      "passage": "In un distretto con 46.000 residenti si sono registrati 322 nuovi contratti di locazione in un anno.",
      "question": "Qual è il tasso di nuovi contratti ogni 1.000 residenti?",
      "options": [
        {
          "letter": "A",
          "text": "0,7"
        },
        {
          "letter": "B",
          "text": "70"
        },
        {
          "letter": "C",
          "text": "6,5"
        },
        {
          "letter": "D",
          "text": "7"
        },
        {
          "letter": "E",
          "text": "8"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Tasso = 322 / 46.000 × 1.000 = 7 contratti ogni 1.000 residenti. Trappole tipiche: sbagliare di un fattore 10 nel passaggio \"per mille\" (70 o 0,7).",
      "tag": "rapporti",
      "difficulty": 2
    },
    {
      "id": 2021,
      "batch": 1,
      "passage": "Un furgone consuma in media 6 litri di gasolio ogni 100 km. Deve completare un itinerario di 540 km.",
      "question": "Quanti litri di gasolio consumerà, in media, sull'intero itinerario?",
      "options": [
        {
          "letter": "A",
          "text": "90 litri"
        },
        {
          "letter": "B",
          "text": "324 litri"
        },
        {
          "letter": "C",
          "text": "36 litri"
        },
        {
          "letter": "D",
          "text": "27 litri"
        },
        {
          "letter": "E",
          "text": "32,4 litri"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Consumo = 540 / 100 × 6 = 5,4 × 6 = 32,4 litri. Trappola principale: dividere i km per i litri (540/6 = 90) confondendo \"litri ogni 100 km\" con \"km per litro\".",
      "tag": "unita-misura",
      "difficulty": 1
    },
    {
      "id": 2022,
      "batch": 1,
      "passage": "In un'indagine, 210 rispondenti hanno scelto l'opzione \"trasporto pubblico\", pari al 35% del totale dei rispondenti.",
      "question": "Quante persone hanno risposto all'indagine in totale?",
      "options": [
        {
          "letter": "A",
          "text": "323,08"
        },
        {
          "letter": "B",
          "text": "283,5"
        },
        {
          "letter": "C",
          "text": "600"
        },
        {
          "letter": "D",
          "text": "73,5"
        },
        {
          "letter": "E",
          "text": "735"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Totale × 35% = 210 → totale = 210 / 0,35 = 600. Trappola: moltiplicare per la percentuale invece di dividere (210 × 0,35 ≈ 74) o aggiungere il 35% (283,5): la parte nota va \"riespansa\" dividendo.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2023,
      "batch": 1,
      "passage": "Una pompa riempie da sola una cisterna in 6 ore; una seconda pompa, più potente, la riempie da sola in 3 ore. Le due pompe lavorano insieme dall'inizio.",
      "question": "In quanto tempo riempiono la cisterna lavorando insieme?",
      "options": [
        {
          "letter": "A",
          "text": "3 ore"
        },
        {
          "letter": "B",
          "text": "1 ora e 30 minuti"
        },
        {
          "letter": "C",
          "text": "4 ore e 30 minuti"
        },
        {
          "letter": "D",
          "text": "2 ore"
        },
        {
          "letter": "E",
          "text": "4 ore"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "In un'ora: la prima riempie 1/6 di cisterna, la seconda 1/3; insieme 1/6 + 1/3 = 1/2 di cisterna all'ora → tempo totale = 2 ore. Trappola: fare la media dei tempi (4,5 ore) — i tempi non si mediano, si sommano le portate.",
      "tag": "rapporti",
      "difficulty": 3
    },
    {
      "id": 2024,
      "batch": 1,
      "passage": "Un laboratorio artigianale sostiene costi fissi mensili di 8.400 €. Ogni articolo è venduto a 25 € e comporta costi variabili di 11 €.",
      "question": "Quanti articoli deve vendere in un mese per coprire esattamente i costi fissi (punto di pareggio)?",
      "options": [
        {
          "letter": "A",
          "text": "336"
        },
        {
          "letter": "B",
          "text": "600"
        },
        {
          "letter": "C",
          "text": "700"
        },
        {
          "letter": "D",
          "text": "763,64"
        },
        {
          "letter": "E",
          "text": "233,33"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Margine per articolo = 25 − 11 = 14 €; pareggio = 8.400 / 14 = 600 articoli. Trappola: dividere per il solo prezzo di vendita (336) o per i soli costi variabili, ignorando il margine unitario.",
      "tag": "media",
      "difficulty": 3
    },
    {
      "id": 2025,
      "batch": 2,
      "passage": "Un preventivo per lavori di tinteggiatura indica un imponibile di 1.250 € più IVA al 22%.",
      "question": "Qual è l'importo totale da pagare, IVA inclusa?",
      "options": [
        {
          "letter": "A",
          "text": "1.400 €"
        },
        {
          "letter": "B",
          "text": "1.525 €"
        },
        {
          "letter": "C",
          "text": "1.272 €"
        },
        {
          "letter": "D",
          "text": "975 €"
        },
        {
          "letter": "E",
          "text": "1.550 €"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Totale = 1.250 × 1,22 = 1.525 €. Trappole: sommare 22 € come cifra fissa, applicare il 12%, o sottrarre l'IVA invece di aggiungerla.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2026,
      "batch": 2,
      "passage": "Una fattura di 1.830 € è comprensiva di IVA al 22%.",
      "question": "Qual è l'imponibile (importo al netto dell'IVA)?",
      "options": [
        {
          "letter": "A",
          "text": "1.500 €"
        },
        {
          "letter": "B",
          "text": "1.480 €"
        },
        {
          "letter": "C",
          "text": "1.427,4 €"
        },
        {
          "letter": "D",
          "text": "1.610,4 €"
        },
        {
          "letter": "E",
          "text": "1.808 €"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Imponibile × 1,22 = 1.830 → imponibile = 1.830 / 1,22 = 1.500 €. Trappola classica: togliere il 22% dal lordo (1.830 × 0,78 = 1.427,40 €), che sbaglia perché il 22% era calcolato sull'imponibile, più piccolo.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2027,
      "batch": 2,
      "passage": "Il tasso di cambio è 1 € = 1,08 $.",
      "question": "Quanti dollari si ottengono cambiando 850 €?",
      "options": [
        {
          "letter": "A",
          "text": "1.530 $"
        },
        {
          "letter": "B",
          "text": "935 $"
        },
        {
          "letter": "C",
          "text": "918 $"
        },
        {
          "letter": "D",
          "text": "787,04 $"
        },
        {
          "letter": "E",
          "text": "958 $"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "850 × 1,08 = 918 $. Trappola principale: dividere invece di moltiplicare (850/1,08 ≈ 787 $), cioè applicare il cambio nel verso sbagliato.",
      "tag": "unita-misura",
      "difficulty": 1
    },
    {
      "id": 2028,
      "batch": 2,
      "passage": "Il tasso di cambio è 1 € = 1,08 $. Un acquisto online costa 648 $.",
      "question": "A quanti euro corrisponde l'acquisto?",
      "options": [
        {
          "letter": "A",
          "text": "699,84 €"
        },
        {
          "letter": "B",
          "text": "560 €"
        },
        {
          "letter": "C",
          "text": "600 €"
        },
        {
          "letter": "D",
          "text": "612 €"
        },
        {
          "letter": "E",
          "text": "635,04 €"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "648 / 1,08 = 600 €. Dal dollaro all'euro si divide per il tasso: moltiplicare (699,84 €) è l'errore di direzione più comune.",
      "tag": "unita-misura",
      "difficulty": 2
    },
    {
      "id": 2029,
      "batch": 2,
      "passage": "Una provincia conta 184.000 abitanti su una superficie di 460 km².",
      "question": "Qual è la densità di popolazione?",
      "options": [
        {
          "letter": "A",
          "text": "460 ab./km²"
        },
        {
          "letter": "B",
          "text": "4.000 ab./km²"
        },
        {
          "letter": "C",
          "text": "360 ab./km²"
        },
        {
          "letter": "D",
          "text": "400 ab./km²"
        },
        {
          "letter": "E",
          "text": "2,5 ab./km²"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Densità = 184.000 / 460 = 400 abitanti per km². Trappole: invertire il rapporto o sbagliare di un fattore 10.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2030,
      "batch": 2,
      "passage": "Un capitale di 6.000 € è investito al tasso di interesse semplice del 3% annuo per 4 anni.",
      "question": "Quanti interessi totali maturano nel periodo?",
      "options": [
        {
          "letter": "A",
          "text": "2.880 €"
        },
        {
          "letter": "B",
          "text": "753,05 €"
        },
        {
          "letter": "C",
          "text": "720 €"
        },
        {
          "letter": "D",
          "text": "600 €"
        },
        {
          "letter": "E",
          "text": "180 €"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Interesse semplice = 6.000 × 3% × 4 = 180 × 4 = 720 €. Trappole: fermarsi a un solo anno (180 €) o usare l'interesse composto (753,05 €), che qui non è richiesto.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2031,
      "batch": 2,
      "passage": "Un sondaggio su 1.200 pendolari sul mezzo usato:\nAuto: 45%\nTreno: 30%\nAltro: 25%",
      "question": "Quante persone in più usano l'auto rispetto al treno?",
      "options": [
        {
          "letter": "A",
          "text": "360"
        },
        {
          "letter": "B",
          "text": "15"
        },
        {
          "letter": "C",
          "text": "300"
        },
        {
          "letter": "D",
          "text": "180"
        },
        {
          "letter": "E",
          "text": "540"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Differenza: 45% − 30% = 15% del totale = 1.200 × 0,15 = 180 persone. Trappole: rispondere con una delle due quote assolute (540 o 360) o con il 15 \"secco\" senza applicarlo al totale.",
      "tag": "lettura-dati",
      "difficulty": 2
    },
    {
      "id": 2032,
      "batch": 2,
      "passage": "Un fornitore applica l'offerta \"4 al prezzo di 3\" su risme di carta da 6,40 € l'una. Un ufficio acquista 12 risme sfruttando l'offerta.",
      "question": "Quanto spende in totale l'ufficio?",
      "options": [
        {
          "letter": "A",
          "text": "53,76 €"
        },
        {
          "letter": "B",
          "text": "76,8 €"
        },
        {
          "letter": "C",
          "text": "64 €"
        },
        {
          "letter": "D",
          "text": "51,2 €"
        },
        {
          "letter": "E",
          "text": "57,6 €"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Con \"4 al prezzo di 3\", ogni blocco da 4 risme si paga 3: per 12 risme (3 blocchi) si pagano 9 risme = 9 × 6,40 = 57,6 €. Trappole: pagare tutte e 12, o applicare uno sconto del 30% (l'offerta equivale al 25%).",
      "tag": "rapporti",
      "difficulty": 2
    },
    {
      "id": 2033,
      "batch": 2,
      "passage": "Tre soci ripartiscono un utile di 72.000 € in proporzione alle quote 3 : 4 : 5.",
      "question": "Quanto riceve il socio con la quota maggiore?",
      "options": [
        {
          "letter": "A",
          "text": "36.000 €"
        },
        {
          "letter": "B",
          "text": "14.400 €"
        },
        {
          "letter": "C",
          "text": "18.000 €"
        },
        {
          "letter": "D",
          "text": "24.000 €"
        },
        {
          "letter": "E",
          "text": "30.000 €"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Parti totali: 3+4+5 = 12; una parte = 72.000/12 = 6.000 €; quota maggiore = 5 × 6.000 = 30.000 €. Trappole: prendere la quota intermedia (24.000 €) o dividere per il numero dei soci.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2034,
      "batch": 2,
      "passage": "Un corriere percorre 120 km all'andata a 60 km/h e gli stessi 120 km al ritorno a 40 km/h.",
      "question": "Qual è la velocità media sull'intero viaggio?",
      "options": [
        {
          "letter": "A",
          "text": "48 km/h"
        },
        {
          "letter": "B",
          "text": "55 km/h"
        },
        {
          "letter": "C",
          "text": "50 km/h"
        },
        {
          "letter": "D",
          "text": "52 km/h"
        },
        {
          "letter": "E",
          "text": "45 km/h"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Tempo andata = 120/60 = 2 h; ritorno = 120/40 = 3 h; totale 240 km in 5 h → media = 240/5 = 48 km/h. Trappola per eccellenza: la media aritmetica delle velocità (50 km/h) è sbagliata perché i tempi sulle due tratte sono diversi.",
      "tag": "media",
      "difficulty": 3
    },
    {
      "id": 2035,
      "batch": 2,
      "passage": "Dopo un calo del 15%, gli iscritti a un corso serale sono 1.224.",
      "question": "Quanti erano gli iscritti prima del calo?",
      "options": [
        {
          "letter": "A",
          "text": "1.239"
        },
        {
          "letter": "B",
          "text": "1.440"
        },
        {
          "letter": "C",
          "text": "1.040,4"
        },
        {
          "letter": "D",
          "text": "1.500"
        },
        {
          "letter": "E",
          "text": "1.407,6"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Iscritti iniziali × 0,85 = 1.224 → iniziali = 1.224 / 0,85 = 1.440. Trappola: aggiungere il 15% al valore finale (1.407,6), che usa la base sbagliata.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2036,
      "batch": 2,
      "passage": "Vendite trimestrali di due negozi (pezzi):\nNegozio — T1 — T2 — T3\nCentro — 320 — 280 — 400\nStazione — 180 — 220 — 300",
      "question": "Quanti pezzi ha venduto in totale il negozio Centro nei tre trimestri?",
      "options": [
        {
          "letter": "A",
          "text": "1.000"
        },
        {
          "letter": "B",
          "text": "700"
        },
        {
          "letter": "C",
          "text": "1.700"
        },
        {
          "letter": "D",
          "text": "940"
        },
        {
          "letter": "E",
          "text": "500"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Centro: 320 + 280 + 400 = 1.000 pezzi. Trappole: sommare la riga sbagliata (700), fermarsi a una colonna, o sommare l'intera tabella (1.700).",
      "tag": "lettura-dati",
      "difficulty": 1
    },
    {
      "id": 2037,
      "batch": 2,
      "passage": "Il canone di un software è di 200 € il primo anno. Dal secondo anno aumenta del 10%; dal terzo anno si applica un ulteriore aumento del 10% sul prezzo del secondo anno.",
      "question": "Quanto costa il canone il terzo anno?",
      "options": [
        {
          "letter": "A",
          "text": "242 €"
        },
        {
          "letter": "B",
          "text": "230 €"
        },
        {
          "letter": "C",
          "text": "247 €"
        },
        {
          "letter": "D",
          "text": "220 €"
        },
        {
          "letter": "E",
          "text": "240 €"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "200 × 1,10 = 220 € il secondo anno; 220 × 1,10 = 242 € il terzo. Sommare gli aumenti (20% → 240 €) ignora la base cresciuta: i rincari ripetuti si moltiplicano, non si sommano.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2038,
      "batch": 2,
      "passage": "In un albergo con 140 camere, il tasso di occupazione di sabato è stato del 85%.",
      "question": "Quante camere sono rimaste libere sabato?",
      "options": [
        {
          "letter": "A",
          "text": "119"
        },
        {
          "letter": "B",
          "text": "15"
        },
        {
          "letter": "C",
          "text": "55"
        },
        {
          "letter": "D",
          "text": "28"
        },
        {
          "letter": "E",
          "text": "21"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Occupate: 140 × 0,85 = 119; libere: 140 − 119 = 21 (cioè il 15% di 140). Trappole: rispondere con le occupate (119), sottrarre 85 come numero assoluto (55) o fermarsi al \"15\" percentuale.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2039,
      "batch": 2,
      "passage": "Una ricetta per 6 persone richiede 450 g di riso.",
      "question": "Quanti grammi di riso servono per 10 persone?",
      "options": [
        {
          "letter": "A",
          "text": "900 g"
        },
        {
          "letter": "B",
          "text": "750 g"
        },
        {
          "letter": "C",
          "text": "600 g"
        },
        {
          "letter": "D",
          "text": "270 g"
        },
        {
          "letter": "E",
          "text": "675 g"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Per persona: 450/6 = 75 g; per 10 persone: 75 × 10 = 750 g. Trappola: invertire la proporzione (270 g) o raddoppiare a occhio.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2040,
      "batch": 2,
      "passage": "La media di quattro rilevazioni di temperatura è 18 °C. Le prime tre rilevazioni sono 16, 19 e 20 °C.",
      "question": "Qual è la quarta rilevazione?",
      "options": [
        {
          "letter": "A",
          "text": "17 °C"
        },
        {
          "letter": "B",
          "text": "15 °C"
        },
        {
          "letter": "C",
          "text": "21 °C"
        },
        {
          "letter": "D",
          "text": "19 °C"
        },
        {
          "letter": "E",
          "text": "18 °C"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Somma richiesta: 4 × 18 = 72; prime tre: 16+19+20 = 55; quarta = 72 − 55 = 17 °C. Trappola: rispondere con la media stessa o con un valore \"a occhio\" tra i tre noti.",
      "tag": "media",
      "difficulty": 2
    },
    {
      "id": 2041,
      "batch": 2,
      "passage": "In un'azienda di 800 dipendenti, il 55% lavora in produzione. Tra i dipendenti della produzione, il 30% svolge turni notturni.",
      "question": "Quanti dipendenti svolgono turni notturni in produzione?",
      "options": [
        {
          "letter": "A",
          "text": "200"
        },
        {
          "letter": "B",
          "text": "240"
        },
        {
          "letter": "C",
          "text": "150"
        },
        {
          "letter": "D",
          "text": "680"
        },
        {
          "letter": "E",
          "text": "132"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "Produzione: 800 × 0,55 = 440; turni notturni: 440 × 0,30 = 132. Trappola: applicare il 30% all'intera azienda (240) o sommare le percentuali.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2042,
      "batch": 2,
      "passage": "Tariffe di due parcheggi:\nParcheggio A: 2,50 € l'ora\nParcheggio B: 12 € tariffa fissa giornaliera",
      "question": "Per quante ore di sosta, al minimo, il parcheggio B diventa più conveniente del parcheggio A (considerando ore intere)?",
      "options": [
        {
          "letter": "A",
          "text": "6 ore"
        },
        {
          "letter": "B",
          "text": "7 ore"
        },
        {
          "letter": "C",
          "text": "4 ore"
        },
        {
          "letter": "D",
          "text": "5 ore"
        },
        {
          "letter": "E",
          "text": "3 ore"
        }
      ],
      "correct": [
        "D"
      ],
      "explanation": "Con A: 4 ore = 10 € (meno di 12 €), 5 ore = 12,50 € (più di 12 €). Da 5 ore in su la tariffa fissa B conviene. Trappola: rispondere 4 ore, dove A costa ancora meno, o dividere 12/2,5 = 4,8 arrotondando male per difetto.",
      "tag": "lettura-dati",
      "difficulty": 3
    },
    {
      "id": 2043,
      "batch": 2,
      "passage": "Un condizionatore assorbe 1,2 kW e resta acceso 6 ore al giorno. L'energia costa 0,25 € per kWh.",
      "question": "Quanto costa il funzionamento in 30 giorni?",
      "options": [
        {
          "letter": "A",
          "text": "54 €"
        },
        {
          "letter": "B",
          "text": "45 €"
        },
        {
          "letter": "C",
          "text": "1,8 €"
        },
        {
          "letter": "D",
          "text": "9 €"
        },
        {
          "letter": "E",
          "text": "216 €"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "Energia: 1,2 × 6 × 30 = 216 kWh; costo: 216 × 0,25 = 54 €. Trappole: fermarsi al costo giornaliero (1,80 €), dimenticare le ore, o riportare i kWh come euro.",
      "tag": "unita-misura",
      "difficulty": 2
    },
    {
      "id": 2044,
      "batch": 2,
      "passage": "Lo stesso zaino costa 64 € nel negozio X e 80 € nel negozio Y.",
      "question": "Di quale percentuale il prezzo di Y supera quello di X?",
      "options": [
        {
          "letter": "A",
          "text": "80 %"
        },
        {
          "letter": "B",
          "text": "16 %"
        },
        {
          "letter": "C",
          "text": "25 %"
        },
        {
          "letter": "D",
          "text": "20 %"
        },
        {
          "letter": "E",
          "text": "30 %"
        }
      ],
      "correct": [
        "C"
      ],
      "explanation": "Differenza: 80 − 64 = 16 €; rispetto a X: 16/64 × 100 = 25%. Trappola simmetrica: 16/80 = 20% risponde a un'altra domanda (di quanto X è inferiore a Y). \"Supera del\" fissa la base nel valore superato.",
      "tag": "percentuali",
      "difficulty": 2
    },
    {
      "id": 2045,
      "batch": 2,
      "passage": "Un volo parte alle 9:40 (ora locale di partenza) e atterra alle 14:10 ora locale di destinazione. La destinazione è avanti di 2 ore rispetto alla partenza.",
      "question": "Quanto dura effettivamente il volo?",
      "options": [
        {
          "letter": "A",
          "text": "2 ore e 10 minuti"
        },
        {
          "letter": "B",
          "text": "4 ore e 30 minuti"
        },
        {
          "letter": "C",
          "text": "3 ore"
        },
        {
          "letter": "D",
          "text": "6 ore e 30 minuti"
        },
        {
          "letter": "E",
          "text": "2 ore e 30 minuti"
        }
      ],
      "correct": [
        "E"
      ],
      "explanation": "L'orario di arrivo riportato all'ora di partenza è 14:10 − 2:00 = 12:10; durata = 12:10 − 9:40 = 2 h 30 min. Trappola: sottrarre gli orari senza correggere il fuso (4 h 30 min) o correggerlo nel verso sbagliato.",
      "tag": "unita-misura",
      "difficulty": 3
    },
    {
      "id": 2046,
      "batch": 2,
      "passage": "Un festival ha venduto 8.400 biglietti. Il 25% è stato venduto in prevendita online, il resto alle casse.",
      "question": "Quanti biglietti sono stati venduti alle casse?",
      "options": [
        {
          "letter": "A",
          "text": "8.375"
        },
        {
          "letter": "B",
          "text": "6.300"
        },
        {
          "letter": "C",
          "text": "6.000"
        },
        {
          "letter": "D",
          "text": "2.100"
        },
        {
          "letter": "E",
          "text": "6.500"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "Alle casse: 75% di 8.400 = 6.300. Trappole: rispondere con la prevendita (2.100) o sottrarre 25 come numero assoluto.",
      "tag": "percentuali",
      "difficulty": 1
    },
    {
      "id": 2047,
      "batch": 2,
      "passage": "Un reparto con 16 addetti assembla 1.920 pezzi in una settimana.",
      "question": "Quanti pezzi assembla in media ogni addetto a settimana?",
      "options": [
        {
          "letter": "A",
          "text": "120"
        },
        {
          "letter": "B",
          "text": "96"
        },
        {
          "letter": "C",
          "text": "160"
        },
        {
          "letter": "D",
          "text": "24"
        },
        {
          "letter": "E",
          "text": "240"
        }
      ],
      "correct": [
        "A"
      ],
      "explanation": "1.920 / 16 = 120 pezzi per addetto a settimana. Trappole: dividere anche per i giorni (24, che risponde a un'altra domanda), o sbagliare il divisore.",
      "tag": "rapporti",
      "difficulty": 1
    },
    {
      "id": 2048,
      "batch": 2,
      "passage": "Un serbatoio da 2.400 litri contiene 1.560 litri d'acqua.",
      "question": "Qual è la percentuale di riempimento del serbatoio?",
      "options": [
        {
          "letter": "A",
          "text": "60 %"
        },
        {
          "letter": "B",
          "text": "65 %"
        },
        {
          "letter": "C",
          "text": "70 %"
        },
        {
          "letter": "D",
          "text": "35 %"
        },
        {
          "letter": "E",
          "text": "78 %"
        }
      ],
      "correct": [
        "B"
      ],
      "explanation": "1.560 / 2.400 × 100 = 65%. Trappola: il complemento (35%, cioè la parte vuota) o approssimazioni a occhio (60-70%). Il rapporto va sempre calcolato, non stimato.",
      "tag": "rapporti",
      "difficulty": 1
    }
  ]
});
