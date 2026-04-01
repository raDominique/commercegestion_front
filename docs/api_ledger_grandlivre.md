Ledger Display


GET
/api/ledger/user/{userId}
Grand livre complet d'un utilisateur


Affiche le grand livre (ledger) récapitulatif de TOUS les mouvements d'actifs et de passifs pour un utilisateur spécifique.

Contenu:

Actifs: Tous les produits que l'utilisateur possède ou détient

Quantité par produit
Valeur unitaire et totale
Statut (actif, inactif)
Provenance (initialisé, reçu, acheté, etc.)
Passifs: Toutes les dettes/obligations de l'utilisateur

Marchandises dues à d'autres
Quantités dues par produit
Créancier (qui doit recevoir)
Provenance du passif
Status de remboursement (partiel, complet)
Mouvements: Historique complet des transactions

Dépôts reçus
Retraits effectués
Transferts de propriété
Virements
Validations/rejets
Utilisation:

Audit interne: État financier complet
Réconciliation: Vérifier conformité registres ↔ système
Reporting: Bilan par utilisateur
Suivi solvabilité: Actifs vs Passifs
Contrôle gestion: Performance utilisateur
Interprétation:

Balance positive = plus de dettes que d'actifs (sain)
Balance négative = plus d'actifs que de dettes (risque crédit)
Note: Cet endpoint retourne TOUS les mouvements. Pour un historique limité ou filtré, utiliser les endpoints spécialisés (actifs/, passifs/, product/).

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
Responses
Code	Description	Links
200	
Grand livre complet: actifs, passifs et mouvements de l'utilisateur

No links
401	
Non authentifié

No links
404	
Utilisateur non trouvé

No links

GET
/api/ledger/global
Grand livre global du système


Affiche le grand livre GLOBAL: tous les mouvements de TOUS les utilisateurs du système avec pagination.

Contenu:

Chaque mouvement enregistre:

Produit: ID, nom, référence
Type: TRANSFERT, VIREMENT, INITIALISATION, DÉPÔT, RETRAIT
Quantité manipulée
Initiateur (qui a créé le mouvement)
Destinataire/Propriétaire actuel
Date/heure exact du mouvement
Validateur (qui a approuvé)
Status: PENDING, VALIDATED, FLAGGED, REJECTED
Statistiques globales:

Volume total de mouvements
Nombre de transactions par type
Utilisateurs actifs
Produits les plus mouvementés
Utilisation:

Audit groupe: Vue d'ensemble système
Conformité: Tracer tous les mouvements
Détection fraude: Identifier anomalies globales
Reporting direction: Performance globale
BigData: Analyse tendances
Réconciliation groupe: Tous les comptes
Pagination:

page: numéro de page (défaut: 1)
limit: mouvements par page (défaut: 50, max: 500)
Tri: Par date décroissante (les plus récents d'abord)

Note: Utilisateur Normal ne voit que ses propres mouvements (getUserLedger). Cet endpoint est ADMIN uniquement.

Erreurs possibles:

400: Paramètres pagination invalides
401: Non authentifié
403: Pas permissions admin
Parameters
Try it out
Name	Description
page
number
(query)
Numéro de page (défaut: 1)

1
limit
number
(query)
Nombre d'éléments par page (défaut: 50)

50
Responses
Code	Description	Links
200	
Grand livre global avec tous les mouvements du système

No links
401	
Non authentifié

No links
403	
Pas permissions admin

No links

GET
/api/ledger/product/{productId}
Historique complet d'un produit


Affiche TOUS les mouvements concernant un produit spécifique (identification complète du flux du produit).

Contenu:

Flux entrant:

Initialisation: quantité et date
Dépôts reçus: de qui, quantité, quand
Retours: d'où, quantité, quand
Transferts entrant: ancien détenteur, nouvelle quantité
Flux sortant:

Retraits: quantité, destination, quand
Dépôts envoyés (pour suivre): à qui, quantité, quand
Transferts sortant: nouveau détenteur, quantité
Propriété:

Propriétaire original (initialisateur)
Modifications de propriété (virements)
Détenteurs successifs
Saisi/Libération (si applicable)
Qualité:

Mouvements validés
Mouvements signalés/suspects (FLAGGED)
Mouvements rejetés (non comptabilisés)
Utilisation:

Traçabilité produit: chaîne complète fournisseur → client
Contrôle qualité: tous les mouvements, incidents
Comptabilité: coûts, débits/crédits
Inventaire: justification quantités
Suivi stock: là où est le produit MAINTENANT
Audit: tous les intervenants
Propriété des données:

Avec userId: voit UNIQUEMENT les mouvements concernant cet utilisateur pour ce produit
Sans userId: voit TOUS les mouvements du produit (Admin)
Exemple pratique:

Initialisation: 1000 unités le 01/01
Dépôt à Alice: 400 le 05/01
Dépôt à Bob: 300 le 10/01
Retrait initial: 300 le 20/01
→ Produit actuellement: 100 unités chez propriétaire
Erreurs possibles:

400: Pas de mouvements pour ce produit
401: Non authentifié
403: Pas d'accès à cet utilisateur (sans permission)
404: Produit non trouvé
Parameters
Try it out
Name	Description
productId *
string
(path)
ID unique du produit

productId
userId
string
(query)
Filtrer par ID d'utilisateur (optionnel)

userId
Responses
Code	Description	Links
200	
Mouvements complets du produit

No links
401	
Non authentifié

No links
404	
Produit non trouvé

No links

GET
/api/ledger/stock-card/{userId}/{productId}
Fiche de stock détaillée (Stock card)


Affiche la FICHE DE STOCK (stock card) détaillée pour un produit et un utilisateur: récapitulatif complet du mouvement du produit.

Contenu standard de fiche de stock:

EN-TÊTE:

Produit: ID, nom, référence, description
Période d'analyse (date début-fin)
Utilisateur propriétaire/détenteur
Valeur unitaire (prix FIFO/LIFO)
STOCK INITIAL:

Quantité au début de période
Valeur initiale
MOUVEMENTS (tableau détaillé):

Date | Référence | Type | Quantité Entrée | Quantité Sortie | Solde | Valeur
ENTR: Dépôt reçu | 100 | - | 100 | 250€
SORT: Retrait | - | 40 | 60 | 150€
INIT: Initialisation | 200 | - | 260 | 650€
STOCK FINAL:

Quantité clôture
Valeur clôture
Variation période
STATISTIQUES:

Rotation: nombre de mouvements
Entrées totales
Sorties totales
Stock moyen
Valeur moyenne
ALERTES:

Mouvements suspects (FLAGGED)
Discordances
Anomalies détectées
Utilisation:

Comptabilité: Justifier valeur stock fiche de paie
Audit interne: Vérifier calculs
Gestion stock: Connaître consommation réelle
Contrôle de gestion: Analyser rotation produit
Suivi matière: Justifier variations
FIFO/LIFO: Évaluation précise inventaire
Norme d'utilisation:

C'est le document standard d'audit comptable
Chaque produit = une fiche
À conserver à titre de preuve
Required pour audit externe
Sert à réconciliation stock/bilan
Périodes standard:

Mensuelle: suivi opérationnel
Trimestrielle: reporting management
Annuelle: audit/bilan comptable
Résultat attendu:

Stock initial + Entrées - Sorties = Stock final (DOIT égal physique)
Si discordance → investigation requise
Erreurs possibles:

401: Non authentifié
403: Pas d'accès aux données de cet utilisateur
404: Produit non trouvé pour cet utilisateur
Parameters
Try it out
Name	Description
userId *
string
(path)
ID unique (MongoDB ObjectId) de l'utilisateur propriétaire/détenteur

userId
productId *
string
(path)
ID unique du produit

productId
Responses
Code	Description	Links
200	
Fiche de stock détaillée avec tous les mouvements et statistiques

No links
401	
Non authentifié

No links
404	
Produit ou utilisateur non trouvé

No links

GET
/api/ledger/actifs/{userId}
Mouvements d'ACTIFS d'un utilisateur


Affiche UNIQUEMENT les mouvements d'ACTIFS de l'utilisateur: tous les produits qu'il possède ou détient.

Definition ACTIF:

Ressources positives
Éléments de valeur que l'utilisateur possède
Biens à l'actif du bilan
Ce qui ENTRE ou ce qu'il DÉTIENT
Contenu:

Chaque mouvement d'actif inclut:

Produit: ID, nom, description, référence
Quantité: unités en stock
Valeur unitaire et totale
Type de mouvement: DÉPÔT, INITIALISATION, TRANSFERT (entrant), VIREMENT (entrant)
Date du mouvement
Source/Initiateur
Statut: VALIDÉ, PENDING, FLAGGED, REJETÉ
Organisation:

Groupé par produit
Ou par type de mouvement
Ou par date (récent d'abord)
Statistiques actifs:

Total produits: combien de références
Valeur brute: somme tous prix
Quantité totale: somme unités
Produit principal (concentration risque)
Utilisation:

Bilan comptable: colonne ACTIF
Garanties crédit: quelles collaterals
Reporting personnel: "j'ai quoi?"
Décision vente: évaluer portefeuille
Suivi investissement: évolution actifs
Assurance: inventaire couverture
Comparaison avec PASSIFS:

Si Actifs > Passifs = situation saine
Si Actifs < Passifs = risque d'insolvabilité
Ratio Actifs/Passifs = pouvoir de crédit
Note: C'est une vue simplifiée de getUserLedger() mais avec UNIQUEMENT les actifs (sans passifs).

Erreurs possibles:

401: Non authentifié
404: Utilisateur non trouvé ou pas d'actifs
Parameters
Try it out
Name	Description
userId *
string
(path)
ID unique (MongoDB ObjectId) de l'utilisateur

userId
Responses
Code	Description	Links
200	
Mouvements d'actifs: tous les produits possédés par l'utilisateur

No links
401	
Non authentifié

No links
404	
Utilisateur non trouvé ou pas d'actifs

No links

GET
/api/ledger/passifs/{userId}
Mouvements de PASSIFS d'un utilisateur


Affiche UNIQUEMENT les mouvements de PASSIFS de l'utilisateur: toutes les dettes/obligations à rembourser.

Definition PASSIF:

Ressources négatives
Obligations de l'utilisateur
Dettes à rembourser
Éléments de responsabilité au bilan
Ce qu'il DOIT rendre/payer
Contenu:

Chaque mouvement de passif inclut:

Produit dû: ID, nom, description, référence
Quantité due: unités à rembourser
Créancier: qui doit recevoir (propriétaire original)
Détenteur actuel: qui doit rendre
Type: DÉPÔT reçu (crée un passif), RETOUR (réduit), INITIALISATION de passif
Valeur: quantité × prix unitaire
Date création: quand la dette a commencé
Date échéance: quand rembourser
Status: actif (impayé), partiellement payé, clôturé
Organisation:

Groupé par créancier (qui réclame)
Ou par produit
Ou par date d'échéance (les plus urgentes d'abord)
Statistiques passifs:

Montant total dû (en €)
Quantité totale à rembourser
Créanciers (combien de personnes créancières)
Passif par créancier (dette max)
Passif moyen
Risque de défaut (évaluation)
Utilisation:

Bilan comptable: colonne PASSIF
Trésorerie: prévisionnel remboursements
Reporting crédit: risque défaut
Gestion fournisseurs: obligations
Négociation délai: quand payer
Suivi contentieux: dettes contestées
Audit interne: obligation complètes
Comparaison avec ACTIFS:

Si Passifs > Actifs = ALERTE: insolvabilité
Si Passifs < Actifs = situation équilibrée
Ratio Passifs/Actifs = levier financier
Types de passifs:

"Dépôt reçu": Quelqu'un m'a confié de la marchandise (je dois rendre)
"Emprunt": J'ai emprunté de la marchandise (je dois rembourser)
"Achat crédit": J'ai acheté à crédit (je dois payer)
"Passif créé": Transfert de propriété sans mouvement (dette crée)
Risque de crédit:

Évalué par ratio Passifs/Actifs
Si ratio > 1 = situation critique
Si ratio > 0.5 = vigilance recommandée
Note: C'est une vue simplifiée de getUserLedger() mais avec UNIQUEMENT les passifs (sans actifs).

Erreurs possibles:

401: Non authentifié
404: Utilisateur non trouvé ou pas de passifs
Parameters
Try it out
Name	Description
userId *
string
(path)
ID unique (MongoDB ObjectId) de l'utilisateur

userId
Responses
Code	Description	Links
200	
Mouvements de passifs: toutes les dettes de l'utilisateur

No links
401	
Non authentifié

No links
404	
Utilisateur non trouvé ou pas de passifs

No links
