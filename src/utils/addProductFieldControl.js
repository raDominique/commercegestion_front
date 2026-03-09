// Contrôle des champs requis pour le modal d'ajout de dépôt produit

export const addProductFieldControl = {
    siteOrigineId: {
        label: "Site d'origine",
        required: true,
        validate: (value) => !value ? "Le site d'origine est requis." : '',
    },
    siteDestinationId: {
        label: "Site de destination",
        required: true,
        validate: (value) => !value ? "Le site de destination est requis." : '',
    },
    quantite: {
        label: "Quantité",
        required: true,
        validate: (value) => !value || Number(value) <= 0 ? 'La quantité est requise et doit être supérieure à 0.' : '',
    },
    prixUnitaire: {
        label: "Prix Unitaire",
        required: true,
        validate: (value) => !value || Number(value) < 0 ? 'Le prix unitaire est requis et doit être positif.' : '',
    },
    // Les autres champs peuvent être ajoutés ici si besoin
};
