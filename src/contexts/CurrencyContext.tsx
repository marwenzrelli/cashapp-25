
import { createContext, useContext, ReactNode } from "react";

export type Currency = "TND";

interface CurrencyContextType {
  currency: Currency;
}

const CurrencyContext = createContext<CurrencyContextType>({ currency: "TND" });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const currency = "TND";

  return (
    <CurrencyContext.Provider value={{ currency }}>
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
