# Données fictives communes — Maquette ERP Mata (Continuité)

Toutes les valeurs ci-dessous sont fictives mais cohérentes entre elles. Chaque écran DOIT utiliser exactement ces noms, ces montants et ces statuts. Montants en FCFA, entiers, jamais de décimales. Date de référence : **jeudi 27 août 2026**, heure de Dakar (GMT). Journée en cours ; gel « À réconcilier » à 23:59.

## 1. Entités (Mata Core)

| Code | Entité | Type | Statut sélecteur |
|---|---|---|---|
| MG | Mata Group | Entité mère | Active (seule sélectionnable) |
| MLC | MLC | Filiale | Visible, « à migrer », non sélectionnable |
| MV | Mata Volaille | Filiale | Visible, « à migrer », non sélectionnable |
| KB | Keur Bally | Filiale (franchise) | Visible, « à activer », non sélectionnable |
| MAAS-* | 12 MaaS : Keur Massar, Ouakam, Pikine, Rufisque, Grand Yoff, Parcelles, Médina, Yoff, Ngor, Thiaroye, Guédiawaye, HLM | MaaS | Référencés, « à activer », non sélectionnables (sauf pour le Gérant MaaS connecté : son MaaS est son contexte) |

## 2. Utilisateurs et profils (Mata Core)

Un compte par personne. Un seul profil actif à la fois. Le compte connecté par défaut est Saliou Doucouré.

| Id | Nom | Catégorie(s) | Profil(s) | Entité | Statut |
|---|---|---|---|---|---|
| u1 | Saliou Doucouré | Interne — Employé | **Super Admin Mata Group** ; Directeur financier MLC (entité à migrer, profil non activable) | MG | Actif |
| u2 | Ousmane Seck | Interne — Employé | DG Mata | MG | Actif |
| u3 | Fatou Sarr | Interne — Employé | Directeur des Opérations | MG | Actif |
| u4 | Moussa Diop | Interne — Employé | Gestionnaire de caisse (Caisse générale, Sous-caisse Marché) | MG | Actif |
| u5 | Abdou Ndiaye | Interne — Employé | Collecteur | MG | Actif |
| u6 | Ibrahima Kane | Externe — Investisseur | Investisseur | MG | Actif |
| u7 | Coumba Mbaye | Externe — Comptable, Externe — Accès temporaire (01/09/2026 → 30/09/2026) | Comptable externe | MG | Actif, expire le 30/09/2026 |
| u8 | Babacar Fall | Externe — MaaS | Gérant MaaS Keur Massar | MaaS Keur Massar | Actif |
| u9 | Mamadou Gueye | Interne — Employé | Administrateur Mata Finance | MG | **Désactivé** le 30/06/2026 (jamais supprimé) |

Initiales pour avatars : SD, OS, FS, MD, AN, IK, CM, BF, MG.

### Périmètres de démonstration par profil (menu et actions filtrés, refus par défaut ailleurs)

| Profil | Mata Core | Mata Finance | Export | Sensibilité max consultable |
|---|---|---|---|---|
| Super Admin | Tout | Tout ; valide transferts, ajustements, corrections, désactivations ; jamais sa propre demande | Oui | Hautement sensible |
| DG Mata | Entités, Utilisateurs (lecture), Demandes (valider), Audit (lecture), Agents IA (lecture), Notifications, Alertes (lecture) | Tout en lecture ; initie et valide transferts ; Validations | Oui | Hautement sensible |
| Directeur des Opérations | Demandes (initier), Notifications, Incidents | Dashboard, Comptes (lecture), Dépenses (créer, modifier), Fournisseurs (payer), Créances (accorder), Réconciliation (fournisseurs), Transferts (initier), Validations (mes demandes), P&L, Historique | Non (refusé : permission Exporter distincte) | Hautement sensible |
| Gestionnaire de caisse | Notifications, Incidents | Déclarations (ses caisses), Comptes (ses caisses, lecture), Dépenses (créer sur ses caisses), Réconciliation (Caisses, lecture) | Non | Sensible |
| Collecteur | Notifications, Incidents | Déclarations (collecte), Réconciliation (Encaissements collectés, lecture) | Non | Sensible |
| Investisseur (Externe) | Notifications | Dashboard (blocs P&L et Trésorerie agrégée), P&L, Historique — lecture seule | Non | Standard + agrégats |
| Comptable externe (Externe, temporaire) | Notifications | Comptes (lecture), Dépenses (lecture), Fournisseurs (lecture), P&L, Historique — lecture seule ; Transferts, Validations, Audit interdits | Non | Sensible |
| Gérant MaaS | Demandes (initier : utilisateur, client), Notifications | Créances (sa position MaaS Keur Massar uniquement), Déclarations (versements de son MaaS) | Non | Sensible (son périmètre) |

## 3. Comptes (Mata Finance, entité Mata Group) — 6 types

Source du solde : CALCULÉ (mouvements), SYNCHRONISÉ (API), IMPORT (CSV).

| Code | Compte | Type | Source | Solde / position (FCFA) | Détail |
|---|---|---|---|---|---|
| CG | Caisse générale | Trésorerie | CALCULÉ | 8 450 000 | Réconciliation obligatoire ; a bougé aujourd'hui ; **à déclarer** (dernier réconcilié 26/08 : 7 980 000 ; mouvements +470 000) |
| SCM | Sous-caisse Marché | Trésorerie | CALCULÉ | 1 275 000 | Déclaré 1 250 000 à 21:12 → **écart −25 000**, statut « À réconcilier » |
| SCL | Sous-caisse Livraisons | Trésorerie | CALCULÉ | 640 000 | Déclaré 640 000 à 20:48 (F. Sarr) → réconciliée |
| BOA | Banque BOA | Position externe | IMPORT CSV | 45 200 000 | Dernier import 27/08 08:00 ; réf. bancaire = identifiant ; correction −45 000 (frais) **en attente de validation** |
| BIC | Bictorys | Position externe | SYNCHRONISÉ | 2 890 000 | Dernière synchro 27/08 08:12 ; jamais modifiable à la main |
| REL1 | Dépôt en cours (Caisse → Banque) | Relais | CALCULÉ | 2 500 000 | Créé 27/08 07:45 (A. Ndiaye) ; âge 0 j |
| REL2 | Bictorys → Banque en cours | Relais | CALCULÉ | 350 000 | Créé 24/08 ; **âge 3 j > seuil 2 j → alerte relais ancien** |
| F1 | AGNEAUX | Fournisseur | CALCULÉ | **−12 400 000** (dette) | Plafond 10 000 000 → **dépassé** (alerte, aucun blocage) ; compte de paiement de référence : Caisse générale |
| F2 | MATA VOLAILLE CHAIR | Fournisseur | CALCULÉ | −4 300 000 | Plafond 8 000 000 ; réf. paiement : Banque BOA |
| F3 | MATA VOLAILLE ŒUFS | Fournisseur | CALCULÉ | −1 150 000 | Plafond 3 000 000 ; réf. : Caisse générale |
| F4 | Bétail Thiès | Fournisseur | CALCULÉ | −4 600 000 | Plafond 6 000 000 ; réf. : Caisse générale |
| F5 | Abattoirs Dakar | Fournisseur | CALCULÉ | **+350 000** (avance chez le fournisseur) | Plafond 2 000 000 ; réf. : Caisse générale |
| F6 | Aliments Sénégal | Fournisseur | CALCULÉ | −800 000 | Plafond 1 500 000 ; réf. : Banque BOA |
| C1 | MaaS Keur Massar | Créance client (MaaS) | CALCULÉ | 3 250 000 | Réf. ERP entity_id MAAS-KM |
| C2 | MaaS Ouakam | Créance client (MaaS) | CALCULÉ | 2 870 000 | |
| C3 | MaaS Pikine | Créance client (MaaS) | CALCULÉ | 1 985 000 | |
| C4 | Restaurant Le Baobab | Créance client (Gros client) | CALCULÉ | 2 400 000 | |
| C5 | Boucherie des Almadies | Créance client (Gros client) | CALCULÉ | 1 730 000 | |
| C6 | Touba Viandes | Créance client (Gros client) | CALCULÉ | **−150 000** (avance client) | |
| C7–C15 | 9 autres MaaS | Créance client (MaaS) | CALCULÉ | 7 840 000 au total | Rufisque 980 000 · Grand Yoff 1 120 000 · Parcelles 860 000 · Médina 940 000 · Yoff 780 000 · Ngor 1 050 000 · Thiaroye 690 000 · Guédiawaye 810 000 · HLM 610 000 |
| ADJ | Ajustement | Ajustement | CALCULÉ | 0 | Compte technique ; **actions désactivées** ; exclu de tous les agrégats |

Convention de signe (Finance §4.3) : Fournisseur positif = avance de Mata chez le fournisseur ; négatif = Mata doit. Client positif = le client doit à Mata ; négatif = avance du client.

## 4. KPI de trésorerie (Finance §8.1 et §8.2) — FCFA d'abord, ratio ensuite

CA de référence par défaut : CA Mata du mois en cours (août, au 27) = **452 000 000**.

| Indicateur | Formule | Valeur | Ratio / CA réf. |
|---|---|---|---|
| Trésorerie disponible | Σ Trésorerie + Positions externes immédiatement disponibles (CG + SCM + SCL + BOA + BIC) | **58 455 000** | 12,9 % |
| Trésorerie en transit | Σ Relais actifs (REL1 + REL2) | **2 850 000** | 0,6 % |
| Trésorerie totale contrôlée | Disponible + Transit | **61 305 000** | 13,6 % |
| Dettes fournisseurs | Σ max(−Position fournisseur ; 0) | **23 250 000** | 5,1 % |
| Avances fournisseurs | Σ max(Position fournisseur ; 0) | **350 000** | — |
| Créances clients | Σ max(Position client ; 0) | **20 075 000** | 4,4 % |
| Avances clients | Σ max(−Position client ; 0) | **150 000** | — |
| Position financière nette | Totale contrôlée + Avances fourn. + Créances clients − Dettes fourn. − Avances clients | **58 330 000** | 12,9 % |
| Trésorerie après fournisseurs | Totale contrôlée − Dettes fournisseurs | **38 055 000** | 8,4 % |

Périodes alternatives du CA de référence (sélecteur) : mois en cours (défaut, 452 000 000), mois précédent (juillet : 438 500 000), 3 derniers mois (1 301 200 000).

## 5. P&L de gestion (Finance §8.3, §8.4) — cumul du 1er au 27 août

| Symbole | Valeur | Détail |
|---|---|---|
| CA | 452 000 000 | Ventes Mata (source OK, maj 27/08 20:30) |
| ΔS | +2 235 000 | Stock fin 41 235 000 − stock début 39 000 000 (source Stock, maj 27/08 06:00) |
| D | 421 500 000 | Toutes dépenses par date métier |
| DI | 18 000 000 | Investissement = vrai : chambre froide 12 000 000 (12/08), acompte camion frigorifique 6 000 000 (20/08) |
| DS | 6 500 000 | Dépense spéciale = vrai : indemnités exceptionnelles 4 000 000 (05/08), sinistre 2 500 000 (18/08) |
| CF | 6 900 000 | max(0 ; 21 700 000 × 27 / 31 − 12 000 000) = max(0 ; 18 900 000 − 12 000 000) |

| Variante | Formule | Valeur | / CA |
|---|---|---|---|
| **P&L Global** | CA + ΔS − D − CF | **25 835 000** | 5,7 % |
| **P&L hors Investissements** | Global + DI | **43 835 000** | 9,7 % |
| **P&L hors Dépenses spéciales** | Global + DS | **32 335 000** | 7,2 % |

### Charges fixes (écran de configuration, Finance §8.4)

| Nom | Montant mensuel | Date d'effet | Date de fin | Catégorie | Statut |
|---|---|---|---|---|---|
| Salaires | 18 600 000 | 01/07/2026 | — | Personnel | Actif |
| Loyer | 2 500 000 | 01/01/2026 | — | Locaux | Actif |
| Gardiennage et sécurité | 600 000 | 01/03/2026 | — | Services | Actif |
| Assurance flotte | 350 000 | 01/01/2025 | 30/06/2026 | Assurances | Inactif |

Total actif 21 700 000 · théorique proratisé au 27/08 = 18 900 000 · déjà comptabilisé en dépenses = 12 000 000 · complémentaire CF = 6 900 000.

## 6. Réconciliations du jour (Finance §4.8, §6.3, §6.4, §5.5)

| Circuit | Statut | Détail |
|---|---|---|
| Caisses | 1 réconciliée, 1 écart, 1 à déclarer | SCL réconciliée 20:48 · SCM écart −25 000 (déclaré 1 250 000 / théorique 1 275 000) · CG à déclarer (théorique 8 450 000, masqué au déclarant) |
| Encaissements collectés | **Validée 02:04** (collecte du 26/08) | Source A : 12 déclarations MaaS = 4 725 000 · Source B : collecteur A. Ndiaye = 4 725 000 → Caisse créditée, remboursements affectés. Détail : Keur Massar 420 000 · Ouakam 385 000 · Pikine 512 000 · Rufisque 298 000 · Grand Yoff 445 000 · Parcelles 367 000 · Médina 402 000 · Yoff 356 000 · Ngor 489 000 · Thiaroye 315 000 · Guédiawaye 378 000 · HLM 358 000. La collecte du 27/08 (versements du jour 3 100 000) sera réconciliée cette nuit vers 02:00. |
| Ventes du jour | **Cohérente** | Ventes Mata du jour 6 200 000 = Versements 3 100 000 + Paiements Bictorys 1 250 000 + Créances nettes nouvelles 2 450 000 − Remboursements à neutraliser 600 000. Sources : Ventes OK 20:30 · Versements OK · Bictorys OK 08:12 · Comptes créance OK. |
| Fournisseurs | 3 validées, 2 en attente, 1 sans mouvement | AGNEAUX validée 18:30 · VOLAILLE CHAIR validée 17:50 · ŒUFS validée 17:20 · Bétail Thiès en attente (a bougé : achat agneau 262 000) · Abattoirs Dakar en attente (frais d'abattage 150 000) · Aliments Sénégal sans mouvement → non bloquant |

Sources et fraîcheur : Ventes Mata OK (20:30) · Bictorys OK (08:12) · Banque BOA OK (08:00) · Stock OK (06:00) · Achat OK (import 17:00, 5 achats intégrés).

## 7. Dépenses du jour (Finance §5.1) — 14 écritures, 1 862 000

| Désignation | Fournisseur | Catégorie | Montant | Payé immédiatement | Pas sûr | Invest. | Spéciale | Source | Date souhaitée au plus tard |
|---|---|---|---|---|---|---|---|---|---|
| Achat bœuf — lot BV-260827-04 | AGNEAUX | Achat bœuf | 850 000 | 0 | non | non | non | Achat (API) | 30/09/2026 |
| Carburant véhicule livraison | — | Logistique | 85 000 | ? | **oui** | non | non | Manuel | — |
| Achat volaille | MATA VOLAILLE CHAIR | Achat volaille | 420 000 | 420 000 | non | non | non | Achat (API) | — |
| Frais d'abattage | Abattoirs Dakar | Abattage | 150 000 | 150 000 | non | non | non | Manuel | — |
| Entretien chambre froide | — | Maintenance | 95 000 | 0 | non | non | non | Manuel | 05/09/2026 |
| Achat agneau — lot AG-260827-02 | Bétail Thiès | Achat agneau | 262 000 | 0 | non | non | non | Achat (API) | 12/09/2026 |
| 8 autres écritures | divers | divers | 0 au total affiché comme « + 8 autres » | | | | | | |

La dépense « Pas sûr » (Carburant) bloque uniquement le périmètre Sous-caisse Livraisons ; notification à 23:00 au Directeur des Opérations, aux Admins et au Super Admin si non résolue.

## 8. Échéances fournisseurs (Finance §5.3, §5.6) — priorité aux dépassées

| Fournisseur | Dépense / lot | Montant restant | Date souhaitée au plus tard | Compte de paiement de référence | État |
|---|---|---|---|---|---|
| MATA VOLAILLE ŒUFS | Lot œufs 18/08 | 1 150 000 | 25/08/2026 | Caisse générale | **Dépassée (2 j)** |
| Aliments Sénégal | Aliment volaille 05/08 | 800 000 | 20/08/2026 | Banque BOA | **Dépassée (7 j)** |
| Bétail Thiès | Lot AG-260820-01 | 1 600 000 | 02/09/2026 | Caisse générale | Prochaine |
| MATA VOLAILLE CHAIR | Lot 22/08 | 4 300 000 | 05/09/2026 | Banque BOA | À venir |
| AGNEAUX | Lot BV-260810 | 2 000 000 | 10/09/2026 | Caisse générale | À venir |
| Bétail Thiès | Lot AG-260827-02 (+ antérieurs) | 3 000 000 | 12/09/2026 | Caisse générale | À venir |
| AGNEAUX | Lot BV-260818 | 3 000 000 | 14/09/2026 | Caisse générale | À venir |
| AGNEAUX | Lot BV-260827-04 (+ antérieurs) | 7 400 000 | 30/09/2026 | Caisse générale | À venir |

Total dépassé : **1 950 000**. Prochaine échéance : **02/09/2026 — 1 600 000** (Bétail Thiès). Paiement FIFO : la tranche la plus proche est réduite en premier ; affectation manuelle exceptionnelle auditée.

## 9. Transferts et Validations (Finance §7)

Transferts (Trésorerie et Position externe uniquement ; passage par Relais si destination non confirmée) :

| Date | De → Vers | Montant | Initiateur | Validateur | Statut |
|---|---|---|---|---|---|
| 27/08 18:05 | Banque BOA → Caisse générale | 600 000 | F. Sarr | — | En attente |
| 27/08 16:42 | Caisse générale → Banque BOA (via Relais Dépôt en cours) | 1 500 000 | S. Doucouré | — | En attente |
| 26/08 18:10 | Caisse générale → Banque BOA | 3 000 000 | O. Seck | S. Doucouré | Validé |
| 24/08 11:05 | Banque BOA → Caisse générale | 800 000 | F. Sarr | O. Seck | Validé |
| 22/08 09:30 | Bictorys → Banque BOA (via Relais) | 350 000 | S. Doucouré | O. Seck | Validé (relais encore ouvert) |

Écran Validations, compteur menu **« Validations (4) »** pour le Super Admin :

| À valider (S. Doucouré peut agir) | Type | Initiateur | Niveau | Détail |
|---|---|---|---|---|
| VAL-118 | Transfert | F. Sarr | Hautement sensible · validation simple | 600 000 BOA → CG |
| VAL-117 | Ajustement | M. Diop | Hautement sensible · **double validation** (1re : O. Seck 19:02 ; 2e requise) | +180 000 sur Caisse générale, motif « écart de comptage du 26/08 » |
| VAL-116 | Correction Position externe | F. Sarr | Hautement sensible · double validation | Banque BOA −45 000, motif « frais bancaires non importés » |
| VAL-115 | Désactivation compte | F. Sarr | Hautement sensible · validation simple | Sous-caisse Abattoir (inactive depuis 3 mois) |

| Mes demandes (S. Doucouré) | Type | Statut |
|---|---|---|
| VAL-114 | Transfert 1 500 000 CG → BOA | En attente (un autre validateur doit agir : l'initiateur ne valide pas) |
| VAL-109 | Contrepassation dépense 25/08 (double saisie) | Validée par O. Seck le 26/08 |
| VAL-103 | Ajustement −60 000 Sous-caisse Marché | Refusée par O. Seck le 21/08, motif « justificatif manquant » |
| VAL-098 | Transfert 200 000 CG → BOA | Annulée par l'initiateur le 19/08 |

## 10. Demandes administratives (Mata Core §4.1)

| Id | Objet | Initiateur | Date | Statut | Historique |
|---|---|---|---|---|---|
| DEM-031 | Création utilisateur « Khady Sow », commerciale MaaS Ouakam | B. Fall (Gérant MaaS) | 27/08 | En attente | Soumise 27/08 09:15 |
| DEM-030 | Nouvel accès : prolongation Comptable externe C. Mbaye jusqu'au 31/12/2026 | F. Sarr | 26/08 | **Retournée** | Retour S. Doucouré 26/08 : « préciser la date de fin et le périmètre demandé » ; correction attendue de l'initiateur |
| DEM-029 | Création fournisseur « Ferme Ndiaye » | F. Sarr | 25/08 | Validée | Validée par S. Doucouré 25/08 17:40 → compte Fournisseur créé, compte de paiement de référence : Caisse générale |
| DEM-028 | Permission temporaire « Exporter dépenses » 1 semaine | F. Sarr | 24/08 | Refusée | Refusée par O. Seck 24/08 : « export réservé aux Admins, passer par un relevé fournisseur » |
| DEM-027 | Création client « Restaurant Teranga » | B. Fall | 23/08 | Annulée | Annulée par l'initiateur 23/08 |

## 11. Registre des agents IA (Mata Core §7.2)

| Id | Agent | Type | Autonomie | Modules | Modèle par défaut | Budget plafond / mois | Consommé | Override | Environnement |
|---|---|---|---|---|---|---|---|---|---|
| AG-01 | Conseiller financier Mata | Conseiller | Conseil | Mata Finance (lecture) | Économique | 150 000 (éditable) | 93 000 (62 %) | **Modèle avancé actif jusqu'au 27/08 18:00**, demandé par S. Doucouré, audité | Production (lecture seule, pas d'écriture) |
| AG-02 | Assistant réconciliation | Exécutant | Préparation + confirmation humaine | Mata Finance (réconciliation) | Économique | 80 000 | 12 400 (16 %) | — | **Test / Recette** (droits d'écriture → badge obligatoire) |
| AG-03 | Assistant Demandes | Conseiller | Conseil | Mata Core (Demandes) | Économique | 40 000 | 0 | — | Inactif |

Droits effectifs d'un agent = droits de l'agent ∩ droits du profil de l'utilisateur. Interrogation à la demande uniquement.

## 12. Notifications (boîte de S. Doucouré) et Alertes (règles)

Boîte de réception (Core §6.1) :

| Heure | Type | Critique | Message |
|---|---|---|---|
| 21:15 | Réconciliation | oui | Écart −25 000 sur Sous-caisse Marché (déclaré par M. Diop) |
| 19:02 | Validation | oui | Ajustement +180 000 Caisse générale : 2e validation requise (1re : O. Seck) |
| 18:05 | Validation | oui | Transfert 600 000 BOA → CG proposé par F. Sarr |
| 17:30 | Fournisseurs | oui | Échéance dépassée : ŒUFS 1 150 000 (25/08) |
| 15:24 | Fournisseurs | non | Plafond d'encours dépassé : AGNEAUX 12,4 M / 10 M |
| 12:00 | Comptes | oui | Relais « Bictorys → Banque en cours » ouvert depuis 3 jours (seuil 2 j) |
| 08:12 | Sources | non | Synchronisation Bictorys réussie (2 890 000) |
| 08:00 | Sources | non | Import relevé BOA réussi : 14 lignes, 0 doublon |
| 02:04 | Réconciliation | non | Encaissements collectés du 26/08 validés (4 725 000) |
| 26/08 23:00 | Dépenses | oui | 1 dépense « Pas sûr » non résolue à 23:00 |

Règles d'alerte (écran Alertes) :

| Règle | Canal | Destinataires | Criticité | Actif |
|---|---|---|---|---|
| Écart de réconciliation | Email + centre | Admin, DG, Collecteur | Critique (non désactivable) | Oui |
| Dépense « Pas sûr » à 23:00 | Email + centre | Directeur des Opérations, Admins, Super Admin | Critique | Oui |
| Échéance fournisseur dépassée | Centre | Directeur des Opérations | Haute | Oui |
| Plafond d'encours dépassé | Centre | Directeur des Opérations, DG | Informative | Oui |
| Relais ouvert au-delà du seuil (2 j) | Centre | Admin | Haute | Oui |
| Ajustement inhabituel (> 500 000 ou > 3 par jour) | Email + centre | DG, Super Admin | Critique (non désactivable) | Oui |
| Source non à jour | Centre | Admin | Haute | Oui |
| Budget agent IA > 80 % | Centre | Super Admin | Informative | Oui |
| Correction post-clôture | Email | Super Admin | Critique (non désactivable) | Oui |
| Sauvegarde échouée | Email | Super Admin | Critique | Oui |

## 13. Audit central (Core §5.4) — extrait du 27/08

| Heure | Acteur | Profil | Module | Action | Type | Sensibilité | Objet / détail |
|---|---|---|---|---|---|---|---|
| 21:12 | M. Diop | Gestionnaire de caisse | Finance | Déclaration | Modification | Hautement sensible | Sous-caisse Marché : déclaré 1 250 000 (théorique 1 275 000) |
| 19:02 | O. Seck | DG Mata | Finance | 1re validation | Modification | Hautement sensible | VAL-117 ajustement +180 000 Caisse générale |
| 18:05 | F. Sarr | Directeur des Opérations | Finance | Proposition transfert | Modification | Hautement sensible | 600 000 BOA → CG |
| 17:00 | API Achat | (interface) | Finance | Import idempotent | Modification | Sensible | 5 achats du jour intégrés, 0 doublon |
| 16:42 | S. Doucouré | Super Admin | Finance | Proposition transfert | Modification | Hautement sensible | 1 500 000 CG → BOA |
| 15:30 | S. Doucouré | Super Admin | Core | Override modèle agent | Modification | Sensible | AG-01 : modèle avancé jusqu'à 18:00 |
| 14:05 | O. Seck | DG Mata | Finance | Consultation | **Consultation** | Hautement sensible | Historique Caisse générale |
| 11:20 | S. Doucouré | Super Admin | Core | Attribution de droit | Modification | Sensible | Profil « Comptable externe » attribué à C. Mbaye, accès temporaire 01/09 → 30/09 |
| 09:15 | B. Fall | Gérant MaaS | Core | Demande | Modification | Standard | DEM-031 création utilisateur |
| 08:12 | API Bictorys | (interface) | Finance | Synchronisation | Modification | Hautement sensible | Position externe Bictorys : 2 890 000 |
| 08:00 | Import CSV | S. Doucouré | Finance | Import relevé | Modification | Hautement sensible | Banque BOA : 14 lignes |
| 02:04 | Moteur réconciliation | (automatisation) | Finance | Auto-validation | Modification | Hautement sensible | Encaissements collectés 4 725 000 |
| 26/08 23:59 | Système | (automatisation) | Finance | Gel | Modification | Sensible | 2 opérations passées « À réconcilier » |

Réponse type à « qui a donné quel droit à qui, quand, sous quel profil ? » : S. Doucouré, sous le profil Super Admin, a attribué le profil Comptable externe à C. Mbaye le 27/08 à 11:20 (accès temporaire 01/09 → 30/09).

## 14. Snapshots (Finance §8.6)

| Date | Origine | Auteur | Contenu (agrégats uniquement) |
|---|---|---|---|
| 26/08 22:14 | Auto post-clôture | Système | P&L Global 25 105 000 · hors Invest. 43 105 000 · hors Spéciales 31 605 000 · Trésorerie totale contrôlée 60 790 000 · Dettes fourn. 23 100 000 · Créances 19 925 000 |
| 25/08 23:59 | Auto filet 23:59 | Système | P&L Global 24 380 000 · Trésorerie totale contrôlée 59 950 000 |
| 24/08 18:30 | Manuel | S. Doucouré, motif « avant correction du transfert 24/08 » | P&L Global 23 900 000 · Trésorerie totale contrôlée 59 400 000 |
| 23/08 21:50 | Auto post-clôture | Système | P&L Global 23 210 000 |

Comparer snapshot 26/08 à l'état recalculé au 26/08 : Trésorerie totale contrôlée 60 790 000 → 60 970 000 (**+180 000**, ajustement VAL-117 en cours, contrepassation tracée) ; P&L Global inchangé.

## 15. Stock (lecture seule dans Mata Finance)

Valeur début de mois 39 000 000 · valeur courante 41 235 000 · ΔS +2 235 000 · source Stock OK (27/08 06:00). Par site : Abattoir 22 400 000 · Dépôt central 12 835 000 · Points de vente 6 000 000.

## 16. Incidents (Core §8.3) et versions

| Id | Criticité | Statut | Objet | Ouvert par |
|---|---|---|---|---|
| INC-014 | Majeur | En cours | Import CSV BOA : référence dupliquée sur 2 lignes du 26/08 | S. Doucouré, 27/08 08:05 |
| INC-013 | Mineur | Résolu | Libellé tronqué écran Dépenses sur mobile | F. Sarr, 25/08 |
| INC-012 | Critique | Clos | Synchronisation Bictorys en erreur pendant 2 h le 21/08 | Système, 21/08 |

Versions affichées : Mata Core v0.9.0 (maquette) · Mata Finance v0.9.0 (maquette). Changelog simple : 0.9.0 — maquette de validation panel ; 0.8.0 — cadrage V13.

## 17. Paramètres transverses (Core §6.4)

Fuseau : Dakar / GMT · Devise : FCFA · Heure de gel : 23:59 · Heure notification « Pas sûr » : 23:00 · Seuil relais ancien : 2 jours · Seuil ajustement inhabituel : 500 000 et 3 par jour · Conservation des exports : 7 jours · Sauvegarde : tous les 3 jours, rétention 30 jours · Audit : modifications 24 mois en base active puis archive froide 10 ans ; consultations 90 jours puis résumées.

## 18. Sensibilité par écran (badge obligatoire)

| Hautement sensible | Sensible | Standard |
|---|---|---|
| Comptes, Transferts, Validations, Réconciliation (Caisses), Audit central | Dashboard, Dépenses, Fournisseurs, Créances, Déclarations, P&L, Historique, Visualisation, Utilisateurs, Droits effectifs, Demandes, Agents IA, Paramètres, Import/Export | Hub, Entités, Notifications, Alertes, Stock (lecture), Incidents |
