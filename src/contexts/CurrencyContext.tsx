
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

  useEffect(() => {
    const loadInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("Session initiale chargée:", initialSession?.user?.id);
      setSession(initialSession);
      if (initialSession?.user?.id) {
        await loadCurrency(initialSession.user.id);
      }
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Changement d'état d'authentification:", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        await loadCurrency(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCurrency = async (userId: string) => {
    console.log("Chargement de la devise pour l'utilisateur:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', userId)
        .maybeSingle();

      console.log("Résultat du chargement de la devise:", { data, error });

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
        console.log("Mise à jour de la devise dans l'état:", data.currency);
        setCurrencyState(data.currency as Currency);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la devise:', error);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    console.log("Tentative de mise à jour de la devise vers:", newCurrency);
    if (!session?.user?.id) {
      console.error("Pas de session utilisateur active");
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour changer de devise",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', session.user.id);

      console.log("Résultat de la mise à jour:", { error });

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
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
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la devise",
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
