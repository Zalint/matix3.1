# -*- coding: utf-8 -*-
"""Contrôles statiques des fragments d'écran (CONTRACT.md) : erreurs systémiques déjà rencontrées en revue.
Usage : python lint.py [id ...]   (défaut : tous les écrans de screens/)
"""
import io, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCREENS = os.path.join(HERE, "screens")
LIMIT_LINES, LIMIT_SCRIPT = 330, 120

def rd(p): return io.open(p, encoding="utf-8").read()

def lint(sid):
    path = os.path.join(SCREENS, sid + ".html")
    s = rd(path); out = []
    lines = s.split("\n")
    if len(lines) > LIMIT_LINES: out.append("taille : %d lignes (> %d)" % (len(lines), LIMIT_LINES))
    m = re.search(r"<script data-screen[^>]*>(.*?)</script>", s, re.S)
    script = m.group(1) if m else ""
    if script.count("\n") > LIMIT_SCRIPT: out.append("script : %d lignes (> %d)" % (script.count("\n"), LIMIT_SCRIPT))
    html = s[:m.start()] if m else s
    # 1. data-amt réservé aux éléments de montant (jamais sur tr / section / button / select)
    for tag in re.findall(r"<(tr|section|button|select|input|table|tbody|thead)\b[^>]*\sdata-amt=", html):
        out.append("data-amt posé sur <%s> : le moteur remplacerait son contenu par le montant" % tag)
    # 2. data-scr et enregistrement
    if 'data-scr="%s"' % sid not in html: out.append("data-scr manquant")
    if script and "ERP.register('%s'" % sid not in script and 'ERP.register("%s"' % sid not in script: out.append("ERP.register absent ou mauvais id")
    # 3. .fx sans data-f ; data-f vide
    for fx in re.findall(r'<button class="fx"[^>]*>', html):
        if "data-f=" not in fx: out.append(".fx sans data-f : " + fx[:80])
    # 4. Montants en dur dans le texte visible (hors attributs, .fcode/.eq, script)
    # Les blocs .eq / .fcode entiers sont retirés d'abord (CONTRACT §2 : exception prévue), y compris leurs balises imbriquées (<b>, <span data-t>)
    body = re.sub(r"<(div|span|p)\b[^>]*\bclass=\"(?:eq|fcode)\b[^\"]*\"[^>]*>.*?</\1>", "", html, flags=re.S)
    body = re.sub(r"<[^>]+>", lambda t: "<>" if not re.match(r"<(div|span|p|small|b|td|th|li|h\d)\b[^>]*class=\"[^\"]*(fcode|eq)\b", t.group(0)) else "<FX>", body)
    body = re.sub(r"<FX>.*?<>", "", body, flags=re.S)
    hard = re.findall(r"(?<![\d/:])\b\d{1,3}(?: \d{3}){2,}\b", body)
    if hard: out.append("montants en dur dans le texte (%d) : %s" % (len(hard), ", ".join(sorted(set(hard))[:6])))
    # 5. hidden sur flex : couvert par #app [hidden] ; classes 'sm' inventées
    if "payrow" in html: out.append("classe .payrow hors catalogue (utiliser .grid2b)")
    # 6. data-perm sur select/input sans garde : le moteur les désactive désormais, rien à faire ; signaler tag api détourné
    for t in re.findall(r'<span class="tag api">[^<]*<svg><use href="#i-[a-z]+"/></svg>([^<]{0,40})', html):
        if "API" not in t and "api" not in t.lower(): out.append("tag api utilisé pour « %s » (réservé à Lecture API)" % t.strip())
    # 7. données inventées fréquentes : « snapshot » attribué à un détail de compte
    if re.search(r"snapshot[^<]{0,40}(par compte|position précédente)", html, re.I): out.append("snapshot cité pour un détail par compte (§8.6 : agrégats seulement)")
    # 8. innerHTML avec valeur utilisateur sans esc
    if re.search(r"\.value\b[^;]{0,80}innerHTML|innerHTML[^;]{0,120}\.value\b", script) and "esc(" not in script: out.append("innerHTML avec .value sans esc()")
    if re.search(r"esc = function \(s\) \{ return String\(s\)\.replace\(/\[<>&\"\]/g, ''\)", script): out.append("esc() supprime au lieu d'échapper")
    # 9. aucun setAmt qui écrit textContent sans toucher data-amt
    if re.search(r"function setAmt\([^)]*\) \{ el\.textContent", script): out.append("setAmt écrit textContent sans mettre à jour data-amt")
    return out

if __name__ == "__main__":
    ids = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(SCREENS) if f.endswith(".html"))
    total = 0
    for sid in ids:
        res = lint(sid); total += len(res)
        print(sid + " : " + ("OK" if not res else ""))
        for r in res: print("   - " + r)
    print("%d constat(s)" % total)
