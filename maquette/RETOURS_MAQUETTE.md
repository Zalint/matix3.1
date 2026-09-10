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

**R-02 · En-têtes de colonnes figés sur les tableaux longs.** Statut : **Corrigé**, arbitré le 10/09.
Décision : hauteur plafonnée et défilement dans le cadre, au-delà de 15 lignes, desktop et mobile.
Demande : au défilement vertical, les en-têtes restent visibles.
Diagnostic mesuré dans Chromium : le conteneur `.tbl-scroll` porte `overflow-x:auto`, ce qui fait calculer `overflow-y:auto` par le navigateur. Il devient donc le scrollport de référence pour `position:sticky`, alors qu'il ne défile jamais verticalement. Un en-tête `sticky` y est inerte : au défilement de page il part à -306 px, hors écran. Le figeage ne s'obtient pas en ajoutant deux lignes de CSS.
Correction : le moteur marque `.tall` tout `.tbl-scroll` dont le corps dépasse 15 lignes visibles, à l'ouverture de l'écran et après chaque filtrage (`filterRows`, et `ctx.refreshTall` pour les écrans qui filtrent eux-mêmes). Le CSS lui donne alors un plafond de `min(68dvh, 600px)` avec en-tête et pied de tableau collés. La bordure basse de l'en-tête passe en `box-shadow` : une bordure sur un élément `sticky` ne suit pas le défilement.
Trois tableaux franchissent le seuil : Comptes (29 lignes), Entités (16) et Créances (15, sous le seuil, donc inchangé). Vérifié en 1440 et 375, thèmes clair et sombre : l'en-tête tient au défilement du cadre, aucun débordement horizontal de la page, aucune erreur JS.

**R-03 · Filtres par colonne et recherche textuelle sur tous les tableaux.** Statut : **Corrigé**, arbitré le 10/09.
Décision : les puces de filtre déjà présentes (Déclarations, Alertes) sont conservées comme raccourcis au-dessus du tableau, en plus du filtre par colonne.
Comportement standard des tableaux de l'application, Mata Core inclus, pas une fonctionnalité d'écran. Filtre par colonne quand il est pertinent, recherche textuelle quand elle est pertinente. Exemple cité : filtrer sur État = OK dans le tableau de réconciliation.
Correction : le moteur pose une barre au-dessus de chaque tableau d'au moins 5 lignes, hors tiroirs et modales, avec une recherche plein texte, un menu par colonne filtrable et le compte des lignes affichées. Une colonne est retenue si elle porte de 2 à 10 valeurs distinctes, courtes, sans montant ni bouton ; `<th data-nofilter>` l'exclut explicitement. La valeur de filtre d'une cellule est son statut ou son étiquette, sinon son texte principal débarrassé des qualificatifs `.hint` et `small`.
Les deux mécanismes de filtrage cohabitent sans se marcher dessus : les écrans continuent d'écrire `tr.hidden` pour leurs puces, la barre passe par la classe `f-out`, et une ligne s'affiche si aucun des deux ne l'écarte. Les puces existantes sont donc conservées comme raccourcis, conformément à l'arbitrage.
Résultat : 21 écrans sur 27 reçoivent une barre, 65 filtres de colonne au total. Vérifié en 1440 et 375, thèmes clair et sombre : recherche, filtre, combinaison des deux, réinitialisation, recalcul du plafond de hauteur de R-02, aucun débordement horizontal, aucune erreur JS.
À noter sur l'exemple cité : la colonne État du tableau des sources de Réconciliation ne reçoit pas de filtre, ses 7 lignes valant toutes « OK ». Filtrer une colonne à valeur unique n'apporte rien. Le second tableau du même écran reçoit bien un filtre « Statut », et l'écran Fournisseurs un filtre « État ».

### Pédagogie de la maquette, à retirer en production

**R-04 · Écran d'accueil.** Statut : **Corrigé**.
La section qui détaille les 27 écrans et le bloc de contexte qui explique la maquette disparaissent en production.
Correction : plutôt que de retirer cette pédagogie de la maquette, qui reste le support de validation, un basculement « Vue production » dans la barre du haut la masque et montre exactement ce que reçoit la production. Ce qui disparaît : les boutons et panneaux « Comment ça marche ? », les paragraphes d'explication en tête d'écran, le texte de présentation de l'accueil, et tout élément marqué `data-maquette-only`.
La règle est donc démontrable au lieu d'être seulement écrite : la spec de développement dit que la production ne reçoit pas ce que la vue production masque.

**R-05 · Blocs explicatifs dans les écrans.** Statut : **Corrigé**, arbitré le 10/09.
Décision : le contenu des panneaux « Comment ça marche ? » est redécoupé en infobulles « ? » rattachées aux éléments qu'elles expliquent. Rien du contenu validé n'est perdu.
Le mécanisme « ? » existe déjà, c'est le bouton `.fx` du §3 du contrat, avec survol sur desktop et tap sur mobile.
Couverture mesurée écran par écran, pédagogie masquée : 191 infobulles pour 155 points d'aide. La plupart des écrans ne perdent rien. Quatre faisaient exception et ont été enrichis de 22 infobulles : Entités 0 → 5, Validations 1 → 7, Profils et rôles 2 → 8, Droits effectifs 2 → 7. Chaque point d'aide de ces écrans a trouvé son ancrage, aucun panneau n'a été supprimé.

**Défaut trouvé en vérifiant l'exigence tactile, et corrigé.** Le retour demandait « une interaction équivalente adaptée au mobile ». Elle ne fonctionnait pas : au tap, l'infobulle s'ouvrait puis se refermait aussitôt. Le tap donne le focus au bouton, `focusin` ouvrait l'infobulle, et le clic du même tap la refermait en croyant à une seconde pression. L'aide « ? » était donc inatteignable au doigt sur les 27 écrans.
Correction dans le moteur : le survol passe de `mouseover` à `pointerover` filtré sur `pointerType === 'mouse'`, et l'ouverture au focus est réservée au focus clavier via `:focus-visible`. Le tap passe désormais par le gestionnaire de clic, seul responsable sur tactile.
Vérifié sur profil iPhone 12 tactile et en desktop : le tap ouvre puis referme, le survol souris ouvre, la navigation clavier ouvre.

### Règles métier

**R-06 · Confidentialité des montants lors des déclarations.** Statut : **Corrigé** sur l'écran Déclarations, arbitré le 10/09. Voir R-16 pour le reste de l'application.
Décision : le déclarant ne voit que le statut, « Réconciliée » ou « À réconcilier, en investigation ». Aucun montant théorique, aucune valeur d'écart, y compris dans l'historique « Mes déclarations » et dans le cloisonnement entre sources.
Règle énoncée : le déclarant ne voit jamais le montant calculé par le système, ni avant ni après sa déclaration. Le cloisonnement vaut aussi entre sources : la source A ne voit jamais le montant de la source B, et réciproquement, pour que chaque déclarant travaille sans influence.
La maquette masquait le théorique avant la déclaration et le révélait après. Le retour durcit la règle du cahier, qui ne couvrait que l'avant.
Correction : dans les quatre vues déclarantes, le panneau de résultat se limite à « Votre déclaration » et « Statut », les colonnes Solde théorique et Écart disparaissent des historiques personnels et du tableau des positions fournisseurs, un bandeau indique que le montant part à l'Admin, au DG et au Collecteur. Le théorique n'est plus injecté que dans la table de contrôle `[data-sa-rows]`, lue par les seuls profils qui ne déclarent pas.
Vérifié dans Chromium sur les quatre profils déclarants et sur le Super Admin, avant et après une déclaration en écart.

**R-07 · Trésorerie nette fournisseur au tableau de bord.** Statut : **Corrigé**, arbitré le 10/09.
Décision : Trésorerie totale contrôlée − Dettes fournisseurs brutes = 61 305 000 − 23 250 000 = 38 055 000. Les avances fournisseurs (350 000) restent affichées à part et n'entrent pas dans le calcul. Libellé retenu à l'écran : « Trésorerie nette fournisseur ».
Indicateur demandé : ce qui resterait disponible si tous les fournisseurs étaient payés.
À noter : l'indicateur existait déjà sur l'écran, nommé « Trésorerie après fournisseurs », avec la bonne formule et la bonne valeur, mais rangé dans le bandeau du bloc Fournisseurs où il passait inaperçu. Correction : il monte en cinquième indicateur de tête sous le nom demandé et quitte le bandeau, pour ne pas figurer deux fois. La grille d'indicateurs passe en colonnes adaptatives afin d'en accueillir cinq sans casser les écrans qui n'en ont que quatre.

**R-08 · Évolution historique des 5 types de trésorerie.** Statut : **Corrigé**, arbitré le 10/09.
Décision : les cinq séries sont Trésorerie disponible, Trésorerie en transit, Trésorerie totale contrôlée, Position financière nette, Trésorerie nette fournisseur. Sélection d'une seule ou de plusieurs, superposées sur le même graphique. Les courbes restent dans le tableau de bord.
Le tableau de bord doit permettre de suivre l'évolution des types de trésorerie, un seul ou plusieurs à la fois, superposés sur le même graphique pour comparaison. Les graphiques de trésorerie restent strictement dans le tableau de bord.
Correction : le graphique devient un graphique à séries multiples avec cinq cases à cocher, et le bouton « Superposer » qui renvoyait vers Visualisation disparaît. Les courbes restent donc dans le tableau de bord.
Les trois nouvelles séries sont dérivées des séries de base à chaque point, pas saisies à la main, pour que les invariants tiennent sur les 30 jours : disponible = totale − transit, nette fournisseur = totale − dettes, position financière nette = totale + avances fournisseurs + créances − dettes − avances clients (§8.1). Les valeurs du 27/08 tombent sur les indicateurs de tête : 58,45 + 2,85 = 61,30, nette fournisseur 38,05, position nette 58,33.
La palette reste limitée aux trois couleurs CVD validées : cinq courbes se distinguent par la couleur et par le trait, plein ou pointillé, et chaque case à cocher porte le témoin de sa courbe. Sans lui la légende ne disait pas quelle courbe était laquelle.

**R-09 · Allègement visuel du tableau de bord.** Statut : **Corrigé**.
Les informations présentes sont toutes utiles, la densité est trop forte. Travail attendu sur la hiérarchisation, les regroupements et l'affichage progressif. Les graphiques de trésorerie restent visibles sans repli.
Correction : affichage progressif, aucune information retirée. Le bloc Trésorerie reste ouvert avec ses cinq indicateurs, son graphique, le détail par compte et les caisses à réconcilier. Les six blocs suivants (Fournisseurs, Échéancier, Clients, Activité du jour, Contrôles, P&L) arrivent repliés, chacun avec une ligne qui dit ce qu'il contient, et se déplient d'un clic.
Le repli est un mécanisme transverse du moteur, `data-fold` et `data-fold-sum` sur une carte, disponible pour les autres écrans. Il s'applique après la barre de filtre pour que celle-ci se replie avec son tableau, et redessine les graphiques au dépliage.
Mesuré : la page passe de 4 899 px à 1 942 px à l'arrivée, soit 60 % de moins, sans rien perdre.

**R-10 · Saisie manuelle des créances et des remboursements.** Statut : **Corrigé**, arbitré le 10/09.
Décision : écriture directe, sans validation. Le Directeur des Opérations détient ce droit par défaut. Création d'une créance sans vente et enregistrement d'un remboursement sans versement, tous deux couverts par l'audit de modification. Mesure transitoire assumée : une fois la refonte terminée, toutes les créances naîtront des ventes et ce circuit manuel sera retiré. À écrire comme telle dans les specs pour qu'elle ne survive pas à la refonte.
L'écran Créances doit permettre d'enregistrer une nouvelle créance et le remboursement d'une créance existante. Aujourd'hui il ne propose que « Accorder une créance », modélisé comme une autorisation de crédit sans effet sur la position.
Point déjà ouvert au panel (`AMBIGUITES_PANEL.md`, questions de revue, point 2) et clos par cet arbitrage.
Correction : bouton « Saisie manuelle » et modale à deux modes, créance sans vente ou remboursement sans versement, avec contrepartie, montant, date métier et motif obligatoire. L'écriture agit tout de suite sur la position du client, sur le total des créances et sur les indicateurs, ce que « Accorder une créance » ne fait pas. Nouvelle permission `finance.creances.saisir`, accordée par défaut au Directeur des Opérations et au Super Admin ; les autres profils voient le bouton désactivé avec son motif de refus. Un encart rappelle dans la modale et dans l'aide que le circuit est transitoire.
Vérifié dans Chromium : créance de 500 000 puis remboursement de 200 000 sur Restaurant Le Baobab, position 2 400 000 → 2 900 000 → 2 700 000 et total des créances suivi à chaque écriture ; saisie sans motif refusée ; bouton désactivé pour le Gérant MaaS ; motif contenant du HTML échappé et non interprété.

### Périmètre V1

**R-11 · Règles d'alerte figées.** Statut : **Corrigé**.
La création libre de règles d'alerte introduit trop d'ambiguïté. En V1 le catalogue est fermé aux règles définies au cahier.
Correction : bouton « Nouvelle règle », modale de création et bouton « Créer la règle » du signal « Caisses à réconcilier » retirés, avec le code et le CSS devenus morts. Les 10 règles du cahier (et non 8, décompte corrigé), les 3 verrous des règles critiques non désactivables et les 12 commandes de configuration sous `core.alertes.modifier` restent en place. La fermeture du catalogue est signalée dans la note d'écran, le bandeau d'en-tête, le bloc « Refus par défaut » et l'aide, présentée comme une décision de périmètre V1 et non comme une règle du cahier.

**R-12 · Formulaire guidé de création d'un agent IA.** Statut : **Corrigé**, arbitré le 10/09.
Décisions : l'analyse du besoin repose sur une grille de correspondance entre types de tâches et modèles, tenue dans les paramètres et modifiable sans redéploiement. La liste des modèles et de leurs coûts vit dans Mata Core. Le remplacement du modèle proposé passe par deux détenteurs de core.agents.budget, distincts de l'initiateur et distincts entre eux ; l'agent reste inactif tant que la deuxième validation n'est pas acquise.
Remplacer la configuration libre par un parcours guidé : l'utilisateur décrit ce que l'agent doit faire, l'application analyse le besoin, elle propose le modèle le moins cher capable de réaliser la tâche correctement, la liste des modèles disponibles reste configurable, l'utilisateur peut remplacer le modèle proposé, et ce remplacement passe par une double validation.
Rappel du cahier applicable en l'état : l'agent IA reste une API de lecture uniquement, bornée au périmètre de l'utilisateur.
Correction : parcours en trois étapes, Besoin puis Modèle puis Création, à la place de la configuration libre. L'utilisateur décrit le besoin en français ; l'écran affiche le type de tâche reconnu, la capacité requise, le modèle proposé, le périmètre de lecture déduit et la source de la règle, avec la grille de correspondance dépliable. Le texte dit explicitement qu'aucun modèle n'a été appelé pour l'analyse. Le remplacement du modèle déclenche l'avertissement de double validation, câblé sur les mécanismes `data-initiator` et `data-validated-by` du moteur, et l'agent naît Inactif. Les choix figés par le cahier (catégorie Conseiller, aucune écriture directe) ne sont plus des menus.
Vérifié dans Chromium : passage de l'étape 1 à l'étape 2, reconnaissance du type « Préparation de réconciliation », proposition du modèle de rang de coût le plus faible, aucune erreur JS.

Deux points à trancher, remontés par cette implémentation :
1. **Les coûts des modèles n'existent pas dans les fixtures.** Le cahier ne donne que « Économique » et « Modèle avancé », sans prix. L'écran affiche donc un rang de coût plutôt qu'un montant, et renvoie au référentiel Mata Core. Il faut fournir la grille des coûts pour que « le moins cher capable » soit démontrable.
2. **La double validation ne peut pas aboutir dans la maquette.** Seul le Super Admin détient `core.agents.budget` (FIXTURES §2). Exiger deux validateurs distincts de l'initiateur et l'un de l'autre rend l'opération impossible avec la matrice actuelle. Soit la permission est étendue à un second profil, soit la règle est allégée pour ce cas. L'écran le dit au lieu de tordre la matrice.

**R-13 · Retrait du paramètre Devise.** Statut : **Corrigé**.
La V1 est en FCFA uniquement. Le paramètre `devise` est retiré, et les décomptes sont recomptés sur le tableau réel : 9 paramètres transverses, 4 globaux, 3 avec override, 2 locaux, 6 sensibles pour 3 standard. Repris dans les cartes du bandeau, le compteur du tableau Global et les trois passages du panneau d'aide. Le formatage des montants reste en FCFA entiers sans décimales, en dur.

### Confort d'usage

**R-14 · Champ « Objet concerné » de l'écran Droits effectifs.** Statut : **Corrigé**.
Le champ porte une aide au format des autres champs de la maquette (formule, composantes, source) : ce que l'objet désigne, ce qu'on y saisit, et l'exemple VAL-114 qui montre que renseigner l'objet fait basculer la réponse au niveau 1 là où la même question sans objet répondrait « autorisé ». Le bloc « Contexte évalué » emploie désormais le même libellé que le champ.

**R-15 · Lien vers l'objet dans le détail d'une notification.** Statut : **Corrigé**.
Chaque notification porte la référence de l'objet concerné, tirée des fixtures (VAL-117, DEM-031, Sous-caisse Marché, relais « Bictorys → Banque en cours »…). Le tiroir de détail gagne une ligne « Objet concerné » avec son lien, sous permission, à côté du bouton d'ouverture de l'écran : les deux liens demandés.
Limite assumée : la maquette n'a aucun mécanisme de lien profond, `data-goto` ne sait qu'ouvrir un écran. Plutôt que d'en inventer un qui n'existerait nulle part ailleurs, le lien objet ouvre l'écran cible et rappelle la référence à traiter. Un vrai ciblage de ligne est à décider au cadrage technique, pas dans la maquette.

### Constat issu de la vérification de R-06

**R-16 · Le solde système fuit aux déclarants par les autres écrans.** Statut : **Corrigé**, option 2 retenue.
Corriger l'écran Déclarations ne suffit pas à tenir la règle : le même déclarant retrouve son solde théorique et son écart sur les autres écrans de son périmètre. Mesuré dans Chromium en parcourant tous les écrans que chaque profil peut ouvrir :

| Profil | Écrans accessibles | Écrans qui révèlent le théorique ou l'écart de son périmètre |
|---|---|---|
| Gestionnaire de caisse (M. Diop) | 6 | Réconciliation, Comptes, Dépenses, Notifications |
| Collecteur (A. Ndiaye) | 4 | Réconciliation, Notifications |
| Directeur des Opérations (F. Sarr) | 16 | Tableau de bord, P&L, Réconciliation, Comptes, Dépenses |

La question rejoint celle déjà ouverte au panel sur le tableau de bord et les déclarants (`AMBIGUITES_PANEL.md`, questions de revue, point 1). Trois façons de la traiter :
1. Retirer aux profils déclarants les permissions de consultation qui exposent leur propre périmètre, tant qu'une déclaration est attendue. C'est une décision de matrice de permissions, pas d'interface.
2. Masquer, écran par écran, les seules lignes du périmètre que le profil doit déclarer, en réutilisant le mécanisme déjà en place sur le tableau de bord.
3. Assumer que la règle ne vaut que sur l'écran de déclaration, ce qui la vide de son sens puisque le montant reste à deux clics.
Option 2 retenue : retirer les permissions de consultation aurait empêché ces profils de travailler, et s'en tenir à l'écran de déclaration aurait vidé la règle de son sens.

Le comptage initial de 61 occurrences était trompeur. Un périmètre déjà réconcilié n'a plus rien de secret : le déclarant connaît son propre chiffre et sait qu'il correspondait. Sous-caisse Livraisons et les positions AGNEAUX, MATA VOLAILLE CHAIR et MATA VOLAILLE ŒUFS sortent donc du périmètre. Il ne reste réellement secrets que la Caisse générale et la Sous-caisse Marché pour M. Diop, Bétail Thiès et Abattoirs Dakar pour F. Sarr, et la Source A pour le collecteur.

Correction : mécanisme transverse `data-blind="<périmètre>"` dans le moteur, 41 marques posées sur Réconciliation, Comptes, Dépenses, Fournisseurs, Tableau de bord, P&L, Notifications et Incidents. Le cache passe par une classe, jamais en remplaçant le contenu : les scripts d'écran continuent d'écrire dans leurs nœuds, ce qui évitait un plantage au prochain paiement fournisseur, et le contenu réapparaît intact au changement de profil. `applyBlind` est appelé après l'événement `erp:profile`, faute de quoi un écran qui se re-rend effaçait le cache posé avant lui. La cloche de notifications masque le montant de l'écart au déclarant du périmètre concerné, en gardant le fait qu'un écart existe.

Quatre textes d'écran promettaient encore que le montant réapparaît après déclaration, reste de la règle d'avant l'arbitrage R-06. Ils sont réécrits.

Vérifié dans Chromium, profil par profil, en parcourant tous les écrans accessibles : aucun montant système visible pour le gestionnaire de caisse, le directeur des opérations et le collecteur ; le Super Admin garde tout ; un paiement fournisseur ne provoque plus d'erreur ; le cache tient au changement de profil sans quitter l'écran.

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
