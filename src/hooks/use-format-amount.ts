import { useIsMobile } from "./use-mobile";

export const useFormatAmount = () => {
  const isMobile = useIsMobile();

  return {
    formatAmount: (amount: number): string => {
      if (isMobile) {
        // On mobile, just return the integer part
        return Math.round(amount).toString();
      }
      // On desktop, keep the existing format with 3 decimal places
      return amount.toFixed(3).replace(/\./g, ',');
    }
  };
};
