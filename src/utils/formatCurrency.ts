
export type Currency = "TND";

export const getCurrencySymbol = (currency: Currency): string => {
  return "TND";
};

export const formatAmount = (amount: number, currency: Currency): string => {
  // Format with 2 decimal places and use a comma as decimal separator (French style)
  const formattedNumber = amount.toLocaleString('fr-FR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formattedNumber} ${getCurrencySymbol(currency)}`;
};
