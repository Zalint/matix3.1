# Règles de développement — Matix 3.1 / Mata Finance

Ce document fixe les règles de travail pour tout le développement de Mata Finance et des modules liés. Il s'applique à chaque contribution, humaine ou assistée par IA. Le cahier des charges fonctionnel V13 fait foi sur le métier ; en cas de conflit entre ce document et le cahier des charges, le cahier des charges gagne et l'écart est signalé. En cas de conflit entre une règle UI (§5) et une règle métier (§6), la règle métier gagne.

## 1. Cadrage avant le code

Aucune ligne de code sans cadrage validé.

- Toute demande commence par un cadrage écrit court : objectif, périmètre inclus et exclu, critères d'acceptation vérifiables, modules touchés, API consommées ou exposées, référence aux sections du cahier des charges concernées.
- Le cadrage est validé par Saliou avant de commencer. Une ambiguïté se règle par des questions au cadrage, pas par des suppositions en cours de route.
- Cadrage allégé pour les corrections triviales (bug évident localisé, typo, libellé) : une phrase dans le message de commit décrivant le problème et la correction suffit. Le cadrage complet reste obligatoire dès la taille M, dès qu'un moteur critique, un contrat d'API ou une règle métier du §6 est concerné, ou au moindre doute sur le périmètre.
- Chaque demande reçoit une taille (S : moins d'une demi-journée, M : une journée, L : plus). Une demande L est découpée en lots livrables et testables séparément.
- Le cadrage indique ce qui existe déjà et sera réutilisé (moteur de validation, permissions, audit, calcul financier) pour éviter de recoder un mécanisme transverse.

## 2. Architecture et modularité

Le code est modulaire par défaut, pas par exception.

- Un fichier porte une seule responsabilité. Limite : 500 lignes par fichier de code source ; au-delà, découpage obligatoire avant le merge suivant. Exclusions : fichiers générés, lockfiles, migrations automatiques, fixtures de test. Aucun fichier de plusieurs milliers de lignes, jamais.
- Une fonction fait une chose. Au-delà d'une cinquantaine de lignes, elle se découpe.
- Séparation stricte des couches : routes/contrôleurs (fins), services métier (la logique), accès aux données, composants UI. La logique métier ne vit jamais dans un contrôleur ni dans un composant d'affichage.
- Les moteurs transverses (permissions, validation simple/double, audit, réconciliation, calcul P&L/KPI) sont écrits une fois et consommés partout. Interdiction d'en dupliquer la logique dans un module.
- Nommage en français métier cohérent avec le cahier des charges (créance, remboursement, contrepassation, réconciliation), code technique en anglais si c'est l'usage du framework.

### Interdictions héritées de l'audit des dépôts existants (§10.2 du cahier)

- Pas de dates en texte libre : ISO 8601 côté API, type date/timestamp côté base, une seule convention partout.
- Pas d'endpoint exposé sans authentification, y compris les statistiques.
- Verrouillage optimiste obligatoire pour les écritures financières sensibles : champ version, conflit sur version obsolète, HTTP 409.
- Idempotence obligatoire pour toute API ou import financier : identifiant externe unique et stable, rejouer un événement ne crée jamais une deuxième écriture.
- Clé API dédiée par relation entre applications, jamais de clé partagée ni de fallback croisé.
- Secrets et configuration en variables d'environnement. Aucun secret, aucune donnée réelle dans le code ou dans le dépôt (le dépôt est public).
- Ne jamais reproduire depuis le code historique (Matix, maas_service, mata-analysis) : la commission MaaS de 3 % — supprimée, elle s'intègre au prix de vente et aucune commission distincte n'existe dans Mata Finance (§6.0) ; toute composante « Stock Vivant », décote ou valorisation de stock dans les calculs de Mata Finance — le module Stock en est seul propriétaire, Mata Finance ne consomme que la valeur financière par API (§8.1, §8.3) ; les anciens termes « Livraisons partenaires » dans le P&L.

## 3. Tests

- Chaque feature livrée s'accompagne de ses tests unitaires : cas nominal, cas limite, cas d'erreur. Une feature sans test n'est pas terminée.
- Les fonctions critiques ont une couverture renforcée : calcul de solde, moteur P&L et ses 4 variantes, KPI de trésorerie, équation de réconciliation B, affectation FIFO des paiements fournisseurs, prorata des charges fixes, fingerprint de relevé bancaire.
- Les formules de référence du cahier des charges servent de cas de non-régression : équation de réconciliation B (solde début + ventes générant créance ± ajustements − remboursements réconciliés = solde fin, §6.3) ; prorata des charges fixes (montant mensuel × jours calendaires écoulés / jours du mois, ex. × 27 / 31 au 27 août, §8.6) ; affectation FIFO par échéance (ex. 2 000 000 FCFA dus avant le 10 réduits avant les 3 000 000 FCFA dus avant le 14, §5.5) ; fingerprint de relevé bancaire distinguant deux vraies transactions identiques (§4.1). Les montants utilisés dans les tests sont fictifs et ne sont jamais présentés comme des chiffres du cahier des charges.
- Tests d'intégration pour chaque API : rejouer le même événement ne crée pas de doublon ; écriture avec version obsolète renvoie 409 ; source manquante ou non à jour bloque l'auto-validation.
- Test UI complet (desktop, mobile 375 px, thèmes clair et sombre) obligatoire avant tout merge vers `main` : navigation, états visuels (chargement, vide, erreur), aucun défilement horizontal de page, formules visibles au survol ou au tap. Sur une branche feature, un push intermédiaire exige seulement les tests unitaires verts. Aucun code non testé visuellement n'atteint `main`.
- Un test qui échoue bloque le push. On corrige, on ne contourne pas.

## 4. Revues et flux Git

L'ordre est toujours le même avant un merge vers `main` : tests unitaires verts, puis test UI, puis code review, puis revue adversariale si le commit est gros, puis corrections, puis merge.

- Code review systématique après le test UI et avant chaque merge vers `main`. Elle vérifie : correction du code, sécurité, respect des règles métier du §6, modularité, absence de duplication. Elle est effectuée par un agent IA dans un contexte vierge, distinct de la session qui a écrit le code.
- Revue adversariale avant tout gros commit. Est « gros » un commit dont `git diff --stat` montre 300 lignes ou plus de code source modifié (ajouts + suppressions, hors fichiers générés, lockfiles, migrations et fixtures), ou qui touche un moteur critique (calcul financier, réconciliation, permissions, clôture), ou qui modifie un contrat d'API, quel que soit son volume. Elle mobilise au moins deux agents indépendants (contextes séparés) qui cherchent activement à réfuter le code : bug, faille, écart au cahier des charges. Les constats confirmés sont corrigés avant le merge.
- Arbitrage : Saliou tranche tout désaccord de revue. Un constat contesté est tranché par lui et la décision est notée dans le message de commit ou dans `docs/decisions/` ; un constat non tranché bloque le merge.
- Procédure hotfix : quand un bug bloque la production ou les utilisateurs, le flux normal est remplacé par : branche `hotfix/...` depuis `main`, correctif minimal, tests unitaires ciblés sur la zone corrigée, test UI limité aux écrans touchés (desktop + mobile, thème courant), merge et déploiement. La code review complète et le test UI complet (deux thèmes) sont rattrapés sous 24 h et l'incident est documenté dans `docs/decisions/`. Un hotfix qui touche un moteur critique subit la revue adversariale a posteriori, avant tout nouveau développement.
- Commits petits et fréquents, un sujet par commit, message clair en français qui dit le pourquoi.
- Une branche par feature. `main` reste toujours fonctionnelle et déployable. Pas de push direct d'un travail cassé sur `main`.
- Le `.gitignore` protège en permanence : documents internes (`*.docx`), secrets, fichiers d'environnement, données réelles. Aucune donnée réelle de Mata (montants, noms de clients, fournisseurs, soldes) dans le code, les tests ou les fixtures : les jeux de données sont fictifs mais cohérents.

## 5. UI et design

- /ui-ux-pro-max est obligatoire pour : tout nouvel écran, tout nouveau composant réutilisable, toute nouvelle icône, toute nouvelle couleur ou modification de palette, toute refonte d'un parcours existant. Les ajustements dans le cadre établi (espacements, libellés, réorganisations mineures) appliquent les design tokens et la famille d'icônes en place, sans nouvelle passe design.
- Les icônes sont des SVG d'une même famille (style Lucide, trait cohérent), jamais des emojis.
- L'identité visuelle est le rouge et blanc validé sur la maquette retenue. Les couleurs vivent dans des design tokens (variables CSS), jamais en dur dans les composants.
- Les palettes de graphiques restent celles validées pour daltonisme : clair `#C22A21 / #3564D9 / #C08A10` sur blanc, sombre `#E14B3F / #5B8AFF / #C08A10`. Toute nouvelle couleur de série passe par le validateur avant usage.
- Règle transverse du cahier des charges : toute donnée calculée affiche sa formule complète, au survol sur desktop, au tap sur mobile. Exception : cette règle ne s'applique jamais aux écrans de déclaration en aveugle (§6) — aucun montant dérivé du solde attendu, ni sa formule, n'est affiché au déclarant avant sa déclaration.
- Accessibilité : contraste texte 4.5:1 minimum dans les deux thèmes, focus clavier visible, cibles tactiles de 44 px minimum, `prefers-reduced-motion` respecté.
- Responsive obligatoire sur 375, 768, 1024 et 1440 px. Menu hamburger avec tiroir en mobile. Les tableaux larges défilent dans leur propre cadre, jamais la page entière.
- Montants en FCFA au format fr-FR, chiffres tabulaires, statuts toujours doublés d'une icône ou d'un libellé (jamais la couleur seule).

## 6. Règles métier non négociables (cahier des charges V13)

Ces règles sont vérifiées à chaque code review. Aucun code ne peut les contourner, même temporairement.

- Un solde n'est jamais un champ saisi ni modifiable : il est toujours calculé à partir des mouvements.
- Réconciliation en aveugle : le déclarant ne voit jamais le solde calculé avant sa déclaration.
- Aucune permission, y compris Super Admin, ne contourne une règle de double validation. L'auteur d'une opération ne la valide jamais lui-même.
- `created_at` automatique et non modifiable ; `updated_at` et `updated_by` automatiques à chaque modification ; la date métier reste un champ distinct.
- Clôture événementielle : les opérations d'un périmètre se verrouillent dès que sa réconciliation est validée, jamais à heure fixe. Filet de sécurité : à 23h59 GMT, toute opération du jour non réconciliée est gelée avec le statut « À réconcilier » ; la réconciliation reste possible, toute autre correction suit le processus post-clôture. Après clôture, aucune modification directe : correction uniquement par ajustement ou contrepassation tracée, avec validation obligatoire du Super Admin. La réconciliation quotidienne se déclenche automatiquement vers 2h du matin, uniquement si les sources obligatoires sont complètes et à jour.
- Les snapshots de clôture sont immuables et uniques par date et par entité.
- Un seul moteur de calcul financier : P&L, KPI, snapshots, API, rapports et agent IA consomment le même service. Aucun calcul dupliqué côté écran.
- Bictorys se modélise en deux comptes Trésorerie (§4.3) : « Bictorys — Solde disponible » est alimenté exclusivement par API en lecture, jamais modifiable à la main ; « Bictorys — Transfert en cours » est un compte-relais créditable manuellement quand un transfert vers la Banque est initié, puis débité lorsque le virement est confirmé sur le relevé bancaire. Pour les KPI, Bictorys disponible = Solde Bictorys + Bictorys Transfert en cours.
- Refus par défaut : sans permission explicite sur un périmètre, l'accès est refusé.
- Investisseur et agent conseiller sont limités à la lecture, même sur les périmètres où ils ont un accès explicite ; sans accès explicite, refus par défaut. L'agent IA central est un agent conseiller de niveau d'autonomie 1 : Mata Finance ne lui expose que des API de lecture, jamais d'écriture, et ses réponses sont bornées au périmètre effectif de l'utilisateur qui l'interroge. Les agents exécutants sont refusés par défaut ; seul rôle identifié à ce jour : « déclarant » sur l'API de récupération des versements MaaS.
- Avant toute auto-validation, les sources obligatoires sont complètes et à jour ; sinon la validation reste manuelle.
- Passage Recette obligatoire : tout agent IA ou toute API qui écrit automatiquement en base (intégration Achat → Dépenses, Ventes Mata → Créances, réconciliation automatique des versements, tout futur agent ou import) passe par l'environnement de Recette avant toute mise en production (§18.3 du Socle V1). Aucune écriture automatique n'est branchée directement en production.
- Deux niveaux de sensibilité (§10 du Socle) : les périmètres « Hautement sensible » (Comptes/Trésorerie, Transferts manuels) imposent l'audit de consultation en plus de l'audit de modification — chaque lecture est tracée ; les périmètres « Sensible » (Dépenses, Créances & Remboursements) imposent l'audit de modification uniquement. L'audit de modification est systématique partout.
- Les notifications du cahier des charges font partie de la feature, pas d'une option : écart de réconciliation → email à Admin, DG et Collecteur ; compte désactivé, ajustement de solde et transfert manuel → mailing list dédiée ; dépense « pas sûr » bloquant son périmètre, échec d'import Achat, écart fournisseur et correction post-clôture → notifications ciblées ; dépassement du plafond d'encours fournisseur → notification informative, sans aucun blocage de la saisie. Pas de notification systématique sur chaque dépense.

## 7. Documentation et traçabilité

- Chaque module a un README court : son rôle, les API qu'il expose et consomme, ses dépendances, comment lancer ses tests.
- Les décisions d'architecture importantes sont notées en quelques lignes (contexte, décision, conséquences) dans `docs/decisions/`.
- Un écart au cahier des charges, même minime, est documenté et validé par Saliou avant implémentation, puis reporté dans le cahier à sa prochaine version.

## 8. Définition de « terminé »

Une feature est terminée quand toutes ces cases sont cochées, dans cet ordre :

1. Cadrage écrit et validé (ou cadrage allégé si correction triviale).
2. Code modulaire, fichiers sous les limites de taille, couches respectées.
3. Tests unitaires écrits et verts (feature + fonctions critiques touchées).
4. Test UI passé : desktop et mobile, thèmes clair et sombre.
5. Code review faite et constats corrigés.
6. Revue adversariale faite si le commit est gros, constats confirmés corrigés.
7. Documentation à jour (README du module, décision d'architecture si besoin).
8. Commit propre et merge vers `main`.

## 9. Application automatique

Les règles bloquantes sont outillées, pas seulement écrites :

- Hook `pre-push` qui exécute les tests unitaires et refuse le push en cas d'échec.
- Vérification automatique (lint ou script CI) de la limite de lignes par fichier et de l'absence de secrets à chaque commit.
- La checklist du §8 sert de modèle de pull request, cochée avant tout merge vers `main`.
- Toute règle du présent document qui ne peut être vérifiée ni automatiquement ni en code review est reformulée ou retirée.
