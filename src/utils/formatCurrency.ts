
export type Currency = "EUR" | "USD" | "TND" | "AED";

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "TND":
      return "د.ت";
    case "AED":
      return "د.إ";
    default:
      return "€";
  }
};

export const formatAmount = (amount: number, currency: Currency): string => {
  return `${amount} ${getCurrencySymbol(currency)}`;
};
