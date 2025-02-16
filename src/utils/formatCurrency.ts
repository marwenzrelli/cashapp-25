
export type Currency = "TND";

export const getCurrencySymbol = (currency: Currency): string => {
  return "TND";
};

export const formatAmount = (amount: number, currency: Currency): string => {
  return `${amount} ${getCurrencySymbol(currency)}`;
};
