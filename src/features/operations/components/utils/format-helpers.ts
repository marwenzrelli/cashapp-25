
/**
 * Format number with 2 decimal places and comma separator
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
};
