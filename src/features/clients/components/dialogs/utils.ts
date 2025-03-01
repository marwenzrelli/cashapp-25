
import { useCurrency } from "@/contexts/CurrencyContext";

export const formatPhoneNumber = (value: string) => {
  const numberOnly = value.replace(/\D/g, '');
  const truncated = numberOnly.slice(0, 8);
  if (truncated.length >= 2) {
    let formatted = truncated.slice(0, 2);
    if (truncated.length >= 5) {
      formatted += ' ' + truncated.slice(2, 5);
      if (truncated.length > 5) {
        formatted += ' ' + truncated.slice(5);
      }
    } else if (truncated.length > 2) {
      formatted += ' ' + truncated.slice(2);
    }
    return formatted;
  }
  return truncated;
};

export const useFormattedCurrency = () => {
  const { currency } = useCurrency();
  return currency;
};
