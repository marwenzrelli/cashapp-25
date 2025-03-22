
/**
 * Format un ID en chaîne de caractères avec des zéros de remplissage
 * @param id L'ID à formater
 * @param length Le nombre de chiffres souhaités (par défaut 6)
 * @returns L'ID formaté
 */
export const formatId = (id: number, length: number = 6): string => {
  return id.toString().padStart(length, '0');
};
