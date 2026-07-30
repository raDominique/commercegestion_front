# Pages avec tableaux

| Page | Type de tableau | Mobile responsive (card fallback) |
|---|---|---|
| Administration/AdminUsers.jsx | `<Table>` | Oui |
| Administration/AdminProducts.jsx | `<Table>` | Oui |
| Administration/AdminCpc.jsx | `<Table>` | Oui |
| Actifs/Actifs.jsx | `<Table>` | Oui |
| Boutique/Boutique.jsx | `<Table>` | Oui |
| OperationsAValider/OperationsAValider.jsx | `<Table>` | Oui |
| Parrainages/Parrainages.jsx | `<Table>` | Oui |
| MesTransactions/MesTransactions.jsx | `<Table>` | Partiel (1/3 tables) |
| Passifs/Passifs.jsx | `<Table>` | Oui |
| Retrait/Retrait.jsx | `<Table>` | Oui |
| EchangeActifs/EchangeActifs.jsx | `<Table>` | CSS-only (`hidden lg:block`) |
| Depot/Depot.jsx | `<Table>` | Oui |
| MesProduits/MesProduits.jsx | `<Table>` | Oui |
| AppelOffre/AppelOffre.jsx | `<table>` (raw HTML) | Oui |

**Légende :**
- `<Table>` = composant custom depuis `components/ui/table.jsx`
- `<table>` = balise HTML native
- **Partiel** = certaines tables dans la page n'ont pas encore de fallback mobile (ex: `MesTransactions` a 3 tables, 2 sans fallback)
- **CSS-only** = utilise `hidden lg:block` / `lg:hidden` au lieu du hook `useScreenType`
