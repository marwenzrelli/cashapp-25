
/**
 * Format un ID en chaîne de caractères avec des zéros de remplissage
 * @param id L'ID à formater
 * @param length Le nombre de chiffres souhaités (par défaut 6)
 * @returns L'ID formaté
 */
export const formatId = (id: number | string, length: number = 6): string => {
  // Parse string to number if it's a string
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  // Return formatted ID with leading zeros
  return isNaN(numericId) ? '0'.repeat(length) : numericId.toString().padStart(length, '0');
};
