
import { useIsMobile } from "@/hooks/use-mobile";

export const useFormatAmount = () => {
  const isMobile = useIsMobile();
  
  return (amount: number): string => {
    if (isMobile) {
      // Sur mobile, arrondir à l'entier le plus proche et retourner sans décimales
      return Math.round(amount).toString();
    }
    
    // Sur desktop, garder le format avec 3 décimales
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };
};
