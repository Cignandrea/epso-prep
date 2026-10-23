"""Indizi che non dovrebbero predire la risposta nel verbale di livello prova (tools/source-v2/verbale-l2-*.json).
Uso: python3 tools/stats-l2.py  — parole «spia» nelle chiavi e nei distrattori, posizione della chiave per lunghezza, lettere."""
import json, glob, re, os
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
items = []
for f in sorted(glob.glob(os.path.join(HERE, 'source-v2', 'verbale-l2-*.json'))):
    d = json.load(open(f, encoding='utf-8'))
    items += (d['items'] if isinstance(d, dict) and 'items' in d else d)
items = [q for q in items if q.get('status') != 'dropped']
WORDS = {
    'già': r'\bgià\b', 'ancora': r'\bancora\b',
    'solo/soltanto/esclusivamente': r'\b(solo|soltanto|esclusivamente|unicamente|solamente)\b',
    'tutti/ogni/qualsiasi': r'\b(tutti|tutte|tutto|ogni|qualsiasi|qualunque)\b',
    'nessun/mai/sempre': r'\b(nessun\w*|mai|sempre)\b',
    'in ogni caso/comunque': r'\b(in ogni caso|comunque|in nessun caso)\b',
    'non': r'\bnon\b', 'cifre': r'\d',
    # nessi causali: una chiave causale va bene se il nesso lo dà il brano; non devono stare quasi solo nei distrattori
    'causali (perché, grazie a…)': (r"(?<!\w)(?:perch[éè]|poich[éè]|giacch[éè]|siccome|quindi|pertanto|perciò|di conseguenza|per questo|"
        r"in quanto|dato che|visto che|grazie a|a causa d|per effetto d|per via d|in seguito a|dovut[oaie](?: \w+){0,2} a|"
        r"si dev(?:e|ono)(?: \w+){0,3} a|dipend\w*(?: \w+){0,2} d(?:a|al|allo|alla|ai|agli|alle|all')(?!\w)|"
        r"determin(?:a|ano|ato|ata|ati|ate|ò|arono)(?!\w)|provoc\w*|causat\w*|(?:è|sono|era|erano) la causa|causa principale|"
        r"causa (?:l'|il |la |lo |i |gli |le )|spieg(?:a|ano|ava|avano)(?!\w)|ha(?:nno)? portato a|"
        r"(?:fa|fanno|ha fatto|hanno fatto|fece|fecero) (?:aumentare|diminuire|crescere|calare|salire|scendere|peggiorare|migliorare|scattare))"),
}
n = len(items)
stats = {w: [0, 0] for w in WORDS}
rank = Counter()
for q in items:
    key = q['correct'][0]
    texts = {o['letter']: o['text'] for o in q['options']}
    order = sorted(texts, key=lambda l: len(texts[l]))
    rank[order.index(key)] += 1
    for w, rx in WORDS.items():
        for l, t in texts.items():
            if re.search(rx, t, re.I): stats[w][0 if l == key else 1] += 1
print(f'{n} quesiti: {n} chiavi, {3 * n} distrattori')
for w, (k, d) in stats.items():
    print(f'  {w:32s} chiavi {k:3d} ({k / n:4.0%})   distrattori {d:3d} ({d / (3 * n):4.0%})')
print('  posizione della chiave per lunghezza (0 = la più corta … 3 = la più lunga):', {k: f'{v} ({v / n:.0%})' for k, v in sorted(rank.items())})
print('  lettere delle chiavi:', dict(sorted(Counter(q['correct'][0] for q in items).items())))
