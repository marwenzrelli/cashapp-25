
import { createContext, useContext, ReactNode } from "react";

export type Currency = "TND";

interface CurrencyContextType {
  currency: Currency;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "TND",
  formatCurrency: (amount) => `${amount.toLocaleString()} TND`
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const currency = "TND";
  
  // Create a formatter function for currency display
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} ${currency}`;
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
