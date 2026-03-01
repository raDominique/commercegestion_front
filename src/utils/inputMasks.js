// Masques et helpers pour Register

// Nom: tout en majuscule
export function maskUppercase(value = '') {
  return value.toUpperCase();
}

// Prénom: chaque 1ère lettre en majuscule
export function maskFirstname(value = '') {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Téléphone: format indicatif pays (ex: +261 XX XX XXX XX)
export function maskPhone(value = '') {
  // Nettoyer tout sauf chiffres et +
  let cleaned = value.replace(/[^\d+]/g, '');
  // Si le numéro commence par +, séparer l'indicatif du reste
  if (cleaned.startsWith('+')) {
    // Trouver la fin de l'indicatif (après 1 à 4 chiffres)
    const match = cleaned.match(/^(\+\d{1,4})(\d*)$/);
    if (match) {
      // On sépare l'indicatif et le reste du numéro
      return match[1] + ' ' + match[2];
    }
  }
  // Sinon, retourner le numéro nettoyé
  return cleaned;
}
