# Retours de recette sur la maquette

Liste de suivi des retours émis par Saliou en testant la maquette interactive (`design/erp-mata.html`). Elle s'enrichit au fil des passages de recette. Chaque retour porte un identifiant stable `R-nn` réutilisé dans les messages de commit.

Statuts : **Corrigé** (fait et vérifié), **À cadrer** (périmètre à écrire et à valider avant code), **À faire** (cadré et arbitré, reste à coder), **Arbitrage** (une question bloque).

Priorité de lecture en cas de conflit : cahier des charges V13, puis architecture, puis ces retours.

---

## Passage de recette 1 (07/09/2026)

### Transverse

**R-01 · Scroll des fenêtres modales.** Statut : **Corrigé**.
Une modale plus haute que l'écran débordait du centrage flex sans jamais devenir atteignable : le scroll de page ne l'atteint pas, et ses actions restaient hors champ. Constaté sur « Nouvel utilisateur » (bouton « Créer le compte » invisible) et sur « Ajouter une exception », mais la cause était commune aux 66 modales.
Correction : `max-height:calc(100dvh - 36px)`, `overflow-y:auto` et `overscroll-behavior:contain` sur `#app .modal` (`10_continuite.css`). Une seule règle couvre tous les écrans.
Vérifié en 1440x700, 1440x560 et 375x667 : la modale tient dans l'écran, défile en interne, et « Créer le compte » est atteignable.

**R-02 · En-têtes de colonnes figés sur les tableaux longs.** Statut : **À faire**, arbitré le 10/09.
Décision : option 1, hauteur plafonnée et défilement dans le cadre, à partir de 15 lignes, desktop et mobile.
Demande : au défilement vertical, les en-têtes restent visibles.
Diagnostic mesuré dans Chromium : le conteneur `.tbl-scroll` porte `overflow-x:auto`, ce qui fait calculer `overflow-y:auto` par le navigateur. Il devient donc le scrollport de référence pour `position:sticky`, alors qu'il ne défile jamais verticalement. Un en-tête `sticky` y est inerte : au défilement de page il part à -306 px, hors écran. Le figeage ne s'obtient pas en ajoutant deux lignes de CSS.

**R-03 · Filtres par colonne et recherche textuelle sur tous les tableaux.** Statut : **À faire**, arbitré le 10/09.
Décision : les puces de filtre déjà présentes (Déclarations, Alertes) sont conservées comme raccourcis au-dessus du tableau, en plus du filtre par colonne.
Comportement standard des tableaux de l'application, Mata Core inclus, pas une fonctionnalité d'écran. Filtre par colonne quand il est pertinent, recherche textuelle quand elle est pertinente. Exemple cité : filtrer sur État = OK dans le tableau de réconciliation.
À écrire au cadrage : un composant transverse unique, la déclaration du type de filtre par colonne (énumération, texte, montant, date), le comportement combiné filtre plus recherche, la persistance ou non entre deux visites, le rendu mobile, et l'articulation avec les puces de filtre déjà présentes sur certains écrans (Déclarations, Alertes) pour éviter deux mécanismes concurrents.

### Pédagogie de la maquette, à retirer en production

**R-04 · Écran d'accueil.** Statut : **À cadrer**.
La section qui détaille les 27 écrans et le bloc de contexte qui explique la maquette disparaissent en production. À écrire explicitement dans les specs de développement pour éviter toute confusion entre support de validation et application livrée.

**R-05 · Blocs explicatifs dans les écrans.** Statut : **À faire**, arbitré le 10/09.
Décision : le contenu des panneaux « Comment ça marche ? » est redécoupé en infobulles « ? » rattachées aux éléments qu'elles expliquent. Rien du contenu validé n'est perdu.
Les textes qui expliquent les entités, leur rôle et le fonctionnement des écrans disparaissent en production. Les explications fonctionnelles restent accessibles par les « ? » : survol sur desktop, interaction équivalente adaptée au tactile sur mobile.

### Règles métier

**R-06 · Confidentialité des montants lors des déclarations.** Statut : **À faire**, arbitré le 10/09.
Décision : le déclarant ne voit que le statut, « Réconciliée » ou « À réconcilier, en investigation ». Aucun montant théorique, aucune valeur d'écart, y compris dans l'historique « Mes déclarations » et dans le cloisonnement entre sources.
Règle énoncée : le déclarant ne voit jamais le montant calculé par le système, ni avant ni après sa déclaration. Le cloisonnement vaut aussi entre sources : la source A ne voit jamais le montant de la source B, et réciproquement, pour que chaque déclarant travaille sans influence.
État actuel de la maquette : le masquage avant déclaration est en place, mais le théorique est révélé après déclaration (« théorique révélé après déclaration », écran Déclarations, vues Gestionnaire et Collecteur). Le retour durcit la règle du cahier, qui ne couvrait que l'avant.

**R-07 · Trésorerie nette fournisseur au tableau de bord.** Statut : **À faire**, arbitré le 10/09.
Décision : Trésorerie totale contrôlée − Dettes fournisseurs brutes = 61 305 000 − 23 250 000 = 38 055 000. Les avances fournisseurs (350 000) restent affichées à part et n'entrent pas dans le calcul. Libellé retenu à l'écran : « Trésorerie nette fournisseur ».
Indicateur demandé : ce qui resterait disponible si tous les fournisseurs étaient payés.

**R-08 · Évolution historique des 5 types de trésorerie.** Statut : **À faire**, arbitré le 10/09.
Décision : les cinq séries sont Trésorerie disponible, Trésorerie en transit, Trésorerie totale contrôlée, Position financière nette, Trésorerie nette fournisseur. Sélection d'une seule ou de plusieurs, superposées sur le même graphique. Les courbes restent dans le tableau de bord.
Le tableau de bord doit permettre de suivre l'évolution des types de trésorerie, un seul ou plusieurs à la fois, superposés sur le même graphique pour comparaison. Les graphiques de trésorerie restent strictement dans le tableau de bord.
État actuel : le graphique n'affiche qu'une série (Trésorerie totale contrôlée) et son bouton « Superposer » renvoie vers l'écran Visualisation, ce qui contredit la consigne de garder ces courbes dans le tableau de bord.

**R-09 · Allègement visuel du tableau de bord.** Statut : **À cadrer**.
Les informations présentes sont toutes utiles, la densité est trop forte. Travail attendu sur la hiérarchisation, les regroupements et l'affichage progressif. Les graphiques de trésorerie restent visibles sans repli.
À noter : R-07 et R-08 ajoutent un indicateur et un sélecteur de séries sur cet écran. Traiter l'allègement dans le même lot pour ne pas densifier puis dédensifier.

**R-10 · Saisie manuelle des créances et des remboursements.** Statut : **À faire**, arbitré le 10/09.
Décision : écriture directe, sans validation. Le Directeur des Opérations détient ce droit par défaut. Création d'une créance sans vente et enregistrement d'un remboursement sans versement, tous deux couverts par l'audit de modification. Mesure transitoire assumée : une fois la refonte terminée, toutes les créances naîtront des ventes et ce circuit manuel sera retiré. À écrire comme telle dans les specs pour qu'elle ne survive pas à la refonte.
L'écran Créances doit permettre d'enregistrer une nouvelle créance et le remboursement d'une créance existante. Aujourd'hui il ne propose que « Accorder une créance », modélisé comme une autorisation de crédit sans effet sur la position.
Point déjà ouvert au panel (`AMBIGUITES_PANEL.md`, questions de revue, point 2) et clos par cet arbitrage.

### Périmètre V1

**R-11 · Règles d'alerte figées.** Statut : **À cadrer**.
La création libre de règles d'alerte introduit trop d'ambiguïté. En V1, on fige les règles définies dans le cahier. L'écran Alertes conserve les 8 règles existantes et leur configuration (activation, seuils, destinataires) ; le bouton « Nouvelle règle » disparaît.
À vérifier au cadrage : les règles critiques non désactivables restent identifiées comme telles, et la suppression du bouton ne retire pas la permission `core.alertes.modifier` qui sert aussi à régler les seuils.

**R-12 · Formulaire guidé de création d'un agent IA.** Statut : **À faire**, arbitré le 10/09.
Décisions : l'analyse du besoin repose sur une grille de correspondance entre types de tâches et modèles, tenue dans les paramètres et modifiable sans redéploiement. La liste des modèles et de leurs coûts vit dans Mata Core. Le remplacement du modèle proposé passe par deux détenteurs de core.agents.budget, distincts de l'initiateur et distincts entre eux ; l'agent reste inactif tant que la deuxième validation n'est pas acquise.
Remplacer la configuration libre par un parcours guidé : l'utilisateur décrit ce que l'agent doit faire, l'application analyse le besoin, elle propose le modèle le moins cher capable de réaliser la tâche correctement, la liste des modèles disponibles reste configurable, l'utilisateur peut remplacer le modèle proposé, et ce remplacement passe par une double validation.
Rappel du cahier applicable en l'état : l'agent IA reste une API de lecture uniquement, bornée au périmètre de l'utilisateur.

**R-13 · Retrait du paramètre Devise.** Statut : **À cadrer**.
La V1 est en FCFA uniquement. Le paramètre `devise` de l'écran Paramètres (portée globale, sensible, valeur unique FCFA) est retiré, ainsi que sa mention dans le compteur de paramètres sensibles et dans le panneau d'aide. Le formatage des montants reste en FCFA entiers sans décimales, en dur.

### Confort d'usage

**R-14 · Champ « Objet concerné » de l'écran Droits effectifs.** Statut : **À cadrer**.
Le libellé n'est pas explicite pour l'utilisateur. Ajouter une explication de ce que le champ désigne et de ce qu'on y saisit, avec un exemple, dans l'aide contextuelle du champ.

**R-15 · Lien vers l'objet dans le détail d'une notification.** Statut : **À cadrer**.
Le détail d'une notification doit offrir un lien cliquable vers l'écran et vers l'objet concerné, pour aller traiter le sujet directement. Le tableau propose déjà un bouton qui ouvre l'écran ; il manque l'ouverture de l'objet précis (la ligne, la fiche, la validation en attente) et le lien dans le panneau de détail.

---

## Arbitrages rendus

Séance du 10/09/2026, Saliou. Les recommandations portées au document ont été retenues, sauf R-10.

| Réf. | Décision |
|---|---|
| R-02 | Hauteur plafonnée et défilement dans le cadre au-delà de 15 lignes, desktop et mobile |
| R-03 | Filtre par colonne partout, puces existantes conservées en raccourcis |
| R-05 | Panneaux d'aide redécoupés en infobulles « ? », contenu conservé |
| R-06 | Statut seul après déclaration, ni théorique ni écart, historique compris |
| R-07 | Dettes fournisseurs brutes, avances exclues, soit 38 055 000 |
| R-08 | Disponible, En transit, Totale contrôlée, Position financière nette, Nette fournisseur |
| R-10 | Écriture directe sans validation, droit par défaut du Directeur des Opérations, mesure transitoire |
| R-12 | Grille de correspondance dans les paramètres, liste des modèles dans Mata Core, double validation par deux détenteurs de core.agents.budget |

Reste à valider par Ousmane (DG) pour les points qui touchent une règle métier : R-06 et R-10.
