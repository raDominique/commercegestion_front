Stocks & Mouvements


POST
/api/v1/stocks/transfer
Transférer un produit à un autre détenteur


Enregistre un mouvement TRANSFERT physique d'un produit vers un autre détenteur sur le même site ou entre sites.

Flux métier:

Détenteur crée le mouvement de transfert
Sélectionne la quantité à transférer
Désigne le nouveau détenteur
Choix du site de destination (même site ou différent)
Mouvement enregistré avec type TRANSFERT
Stock détenteur actuel: -quantité
Stock nouveau détenteur: +quantité
Passif mis à jour (si applicable)
Champs requis:

productId: ID du produit à transférer
quantity: Quantité (doit être disponible)
destinationSiteId: Site de destination
newHolderId: ID du nouveau détenteur
notes: (optionnel) Description du transfert
Validations:

Vérifier que la quantité est disponible
Valider que le nouveau détenteur existe
Vérifier l'accès au site de destination
Erreurs possibles:

400: Quantité insuffisante ou paramètres invalides
401: Non authentifié
404: Produit ou détenteur non trouvé
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "siteOrigineId": "69989c5cdff25ef7fe0a460f",
  "siteDestinationId": "69989c5cdff25ef7fe0a4610",
  "productId": "69989c5cdff25ef7fe0a460f",
  "quantite": 100,
  "prixUnitaire": 1500,
  "detentaire": "69989c5cdff25ef7fe0a4611",
  "ayant_droit": "69989c5cdff25ef7fe0a4612",
  "observations": "Cession de stock suite étape 4c"
}
Responses
Code	Description	Links
201	
No links

POST
/api/v1/stocks/virement
Virement de propriété (changement de propriétaire)


Enregistre un mouvement VIREMENT: changement de propriétaire/ayant-droit SANS mouvement physique.

Flux métier:

Propriétaire actuel crée le virement
Sélectionne la quantité à transférer de propriété
Désigne le nouveau propriétaire
Mouvement type VIREMENT enregistré
Produit reste physiquement au même endroit (mouvement émotionnel virement)
Propriété/Ayant-droit change
Passif créé ou modifié (nouveau propriétaire devient créancier)
Utilisation:

Vendre un produit (changement de propriétaire)
Transférer la responsabilité (sans mouvement physique)
Enregistrer un échange de propriété
Gérer les dettes de marchandises
Champs requis:

productId: ID du produit
quantity: Quantité transférée
newOwnerId: ID du nouveau propriétaire
reason: Motif du virement (vente, échange, donation)
notes: (optionnel) Détails supplémentaires
Validations:

Vérifier propriété du produit
Valider que le nouveau propriétaire existe
Vérifier les permissions
Erreurs possibles:

400: Quantité invalide ou propriété insuffisante
401: Non authentifié
403: Pas propriétaire du produit
404: Produit ou propriétaire non trouvé
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "siteOrigineId": "69989c5cdff25ef7fe0a460f",
  "siteDestinationId": "69989c5cdff25ef7fe0a4610",
  "productId": "69989c5cdff25ef7fe0a460f",
  "quantite": 100,
  "prixUnitaire": 1500,
  "detentaire": "69989c5cdff25ef7fe0a4611",
  "ayant_droit": "69989c5cdff25ef7fe0a4612",
  "observations": "Cession de stock suite étape 4c"
}
Responses
Code	Description	Links
201	
No links

GET
/api/v1/stocks/site-actifs/{siteId}
Consulter l'inventaire des actifs d'un site


Récupère la liste complète des actifs (produits) actuellement stockés sur un site spécifique pour l'utilisateur actuel.

Contenu retourné:

Produit: ID, nom, référence, description
Quantité actuelle en stock
Valeur unitaire (prix)
Valeur totale (quantité × prix)
Détenteur actuel
Propriétaire/Ayant-droit
Dernière mise à jour
Cas d'usage:

Consultation du stock d'un entrepôt
Vérification des disponibilités avant dépôt/retrait
Inventaire physique
Suivi des mouvements par site
Rapport de stock
Note: Retourne UNIQUEMENT les actifs que l'utilisateur possède ou détient sur ce site. Les autres utilisateurs voient leur propre stock.

Erreurs possibles:

401: Non authentifié
403: Pas d'accès à ce site
404: Site non trouvé
Parameters
Try it out
Name	Description
siteId *
string
(path)
siteId
Responses
Code	Description	Links
200	
No links

GET
/api/v1/stocks/site-passifs/{siteId}
Consulter les dettes (passifs) d'un site


Récupère la liste de toutes les dettes/passifs (marchandises dues) associées à un site spécifique.

Contenu:

Produit dechu: ID, nom, quantité due
Propriétaire original (créancier): qui doit recevoir la marchandise
Détenteur actuel: qui la détient (doit la rendre)
Quantité due
Date de création du passif
Provenance: transaction de dépôt associée
Status: actif, partiellement remboursé, soldé
Interprétation:

Si je dois "10 unités de Ciment", cela signifie:
Quelqu'un m'a fait confiance et m'a confié 10 unités
Je dois les lui rendre (ou payer équivalent)
C'est une obligation/dette
Risk Management:

Avant changement de détenteur: vérifier les passifs
Avant rejet: s'assurer passifs rembourés
Avant transfert: confirmer que les biens ne sont pas grevés
Erreurs possibles:

401: Non authentifié
403: Pas d'accès à ce site
404: Site non trouvé
Parameters
Try it out
Name	Description
siteId *
string
(path)
siteId
Responses
Code	Description	Links
200	
No links

GET
/api/v1/stocks/deposits
Journal des entrées en stock (dépôts)


Récupère l'historique complet de tous les dépôts (entrées) de stock pour l'utilisateur avec pagination.

Contenu:

Type: DÉPÔT ou INITIALISATION
Produit: ID, nom, quantité
Source: Qui a fait le dépôt (initiateur)
Destinataire: Qui a reçu
Site de destination
Quantité entrante
Date du mouvement
Validateur (qui a validé le mouvement)
Notes/commentaires
Utilisation:

Audit: tracer toutes les entrées
Réconciliation: vérifier conformité stock/registre
Inventaire: historique des mouvements
Retraçabilité: qui a apporté quoi et quand
Détection fraude: identifier les entrées suspectes
Pagination:

page: numéro de page (défaut: 1)
limit: éléments par page (défaut: 10)
Tri: Par date décroissante (les plus récents en premier)

Erreurs possibles:

400: Paramètres de pagination invalides
401: Non authentifié
Parameters
Try it out
Name	Description
limit
number
(query)
Éléments par page (défaut: 10)

limit
page
number
(query)
Numéro de page (défaut: 1)

page
Responses
Code	Description	Links
200	
No links

GET
/api/v1/stocks/withdrawals
Journal des sorties de stock (retraits)


Récupère l'historique complet de tous les retraits (sorties) de stock pour l'utilisateur avec pagination.

Contenu:

Type: RETRAIT ou RETOUR
Produit: ID, nom, quantité
Source: Qui a retiré (initiateur)
Site d'origine
Quantité sortante
Destination (qui reçoit le retrait)
Date du mouvement
Validateur (qui a autorisé)
Motif du retrait (vente, échange, perte, usage)
Notes/commentaires
Différence Retrait vs Retour:

RETRAIT: Vente ou cession normale
RETOUR: Annulation d'un précédent dépôt
Utilisation:

Audit: tracer toutes les sorties
Réconciliation: vérifier conformité stock/ventes
Inventaire: historique des mouvements
Retraçabilité: qui a pris quoi et quand
Détection fraude: identifier les sorties anormales
Suivi clients: ce qui a été vendu
Pagination:

page: numéro de page (défaut: 1)
limit: éléments par page (défaut: 10)
Tri: Par date décroissante (les plus récents en premier)

Erreurs possibles:

400: Paramètres de pagination invalides
401: Non authentifié
Parameters
Try it out
Name	Description
limit
number
(query)
Éléments par page (défaut: 10)

limit
page
number
(query)
Numéro de page (défaut: 1)

page
Responses
Code	Description	Links
200	
No links

POST
/api/v1/stocks/flag-movement/{movementId}
Signaler un mouvement comme suspect/invalide


Signale un mouvement existant comme problématique ou nécessitant vérification.

Flux métier:

Utilisateur identifie un mouvement suspect
Crée un signal avec raison spécifique
Mouvement marqué comme FLAGGED (signalé)
Notifications envoyées aux:
Administrateurs pour investigation
Validateur original pour explication
Détenteur affecté pour correctionéventuelle
Stock n'est PAS modifié (mouvement reste valide jusqu'à investigation)
Suivi/audit du signal créé
Détails du signal stockés pour investigation
Motifs courants:

Quantité douteuse (plus/moins que prévu)
Produit abîmé ou non conforme à réception
Discordance entre registre et référence physique
Doute sur l'identité du propriétaire
Transactioncorruptée/enregistrée en double
Revendication de propriété conflictuelle
Champs requis:

movementId (path): ID unique du mouvement à signaler
reason (body): Description détaillée du problème (1000 caractères max)
severity (body): low, medium, high (défaut: medium)
Process après signal:

Admin validera ou annulera le signal
Ajustements de stock si nécessaire
Communication avec toutes les parties
Erreurs possibles:

400: Raison vide ou trop longue
401: Non authentifié
404: Mouvement non trouvé
409: Mouvement déjà signalé
Parameters
Try it out
Name	Description
movementId *
string
(path)
movementId
Responses
Code	Description	Links
201	
No links

POST
/api/v1/stocks/validate-movement/{movementId}
Valider/confirmer un mouvement signalé


Confirme qu'un mouvement FLAGGED peut rester valide après investigation.

Flux métier:

Admin/Manager examine le signal et pièces jointes
Investigation complétée
Décision: mouvement valide et conforme
Validation appliquée: flag retiré
Mouvement réintégré comme VALIDE
Email confirmation aux parties
Signal fermé avec résolution confirmée
Préconditions:

Mouvement doit être en statut FLAGGED
Admin/Manager authorization requis
Dossier d'investigation doit exister
Etapes après validation:

Flag FLAGGED → VALIDATED
Stock réintégré normalement
Historique conservé pour audit
Rapport transmis aux parties intéressées
Signal fermé avec résolution
Alternatives:

Rejeter le mouvement (l'annuler complètement)
Modifier le mouvement (corriger quantité/propriétaire)
Erreurs possibles:

401: Non authentifié
403: Pas permissions admin
404: Mouvement non trouvé
409: Mouvement non signalé / pas en statut FLAGGED
Parameters
Try it out
Name	Description
movementId *
string
(path)
movementId
Responses
Code	Description	Links
201