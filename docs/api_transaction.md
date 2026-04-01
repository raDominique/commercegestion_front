Transactions


POST
/api/transactions/deposit
Créer une transaction de dépôt


Crée une demande de dépôt d'actif vers un autre membre (phase 1: création en attente).

Flux métier:

Initiateur crée la demande (statut PENDING)
Un email est envoyé au destinataire pour notification
Destinataire reçoit une notification "nouvelle transaction"
Admin/Manager approuve ou rejette
Si approuvé: mouvements appliqués automatiquement
Actif initiateur: -quantité
Actif destinataire: +quantité
Passif créé: destinataire doit la marchandise à l'initiateur
Un email de confirmation est envoyé au destinataire
Champs requis:

initiatorId: ID du déposant
recipientId: ID du destinataire
productId: ID du produit
originSiteId: Site de départ
destinationSiteId: Site d'arrivée
quantity: Quantité
unitPrice: (optionnel) Prix unitaire
Erreurs possibles:

400: Données invalides
401: Non authentifié
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "initiatorId": "69989c5cdff25ef7fe0a460f",
  "recipientId": "69989c5cdff25ef7fe0a4611",
  "productId": "69989c5cdff25ef7fe0a460f",
  "originSiteId": "69989c5cdff25ef7fe0a4610",
  "destinationSiteId": "69989c5cdff25ef7fe0a4612",
  "quantity": 500,
  "unitPrice": 100
}
Responses
Code	Description	Links
201	
Transaction de dépôt créée avec succès. Numéro unique (ULID) généré. Email envoyé au destinataire.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439011",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "type": "DÉPÔT",
  "status": "PENDING",
  "initiatorId": "507f1f77bcf86cd799439001",
  "recipientId": "507f1f77bcf86cd799439002",
  "quantity": 100,
  "unitPrice": 50,
  "createdAt": "2026-04-01T10:30:45.000Z"
}
No links
400	
Paramètres invalides ou champs manquants

No links
401	
Non authentifié

No links

POST
/api/transactions/return
Créer une transaction de retour


Crée une demande de retour d'actif au propriétaire original.

Flux métier:

Détenteur crée une demande de retour (statut PENDING)
Email envoyé au propriétaire pour notification
Admin/Manager approuve ou rejette
Si approuvé: mouvements appliqués automatiquement
Actif détenteur: -quantité
Actif propriétaire: +quantité
Passif réduit ou supprimé (propriétaire devait la marchandise au détenteur)
Email de confirmation envoyé au propriétaire
Utilisation:

Annuler un dépôt
Retourner au propriétaire
Restaurer le stock original
Erreurs possibles:

400: Données invalides
401: Non authentifié
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "initiatorId": "69989c5cdff25ef7fe0a460f",
  "ayantDroitId": "69989c5cdff25ef7fe0a4611",
  "productId": "69989c5cdff25ef7fe0a460f",
  "originSiteId": "69989c5cdff25ef7fe0a4610",
  "destinationSiteId": "69989c5cdff25ef7fe0a4612",
  "quantity": 500,
  "unitPrice": 100
}
Responses
Code	Description	Links
201	
Transaction de retour créée avec succès. Numéro unique (ULID) généré. Email envoyé au propriétaire.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439012",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAB",
  "type": "RETOUR",
  "status": "PENDING",
  "initiatorId": "507f1f77bcf86cd799439002",
  "recipientId": "507f1f77bcf86cd799439001",
  "quantity": 100,
  "createdAt": "2026-04-01T11:30:45.000Z"
}
No links
400	
Paramètres invalides ou champs manquants

No links
401	
Non authentifié

No links

POST
/api/transactions/initialization
Initialiser le stock pour un nouvel actif/passif


Crée une transaction d'initialisation pour créer un nouvel actif ou passif en stock.

Flux métier:

Propriétaire crée une initialisation (statut PENDING)
Email envoyé au créateur pour confirmation
Admin/Manager approuve ou rejette
Si approuvé: nouveau mouvement créé
Crée une ligne actif avec mouvement INIT (initialisation)
Définit le stock initial
Marque le mouvement comme validé
Email de confirmation envoyé
Utilisation:

Créer un nouvel actif (ex: nouveau lot de produits)
Ajouter un nouveau passif (ex: nouvel emprunt)
Initialiser le stock pour un nouveau code produit
Champs requis:

productId: ID du produit
quantity: Quantité à initialiser (strictement positive)
type: 'ACTIF' ou 'PASSIF'
siteId: Site où initialiser
Erreurs possibles:

400: Quantité invalide ou champs manquants
401: Non authentifié
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "initiatorId": "69989c5cdff25ef7fe0a460f",
  "productId": "69989c5cdff25ef7fe0a460f",
  "siteId": "69989c5cdff25ef7fe0a4610",
  "quantity": 1000,
  "unitPrice": 100
}
Responses
Code	Description	Links
201	
Initialisation créée avec succès. Mouvement enregistré. Email envoyé.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439012",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAB",
  "type": "INITIALISATION",
  "status": "PENDING",
  "initiatorId": "507f1f77bcf86cd799439002",
  "productId": "507f1f77bcf86cd799439001",
  "quantity": 500,
  "createdAt": "2026-04-01T10:15:30.000Z"
}
No links
400	
Paramètres invalides ou quantité négative

No links

PATCH
/api/transactions/{id}/approve
Approuver une transaction


Approuve une transaction en attente et applique automatiquement les mouvements de stock.

Flux métier:

Admin/Manager approuve la transaction (statut change à APPROVED)
Les mouvements d'actif/passif sont appliqués:
Transaction DÉPÔT: initiateur perd quantité, destinataire gagne, passif créé
Transaction RETOUR: détenteur perd quantité, propriétaire regagne, passif réduit
Transaction INITIALISATION: stock créé avec mouvement INIT validé
Email de confirmation envoyé à l'initiateur (ou destinataire pour dépôt)
Approver name enregistré pour traçabilité
Champs:

id (path): ID unique de la transaction
approverId (body): ID de l'utilisateur qui approuve
Erreurs possibles:

400: Statut invalide pour approbation
401: Non authentifié
404: Transaction non trouvée
Parameters
Try it out
Name	Description
id *
string
(path)
ID unique de la transaction à approuver

id
Request body

application/json
Example Value
Schema
{
  "approverUserId": "69989c5cdff25ef7fe0a460f",
  "notes": "Dépôt conforme"
}
Responses
Code	Description	Links
200	
Transaction approuvée avec succès. Mouvements appliqués. Email de confirmation envoyé.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439011",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "type": "DÉPÔT",
  "status": "APPROVED",
  "approvedBy": "507f1f77bcf86cd799439005",
  "approverId": "507f1f77bcf86cd799439005",
  "approvedAt": "2026-04-01T14:30:45.000Z",
  "movements": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "type": "MOUVEMENT",
      "actifId": "507f1f77bcf86cd799439030",
      "quantity": 100,
      "isValidated": true
    }
  ]
}
No links
400	
Statut invalide (ne peut approuver que PENDING)

No links
401	
Non authentifié

No links
404	
Transaction non trouvée

No links

PATCH
/api/transactions/{id}/reject
Rejeter une transaction en attente


Rejette une transaction PENDING et annule le processus.

Flux métier:

Admin/Manager rejette la transaction (statut change à REJECTED)
Aucun mouvement n'est appliqué (stock inchangé)
Email de notification envoyé à l'initiateur avec:
Motif du rejet (dans rejectionReason)
Nom de l'approbateur/rejecteur
Permet de nettoyer les transactions invalides
Utilisation:

Rejeter un dépôt si le produit n'existe pas
Refuser un retour si les conditions ne sont pas respectées
Annuler une initialisation si la quantité est incorrecte
Champs:

id (path): ID unique de la transaction
rejectionReason (body): Raison du rejet (affichée au demandeur)
approverId (body): ID de l'utilisateur qui rejette
Erreurs possibles:

400: Statut invalide pour rejet (ne peut rejeter que PENDING)
401: Non authentifié
404: Transaction non trouvée
Parameters
Try it out
Name	Description
id *
string
(path)
ID unique de la transaction à rejeter

id
Request body

application/json
Example Value
Schema
{
  "approverUserId": "69989c5cdff25ef7fe0a460f",
  "rejectionReason": "Produit défectueux"
}
Responses
Code	Description	Links
200	
Transaction rejetée avec succès. Aucun mouvement appliqué. Email de notification envoyé.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439011",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "type": "DÉPÔT",
  "status": "REJECTED",
  "rejectionReason": "Produit indisponible en ce moment",
  "rejectedBy": "507f1f77bcf86cd799439005",
  "rejectedAt": "2026-04-01T15:20:30.000Z"
}
No links
400	
Statut invalide (ne peut rejeter que PENDING)

No links
401	
Non authentifié

No links
404	
Transaction non trouvée

No links

GET
/api/transactions/{id}
Détails complète d'une transaction


Récupère les détails complets d'une transaction incluant tous les mouvements, les participants et l'historique.

Contenu retourné:

Informations de base: ID, numéro ULID, type (DÉPÔT/RETOUR/INIT), statut
Participants: initiatorId, recipientId avec données dénormalisées (noms, emails)
Produit: productId avec nom, référence
Quantité et prix unitaire
Mouvements: Tous les mouvements appliqués à la transaction
Horodatages: createdAt, approvedAt, rejectedAt
Approbateur: approverId, approvedBy (nom et email si approuvé/rejeté)
Statuts possibles:

PENDING: En attente d'approbation
APPROVED: Approuvée et mouvements appliqués
REJECTED: Rejetée, aucun mouvement appliqué
Erreurs possibles:

401: Non authentifié
404: Transaction non trouvée
Parameters
Try it out
Name	Description
id *
string
(path)
ID unique (MongoDB ObjectId) de la transaction

id
Responses
Code	Description	Links
200	
Détails complets de la transaction

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439011",
  "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "type": "DÉPÔT",
  "status": "APPROVED",
  "initiatorId": "507f1f77bcf86cd799439001",
  "initiatorName": "Alice Dupont",
  "recipientId": "507f1f77bcf86cd799439002",
  "recipientName": "Bob Martin",
  "productId": "507f1f77bcf86cd799439030",
  "productName": "Ciment Portland",
  "quantity": 100,
  "unitPrice": 50,
  "movements": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "type": "MOUVEMENT",
      "quantity": 100
    }
  ],
  "createdAt": "2026-04-01T10:30:45.000Z",
  "approvedAt": "2026-04-01T14:30:45.000Z",
  "approverName": "Admin User"
}
No links
401	
Non authentifié

No links
404	
Transaction non trouvée

No links

GET
/api/transactions/pending/list
Lister les transactions en attente d'approbation


Récupère toutes les transactions en statut PENDING en attente de validation par l'utilisateur (Admin/Manager).

Contenu:

Numéro ULID unique
Type de transaction (DÉPÔT, RETOUR, INITIALISATION)
Initiateur de la demande
Destinataire (si applicable)
Produit et quantité
Date de création
Statut toujours = PENDING
Paginatio:

page: numéro de page (défaut: 1)
limit: nombre par page (défaut: 10, max: 100)
Utilisation:

Admin voit les transactions à valider
Trier par date (les plus anciennes en premier)
Permet de gérer le backlog de validation
Erreurs possibles:

400: userId manquant dans query
401: Non authentifié
Parameters
Try it out
Name	Description
userId
string
(query)
ID de l'utilisateur (Manager/Admin qui doit approuver)

userId
page
number
(query)
Numéro de page (défaut: 1)

page
limit
number
(query)
Nombre d'éléments par page (défaut: 10)

limit
Responses
Code	Description	Links
200	
Liste paginée des transactions en attente

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "type": "DÉPÔT",
      "status": "PENDING",
      "initiatorName": "Alice Dupont",
      "productName": "Ciment Portland",
      "quantity": 100,
      "createdAt": "2026-04-01T10:30:45.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
No links
400	
userId requis en query

No links
401	
Non authentifié

No links

GET
/api/transactions/user/{userId}
Historique complet des transactions d'un utilisateur


Récupère toutes les transactions de l'utilisateur (initiées ou reçues) avec filtrage par statut et pagination.

Scope:

Utilisateur voit TOUTES ses transactions
Initiateur: transactions qu'il a créées
Destinataire: transactions reçues de dépôt/retour
Trace l'historique complet des mouvements
Statuts:

PENDING: En attente d'approbation par Admin
APPROVED: Approuvée, mouvements appliqués, confirmée
REJECTED: Rejetée, aucun mouvement appliqué
Pagination:

page: numéro de page (défaut: 1)
limit: nombre par page (défaut: 10, max: 100)
Filtrage:

status (optional): PENDING, APPROVED, ou REJECTED
Sans status: retourne toutes les transactions
Utilisation:

Dashboard personnel
Historique des mouvements
Audit trail
Suivi des transactions reçues
Tri: Par date décroissante (plus récentes en premier)

Erreurs possibles:

401: Non authentifié
404: Utilisateur non trouvé
Parameters
Try it out
Name	Description
userId *
string
(path)
ID unique (MongoDB ObjectId) de l'utilisateur

userId
page
number
(query)
Numéro de page (défaut: 1)

page
limit
number
(query)
Nombre d'éléments par page (défaut: 10)

limit
status
string
(query)
Filtrer par statut: PENDING, APPROVED, REJECTED (optionnel)

status
Responses
Code	Description	Links
200	
Liste paginée de toutes les transactions de l'utilisateur

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "type": "DÉPÔT",
      "status": "APPROVED",
      "initiatorName": "Alice Dupont",
      "recipientName": "Bob Martin",
      "productName": "Ciment Portland",
      "quantity": 100,
      "createdAt": "2026-04-01T10:30:45.000Z",
      "approvedAt": "2026-04-01T14:30:45.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "transactionNumber": "01ARZ3NDEKTSV4RRFFQ69G5FBC",
      "type": "RETOUR",
      "status": "PENDING",
      "initiatorName": "Bob Martin",
      "recipientName": "Alice Dupont",
      "productName": "Ciment Portland",
      "quantity": 50,
      "createdAt": "2026-04-02T09:15:30.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "pages": 3
  }
}
No links
401	
Non authentifié

No links
404	
Utilisateur non trouvé