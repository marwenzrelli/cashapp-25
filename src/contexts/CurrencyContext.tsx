
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Currency = "EUR" | "USD" | "TND" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const { toast } = useToast();

  // Charger la devise depuis Supabase au démarrage
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (data?.currency) {
          setCurrencyState(data.currency as Currency);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la devise:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences de devise",
          variant: "destructive",
        });
      }
    };

    loadCurrency();
  }, [toast]);

  // Mettre à jour la devise dans Supabase
  const setCurrency = async (newCurrency: Currency) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', session.user.id);

      if (error) throw error;

      setCurrencyState(newCurrency);
      toast({
        title: "Succès",
        description: "Vos préférences de devise ont été mises à jour",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la devise:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences de devise",
        variant: "destructive",
      });
    }
  };

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
