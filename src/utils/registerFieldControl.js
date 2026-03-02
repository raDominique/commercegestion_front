// Validation pour les champs de l'étape 3 (Register)
export function validateAvatar(file) {
    if (!file) return "L'avatar est requis.";
    return '';
}

export function validateDocuments(files) {
    const errors = [];
    if (!Array.isArray(files) || files.length < 2) {
        errors[0] = 'Le document est requis.';
        errors[1] = 'Le document est requis.';
        return errors;
    }
    if (!files[0]) errors[0] = 'Le document est requis.';
    if (!files[1]) errors[1] = 'Le document est requis.';
    return errors.length ? errors : '';
}

export function validateLogo(file) {
    if (!file) return 'Le logo est requis.';
    return '';
}

export function validateCarteStat(file) {
    if (!Array.isArray(file) || file.length === 0 || !file[0]) return 'La carte stat est requise.';
    if (!file[0]) return 'La carte stat recto est requise.';
    if (!file[1]) return 'La carte stat verso est requise.';
}

export function validateCarteFiscal(files) {
    if (!Array.isArray(files) || files.length < 2) return 'Les deux cartes fiscales sont requises.';
    if (!files[0]) return 'La carte recto est requise.';
    if (!files[1]) return 'La carte verso est requise.';
    return '';
}
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