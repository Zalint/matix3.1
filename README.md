# Matix 3.1 — Maquettes Mata Finance

Maquettes interactives du module Mata Finance (ERP Mata), basées sur le Cahier des charges fonctionnel V13 du 27 août 2026.

## Règles de travail

[`REGLES_DEVELOPPEMENT.md`](REGLES_DEVELOPPEMENT.md) fixe le cadre de tout le développement : cadrage avant le code, modularité, tests, revues (code review et revue adversariale), UI et règles métier du cahier des charges. `CLAUDE.md` en est le résumé opérationnel appliqué à chaque session de code.

## Ouvrir la maquette

Ouvrir [`design/maquette-mata-finance.html`](design/maquette-mata-finance.html) dans un navigateur. Le fichier est autonome : aucune dépendance, aucune connexion réseau (polices et icônes embarquées).

Aperçu en ligne : https://htmlpreview.github.io/?https://github.com/Zalint/matix3.1/blob/main/design/maquette-mata-finance.html

## Contenu

Trois directions de design, toutes en rouge et blanc, à comparer avec le sélecteur en bas de page (ou les touches 1, 2, 3) :

| Proposition | Caractère | Écrans |
|---|---|---|
| A — Continuité | Console métier dans la lignée de Matix : ivoire chaud, cartes blanches, rouge boucherie, Rubik + Nunito Sans | Les 10 écrans |
| B — Signal | Éditorial : papier blanc, filets d'encre, carmin en aplats, Archivo, angles vifs | Tableau de bord + Réconciliation (vitrine) |
| C — Studio | SaaS doux : gris perle, cartes flottantes arrondies, rouge vif en touches, Manrope | Les 10 écrans |

Écrans couverts pour A et C : Tableau de bord, Réconciliation, Comptes, Dépenses, Créances & Remboursements, Transferts, P&L & KPI, plus les trois écrans transverses ERP en aperçu (Agent IA en lecture seule, Audit central, Administration / Référentiels).

## Interactions à tester

- Bascule clair / sombre (icône dans le sélecteur en bas)
- Formules visibles au survol des icônes ⓘ (règle transverse du cahier des charges)
- Survol de la courbe de trésorerie (détail jour par jour)
- Réconciliation : bouton « Déclarer » ouvre la déclaration en aveugle (solde système masqué)
- Transferts : le formulaire ajoute une ligne « En attente 2ᵉ validation »
- P&L : onglets des 4 variantes avec leurs formules
- Agent IA : posez une question, la réponse est simulée (lecture seule, sources citées)

Les montants sont fictifs mais cohérents entre eux (totaux, KPI et équation de réconciliation B se recoupent).

## Fidélité au cahier des charges

La maquette matérialise les règles clés de la V13 : réconciliation en aveugle, gel à 23:59 GMT en statut « À réconcilier », soldes toujours calculés, Bictorys en lecture API seule, crédit fournisseur (plafond, échéances, FIFO), créance à 100 % de la vente MaaS, double validation des transferts, snapshots immuables, charges fixes avec date d'effet et prorata calendaire. Les modules hors périmètre (Administration, Achat, Ventes, Stock) apparaissent comme des frontières badgées ERP ou API.
