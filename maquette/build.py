# -*- coding: utf-8 -*-
"""Assemble la maquette ERP Mata (Continuité) en fichiers autonomes.
Usage : python build.py                 -> écrit ../design/index.html, erp-mata.html, preview-erp.html
        python build.py --check         -> assemble et vérifie ids dupliqués / écrans manquants / icônes
        python build.py --out <dossier> -> dossier de sortie explicite (défaut : ../design)
"""
import io, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(HERE, "..", "design"))
if "--out" in sys.argv:
    OUT_DIR = sys.argv[sys.argv.index("--out") + 1]

ORDER = [
    "fin-dashboard", "fin-comptes", "fin-depenses", "fin-fournisseurs", "fin-creances",
    "fin-reconciliation", "fin-declarations", "fin-transferts", "fin-validations",
    "fin-pnl", "fin-charges", "fin-visualisation", "fin-historique", "fin-stock", "fin-import",
    "core-entites", "core-utilisateurs", "core-profils", "core-droits", "core-demandes",
    "core-audit", "core-agents", "core-notifications", "core-alertes", "core-import",
    "core-parametres", "core-incidents",
]

def rd(p):
    return io.open(p, encoding="utf-8").read()

def main(check=False):
    base = rd(f"{HERE}/00_base.html")
    for key, fn in [("__RUBIK__", "rubik"), ("__NUNITO__", "nunito"), ("__FIRACODE__", "firacode")]:
        base = base.replace(key, rd(f"{HERE}/fonts/{fn}.b64.txt").strip())
    css = rd(f"{HERE}/10_continuite.css") + "\n" + rd(f"{HERE}/11_shell.css")
    shell = rd(f"{HERE}/20_shell.html")
    screens, missing = [], []
    for sid in ORDER:
        path = f"{HERE}/screens/{sid}.html"
        if os.path.exists(path):
            screens.append(f"<!-- {sid} -->\n" + rd(path))
        else:
            missing.append(sid)
    shell = shell.replace("<!-- SCREENS_PLACEHOLDER -->", "\n".join(screens))
    engine = rd(f"{HERE}/90_engine.js")
    # Les scripts d'écran appellent ERP.register au chargement, avant le moteur : un stub met les
    # enregistrements en file d'attente, le moteur la vide au démarrage.
    stub = "<script>window.ERP={_q:[],register:function(i,f){this._q.push([i,f]);}};</script>\n"
    # Document complet : le charset doit être déclaré dans <head>, sinon un serveur statique
    # sans en-tête charset (Render, python http.server) laisse le navigateur deviner (mojibake).
    base = re.sub(r"^<title>.*?</title>\n", "", base)
    head = ('<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>ERP Mata</title>\n')
    doc = (head + base + "\n<style>\n" + css + "\n</style>\n</head>\n<body>\n" + stub + shell
           + "\n<script>\n" + engine + "\n</script>\n</body>\n</html>\n")
    os.makedirs(OUT_DIR, exist_ok=True)
    io.open(f"{OUT_DIR}/erp-mata.html", "w", encoding="utf-8").write(doc)
    io.open(f"{OUT_DIR}/preview-erp.html", "w", encoding="utf-8").write(doc)
    # Page d'accueil : choix des modules (liens profonds erp-mata.html?m=… et #écran)
    index = rd(f"{HERE}/index_src.html")
    for key, fn in [("__RUBIK__", "rubik"), ("__NUNITO__", "nunito"), ("__FIRACODE__", "firacode")]:
        index = index.replace(key, rd(f"{HERE}/fonts/{fn}.b64.txt").strip())
    io.open(f"{OUT_DIR}/index.html", "w", encoding="utf-8").write(index)
    print(f"assemblé : {len(doc):,} caractères · {len(screens)} écrans · manquants : {missing or 'aucun'}")
    if check:
        ids = re.findall(r'\sid="([^"]+)"', doc)
        dups = sorted({i for i in ids if ids.count(i) > 1})
        print("ids dupliqués :", dups or "aucun")
        for sid in ORDER:
            if sid in missing:
                continue
            frag = rd(f"{HERE}/screens/{sid}.html")
            if f'data-scr="{sid}"' not in frag:
                print(f"  ! {sid}.html ne contient pas data-scr=\"{sid}\"")
            if f"ERP.register('{sid}'" not in frag and f'ERP.register("{sid}"' not in frag:
                print(f"  · {sid}.html sans script ERP.register (statique)")
        opens = set(re.findall(r'data-open="([^"]+)"', doc))
        ovs = set(re.findall(r'data-ov="([^"]+)"', doc))
        orphan = sorted(o for o in opens if o not in ovs)
        print("data-open sans surcouche :", orphan or "aucun")
        uses = set(re.findall(r'href="#(i-[a-z0-9-]+)"', doc))
        defs = set(re.findall(r'<symbol id="(i-[a-z0-9-]+)"', doc))
        print("icônes manquantes :", sorted(uses - defs) or "aucune")

if __name__ == "__main__":
    main(check="--check" in sys.argv)
