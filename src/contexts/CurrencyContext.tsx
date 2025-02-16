
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";

export type Currency = "EUR" | "USD" | "TND" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const isValidCurrency = (value: any): value is Currency => {
  return ["EUR", "USD", "TND", "AED"].includes(value);
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("[CurrencyContext] Session initiale chargée:", initialSession?.user?.id);
      setSession(initialSession);
      if (initialSession?.user?.id) {
        await loadCurrency(initialSession.user.id);
      }
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[CurrencyContext] Changement d'état d'authentification:", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        await loadCurrency(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCurrency = async (userId: string) => {
    console.log("[CurrencyContext] Chargement de la devise pour l'utilisateur:", userId);
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', userId)
        .single();

      console.log("[CurrencyContext] Données de devise reçues:", userData);

      if (userError) {
        console.error('[CurrencyContext] Erreur lors du chargement du profil:', userError);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences de devise",
          variant: "destructive",
        });
        return;
      }

      if (userData?.currency && isValidCurrency(userData.currency)) {
        console.log("[CurrencyContext] Mise à jour de la devise dans l'état:", userData.currency);
        setCurrencyState(userData.currency);
      } else {
        console.warn("[CurrencyContext] Devise invalide reçue:", userData?.currency);
      }
    } catch (error) {
      console.error('[CurrencyContext] Erreur lors du chargement de la devise:', error);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    if (!isValidCurrency(newCurrency)) {
      console.error("[CurrencyContext] Tentative de définir une devise invalide:", newCurrency);
      toast({
        title: "Erreur",
        description: "Devise non valide",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.id) {
      console.error("[CurrencyContext] Pas de session utilisateur active");
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

      if (error) {
        console.error('[CurrencyContext] Erreur lors de la mise à jour:', error);
        toast({
          title: "Erreur",
          description: `Impossible de sauvegarder vos préférences de devise: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setCurrencyState(newCurrency);
      console.log("[CurrencyContext] Devise mise à jour avec succès:", newCurrency);
      toast({
        title: "Succès",
        description: "Vos préférences de devise ont été mises à jour",
      });
    } catch (error) {
      console.error('[CurrencyContext] Erreur lors de la mise à jour de la devise:', error);
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
