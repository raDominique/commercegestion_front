export function validateUserNickName(value) {
    if (!value) return 'Le pseudo est requis.';
    return '';
}

export function validateUserAddress(value) {
    if (!value) return "L'adresse est requise.";
    return '';
}

export function validateUserMainLat(value) {
    if (!value) return 'La latitude est requise.';
    return '';
}

export function validateUserMainLng(value) {
    if (!value) return 'La longitude est requise.';
    return '';
}

export function validateDocumentType(value) {
    if (!value) return 'Le type de pièce est requis.';
    return '';
}

export function validateIdentityCardNumber(value) {
    if (!value) return "Le numéro de pièce d'identité est requis.";
    return '';
}
export function validateUserType(value) {
    if (!value) return "Le type d'utilisateur est requis.";
    return '';
}
export function validateUserPassword(value) {
    if (!value) return 'Le mot de passe est requis.';
    if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    return '';
}
// Contrôles de validation pour le formulaire Register

export function validateUserName(value) {
    if (!value) return 'Le nom est requis.';
    if (!/^[A-ZÀ-Ÿ\s'-]+$/.test(value)) return 'Le nom doit être en majuscules.';
    return '';
}

export function validateUserFirstname(value) {
    if (!value) return 'Le prénom est requis.';
    if (!/^([A-ZÀ-Ÿ][a-zà-ÿ'-]+\s?)+$/.test(value)) return 'Chaque prénom doit commencer par une majuscule.';
    return '';
}

export function validateUserPhone(value) {
    if (!value) return 'Le téléphone est requis.';
    let phone = value.trim();
    // Ajoute le + si absent
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }
    const digits = phone.replace(/\D/g, '');
    // Madagascar: +261 suivi de 9 chiffres (total 12)
    if (/^\+261/.test(phone)) {
        if (digits.length !== 12) return "Le numéro doit inclure l'indicatif et être valide.";
        return '';
    }
    // Autres pays: 11 à 15 chiffres
    if (digits.length < 11 || digits.length > 15) return "Le numéro doit inclure l'indicatif et être valide.";
    return '';
}

export function validateUserEmail(value) {
    if (!value) return "L'email est requis.";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "L'email n'est pas valide.";
    return '';
}

export function validateRequired(value, label = 'Ce champ') {
    if (!value) return `${label} est requis.`;
    return '';
}