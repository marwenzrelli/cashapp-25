
import { useIsMobile } from "./use-mobile";

export const useFormatAmount = () => {
  const isMobile = useIsMobile();

  return {
    formatAmount: (amount: number): string => {
      // On mobile, always return the integer part only
      if (isMobile) {
        return Math.round(amount).toString();
      }
      // On desktop, keep the existing format with 3 decimal places
      return amount.toFixed(3).replace(/\./g, ',');
    }
  };
};
