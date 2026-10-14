# Guide utilisateur — Etokisana

**Plateforme de commerce & gestion**
Documentation à destination des utilisateurs de l'application `commercegestion_front`.

Ce guide détaille **chaque interface** de l'application (page par page), les actions
disponibles et **les fenêtres modales (ajout, détails, modification, suppression)**
associées, illustrées par des captures d'écran réelles.

> **Notes sur les captures**
> - Captures réalisées le **14 octobre 2026** sur l'application en fonctionnement, avec un compte de démonstration validé de rôle **Administrateur** (`patrickramahefarson08022002@gmail.com`).
> - Les images sont stockées dans `docs/screenshots/` et référencées ici avec des chemins relatifs.
> - Les éléments de données (lignes de tableaux, produits, parrainages…) dépendent du contenu réel du compte au moment des captures : lorsqu'un modale n'est pas illustré, c'est qu'il n'existait aucune donnée correspondante (cela est précisé dans le texte).
> - Ce document peut être converti en Word avec `python docs/convert_to_docx.py "Guide utilisateur.md"`.

---

## Sommaire

1. [Présentation générale](#1-présentation-générale)
2. [Accès et authentification](#2-acces-et-authentification)
3. [Anatomie de l'application](#3-anatomie-de-lapplication)
4. [Tableau de bord](#4-tableau-de-bord)
5. [Actifs et Passifs](#5-actifs-et-passifs)
6. [Commerce : Boutique, Panier, Échange, Achat/Vente, Appels d'offre](#6-commerce)
7. [Trésorerie : Dépôt, Retrait, Virement de droit](#7-trésorerie)
8. [Mon compte, Audit, Notifications](#8-mon-compte-audit-notifications)
9. [Mes données : Produits, Transactions, Sites, Parrainages](#9-mes-données)
10. [Validation et Administration](#10-validation-et-administration)
11. [Notifications temps réel et bonnes pratiques](#11-notifications-temps-réel-et-bonnes-pratiques)
12. [Annexes](#12-annexes)

---

## 1. Présentation générale

Etokisana est une plateforme de commerce et de gestion permettant de :

- **suivre ses actifs et ses passifs** (produits, quantités, sites, valorisation) ;
- **acheter et vendre** : boutique, échanges d'actifs, ventes monétaires, appels d'offre ;
- **déposer et retirer** des quantités, **virer des droits** à des détenteurs tiers ;
- **gérer ses sites, ses produits, ses transactions et ses parrainages** ;
- **administrer la plateforme** (produits, codes CPC, utilisateurs, exports) — réservé aux administrateurs.

**Rôles et droits d'accès**

| Rôle | Accès |
|------|-------|
| Utilisateur | Toutes les interfaces « Navigation », « Compte », le panier et les notifications. |
| Admin | Tout ce qui précède + l'administration (Produits, CPC, Utilisateurs) et les validations. |

- Un compte doit être **e-mail vérifié** et **validé par un administrateur** pour accéder
  aux interfaces opérationnelles ; sinon un bandeau d'avertissement s'affiche et les
  pages concernées sont refusées (redirection vers le tableau de bord).
- Certaines interfaces sont accessibles même avant validation : tableau de bord,
  mon compte et notifications.

---

## 2. Accès et authentification

### 2.1 Connexion — `/login`

Page d'entrée de l'application. Saisissez votre **adresse e-mail** et votre **mot de passe**,
puis cliquez sur **Se connecter**. Le lien *Mot de passe oublié ?* permet de lancer une
procédure de récupération, et le lien *Créer un compte* renvoie vers l'inscription.

![Écran de connexion](screenshots/01-connexion.png)

- L'œil à droite du champ mot de passe affiche/masque la saisie.
- En cas d'échec, un message d'erreur (toast) s'affiche en haut à droite.
- Après connexion réussie, vous êtes redirigé vers le **Tableau de bord**.

### 2.2 Inscription — `/register`

Inscription en **3 étapes** :

1. **Type d'utilisateur** — Particulier ou Entreprise + codes parrain (2 codes de 8 caractères obligatoires) ;
2. **Informations personnelles** — identité et contact ;
3. **Documents & Images** — justificatifs à téléverser.

![Écran d'inscription (étape 1)](screenshots/02-inscription.png)

### 2.3 Mot de passe oublié — `/forgot-password`

Saisissez votre e-mail ou votre code utilisateur, puis **Envoyer le lien** : un lien de
réinitialisation sécurisé (à usage unique) vous est adressé par e-mail.

![Réinitialisation du mot de passe — demande](screenshots/03-mot-de-passe-oublie.png)

### 2.4 Réinitialisation — `/reset-password`

Depois le lien reçu, choisissez un **nouveau mot de passe** (8 caractères minimum) et
confirmez-le. Vous êtes ensuite reconnecté automatiquement.

![Réinitialisation du mot de passe — nouveau mot de passe](screenshots/04-reinitialisation-mdp.png)

---

## 3. Anatomie de l'application

Une fois connecté, chaque page utilise la même charpente :

- **En-tête (haut)** : logo, raccourcis **Panier** et **Notifications** (cloche avec badge
  de non-lus), menu mobile et **avatar** avec menu utilisateur (déconnexion).
- **Navigation latérale (gauche)**, regroupée en 3 sections :
  - **NAVIGATION** : Tableau de bord, Actifs, Passifs, Boutique, Depot, Retrait,
    Virement de droit, Echange publics d'actifs, Achat/Vente, Appel d'offres ;
  - **COMPTE** : Mon Compte, Audit, Mes Produits, Mes Transactions, Opérations à valider,
    Mes Sites, Parrainages ;
  - **ADMINISTRATION** *(visibles seulement pour les Admin)* : Produits, CPC, Utilisateurs.
- **Contenu central** : titre de page + sous-titre explicatif, barre d'actions
  (filtres, export, création), puis tableaux ou formulaires.
- **Pied de page** : copyright.

**Conventions d'interface rencontrées dans le guide**

- **Onglets** : plusieurs pages proposent des vues secondaires sous forme d'onglets
  (formulaire, historique, secondes listes) — chaque onglet est illustré comme une vue.
- **Tableaux** : tri/filtres au-dessus du tableau, pagination *Précédent / Page x / y / Suivant*,
  colonne **Actions** avec des boutons icônes (œil = détails, crayon = modifier, corbeille = supprimer).
- **Modaux (fenêtres modales)** : l'application utilise 4 familles de modales :
  1. **Ajout / création** (bouton *Ajouter*, *Nouveau*, *Créer*…) ;
  2. **Détails** (bouton *Détails*, *Voir* ou icône œil) — lecture seule ;
  3. **Modification** (icône crayon / bouton *Modifier*) ;
  4. **Suppression / confirmation** (icône corbeille, interrupteur de rôle/statut,
     validation d'opération) — presque toujours avec boutons **Annuler** et **Confirmer**.
- **Toasts** : les messages de succès/erreur s'affichent en haut à droite.

---

## 4. Tableau de bord

**Route** : `/dashboard` · **Rôle** : Utilisateur, Admin · **Validation** : non requise

Le tableau de bord est la vue d'ensemble de votre activité :

- **Cartes statistiques** : Actifs, Passifs, Retraits effectués, Dépôts effectués
  (avec quantités totales et détail disponible / en attente).
- **Métriques clés** : Total Sites, Total Utilisateurs, Total Actifs, Total Passifs,
  Total Transactions, Total Produits.
- **Graphiques & analyses** (Recharts) : Actifs par Site, Passifs par Site,
  Actifs par Produit, Passifs par Produit, Transactions par Mois (bascule Nombre/Quantité),
  Transactions par Semaine.
- **Inventaire global** : quantités totales actifs/passifs, répartition par site.
- **Autres métriques** : stocks produits, nombre de sites, produits par site.

![Tableau de bord — cartes et métriques](screenshots/05-tableau-de-bord.png)

![Tableau de bord — graphiques](screenshots/05-tableau-de-bord-vue-2.png)

![Tableau de bord — inventaire global et métriques](screenshots/05-tableau-de-bord-vue-3.png)

> Le tableau de bord ne contient pas de modale : il est en lecture seule.

---

## 5. Actifs et Passifs

### 5.1 Mes Actifs — `/actifs`

**Route** : `/actifs` · **Rôle** : Utilisateur, Admin (compte validé)

Liste de vos actifs (produits détenus sur vos sites) et de leur disponibilité.

**Ce que vous voyez**

- Deux **onglets** : *Mes Actifs* (tableau) et *Mes Produits en vente* (annonces).
- Boutons d'action globaux : **Opération hors plateforme** (initialisation produit/site)
  et **Exporter**.
- Tableau : Produit, Code, Image, Dépôt, Adresse dépôt, Quantité, Type, Statut,
  Détenteur, Date, **Actions** (détail, ajouter du stock, mettre en vente).
- Pagination en pied de tableau.

![Page Actifs (onglet Mes Actifs)](screenshots/06-actifs.png)

**Modales d'action**

| Modale | Déclencheur | Capture |
|--------|-------------|---------|
| Détail actif | icône œil en colonne Actions | ![Détail actif](screenshots/06-actifs__02-detail-actif.png) |
| Ajouter du stock | icône « + » en colonne Actions | ![Ajouter du stock](screenshots/06-actifs__03-ajouter-du-stock.png) |
| Mettre en vente | icône de vente en colonne Actions | ![Mettre en vente](screenshots/06-actifs__04-mettre-en-vente.png) |
| Initialiser un produit à un site | bouton **Opération hors plateforme** | ![Initialiser un produit à un site](screenshots/06-actifs__14-initialiser-un-produit-a-un-site.png) |
| Exporter les actifs | bouton **Exporter** | ![Exporter les actifs](screenshots/06-actifs__01-exporter-les-actifs.png) |

- *Mettre en vente* demande la **quantité à vendre**, le **prix unitaire** et une
  description optionnelle ; la quantité est plafonnée au disponible.
- *Ajouter du stock* saisit la quantité ajoutée et des observations.
- *Supprimer l'annonce* (corbeille) existe dans l'onglet **Mes Produits en vente** —
  il apparaît uniquement si vous avez des annonces en vente (aucune au moment des captures) :

![Onglet Mes Produits en vente](screenshots/06-actifs__onglet-annonces.png)

### 5.2 Mes Passifs — `/passifs`

**Route** : `/passifs` · **Rôle** : Utilisateur, Admin (compte validé)

Historique de vos passifs (obligations/quantités sorties). Bouton **Exporter** en haut à droite,
pagination et sélecteur *Par page*.

![Page Passifs](screenshots/07-passifs.png)

**Modales d'action**

- **Exporter les passifs** (bouton *Exporter*) :

![Exporter les passifs](screenshots/07-passifs__14-exporter-les-passifs.png)

- **Détail du Passif** : accessible par clic sur une ligne du tableau — non illustré ici,
  le compte de test n'ayant aucun passif (*Aucun passif trouvé*).

---

## 6. Commerce

### 6.1 Boutique — `/boutique`

**Route** : `/boutique` · **Rôle** : Utilisateur, Admin (compte validé)

Marketplace des produits disponibles à la vente.

**Ce que vous voyez**

- Onglets : **Produits à vendre** (catalogue) et **Achat rapide** (raccourci depuis le panier).
- Filtres : tri par date (croissant/décroissant), nombre d'éléments par page,
  filtrage par fournisseur.
- Chaque ligne propose : **Ajouter au panier** (icône panier) et **Voir détails** (icône œil).

![Page Boutique](screenshots/08-boutique.png)

**Onglet Achat rapide**

![Boutique — onglet Achat rapide](screenshots/08-boutique__onglet-achat-rapide.png)

**Modales d'action**

- **Détail produit** (bouton *Voir détails*) : fiche du produit, prix, stock, vendeur,
  ajout au panier — non illustré : aucun produit en vente au moment des captures
  (*Aucun produit trouvé*).

### 6.2 Panier — `/panier`

**Route** : `/panier` · **Rôle** : Utilisateur, Admin (compte validé)

Contenu de votre panier : quantités, sous-total, bouton de **vidage** du panier et
finalisation de la commande (choix du site de livraison + observations).

![Page Panier (vide)](screenshots/15-panier.png)

**Modales d'action**

- **Finalisation de commande** (checkout) : déclenchée depuis le panier — non illustrée,
  le panier étant vide au moment des captures. Ajoutez d'abord un produit depuis la Boutique.

### 6.3 Échange publics d'actifs — `/echange-actifs`

**Route** : `/echange-actifs` · **Rôle** : Utilisateur, Admin (compte validé)

Permet de **mettre en vente** un produit en échange d'un produit de contrepartie, et
d'**acheter les offres** proposées par les autres membres.

**Ce que vous voyez**

- Onglets : **Mise en vente** (formulaire) et **Produits à vendre** (offres des membres).
- Formulaire *Mise en vente* : détenteur (code à 8 caractères), dépôt, produit A vendu,
  quantité, produit B de contrepartie.

![Page Échange d'actifs (formulaire de mise en vente)](screenshots/12-echange-actifs.png)

**Onglet Produits à vendre (offres)** : chaque offre dispose d'un bouton **Acheter**.

![Échange d'actifs — onglet Produits à vendre](screenshots/12-echange-actifs__onglet-offres.png)

**Modales d'action**

- **Acheter l'offre d'échange** (bouton *Acheter* d'une offre) : récapitulatif de l'offre
  et confirmation d'achat.

![Acheter l'offre d'échange](screenshots/12-echange-actifs__01-acheter-l-offre-d-echange.png)

### 6.4 Achat / Vente — `/achat-vente`

**Route** : `/achat-vente` · **Rôle** : Utilisateur, Admin (compte validé)

Transactions bilatérales entre membres, en deux modes (onglets) :

- **Vente monétaire** : vendez un produit contre de l'argent (étapes *Vendeur*, *Acheteur*…,
  champs code détenteur, dépôt, produit, quantité, prix).
- **Échange produit** : échangez un produit contre un autre produit.

![Achat/Vente — onglet Vente monétaire](screenshots/13-achat-vente.png)

![Achat/Vente — onglet Échange produit](screenshots/13-achat-vente__onglet-echange-produit.png)

> Ces formulaires s'appliquent directement (pas de modale) : un toast confirme l'opération.

### 6.5 Appels d'offre — `/appel-offre`

**Route** : `/appel-offre` · **Rôle** : Utilisateur, Admin (compte validé)

Consultez et gérez les appels d'offres et leurs soumissions.

**Ce que vous voyez**

- Onglets : **Tous les appels d'offres** et **Mes appels d'offre**.
- Filtres : recherche par titre, tri par date, nombre par page, filtre par statut.
- Sur un appel : **Voir / Détails**, **Dépouiller** (si ouvert), **Soumissions**,
  **Supprimer**, et bouton **Soumissionner** (statut OUVERT uniquement).

![Appels d'offre — onglet Tous les appels d'offres](screenshots/14-appel-offre.png)

**Onglet Mes appels d'offre** (bouton de création)

![Appels d'offre — onglet Mes appels d'offre](screenshots/14-appel-offre__onglet-mes-appels.png)

**Modales d'action**

- **Nouvel appel d'offre** (bouton *Nouvel appel d'offre*) : titre, description/TDR,
  unité, produit, site, quantité, conditions de paiement, délai de livraison.

![Nouvel appel d'offre](screenshots/14-appel-offre__01-nouvel-appel-d-offre.png)

- Autres modales disponibles sur une ligne existante : **Détail de l'appel d'offre**,
  **Soumissions reçues**, **Soumettre une offre** (prix unitaire, quantité, délai,
  observations), **Confirmer l'annulation** (suppression) et **Confirmer l'attribution** —
  non illustrés : aucun appel d'offre n'existait au moment des captures.

---

## 7. Trésorerie

### 7.1 Dépôt — `/depot`

**Route** : `/depot` · **Rôle** : Utilisateur, Admin (compte validé)

Enregistre un dépôt de quantités (produit → site) et tient l'historique.

**Ce que vous voyez**

- Onglets : **Historique de mes dépôts** (tableau Produit, Image, Opérateur, Détenteur,
  Ayant droit, Site origine, Site destination, Quantité, Validation, Date)
  et **Formulaire de dépôt**.

![Dépôt — historique](screenshots/09-depot.png)

**Onglet Formulaire de dépôt** : site origine, produit, ayant droit, site destination,
quantité et observations (champs avec autocomplétion).

![Dépôt — formulaire](screenshots/09-depot__onglet-formulaire.png)

> Le formulaire est soumis directement (aucune modale) : la nouvelle opération apparaît
> ensuite dans l'historique avec le statut *En attente* puis *Approuvé*.

### 7.2 Retrait — `/retrait`

**Route** : `/retrait` · **Rôle** : Utilisateur, Admin (compte validé)

Mécanique identique au dépôt, mais pour **retirer** des quantités d'un site.

![Retrait — historique](screenshots/10-retrait.png)

**Onglet Formulaire de retrait** : site origine, produit, site destination, quantité.

![Retrait — formulaire](screenshots/10-retrait__onglet-formulaire.png)

### 7.3 Virement de droit — `/virement-droit`

**Route** : `/virement-droit` · **Rôle** : Utilisateur, Admin (compte validé)

Transfère le **droit d'un actif** à un bénéficiaire tiers. Le tableau liste vos actifs
(Produit, Code, Image, Dépôt, Adresse, Qté, Détenteur, Ayant droit, Date) avec une
action **Virer droit** par ligne.

![Page Virement de droit](screenshots/11-virement-droit.png)

**Modales d'action**

- **VIREMENT DE DROIT** (bouton *Virer droit*) : formulaire de transfert vers le
  bénéficiaire (identité du détenteur, ayant droit destinataire, site, produit, quantité) :

![Modale Virement de droit](screenshots/11-virement-droit__01-virement-de-droit.png)

> L'opération génère une transaction qui doit être validée depuis *Opérations à valider*
> (voir section 10.1) si elle est soumise à approbation.

---

## 8. Mon compte, Audit, Notifications

### 8.1 Mon compte — `/mon-compte`

**Route** : `/mon-compte` · **Rôle** : Utilisateur, Admin (accessible avant validation)

Carte d'identité du compte (nom, e-mail, rôle, badges *Email vérifié* / *Compte vérifié*,
identifiant membre) puis deux onglets :

- **Profil** : pseudo, nom, prénom, avatar, e-mail, téléphone — bouton
  **Enregistrer les modifications** ;
- **Sécurité** : changement de mot de passe (mot de passe actuel, nouveau, confirmation).

![Mon compte — onglet Profil](screenshots/16-mon-compte.png)

**Onglet Sécurité**

![Mon compte — onglet Sécurité](screenshots/16-mon-compte__onglet-securite.png)

**Modales d'action**

- **Confirmer la modification** (après *Enregistrer les modifications*) :

![Confirmer la modification du profil](screenshots/16-mon-compte__01-confirmer-la-modification.png)

### 8.2 Journal d'audit — `/mon-compte/audit`

**Route** : `/mon-compte/audit` · **Rôle** : Utilisateur, Admin (compte validé)

Historique horodaté des actions effectuées sur votre compte : filtre par type d'action,
boutons **Réinitialiser**, **Exporter Excel**, **Exporter PDF**. Chaque entrée affiche
l'acteur, l'action, l'entité, le type, l'adresse IP, la date et un bouton **Détails**.

![Journal d'audit](screenshots/17-audit.png)

**Modales d'action**

- **Détails de l'entrée d'audit** (bouton *Détails* d'une ligne) : acteur, date, objet,
  entité, identifiant, IP :

![Détail d'une entrée d'audit](screenshots/17-audit__01-refresh-token-utilisateur.png)

### 8.3 Notifications — `/notifications`

**Route** : `/notifications` · **Rôle** : Utilisateur, Admin (accessible avant validation)

Liste de vos alertes (créations, validations, rejets de transactions…). Filtre
*Tout afficher* / non-lues, bouton pour tout marquer comme lu. Cliquez sur une
notification pour être dirigé vers la page concernée.

![Page Notifications](screenshots/20-notifications.png)

> Aucune modale sur cette page : le marquage comme lu est effectué directement.

---

## 9. Mes données

### 9.1 Mes produits — `/mes-produits`

**Route** : `/mes-produits` · **Rôle** : Utilisateur, Admin (compte validé)

Catalogue personnel des produits. Filtres *Tous* (catégorie, validation) et bouton
**Ajouter un produit**. Tableau : IDs, Aperçu, Nom, Catégorie, Validé, Code CPC,
Déposer, Actions (détail, modifier, supprimer).

![Page Mes produits](screenshots/18-mes-produits.png)

**Modales d'action**

- **Ajouter un produit** (bouton *Ajouter un produit*) : fiche produit (nom, catégorie,
  description, image, code CPC…) :

![Ajouter un produit](screenshots/18-mes-produits__01-ajouter-un-produit.png)

- Les modales **Détails du produit**, **Modifier**, **Déposer** et **Supprimer** s'ouvrent
  depuis les actions de chaque ligne — non illustrées : le compte de test n'avait aucun
  produit personnel (*Aucun produit trouvé*).

### 9.2 Mes transactions — `/mes-transactions`

**Route** : `/mes-transactions` · **Rôle** : Utilisateur, Admin (compte validé)

Historique complet de vos transactions avec 3 onglets : **Transactions**,
**Mouvements des Actifs**, **Mouvements des Passifs**.

**Filtres** : type de transaction (Dépôt, Retrait, Vente, Virement de droit,
Initialisation…), statut (En attente, Approuvé…), ordre chronologique.

**Colonnes** : N° Transaction, Produit, Type, Quantité, Statut, Lieu d'origine, Date, Actions.

![Mes transactions — onglet Transactions](screenshots/19-mes-transactions.png)

![Mes transactions — onglet Mouvements des Actifs](screenshots/19-mes-transactions__onglet-mouvements-actifs.png)

![Mes transactions — onglet Mouvements des Passifs](screenshots/19-mes-transactions__onglet-mouvements-passifs.png)

**Modales d'action**

- **Détails de la transaction** (icône œil en colonne Actions) : détail complet de la
  transaction (identifiant, produit, quantité, statut, sites, dates, historique) :

![Détails de la transaction](screenshots/19-mes-transactions__01-details-de-la-transaction.png)

### 9.3 Mes sites — `/mes-sites`

**Route** : `/mes-sites` · **Rôle** : Utilisateur, Admin (compte validé)

Vos sites/boutiques : cartes avec nom, adresse, latitude/longitude, et action
**Modifier** ; bouton global **Ajouter un site** ; compteur *Total sites*.

![Page Mes sites](screenshots/22-mes-sites.png)

**Modales d'action**

- **Ajouter un nouveau site** (bouton *Ajouter un site*) :

![Ajouter un nouveau site](screenshots/22-mes-sites__01-ajouter-un-nouveau-site.png)

- **Modifier le site** (bouton *Modifier* d'une carte) :

![Modifier le site](screenshots/22-mes-sites__02-modifier-le-site.png)

- **Confirmer la suppression** (icône corbeille d'une carte) :

![Confirmer la suppression d'un site](screenshots/22-mes-sites__04-confirmer-la-suppression.png)

### 9.4 Parrainages — `/parrainages`

**Route** : `/parrainages` · **Rôle** : Utilisateur, Admin (compte validé)

Suivi de vos filleuls : recherche (nom/e-mail), filtre par type et par statut
d'activation, bouton **Réinitialiser**. Chaque parrainage peut être consulté en détail
et approuvé depuis la ligne concernée.

![Page Parrainages](screenshots/23-parrainages.png)

**Modales d'action**

- **Détail du parrain** et **approbation** : non illustrés — aucun filleul enregistré
  au moment des captures (*Aucun parrain trouvé*).

---

## 10. Validation et Administration

> Les interfaces de cette section servent à **valider les opérations** et à administrer
> la plateforme. L'administration nécessite le rôle **Admin**.

### 10.1 Opérations à valider — `/operations-a-valider`

**Route** : `/operations-a-valider` · **Rôle** : Utilisateur, Admin (compte validé)

File d'attente des opérations soumises à validation (dépôts, retraits, virements…),
avec compteur *(n)* en sous-titre.

![Opérations à valider](screenshots/21-operations-a-valider.png)

**Modales d'action**

- **Approuver la transaction** (bouton *Approuver*) : récapitulatif + saisie d'un
  commentaire d'approbation.
- **Rejeter la transaction** (bouton *Rejeter*) : motif du rejet obligatoire.

> Non illustrées : aucune opération en attente au moment des captures *(0)*.

### 10.2 Administration – Produits — `/admin/produits`

**Route** : `/admin/produits` · **Rôle** : **Admin uniquement**

Gestion du catalogue de la plateforme : bouton **Exporter**, tableau (Aperçu, Nom,
Catégorie, Créateur, Stocké, Validé, Code CPC, Détail) avec interrupteur de validation
par ligne.

![Administration des produits](screenshots/24-admin-produits.png)

**Modales d'action**

- **Valider ce produit ?** (interrupteur *Valider* d'une ligne) :

![Valider ce produit](screenshots/24-admin-produits__02-valider-ce-produit.png)

- **Détail du produit** (icône *Détail* d'une ligne) :

![Détail du produit](screenshots/24-admin-produits__03-detail-du-produit.png)

- **Exporter les produits** (bouton *Exporter*) :

![Exporter les produits](screenshots/24-admin-produits__01-exporter-les-produits.png)

### 10.3 Administration – CPC — `/admin/cpc`

**Route** : `/admin/cpc` · **Rôle** : **Admin uniquement**

Référentiel des **codes CPC** (nomenclature des produits) : boutons **Ajouter un CPC**,
**Importer CSV/Excel**, **Exporter**, filtre par niveau, tableau Code / Nom / Niveau /
Actions, pagination (210 pages).

![Administration des CPC](screenshots/25-admin-cpc.png)

**Modales d'action**

- **Ajouter un code CPC** :

![Ajouter un code CPC](screenshots/25-admin-cpc__32-ajouter-un-code-cpc.png)

- **Détail du code CPC** (icône *Voir*) :

![Détail du code CPC](screenshots/25-admin-cpc__34-detail-du-code-cpc.png)

- **Modifier le code CPC** (icône *Modifier*) :

![Modifier le code CPC](screenshots/25-admin-cpc__35-modifier-le-code-cpc.png)

- **Supprimer le code CPC** (icône *Supprimer*) — confirmation :

![Supprimer le code CPC](screenshots/25-admin-cpc__36-supprimer-le-code-cpc.png)

- **Exporter CPC** (bouton *Exporter*) :

![Exporter CPC](screenshots/25-admin-cpc__33-exporter-cpc.png)

### 10.4 Administration – Utilisateurs — `/admin/utilisateurs`

**Route** : `/admin/utilisateurs` · **Rôle** : **Admin uniquement**

Comptes et permissions : cartes de statistiques (Total, Actifs, Administrateurs),
filtres (e-mail vérifié, statut, type), bouton **Exporter**. Tableau : N° membre,
Utilisateur, Email, Vérification e-mail, Date d'inscription, Date de validation,
Rôle, Statut, **Actions** (détail, suppression) et **interrupteurs** Rôle admin / Statut actif.

![Administration des utilisateurs](screenshots/26-admin-utilisateurs.png)

**Modales d'action**

- **Détail utilisateur** (icône information d'une ligne) :

![Détail utilisateur](screenshots/26-admin-utilisateurs__18-detail-utilisateur.png)

- **Confirmer le changement de rôle** (interrupteur *Rôle admin*) :

![Confirmer le changement de rôle](screenshots/26-admin-utilisateurs__48-confirmer-le-changement-de-role.png)

- **Confirmer l'activation/suspension** (interrupteur *Statut*) :

![Confirmer l'activation/suspension](screenshots/26-admin-utilisateurs__49-confirmer-l-activation-suspension.png)

- **Confirmer la suppression** (icône corbeille d'une ligne) :

![Confirmer la suppression d'un utilisateur](screenshots/26-admin-utilisateurs__19-confirmer-la-suppression.png)

- **Exporter les utilisateurs** (bouton *Exporter*) :

![Exporter les utilisateurs](screenshots/26-admin-utilisateurs__47-exporter-les-utilisateurs.png)

### 10.5 Centre d'export — `/admin/export-hub`

**Route** : `/admin/export-hub` · **Rôle** : Utilisateur, Admin

Point central d'export des données, en deux blocs :

- **Exports Administrateur** : Utilisateurs, Audit, Sites, Produits, CPC, Stocks ;
- **Mes Exports** : Mes Actifs, Mes Passifs, Mes Transactions, Mon Ledger.

Chaque carte comporte un bouton **Exporter** qui ouvre une modale de confirmation
(choix du format — CSV/Excel/PDF selon les cas — et éventuellement des filtres).

![Centre d'export](screenshots/27-centre-export.png)

**Modales d'action** (une par export) :

| Export | Capture |
|--------|---------|
| Exporter les utilisateurs | ![Exporter les utilisateurs](screenshots/27-centre-export__27-exporter-les-utilisateurs.png) |
| Exporter l'audit | ![Exporter l'audit](screenshots/27-centre-export__28-exporter-l-audit.png) |
| Exporter les sites | ![Exporter les sites](screenshots/27-centre-export__29-exporter-les-sites.png) |
| Exporter les produits | ![Exporter les produits](screenshots/27-centre-export__30-exporter-les-produits.png) |
| Exporter CPC | ![Exporter CPC](screenshots/27-centre-export__31-exporter-cpc.png) |
| Exporter les stocks | ![Exporter les stocks](screenshots/27-centre-export__32-exporter-les-stocks.png) |
| Exporter mes actifs | ![Exporter mes actifs](screenshots/27-centre-export__33-exporter-mes-actifs.png) |
| Exporter mes passifs | ![Exporter mes passifs](screenshots/27-centre-export__34-exporter-mes-passifs.png) |
| Exporter mes transactions | ![Exporter mes transactions](screenshots/27-centre-export__35-exporter-mes-transactions.png) |
| Exporter mon ledger | ![Exporter mon ledger](screenshots/27-centre-export__36-exporter-mon-ledger.png) |

> Cette page n'est pas listée dans la barre latérale : elle se rejoint par l'URL
> `/admin/export-hub`.

---

## 11. Notifications temps réel et bonnes pratiques

- **Cloche de notifications** (en-tête) : badge du nombre de non-lus, liste des
  dernières alertes, lien *Voir tout* → page Notifications. Les notifications sont
  poussées en **temps réel (WebSocket)** et consultables ensuite dans l'historique.
- **Clic sur une notification** : marque la notification comme lue et ouvre la page
  métier concernée (dépôt, retrait, transaction…).
- **Panier** : icône dans l'en-tête → page Panier.
- **Déconnexion** : menu avatar (en haut à droite).
- **Bandeau « compte non validé »** : tant que votre compte n'est pas validé, les
  interfaces opérationnelles restent fermées.
- **Toasts** : chaque action (succès/erreur) affiche un message en haut à droite ;
  les fenêtres modales se ferment avec **Échap**, la croix ou le bouton *Annuler*.

---

## 12. Annexes

### Annexe A — Récapitulatif des interfaces

| # | Interface | Route | Rôle | Capture principale |
|---|-----------|-------|------|--------------------|
| 01 | Connexion | `/login` | Public | `01-connexion.png` |
| 02 | Inscription | `/register` | Public | `02-inscription.png` |
| 03 | Mot de passe oublié | `/forgot-password` | Public | `03-mot-de-passe-oublie.png` |
| 04 | Réinitialisation MDP | `/reset-password` | Public | `04-reinitialisation-mdp.png` |
| 05 | Tableau de bord | `/dashboard` | Utilisateur, Admin | `05-tableau-de-bord.png` |
| 06 | Actifs | `/actifs` | Utilisateur, Admin | `06-actifs.png` |
| 07 | Passifs | `/passifs` | Utilisateur, Admin | `07-passifs.png` |
| 08 | Boutique | `/boutique` | Utilisateur, Admin | `08-boutique.png` |
| 09 | Dépôt | `/depot` | Utilisateur, Admin | `09-depot.png` |
| 10 | Retrait | `/retrait` | Utilisateur, Admin | `10-retrait.png` |
| 11 | Virement de droit | `/virement-droit` | Utilisateur, Admin | `11-virement-droit.png` |
| 12 | Échange d'actifs | `/echange-actifs` | Utilisateur, Admin | `12-echange-actifs.png` |
| 13 | Achat/Vente | `/achat-vente` | Utilisateur, Admin | `13-achat-vente.png` |
| 14 | Appel d'offres | `/appel-offre` | Utilisateur, Admin | `14-appel-offre.png` |
| 15 | Panier | `/panier` | Utilisateur, Admin | `15-panier.png` |
| 16 | Mon compte | `/mon-compte` | Utilisateur, Admin | `16-mon-compte.png` |
| 17 | Journal d'audit | `/mon-compte/audit` | Utilisateur, Admin | `17-audit.png` |
| 18 | Mes produits | `/mes-produits` | Utilisateur, Admin | `18-mes-produits.png` |
| 19 | Mes transactions | `/mes-transactions` | Utilisateur, Admin | `19-mes-transactions.png` |
| 20 | Notifications | `/notifications` | Utilisateur, Admin | `20-notifications.png` |
| 21 | Opérations à valider | `/operations-a-valider` | Utilisateur, Admin | `21-operations-a-valider.png` |
| 22 | Mes sites | `/mes-sites` | Utilisateur, Admin | `22-mes-sites.png` |
| 23 | Parrainages | `/parrainages` | Utilisateur, Admin | `23-parrainages.png` |
| 24 | Administration – Produits | `/admin/produits` | **Admin** | `24-admin-produits.png` |
| 25 | Administration – CPC | `/admin/cpc` | **Admin** | `25-admin-cpc.png` |
| 26 | Administration – Utilisateurs | `/admin/utilisateurs` | **Admin** | `26-admin-utilisateurs.png` |
| 27 | Centre d'export | `/admin/export-hub` | Utilisateur, Admin | `27-centre-export.png` |

### Annexe B — Inventaire complet des captures

**Vues d'interfaces (39 fichiers)** — `docs/screenshots/`

```
01-connexion.png                          02-inscription.png
03-mot-de-passe-oublie.png                04-reinitialisation-mdp.png
05-tableau-de-bord.png                    05-tableau-de-bord-vue-2.png
05-tableau-de-bord-vue-3.png              06-actifs.png
06-actifs__onglet-annonces.png            07-passifs.png
08-boutique.png                           08-boutique__onglet-achat-rapide.png
09-depot.png                              09-depot__onglet-formulaire.png
10-retrait.png                            10-retrait__onglet-formulaire.png
11-virement-droit.png                     12-echange-actifs.png
12-echange-actifs__onglet-offres.png      13-achat-vente.png
13-achat-vente__onglet-echange-produit.png 14-appel-offre.png
14-appel-offre__onglet-mes-appels.png     15-panier.png
16-mon-compte.png                         16-mon-compte__onglet-securite.png
17-audit.png                              18-mes-produits.png
19-mes-transactions.png                   19-mes-transactions__onglet-mouvements-actifs.png
19-mes-transactions__onglet-mouvements-passifs.png  20-notifications.png
21-operations-a-valider.png               22-mes-sites.png
23-parrainages.png                        24-admin-produits.png
25-admin-cpc.png                          26-admin-utilisateurs.png
27-centre-export.png
```

**Modales d'action (39 fichiers)** — motif de nommage : `<page>__NN-titre-de-la-modale.png`

```
06-actifs__01-exporter-les-actifs.png                 06-actifs__02-detail-actif.png
06-actifs__03-ajouter-du-stock.png                    06-actifs__04-mettre-en-vente.png
06-actifs__14-initialiser-un-produit-a-un-site.png    07-passifs__14-exporter-les-passifs.png
11-virement-droit__01-virement-de-droit.png           12-echange-actifs__01-acheter-l-offre-d-echange.png
14-appel-offre__01-nouvel-appel-d-offre.png           16-mon-compte__01-confirmer-la-modification.png
17-audit__01-refresh-token-utilisateur.png            18-mes-produits__01-ajouter-un-produit.png
19-mes-transactions__01-details-de-la-transaction.png 22-mes-sites__01-ajouter-un-nouveau-site.png
22-mes-sites__02-modifier-le-site.png                 22-mes-sites__04-confirmer-la-suppression.png
24-admin-produits__01-exporter-les-produits.png       24-admin-produits__02-valider-ce-produit.png
24-admin-produits__03-detail-du-produit.png           25-admin-cpc__32-ajouter-un-code-cpc.png
25-admin-cpc__33-exporter-cpc.png                     25-admin-cpc__34-detail-du-code-cpc.png
25-admin-cpc__35-modifier-le-code-cpc.png             25-admin-cpc__36-supprimer-le-code-cpc.png
26-admin-utilisateurs__18-detail-utilisateur.png      26-admin-utilisateurs__19-confirmer-la-suppression.png
26-admin-utilisateurs__47-exporter-les-utilisateurs.png
26-admin-utilisateurs__48-confirmer-le-changement-de-role.png
26-admin-utilisateurs__49-confirmer-l-activation-suspension.png
27-centre-export__27-exporter-les-utilisateurs.png    27-centre-export__28-exporter-l-audit.png
27-centre-export__29-exporter-les-sites.png           27-centre-export__30-exporter-les-produits.png
27-centre-export__31-exporter-cpc.png                 27-centre-export__32-exporter-les-stocks.png
27-centre-export__33-exporter-mes-actifs.png          27-centre-export__34-exporter-mes-passifs.png
27-centre-export__35-exporter-mes-transactions.png    27-centre-export__36-exporter-mon-ledger.png
```

### Annexe C — Modales dépendantes des données (non illustrées)

Ces modales existent dans l'application mais n'ont pas pu être capturées car le compte
de test n'avait aucune donnée correspondante :

| Interface | Modale | Condition d'affichage |
|-----------|--------|-----------------------|
| Actifs (onglet annonces) | Supprimer l'annonce | au moins une annonce en vente |
| Passifs | Détail du Passif | au moins un passif |
| Boutique | Détail produit | au moins un produit en vente |
| Panier | Finalisation de commande | panier non vide |
| Mes produits | Détails / Modifier / Déposer / Supprimer | au moins un produit créé |
| Opérations à valider | Approuver / Rejeter | au moins une opération en attente |
| Parrainages | Détail / Approbation | au moins un filleul |
| Appel d'offres | Détail / Soumissions / Dépouiller / Supprimer / Soumissionner | au moins un appel d'offre créé |

### Annexe D — Régénérer les captures et convertir le guide

**Captures d'écran** (script `docs/capture_screenshots.cjs`, nécessite Chrome et le serveur dev lancé `npm run dev`) :

```bash
node docs/capture_screenshots.cjs pages              # (re)capture les interfaces
node docs/capture_screenshots.cjs texts              # dump du texte visible (manifeste)
node docs/capture_screenshots.cjs modals             # capture les modaux
node docs/capture_screenshots.cjs modals --phase-c   # vues d'onglets & déclencheurs spécifiques
node docs/capture_screenshots.cjs pages --resume     # ne recapture que ce qui manque
```

Les captures et leurs métadonnées sont gérées dans `docs/screenshots/_manifest.json`.
En phase « modals », toutes les requêtes de mutation sont bloquées : **aucune donnée
réelle n'est modifiée** lors de la génération.

**Conversion Word (`.docx`)** :

```bash
python docs/convert_to_docx.py "Guide utilisateur.md"      # → docs/Guide utilisateur.docx
python docs/convert_to_docx.py                              # → docs/Documentation.docx
```

---

*Guide généré le 14 octobre 2026 — Etokisana, plateforme de commerce & gestion.*
