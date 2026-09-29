/**
 * Valide un numéro de téléphone pour Mayotte (Dembéni).
 * @param {string} phone - Le numéro de téléphone à valider.
 * @returns {{isValid: boolean, message: string}} Le résultat de la validation avec un message d'erreur si invalide.
 */
export const validateMayottePhone = (phone) => {
  if (!phone) {
    return { isValid: true, message: '' };
  }

  // 1. Refuser toute lettre et caractères spéciaux non autorisés.
  // Caractères autorisés : chiffres, espaces, points, tirets, parenthèses et un '+' ou '00' facultatif au début.
  const allowedCharsRegex = /^[+]?[0-9\s.\-()]+$/;
  if (!allowedCharsRegex.test(phone)) {
    return { 
      isValid: false, 
      message: "Le numéro contient des lettres ou des caractères spéciaux non autorisés. Seuls les chiffres, espaces, '.', '-', '(' et ')' sont acceptés." 
    };
  }

  // 2. Nettoyer le numéro pour ne garder que les chiffres et le '+' initial s'il y en a un
  const clean = phone.replace(/[\s.\-()]/g, '');

  // 3. Détecter l'indicatif international
  if (clean.startsWith('+')) {
    // Format international: doit commencer par +262 et suivi de 269 ou 639 et 6 autres chiffres (total 13 caractères)
    if (!clean.startsWith('+262')) {
      return { 
        isValid: false, 
        message: "Les numéros d'autres pays ne sont pas autorisés. Veuillez utiliser l'indicatif de Mayotte (+262)." 
      };
    }
    
    const remaining = clean.slice(4);
    if (!/^(269|639)\d{6}$/.test(remaining)) {
      return {
        isValid: false,
        message: "Le numéro de Mayotte après l'indicatif +262 doit commencer par 269 ou 639 et comporter exactement 9 chiffres (ex: +262 639 XX XX XX)."
      };
    }
    return { isValid: true, message: '' };
  }

  if (clean.startsWith('00')) {
    // Format international alternatif (00262)
    if (!clean.startsWith('00262')) {
      return { 
        isValid: false, 
        message: "Les numéros d'autres pays ne sont pas autorisés. Veuillez utiliser l'indicatif de Mayotte (00262 ou +262)." 
      };
    }
    
    const remaining = clean.slice(5);
    if (!/^(269|639)\d{6}$/.test(remaining)) {
      return {
        isValid: false,
        message: "Le numéro de Mayotte après l'indicatif 00262 doit commencer par 269 ou 639 et comporter exactement 9 chiffres."
      };
    }
    return { isValid: true, message: '' };
  }

  // Format local : doit comporter 10 chiffres et commencer par 0269 ou 0639
  if (!clean.startsWith('0')) {
    return {
      isValid: false,
      message: "Un numéro local doit commencer par 0 (ex: 06 39 XX XX XX)."
    };
  }

  if (!clean.startsWith('0269') && !clean.startsWith('0639')) {
    return {
      isValid: false,
      message: "Seuls les numéros de Mayotte (commençant par 0269 ou 0639) sont autorisés."
    };
  }

  if (clean.length !== 10) {
    return {
      isValid: false,
      message: `Le numéro de téléphone local doit comporter exactement 10 chiffres. Actuellement, il en contient ${clean.length}.`
    };
  }

  return { isValid: true, message: '' };
};
