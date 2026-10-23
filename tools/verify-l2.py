"""Strumenti per la verifica cieca dei lotti del verbale L2.
  python3 tools/verify-l2.py strip K   → tools/source-v2/blind-K.json (solo brano, domanda, opzioni: niente chiave,
                                          niente trappole, niente spiegazione, niente evidenza)
  python3 tools/verify-l2.py compare K → confronta tools/source-v2/answers-K.json ({"id": "B", ...}) con le chiavi
                                          e stampa solo le discordanze
Il revisore apre solo blind-K.json finché non ha scritto answers-K.json."""
import json, os, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'source-v2')

def load(k):
    with open(os.path.join(SRC, f'verbale-l2-{k}.json'), encoding='utf-8') as f:
        return json.load(f)

def strip(k):
    items = [{'id': q['id'], 'passage': q['passage'], 'question': q['question'],
              'options': [{'letter': o['letter'], 'text': o['text']} for o in q['options']]} for q in load(k)]
    out = os.path.join(SRC, f'blind-{k}.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=1)
    print(f'{len(items)} item senza chiave → {out}')

def compare(k):
    with open(os.path.join(SRC, f'answers-{k}.json'), encoding='utf-8') as f:
        ans = json.load(f)
    keys = {str(q['id']): q['correct'][0] for q in load(k)}
    miss = [(i, ans.get(i), keys[i]) for i in keys if ans.get(i) != keys[i]]
    print(f'{len(keys) - len(miss)}/{len(keys)} concordi')
    for i, a, key in miss:
        print(f'  {i}: revisore {a} · chiave {key}')

if __name__ == '__main__':
    cmd, k = sys.argv[1], sys.argv[2]
    {'strip': strip, 'compare': compare}[cmd](k)
