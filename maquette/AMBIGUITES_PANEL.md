# Points à remonter au panel d'experts — maquette ERP Mata

Relevés pendant la construction de la maquette interactive à partir des cahiers validés (Core fonctionnel v1.1, Finance fonctionnel v2.2, Core technique v1.1, Finance technique v1.2). Chaque point a reçu une hypothèse de travail dans la maquette, indiquée en italique, pour que l'écran existe et puisse être discuté.

## Profils et périmètres

1. **Liste des profils standards.** Le Core (§3.3) donne trois exemples (DG Mata, Directeur financier Mata Volaille, Administrateur Mata Finance) sans liste de référence. *Maquette : Super Admin, DG Mata, Directeur des Opérations, Gestionnaire de caisse, Collecteur, Investisseur, Comptable externe, Gérant MaaS.*
2. **Périmètre de lecture de l'Investisseur et du Comptable externe.** Le Core (§3.2) dit « Investisseur limité à la lecture » et « Comptable externe limité au périmètre financier autorisé », sans dire quels écrans. *Maquette : Investisseur = Dashboard (agrégats), P&L, Historique ; Comptable = Comptes, Dépenses, Fournisseurs, P&L, Historique, sans export.*
3. **Initiateur d'une Demande côté MaaS.** Le Core (§4.1) autorise « les MaaS et utilisateurs autorisés » à demander, sans préciser le profil. *Maquette : profil Gérant MaaS, catégorie Externe — MaaS.*

## Réconciliations et clôture

4. **Clôture d'une réconciliation « Ventes du jour » en écart.** Finance §6.4 dit que la réconciliation reste ouverte et que chaque composante est visible, sans dire qui la ferme ni avec quel niveau de validation. *Maquette : bouton « Valider la réconciliation » réservé à la permission finance.reconciliation.valider, désactivé tant qu'un écart subsiste.*
5. **Seuil d'âge d'un solde Relais.** Finance §4.6 parle d'un seuil configurable sans valeur ni écran. *Maquette : 2 jours, dans les paramètres transverses avec override local.*

## Notifications et paramètres

6. **Notifications critiques non désactivables.** Le Core (§6.1) les mentionne sans les lister. *Maquette : écart de réconciliation, ajustement inhabituel, correction post-clôture, dépense « Pas sûr » à 23:00, sauvegarde échouée.*
7. **Périodes alternatives du CA de référence.** Finance §8.2 autorise « une autre période de référence » sans en fixer la liste. *Maquette : mois en cours, mois précédent, trois derniers mois.*

## Remontées des relectures écran par écran

Cette section est complétée après la relecture indépendante de chaque écran.


## Questions issues des revues (écrans Tableau de bord, Dépenses, Fournisseurs, Créances, Réconciliation)

1. **Tableau de bord et déclarant.** Le Directeur des Opérations déclare (Sous-caisse Livraisons, fournisseurs) et consulte le tableau de bord. La maquette masque le solde théorique de la Caisse générale « À déclarer » pour tout profil déclarant sans droit de validation, mais les agrégats (Trésorerie disponible) restent visibles et permettent une déduction par soustraction. Faut-il masquer aussi les agrégats de trésorerie tant qu'une caisse du périmètre du déclarant n'est pas déclarée, ou retirer le tableau de bord aux déclarants ?
2. **« Accorder une créance ».** Modélisé comme une autorisation de crédit (plafond, validité, motif) sans effet sur la position, conformément au §6.1 (les ventes proviennent exclusivement de Ventes Mata). Si un mouvement manuel de créance est réellement souhaité, il doit passer par Ajustement à double validation (§4.7). À trancher.
3. **Snapshot du 26/08 et positions fournisseurs.** Les positions courantes moins les dépenses du jour impliquent des dettes au 26/08 de 22 138 000, alors que le snapshot du 26/08 fige 23 100 000 : soit le snapshot change, soit des paiements du jour de 962 000 sont ajoutés aux données communes. La maquette ne cite plus de position précédente chiffrée.
4. **Ventilation des ventes du jour par contrepartie.** Seul le total 6 200 000 est fixé ; la répartition affichée dans Créances est illustrative (mention à l'écran). À fixer dans les données communes si le Dashboard « principaux débiteurs » doit s'y appuyer.
5. **Seuil d'alerte anticipée sur l'encours fournisseur.** Le cahier ne définit que le dépassement du plafond (§5.4). Un seuil à 75 % (badge « Encours 77 % ») a été retiré ; s'il est souhaité, l'ajouter aux paramètres configurables (§17).
6. **Boutons de navigation et permissions de consultation.** Un bouton `data-goto` peut porter la permission de consultation de l'écran cible (refus expliqué avant navigation). Acté dans le contrat de maquette, à confirmer pour l'application.
7. **Source B de la collecte.** La maquette réserve « Déclarer la collecte en aveugle » au Collecteur (et au Super Admin pour la démonstration). Confirmer qu'aucun autre profil ne peut saisir la Source B (§6.3).
8. **Pas sûr et clôture du périmètre.** Sous-caisse Livraisons est déclarée égale au théorique mais sa clôture est suspendue par une dépense « Pas sûr » non résolue (§5.2, §3.1) : confirmer que l'égalité déclarée ne vaut pas clôture tant que le « Pas sûr » n'est pas levé.
