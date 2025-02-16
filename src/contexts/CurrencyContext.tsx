
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Currency = "EUR" | "USD" | "TND" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    // Récupérer la devise depuis le localStorage au chargement initial
    const savedCurrency = localStorage.getItem("currency");
    return (savedCurrency as Currency) || "EUR";
  });

  // Sauvegarder la devise dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
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
