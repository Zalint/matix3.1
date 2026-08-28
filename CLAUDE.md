# Matix 3.1 — Mata Finance

Module financier de l'ERP Mata. Cahier des charges V13 (local : `Cahier_des_charges_Mata_Finance_V13.docx`, jamais poussé — le dépôt est public). Dépôt : https://github.com/Zalint/matix3.1. Maquette validée : `design/`.

Les règles complètes et contraignantes sont dans `REGLES_DEVELOPPEMENT.md` — les lire avant tout développement. Résumé opérationnel :

## Avant de coder
- Cadrage écrit court (objectif, périmètre, critères d'acceptation, modules touchés, §§ du cahier) validé par Saliou avant toute ligne de code. Cadrage allégé (une phrase dans le commit) uniquement pour les corrections triviales. Questions au cadrage, pas de suppositions.
- Vérifier ce qui existe déjà (moteurs transverses : permissions, validation, audit, calcul) et le réutiliser.

## En codant
- Fichiers ≤ 500 lignes (hors générés/lockfiles/migrations/fixtures), fonctions ≤ ~50 lignes, une responsabilité par fichier. Couches séparées : contrôleurs fins / services métier / accès données / UI.
- Dates ISO 8601, jamais de texte libre. Aucun endpoint sans authentification. Verrouillage optimiste (version + HTTP 409) sur les écritures financières. Idempotence par identifiant externe sur toute API/import financier. Clé API dédiée par relation. Secrets en variables d'environnement uniquement.
- Ne jamais reproduire du code historique : commission MaaS 3 % (supprimée), « Stock Vivant »/décote dans les calculs (module Stock seul propriétaire), « Livraisons partenaires ».
- UI : /ui-ux-pro-max pour tout nouvel écran, composant, icône, couleur ou refonte (les ajustements mineurs suivent les tokens en place). Icônes SVG Lucide, pas d'emoji. Rouge/blanc de la maquette, design tokens, contraste 4.5:1, responsive 375/768/1024/1440, hamburger mobile, palettes graphiques CVD validées (clair #C22A21/#3564D9/#C08A10, sombre #E14B3F/#5B8AFF/#C08A10). Formules visibles au survol/tap, SAUF sur les écrans de déclaration en aveugle.

## Règles métier absolues (cahier V13)
- Solde toujours calculé, jamais saisi. Réconciliation en aveugle (jamais montrer le solde système avant déclaration). Aucun contournement d'une double validation ; l'auteur ne valide jamais sa propre opération. created_at/updated_at/updated_by automatiques, date métier distincte. Clôture événementielle par périmètre + gel « À réconcilier » à 23:59 GMT ; correction post-clôture par contrepassation tracée validée Super Admin ; réconciliation auto vers 2h si sources complètes et à jour. Snapshots immuables, uniques par date et entité. Moteur de calcul financier unique. Bictorys : « Solde disponible » en lecture API seule ; « Transfert en cours » compte-relais créditable manuellement, débité au rapprochement. Refus par défaut ; investisseur et agent conseiller limités à la lecture ; agent IA = API de lecture uniquement, borné au périmètre de l'utilisateur. Passage Recette obligatoire pour toute écriture automatique (API Achat, Ventes, réconciliation) avant production. Audit de consultation sur les périmètres hautement sensibles (Comptes, Transferts) ; audit de modification partout. Les notifications du cahier font partie de la feature (écart réconciliation → Admin/DG/Collecteur ; ajustement, désactivation, transfert → mailing list ; plafond fournisseur → notification sans blocage).

## Flux avant merge vers main (ordre strict)
1. Tests unitaires verts (chaque feature + fonctions critiques : soldes, P&L 4 variantes, KPI, équation Réc. B, FIFO, prorata, fingerprint ; formules du cahier en non-régression, montants fictifs).
2. Test UI des écrans touchés : desktop + mobile 375, thèmes clair et sombre, pas de défilement horizontal.
3. Code review par un agent en contexte vierge ; constats corrigés.
4. Revue adversariale (≥ 2 agents indépendants qui cherchent à réfuter) si gros commit : ≥ 300 lignes de code source modifiées, ou moteur critique touché (calcul, réconciliation, permissions, clôture), ou contrat d'API modifié.
5. Merge vers `main`. `main` reste toujours déployable.

- Push intermédiaire sur branche feature : tests unitaires verts suffisent.
- Hotfix : branche `hotfix/`, correctif minimal, tests ciblés + UI ciblée, merge ; review complète rattrapée sous 24 h et incident noté dans `docs/decisions/`.
- Saliou arbitre tout désaccord de revue ; un constat non tranché bloque le merge.
- Commits petits, un sujet, message en français. Jamais de données réelles Mata ni de secrets dans le code, les tests ou le dépôt. `*.docx` reste en gitignore.
