
import { createContext, useContext, ReactNode } from "react";

export type Currency = "TND";

interface CurrencyContextType {
  currency: Currency;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "TND",
  formatCurrency: (amount) => `${parseFloat(amount.toFixed(2)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const currency = "TND";
  
  // Create a formatter function for currency display with proper rounding
  const formatCurrency = (amount: number): string => {
    // First fix floating point precision by rounding to 2 decimal places
    const fixedAmount = parseFloat(amount.toFixed(2));
    return `${fixedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
