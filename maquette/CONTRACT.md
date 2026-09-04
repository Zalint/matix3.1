# Contrat de production d'écran — Maquette ERP Mata (Continuité)

Chaque écran est un fragment HTML autonome, assemblé dans un seul fichier avec la coquille, le CSS et le moteur JS communs. Le fragment ne contient ni `<html>`, ni `<head>`, ni `<body>`, ni polices, ni CSS global. Il respecte ce contrat à la lettre : le moteur commun (navigation, permissions, montants, formules, graphiques, modales) ne fonctionne que si les attributs ci-dessous sont utilisés tels quels.

Langue : français. Devise : FCFA sans décimales. Icônes : SVG du sprite uniquement (jamais d'emoji). Données : uniquement celles de `FIXTURES.md`.

## 1. Squelette obligatoire d'un écran

```html
<section class="scr" data-scr="fin-comptes" data-module="finance" data-perm="finance.comptes.view" data-sens="hs" hidden>
  <div class="scr-head">
    <div>
      <h2>Comptes</h2>
      <p class="scr-sub">6 types de comptes · solde toujours calculé ou rattaché à une source externe</p>
    </div>
    <div class="scr-meta">
      <span class="sens hs"><svg><use href="#i-shield"/></svg>Hautement sensible</span>
      <span class="hint">Consultation auditée · désactivation par un second acteur</span>
    </div>
  </div>
  … contenu …
  <!-- modales et tiroirs propres à l'écran, à la fin de la section -->
</section>
<script data-screen="fin-comptes">
ERP.register('fin-comptes', function (root, ctx) {
  // root = la section ; ctx = { profile, entity, hasPerm(p), toast(msg), fmt(n), go(screenId), open(ovId), close(ovId), on(el, evt, fn) }
  // Appelé une seule fois, à la première ouverture de l'écran. Les gestionnaires posés ici restent valides.
});
</script>
```

- `data-scr` : identifiant unique de l'écran (registre §6). `data-module` : `finance` ou `core`. `data-perm` : permission de consultation (registre §7). `data-sens` : `hs` (Hautement sensible), `s` (Sensible), `std` (Standard).
- Le badge de sensibilité et la mention du niveau de validation sont obligatoires dans `.scr-head`.
- Tout `id=` est préfixé par l'identifiant de l'écran (`fin-comptes-filtre`). Préférer les attributs `data-*` aux ids.
- Taille : fragment ≤ 350 lignes, script ≤ 120 lignes. Pas de CSS global. Un petit `<style data-screen="…">` est toléré en tête du fragment, chaque règle préfixée par `#app [data-scr="…"]`.

## 2. Montants, ratios, dates

- Montant : `<span class="amt" data-amt="8450000"></span>` → le moteur affiche `8 450 000` suivi de `FCFA`. Ajouter `data-nocur` pour omettre la devise (tableaux). Un montant négatif s'écrit `data-amt="-12400000"` : le moteur affiche `−12 400 000` et ajoute la classe `neg`.
- Jamais `data-amt` sur un conteneur (`tr`, `section`, `button`, `select`, `input`) : le moteur remplacerait son contenu par le montant formaté ; pour les données d'une ligne, utiliser `data-solde`, `data-montant`, etc. `python lint.py` détecte ce cas, l'`esc()` qui supprime au lieu d'échapper, les montants en dur et un `setAmt` qui n'écrit pas `data-amt`.
- Ne jamais écrire un montant en dur dans le texte quand il peut être un `data-amt`. Exception : les formules et équations dans `.fcode` ou `.eq`.
- KPI : la valeur en FCFA d'abord, le ratio ensuite en petit :
```html
<div class="card kpi">
  <div class="lb">Trésorerie disponible<button class="fx" data-f="Σ comptes Trésorerie + Positions externes configurées comme immédiatement disponibles" data-c="Caisse générale 8 450 000 · Sous-caisse Marché 1 275 000 · Sous-caisse Livraisons 640 000 · Banque BOA 45 200 000 · Bictorys 2 890 000" data-src="Moteur financier · comptes CALCULÉ, IMPORT, SYNCHRONISÉ" aria-label="Voir la formule"><svg><use href="#i-info"/></svg></button></div>
  <div class="v amt" data-amt="58455000"></div>
  <div class="ratio">12,9 % du CA de référence</div>
</div>
```
- Dates affichées au format `27/08/2026` ou `27/08 · 21:12`. Jamais de texte libre ambigu.

## 3. Formule → composantes → source (Core §7.1)

Chaque KPI ou solde agrégé important porte un bouton `.fx` avec :
- `data-f` : la formule, mot pour mot depuis le cahier.
- `data-c` : les composantes chiffrées (facultatif mais recommandé).
- `data-src` : la source (module propriétaire, horodatage de fraîcheur).
Le moteur affiche une infobulle à trois niveaux au survol (desktop) ou au tap (mobile). Interdit sur les écrans de déclaration en aveugle pour tout montant dérivé du solde théorique.

## 4. Composants disponibles (classes CSS existantes, ne pas en inventer)

| Besoin | Markup |
|---|---|
| Carte | `<div class="card"><div class="ch"><h3>Titre</h3><span class="hint-r">Complément</span></div><div class="cb">…</div></div>` |
| Bandeau de statistiques | `<div class="statstrip"><div class="card stat"><div class="lb">Libellé</div><div class="v amt" data-amt="…"></div><div class="sub2">Précision</div></div>…</div>` (3 par défaut ; `statstrip four` pour 4) |
| Deux colonnes | `<div class="grid2">` (1,62 / 1) ou `<div class="grid2b">` (1 / 1) |
| Tableau | `<div class="tbl-scroll"><table><thead><tr><th>…</th></tr></thead><tbody>…</tbody></table></div>` ; ligne cliquable : `<tr class="rowlink" data-open="fin-comptes-fiche">` |
| Cellule numérique | `<td class="num">` / `<th class="num">` : alignée à droite, sans retour à la ligne (montants `data-amt`, ratios) |
| Statut | `<span class="st ok\|warn\|bad\|mut\|info"><svg><use href="#i-check"/></svg>Validée</span>` |
| Étiquette | `<span class="tag api"><svg><use href="#i-lock"/></svg>Lecture API</span>` ; `tag lock` neutre |
| Sensibilité | `<span class="sens hs\|s\|std">Hautement sensible / Sensible / Standard</span>` |
| Filtres | `<div class="chips"><button class="chip on" data-filter="tous">Tous</button><button class="chip" data-filter="x">…</button></div>` (comportement à câbler dans le script de l'écran) |
| Barre d'actions | `<div class="actionbar">…<div class="sp"></div><button class="btn ghost">…</button><button class="btn pri">…</button></div>` |
| Bouton | `<button class="btn pri\|ghost" data-perm="finance.depenses.creer"><svg><use href="#i-plus"/></svg>Nouvelle dépense</button>` |
| Note explicative | `<div class="note-strip"><svg><use href="#i-info"/></svg>Texte</div>` |
| Champ | `<div class="fld"><label for="id">Libellé</label><input id="id" class="inp"></div>` ; `select.inp` ; `.inp.mono` pour les montants ; grille : `<div class="formgrid">` |
| Case radio | `<label class="rline"><input type="radio" name="…">Texte<span class="rh">aide</span></label>` |
| Formule affichée | `<div class="fcode">P&amp;L Global = CA + ΔS − D − CF</div>` ; équation avec résultat : `.eq` |
| Ligne à échéance | `<div class="due"><span>Libellé</span><span class="dt">avant le <b>10/09</b></span></div>` |
| Barre d'encours | `<div class="encbar"><i class="hot\|over" style="width:62%"></i></div>` |
| Mouvement | `<div class="mvt"><span class="sign p\|m">+</span><div class="tx"><b>Libellé</b><small>Auteur · date</small></div><span class="amt" data-amt="…" data-nocur></span></div>` |
| Ligne signée | `<div class="brk"><div class="row"><span class="sign p">+</span>Libellé<span class="amt" …></span></div></div>` |
| Snapshot | `<div class="snap"><span class="ic2"><svg><use href="#i-lock"/></svg></span><span><b>26 août 2026</b><small>Auto post-clôture</small></span>…</div>` |
| Déclaration en aveugle | `<div class="maskbox"><svg><use href="#i-lock"/></svg>Solde système <span class="dots">••••••••</span> masqué</div>` puis `<div class="declres">…</div>` après déclaration |
| Onglets | `<div class="pnl-tabs"><button class="on" data-tab="a">…</button></div>` + panneaux `[data-pane="a"]` |
| Progression | `<div class="prog"><i style="width:50%"></i></div>` |
| Étapes d'assistant | `<ol class="steps"><li class="done">Fichier</li><li class="on">Prévisualisation</li><li>Contrôles</li><li>Validation</li><li>Import</li></ol>` |
| Chaîne de résolution | `<ol class="chain"><li class="hit deny">Interdiction explicite — aucune</li>…</ol>` (classes `hit`, `deny`, `allow`, `skip`) |
| Bulle de chat | `<div class="chat"><div class="bub user">…</div><div class="bub bot">…</div></div>` |
| Progression annulaire | `<div class="card rhead"><div class="ring"><svg viewBox="0 0 64 64" fill="none"><circle class="bgc" cx="32" cy="32" r="26" stroke-width="6"/><circle class="fgc" cx="32" cy="32" r="26" stroke-width="6" stroke-linecap="round" stroke-dasharray="81.7 163.4"/></svg><b>3/6</b></div><div><h2>…</h2><div class="sub">…</div></div><div class="note">…</div></div>` |
| Liste dépliable | `<button class="linkish" data-acc-toggle>Voir le détail</button><div class="maas-list" hidden><div class="mrow"><span>…</span><span class="amt" …></span></div><div class="mrow tot">…</div></div>` (bascule à câbler dans le script) |
| Bloc de refus expliqué | `<div class="deny-note"><svg><use href="#i-lock"/></svg><b>Refus par défaut</b> : …</div>` |
| Chronologie | `<div class="tl"><div class="ev on"><b>Événement</b><small>Auteur · date</small></div></div>` |
| Tiroir : montant et méta | `<div class="big-amt">…</div><div class="meta-l"><span class="st …">…</span></div>` ; encart de modale `<div class="exp">…</div>` |
| Résultat de déclaration | `<div class="declres"><div><div class="k">Déclaré</div><div class="val">…</div></div>…</div>` (classes `.val.ok` / `.val.bad`) ; verdict de chaîne `<span class="res">Autorisé</span>` |
| Jauge | `<div class="jauge"><i class="hot" style="width:62%"></i></div>` ; expiration `<span class="expire"><svg><use href="#i-clock"/></svg>expire le 30/09/2026</span>` |
| Situation figée | `<div class="frozen">…</div>` |
| Liste d'aide | `<ul class="help-list"><li><b>Concept</b> — explication (§4.3).</li></ul>` (voir §4a) |

Les permissions de consultation (`*.view`) peuvent aussi être portées par un bouton de navigation `data-goto` pour afficher le refus expliqué à l'avance.

- Bouton compact : `.btn.sm` (cellules de tableau, listes denses) — s'ajoute à `.btn.ghost` / `.btn.pri`.

## 4a. Aide d'écran obligatoire (« Comment ça marche ? »)

Chaque écran porte un lien d'aide contextuelle : replié par défaut dans une modale (ne pèse pas sur la densité de l'écran), il explique en français simple le fonctionnement de l'écran et cite la partie exacte du cahier utilisée.

```html
<div class="scr-meta">
  <button class="linkish" data-open="help-fin-comptes"><svg><use href="#i-info"/></svg>Comment ça marche ?</button>
  <span class="sens hs">…</span>
  <span class="hint">…</span>
</div>
… (contenu de l'écran) …
<div class="mback" data-ov="help-fin-comptes"><div class="modal wide" role="dialog" aria-modal="true" aria-label="Comment ça marche : Comptes">
  <h3><svg><use href="#i-info"/></svg>Comment ça marche : Comptes</h3>
  <div class="exp">Une ou deux phrases : à quoi sert l'écran, pour qui.</div>
  <ul class="help-list">
    <li><b>Concept clé</b> — explication simple, avec un exemple chiffré réellement affiché sur cet écran (§4.3).</li>
    <li><b>Autre mécanisme</b> — … (§4.8).</li>
  </ul>
  <div class="note-strip"><svg><use href="#i-shield"/></svg>La règle la plus importante à retenir sur cet écran, si elle s'y illustre (réconciliation en aveugle, refus par défaut, double validation…).</div>
  <div class="hint">Sources : Cahier Mata Finance §4.1 à §4.7, §4.9, §10.1 · FIXTURES §3, §17</div>
  <div class="acts"><button class="btn ghost" data-close>Fermer</button></div>
</div></div>
```

Règles :
- Le bouton est le PREMIER élément de `.scr-meta`, avant le badge de sensibilité — même id que l'écran, préfixé `help-`.
- La modale est ajoutée à la fin de la section (avec les autres modales de l'écran) ; le `<script data-screen>` n'est pas modifié, l'ouverture/fermeture est générique (§5).
- 4 à 7 points dans `.help-list`, chacun avec un exemple chiffré déjà présent sur l'écran (jamais un nombre inventé, jamais une donnée hors FIXTURES) et la référence `(§x.y)` exacte du paragraphe du cahier dont il provient. Comme partout ailleurs (§2) : tout montant ≥ 4 chiffres s'écrit `<span class="amt" data-amt="…" data-nocur></span>`, jamais en dur dans le texte — `python lint.py` le vérifie.
- La ligne `Sources` en pied de modale reprend les sections du cahier réellement citées dans les points ci-dessus (pas plus).
- `.note-strip` optionnel : seulement pour une règle métier transverse déjà illustrée sur cet écran (réconciliation en aveugle, refus par défaut, séparation initiateur/validateur, double validation…).

## 5. Interactions communes fournies par le moteur

- **Modale** : `<div class="mback" data-ov="fin-depenses-nouvelle"><div class="modal" role="dialog" aria-modal="true" aria-label="…"><h3>…</h3>…<div class="acts"><button class="btn ghost" data-close>Annuler</button><button class="btn pri">Enregistrer</button></div></div></div>`. Ouverture par `data-open="fin-depenses-nouvelle"` sur n'importe quel élément. Fermeture : `data-close`, clic sur le fond, Échap. `modal wide` pour 500 px.
- **Tiroir latéral** : `<aside class="drawer" data-ov="fin-comptes-fiche"><div class="dh"><h3>…</h3><button class="ib" data-close aria-label="Fermer"><svg><use href="#i-x"/></svg></button></div><div class="db">…</div><div class="df">…</div></aside>` + `<div class="dback" data-ov-back="fin-comptes-fiche"></div>`. Même ouverture par `data-open`.
- **Navigation** : `data-goto="fin-reconciliation"` sur un bouton ou lien.
- **Permissions** : tout élément portant `data-perm="…"` est désactivé si le profil actif n'a pas la permission ; le moteur ajoute la classe `denied` et une infobulle « Refus par défaut : la permission X n'est pas accordée au profil Y ». Utiliser ce mécanisme pour montrer le refus, ne jamais masquer une action sans explication.
- **Séparation initiateur / validateur** : un bouton « Valider » porte `data-perm="finance.validations.agir" data-initiator="F. Sarr"` (nom court de l'initiateur, comme dans FIXTURES §2). Si l'utilisateur connecté est l'initiateur, le moteur désactive le bouton avec le motif « l'initiateur ne valide jamais sa propre opération ».
- **Double validation** : un bouton « Valider » d'une opération déjà validée une première fois porte `data-validated-by="O. Seck"` (noms courts, séparés par des virgules). Le moteur le désactive pour cette personne avec le motif « les deux validateurs doivent être distincts ».
- **Changement de profil** : `document.addEventListener('erp:profile', function (e) { /* e.detail = { id, user, short, profile, entity, cat, readonly } */ })`. Identifiants de profil : `sa` (Super Admin), `dg`, `dirops` (Directeur des Opérations), `caisse` (M. Diop), `collecteur` (A. Ndiaye), `invest` (I. Kane), `compta` (C. Mbaye), `maas` (B. Fall). `ctx.profile` donne le profil courant à tout moment. Un écran dont le contenu dépend du profil (Déclarations, Notifications, Créances pour le Gérant MaaS) affiche ou masque ses blocs `[data-view="…"]` à l'initialisation ET sur cet événement.
- **Toast** : `ctx.toast('Texte')`. **Montants dynamiques** : après avoir injecté du HTML contenant des `data-amt`, appeler `ctx.formatAmounts(element)`. **Permissions dynamiques** : après injection de boutons `data-perm`, appeler `ctx.applyPerms()`.
- **Graphiques** : `<div class="linechart" data-series="treso" style="height:220px"></div>` (séries disponibles : `treso`, `dettes`, `creances`, `pnl`, `ventes`, `burn`, sur 30 jours) ; `<div class="multichart" data-series="treso,dettes,creances" style="height:260px"></div>` avec cases à cocher `<label><input type="checkbox" data-series-toggle="dettes" checked> Dettes fournisseurs</label>` dans le même écran. Ne pas écrire de code de graphique.
- **Filtrage de lignes** : le script de l'écran peut utiliser `ctx.filterRows(tbody, attr, value)` qui masque les `tr` dont `data-<attr>` ≠ value (`tous` = tout afficher).

## 6. Registre des écrans (identifiants imposés)

| data-scr | Titre menu | Module | Permission | Sens. | Fixtures |
|---|---|---|---|---|---|
| hub | Accueil | — | — | std | §1, §16 |
| fin-dashboard | Tableau de bord | finance | finance.dashboard.view | s | §4, §5, §6, §7, §8, §9 |
| fin-comptes | Comptes | finance | finance.comptes.view | hs | §3 |
| fin-depenses | Dépenses | finance | finance.depenses.view | s | §7, §8 |
| fin-fournisseurs | Fournisseurs | finance | finance.fournisseurs.view | s | §3 (F1–F6), §8 |
| fin-creances | Créances clients | finance | finance.creances.view | s | §3 (C1–C15), §6 |
| fin-reconciliation | Réconciliation | finance | finance.reconciliation.view | hs | §6 |
| fin-declarations | Déclarations | finance | finance.declarations.view | s | §3, §6 |
| fin-transferts | Transferts | finance | finance.transferts.view | hs | §9 |
| fin-validations | Validations | finance | finance.validations.view | hs | §9 |
| fin-pnl | P&L et KPI | finance | finance.pnl.view | s | §4, §5 |
| fin-charges | Charges fixes | finance | finance.charges.view | s | §5 |
| fin-visualisation | Visualisation | finance | finance.visualisation.view | s | §4, §5 |
| fin-historique | Historique | finance | finance.historique.view | s | §14 |
| fin-stock | Stock (lecture) | finance | finance.stock.view | std | §15 |
| fin-import | Import relevé bancaire | finance | finance.import.view | s | §3 (BOA), §16 |
| core-entites | Entités | core | core.entites.view | std | §1 |
| core-utilisateurs | Utilisateurs | core | core.utilisateurs.view | s | §2 |
| core-profils | Profils et rôles | core | core.profils.view | s | §2, §7 du contrat |
| core-droits | Droits effectifs | core | core.droits.view | s | §2 |
| core-demandes | Demandes | core | core.demandes.view | s | §10 |
| core-audit | Audit central | core | core.audit.view | hs | §13 |
| core-agents | Agents IA | core | core.agents.view | s | §11 |
| core-notifications | Notifications | core | core.notifications.view | std | §12 |
| core-alertes | Alertes | core | core.alertes.view | std | §12 |
| core-import | Import / Export | core | core.import.view | s | §16 |
| core-parametres | Paramètres | core | core.parametres.view | s | §17 |
| core-incidents | Incidents | core | core.incidents.view | std | §16 |

## 7. Permissions d'action (à utiliser sur les boutons)

`finance.comptes.creer` · `finance.comptes.desactiver` · `finance.comptes.corriger` (Corriger le solde d'une Position externe) · `finance.depenses.creer` · `finance.depenses.modifier` · `finance.fournisseurs.payer` · `finance.creances.accorder` · `finance.creances.facturer` · `finance.declarations.declarer` · `finance.reconciliation.valider` · `finance.transferts.initier` · `finance.transferts.valider` · `finance.ajustements.initier` · `finance.ajustements.valider` · `finance.validations.agir` · `finance.charges.modifier` · `finance.historique.snapshot` (snapshot manuel) · `finance.import.executer` · `finance.export` · `core.entites.activer` · `core.utilisateurs.creer` · `core.utilisateurs.modifier` · `core.profils.attribuer` · `core.droits.override` · `core.demandes.initier` · `core.demandes.valider` · `core.audit.exporter` · `core.agents.budget` · `core.agents.override` · `core.alertes.modifier` · `core.import.executer` · `core.parametres.modifier` · `core.incidents.gerer` · `core.export`.

Le moteur connaît la matrice profil → permissions (FIXTURES §2). Un bouton dont la permission manque au profil actif est désactivé avec l'explication, pas supprimé.

## 8. Icônes du sprite

`i-m` (logo) · `i-dash` · `i-scale` · `i-wallet` · `i-receipt` · `i-coins` · `i-swap` · `i-chart` · `i-bot` · `i-shield` · `i-sliders` · `i-bell` · `i-search` · `i-sun` · `i-moon` · `i-info` · `i-lock` · `i-alert` · `i-check` · `i-clock` · `i-bank` · `i-x` · `i-arr` · `i-eyeoff` · `i-note` · `i-layers` · `i-refresh` · `i-chevd` · `i-plus` · `i-dl` · `i-menu` · `i-clipboard` · `i-users` · `i-building` · `i-user` · `i-key` · `i-inbox` · `i-flag` · `i-upload` · `i-file` · `i-box` · `i-eye` · `i-filter` · `i-history` · `i-mail`.

## 9. Règles de fidélité

- Chaque statut, libellé, formule vient d'un des cahiers ; citer la section dans un `hint` quand c'est utile (« §4.6 »).
- Séparation initiateur / validateur : un bouton « Valider » sur une demande dont l'utilisateur connecté est l'initiateur est désactivé avec le motif.
- Refus par défaut : ce que le profil ne peut pas faire est visible mais désactivé, avec l'explication.
- Une donnée absente n'est jamais affichée comme 0 : afficher « Manquante » avec son état de fraîcheur.
- Le compte Ajustement apparaît dans les listes avec ses actions désactivées (compte technique).
- Les écrans externes (Investisseur, Comptable) sont en lecture : aucun bouton d'écriture actif.
- Retour en JSON à la fin de la production : `{ "file": "…", "screenId": "…", "permsUsed": [], "overlays": [], "openQuestions": [] }`.
