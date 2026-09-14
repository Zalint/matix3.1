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
Résultat : 21 écrans sur 27 reçoivent une barre, 27 barres et 72 filtres de colonne au total. Vérifié en 1440 et 375, thèmes clair et sombre : recherche, filtre, combinaison des deux, réinitialisation, recalcul du plafond de hauteur de R-02, aucun débordement horizontal, aucune erreur JS.
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

Correction : mécanisme transverse `data-blind="<périmètre>"` dans le moteur, 24 marques posées sur Comptes, Dépenses, Fournisseurs, Tableau de bord, P&L, Notifications et Incidents, auxquelles s'ajoutent les 19 marques du mécanisme local déjà présent sur Réconciliation, qui indexe par profil et non par périmètre. Le cache passe par une classe, jamais en remplaçant le contenu : les scripts d'écran continuent d'écrire dans leurs nœuds, ce qui évitait un plantage au prochain paiement fournisseur, et le contenu réapparaît intact au changement de profil. `applyBlind` est appelé après l'événement `erp:profile`, faute de quoi un écran qui se re-rend effaçait le cache posé avant lui. La cloche de notifications masque le montant de l'écart au déclarant du périmètre concerné, en gardant le fait qu'un écart existe.

Quatre textes d'écran promettaient encore que le montant réapparaît après déclaration, reste de la règle d'avant l'arbitrage R-06. Ils sont réécrits.

Vérifié dans Chromium, profil par profil, en parcourant tous les écrans accessibles : aucun montant système visible pour le gestionnaire de caisse, le directeur des opérations et le collecteur ; le Super Admin garde tout ; un paiement fournisseur ne provoque plus d'erreur ; le cache tient au changement de profil sans quitter l'écran.

---

## Passage aux cahiers v1.2 / v2.3 (14/09/2026)

Quatre documents reçus, tous postérieurs à ceux qui ont servi à construire la maquette : Mata Core fonctionnel v1.2 et architecture technique v1.2, Mata Finance fonctionnel v2.3 et architecture technique v1.3. La maquette avait été bâtie sur Core v1.1 et Finance v2.2.

### Ce que les nouveaux cahiers valident

Une large part des arbitrages rendus le 10/09 est désormais écrite dans les cahiers. Ce n'est plus une décision de périmètre, c'est la règle.

| Ce qu'on avait arbitré | Où c'est écrit maintenant |
|---|---|
| Le déclarant ne voit ni théorique ni écart, ni avant ni après, historique compris, et aucune source ne voit la valeur d'une autre | Finance §3, §4.8, §5.5, §11.2, §11.3 |
| Créance sans vente et remboursement sans encaissement, sans validation préalable | Finance §6.1, §6.2, §11.2 |
| Catalogue d'alertes fermé en V1, seuls les paramètres autorisés restent réglables | Finance §10.4, Core §6.1 |
| Filtre par colonne et recherche sur tous les tableaux, puces conservées en raccourcis | Core §6.5 |
| En-têtes visibles au-delà de 15 lignes, avec zone de défilement propre au tableau | Core §6.5 |
| Modales entièrement exploitables sans dézoom, contenu défilable, actions atteignables | Core §6.5 |
| Panneaux d'aide permanents hors production, explications rattachées aux champs par un « ? » au survol et à l'équivalent tactile | Core §6.5 |
| Contenus de maquette supprimés en production | Core §6.5 |
| Affichage progressif du tableau de bord plutôt que tout afficher d'un coup | Finance §8.5 |
| Création guidée d'agent par grille tâche vers modèle, double validation du changement permanent | Core §6.4, §7.2 |
| Notification qui ouvre l'écran et l'objet concernés sans conférer de droit | Core §6.1 |

Corrigé en conséquence : les mentions « durci en V1 » et « décision de périmètre V1, hors cahier » que j'avais posées sur ces règles sont retirées, puisqu'elles viennent bien du cahier désormais. Seule subsiste l'hypothèse de maquette sur la désactivation de son propre compte, que le cahier ne tranche toujours pas.

### Ce que les nouveaux cahiers changent, corrigé

**L'indicateur R-07 change de nom.** Le cahier le nomme « Tréso si paiement fournisseur » (Finance §8.1, §8.2, §8.5, §11.3), pas « Trésorerie nette fournisseur ». La formule est inchangée : trésorerie totale contrôlée moins dettes fournisseurs brutes, transit inclus, avances affichées à part. Renommé partout, indicateur de tête et série de graphique.

**Le marquage « Manuelle » est obligatoire.** Finance §6.1 et §6.2 exigent que la créance ou le remboursement manuel soit explicitement marqué, et §6.4 qu'il ne soit jamais assimilé à une vente ou à un encaissement du jour dans la réconciliation. La ligne porte désormais une étiquette « Manuelle » et la modale le dit.

**La permission n'est pas préconfigurée pour le Directeur des Opérations.** Finance §6.1 : « La politique de droits prévoit cette permission pour Directeur des Opérations, Admin et Super Admin ; en Production initiale, seul le profil Super Admin est préconfiguré par Mata Core. » La maquette garde le droit sur le profil Directeur des Opérations, qui n'est qu'un profil suggéré, mais la modale porte la précision.

### Ce qu'il reste à faire

**À cadrer, par ordre de poids.**

**N-01 · Licences et habilitations organisationnelles.** Core §3.6 et technique §7. Entièrement absent de la maquette. Une licence rattachée à un MaaS ou à une entité fille porte au minimum un quota d'utilisateurs et un ensemble de modules ou fonctionnalités autorisés. Une permission ne peut jamais rendre accessible une fonctionnalité exclue par la licence, et une fonctionnalité licenciée ne donne aucun droit par elle-même. Un quota dépassé est refusé explicitement. Impacts : un écran ou une extension de l'écran Entités, le refus explicite à la création d'utilisateur au-delà du quota, et surtout la chaîne de résolution de l'écran Droits effectifs, qui passe de sept à huit niveaux avec « Restriction de licence » en tête.

**N-02 · Profil portable.** Core §3.3 et technique §7. L'écran Profils doit permettre d'exporter une définition de profil et de la réimporter : prévisualisation, contrôle de compatibilité des rôles, permissions et paramètres, création atomique et auditée. Le fichier ne contient jamais d'utilisateur, de mot de passe, de secret ni de donnée personnelle. Format V1 : JSON versionné ne portant que des identifiants stables.

**N-03 · Initialisation Production à un seul profil.** Core §3.3 et §10.2. En Production V1, seul « Super Admin » est prédéfini ; les huit profils de la maquette sont des suggestions de conception, pas un catalogue livré. À dire explicitement sur l'écran Profils, faute de quoi la maquette laisse croire le contraire.

**N-04 · Catalogue des modèles LLM dans les paramètres Core.** Core §6.4. Les paramètres transverses portent le catalogue des modèles disponibles, leurs coûts de référence et la grille tâche vers modèle. Cela referme la question restée ouverte sur R-12 : les coûts existent, ils vivent dans Mata Core, et l'écran Paramètres doit les porter. L'écran Agents IA pourra alors afficher un coût réel au lieu d'un rang.

**N-05 · Règle d'alerte « ajustement inhabituel » enrichie.** Finance §10.4 ajoute deux critères à celui déjà en place : fréquence anormale sur un même compte ou par un même utilisateur, et cumul dépassant un seuil configurable sur une période. La maquette ne connaît que le montant unitaire et le nombre par jour.

**N-06 · Préférence d'affichage des séries de trésorerie.** Finance §8.5 : « la sélection peut être conservée comme préférence d'affichage ». Le sélecteur existe, la persistance non.

**N-07 · Profils d'investigation.** Finance §3, §4.8, §5.5 et §11.3 introduisent une habilitation explicite : « les utilisateurs habilités à investiguer peuvent consulter l'écart et ses composantes ». La maquette raisonne par périmètre déclaré, pas par habilitation d'investigation. Les deux se recoupent aujourd'hui mais ne sont pas la même notion, et c'est la formulation du cahier qui fait foi.

**N-08 · ARCHITECTURE.md.** `CLAUDE.md` annonce ce document comme à venir. Les deux documents techniques en fournissent le contenu : monolithe modulaire et base relationnelle unique, contrats inter-modules en processus, scoping central obligatoire par `entity_id` avec refus par défaut hors contexte, barrière base pour les tables hautement sensibles (comptes, mouvements, positions, ajustements), file de travaux en base principale avec worker séparé, verrouillage optimiste sur toute écriture sensible, montants en entiers FCFA jamais en flottant, justificatifs en stockage objet jamais en base, génération PDF sans navigateur headless, archivage à 24 mois pour les modifications et 90 jours pour les consultations, adaptateur bancaire encapsulant le CSV V1, aucun composant distribué sans justification mesurée.

### Ce qui reste sans réponse

La déduction par soustraction depuis les agrégats, relevée par les deux revues adversariales, n'est pas traitée par les nouveaux cahiers. Finance §3 et §11.2 disent ce que le déclarant ne doit pas voir, pas ce qu'il ne doit pas pouvoir calculer. Le tableau de bord et le P&L affichent au Directeur des Opérations tous les termes sauf un, et l'échéancier fournisseur redonne la position masquée. La question reste entière et demande un arbitrage.

---

## Revues avant merge (PR #1)

Trois revues indépendantes en contexte vierge, exigées par `CLAUDE.md` : ce lot dépasse 300 lignes, touche les permissions et la réconciliation, et modifie le contrat. Une relecture de code générale, une revue adversariale sur les règles métier, une revue adversariale sur la robustesse ayant parcouru les 27 écrans avec les 8 profils.
Aucune erreur JavaScript sur 28 écrans par 8 profils, aucun débordement horizontal en 1440 ni en 375, clair et sombre. 22 constats corrigés.

**Corrigé à la suite des revues :**

| Constat | Correction |
|---|---|
| Fournisseurs : la dette et son pourcentage réaffichaient la position masquée de Bétail Thiès | `blind()` masque aussi `[data-enc]`, `[data-pct]` et la barre d'encours |
| Fournisseurs : l'avance d'Abattoirs Dakar restait en clair dans le bandeau | La carte entière porte la marque, plus seulement son infobulle |
| Accueil : la tuile « Écart Sous-caisse Marché −25 000 » s'affichait au déclarant du périmètre | Texte aveuglé comme celui de la cloche |
| La ligne « aucun résultat » se comptait elle-même : compteur faux, message qui restait ouvert après réinitialisation | `visibleRows` l'exclut, et la ligne suit le nombre réel, filtre actif ou non |
| Décocher les cinq séries du graphique en redessinait deux | Aucune case cochée n'affiche aucune courbe ; le repli sur `data-series` ne vaut que si l'écran n'a aucune case |
| La valeur de filtre d'une cellule était mémorisée sans invalidation : filtre faux dès qu'un écran réécrivait la cellule | Cache retiré, les tableaux sont assez courts |
| Options de filtre collées, « ANAbdou Ndiaye » | L'avatar `.av` est retiré comme `.hint` et `small` |
| Témoins de couleur parasites sur Visualisation, qui dessine déjà les siens | Les témoins ne se posent que dans un `.serpick` |
| Bandeau Fournisseurs du tableau de bord à 2 cartes dans une grille de 3 | `.statstrip two` |
| Le ratio du KPI Créances était figé en dur et mentait après une écriture manuelle | Recalculé à chaque mouvement |
| Une écriture manuelle de 9 000 000 ne déclenchait aucune alerte | Au-delà du seuil d'ajustement inhabituel, l'alerte critique non désactivable est annoncée, sans bloquer la saisie |
| Références au cahier posées sur des décisions de périmètre : `(§4.3)` sur l'écriture directe, `(§6.1)` sur le circuit transitoire, `(§3)` sur « ni avant ni après » alors que le cahier ne couvre que l'avant | Citations qualifiées « durci en V1 » ou « décision de périmètre V1, hors cahier » ; la pastille générée ne cite plus de paragraphe |
| Deux textes de Fournisseurs promettaient encore la révélation après déclaration | Réécrits |
| Clé de périmètre `srca` morte, laissant croire que le collecteur était couvert par le mécanisme transverse | Retirée, avec la raison en commentaire |
| Contrat non mis à jour pour les sept mécanismes transverses ajoutés | Nouvelle section §5a |
| Chiffres faux dans ce suivi : 65 filtres au lieu de 72, 41 marques mélangeant deux mécanismes | Recomptés |
| En 375 px, cinq des six boutons « Déplier » du tableau de bord sortaient de l'écran, un n'offrait plus que 10 px de cible | L'en-tête de carte passe à la ligne sous 640 px, le résumé prend toute la largeur et le bouton reste à droite |
| Sur Dépenses, la barre pilotait la première des sept lignes « aucun résultat » de l'écran : deux messages contradictoires empilés, ou un message sans rapport avec la recherche | La barre ne touche plus aux lignes vides de l'écran. Elle les neutralise le temps de son filtrage, pose la sienne, et leur rend leur état exact ensuite |
| Un filtre de colonne était abandonné au changement de profil, le sélecteur affichant toujours sa valeur | Le filtrage est rejoué après l'événement de changement de profil |
| Une ligne créée après coup échappait au filtre actif | Un observateur sur le corps du tableau rejoue le filtrage à toute ligne ajoutée ou retirée |
| Compteur de lignes à 3,09:1 de contraste, sous le 4,5:1 exigé, et résultat du filtrage jamais annoncé | Couleur remontée à 5,98:1 en clair et 7,82:1 en sombre, et `role="status" aria-live="polite"` |
| Repli imbriqué : l'Échéancier, déjà à l'intérieur de la carte Fournisseurs, portait son propre bouton | Retiré, il se replie avec sa carte parente |

**Constats laissés ouverts, à trancher :**

1. **Déduction par soustraction.** Le Directeur des Opérations voit les cinq indicateurs de tête et la décomposition du P&L. Position financière nette, trésorerie totale, créances, dettes et avances clients étant toutes visibles, l'avance d'Abattoirs Dakar se retrouve par soustraction ; de même la dette de Bétail Thiès se déduit du total des dettes moins les quatre autres fournisseurs, tous visibles. Masquer un champ ne suffit pas quand l'agrégat qui le contient reste affiché. Trois issues : retirer le tableau de bord et le P&L aux profils déclarants, masquer les agrégats concernés tant qu'une déclaration est attendue, ou accepter la déduction et l'écrire. La question rejoint le point 1 des questions de revue de `AMBIGUITES_PANEL.md`, resté ouvert.
2. **Échéancier fournisseur.** Les deux tranches de Bétail Thiès, 1 600 000 et 3 000 000, redonnent sa position. Les masquer prive le Directeur des Opérations de la planification des paiements, qui est son métier. Même arbitrage que le point 1.
3. **La recherche lit le texte masqué.** Le cache par périmètre est visuel : le texte reste dans le DOM, donc la recherche plein texte de la barre le voit. Aucune des marques posées ne se trouve aujourd'hui dans une colonne indexée, mais un déclarant pourrait sonder une valeur par le compteur si cela changeait. Même arbitrage que les points 1 et 2 : tant que la donnée est envoyée au navigateur, aucun masquage d'interface n'est étanche.
4. **R-10 codé avant validation du DG.** `CLAUDE.md` demande la validation de Saliou et d'Ousmane avant toute ligne de code. Saliou a arbitré le 10/09, Ousmane n'a pas vu R-06 ni R-10.

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
