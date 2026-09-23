# Frontend — Virement de droit

## Endpoint

```http
POST /api/v1/transactions/virement-droit
Authorization: Bearer <token>
Content-Type: application/json
```

Un virement de droit ne déplace pas physiquement le produit. Le détenteur et
le site du dépôt restent identiques ; seul l'`ayant_droit` de la quantité
transférée devient le bénéficiaire.

## Corps de la requête

```ts
type CreateVirementDroitPayload = {
  id_transactions: string; // ID de la transaction de dépôt approuvée
  beneficiaryId: string; // Nouvel ayant_droit
  detentaireId: string; // Détenteur physique du dépôt
  productId: string; // Produit du dépôt
  quantite: number; // Nombre décimal positif à transférer
  observations?: string;
};
```

Exemple :

```ts
await api.post('/v1/transactions/virement-droit', {
  id_transactions: deposit._id,
  beneficiaryId: form.beneficiaryId,
  detentaireId: deposit.detentaire,
  productId: deposit.productId,
  quantite: Number(form.quantite), // ex. 12.5
  observations: form.observations || undefined,
});
```

`siteId` ne doit plus être envoyé : le backend récupère le site depuis la
transaction de dépôt de référence.

## Règles à appliquer dans l'interface

- Le dépôt référencé doit avoir le statut `APPROVED`.
- Seul son `ayant_droit` actuel peut initier le virement.
- Le détenteur et le produit envoyés doivent correspondre au dépôt.
- La quantité est décimale et strictement positive (`0.5`, `12.75`, etc.).
- La quantité ne peut pas dépasser le reliquat de **ce dépôt**, indépendamment
  du stock total de l'utilisateur pour le même produit.

Exemple avec un dépôt de `100` : après un virement de `40`, le prochain
virement lié au même `id_transactions` ne peut pas excéder `60`.

Pour les nombres, envoyer un nombre JSON avec un point décimal (`12.5`) et non
une chaîne avec une virgule (`"12,5"`). Utiliser un champ `input` avec
`type="number"` et `step="any"`.

## Réponses d'erreur attendues

| Situation | Statut | Message indicatif |
| --- | --- | --- |
| Dépôt introuvable ou non approuvé | `404` / `400` | Transaction de dépôt de référence introuvable / doit être approuvée |
| Détenteur ou produit incohérent | `400` | Ne correspond pas à la transaction de référence |
| Quantité supérieure au reliquat du dépôt | `400` | Quantité de virement trop élevée |
| Solde d'actif insuffisant | `404` | Stock insuffisant pour transfert de droit |

Après succès, recharger les actifs et l'historique des transactions : l'ancien
ayant droit conserve le reliquat et le bénéficiaire reçoit exactement la
quantité demandée.

Le message de succès contient également la quantité transférée et le reliquat
du dépôt, par exemple :

```text
Virement de droit effectué : 12.5 transféré(s) au bénéficiaire.
Reliquat du dépôt : 47.5.
```
