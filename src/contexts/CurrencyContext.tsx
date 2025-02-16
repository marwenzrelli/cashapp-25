
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";

type Currency = "EUR" | "USD" | "TND" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  // Gérer la session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        loadCurrency(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        loadCurrency(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCurrency = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la devise:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences de devise",
          variant: "destructive",
        });
        return;
      }

      if (data?.currency) {
        setCurrencyState(data.currency as Currency);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la devise:', error);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', session.user.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos préférences de devise",
          variant: "destructive",
        });
        return;
      }

      setCurrencyState(newCurrency);
      toast({
        title: "Succès",
        description: "Vos préférences de devise ont été mises à jour",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la devise:', error);
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
