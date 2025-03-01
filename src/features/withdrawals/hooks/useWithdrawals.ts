
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/features/operations/types";

interface Withdrawal {
  id: string;
  client_name: string;
  amount: number;
  created_at: string;
  operation_date: string;
  notes: string | null;
  status: string;
  created_by: string | null;
  formattedDate?: string;
}

// Fonction de formatage de date isolée dans ce composant pour le débuggage
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Date inconnue";
  
  try {
    console.log(`formatDate - Valeur d'entrée:`, {
      valeur: dateString,
      type: typeof dateString
    });
    
    // S'assurer que nous avons une chaîne de caractères
    const dateStr = String(dateString);
    
    // Créer un objet Date
    const date = new Date(dateStr);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error(`Date invalide: ${dateStr}`);
      return "Date invalide";
    }
    
    // Utiliser Intl.DateTimeFormat pour un formatage plus fiable
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const formatted = formatter.format(date);
    console.log(`formatDate - Résultat:`, formatted);
    
    return formatted;
  } catch (error) {
    console.error(`Erreur lors du formatage de la date ${dateString}:`, error);
    return "Erreur de date";
  }
};

export const useWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des retraits");
        console.error("Erreur:", error);
        return;
      }

      console.log("--- DONNÉES REÇUES DE SUPABASE ---");
      if (data && data.length > 0) {
        console.log("Premier retrait brut:", JSON.stringify(data[0], null, 2));
        console.log("Type de created_at:", typeof data[0].created_at);
        console.log("Valeur de created_at:", data[0].created_at);
      }
      
      // Traitement des withdrawals avec un nouveau formatage des dates
      const formattedWithdrawals = data.map(withdrawal => {
        // Obtention de l'horodatage ISO complet depuis la base de données
        // Utiliser created_at au lieu de operation_date
        let createdAtIso: string | null = withdrawal.created_at;
        
        // Si c'est un objet, tenter de l'extraire (cas particulier pour certaines implémentations Supabase)
        if (typeof createdAtIso === 'object' && createdAtIso !== null) {
          console.log("created_at est un objet:", createdAtIso);
          // Tenter de trouver une propriété qui contient la date
          if ('toISOString' in createdAtIso) {
            createdAtIso = (createdAtIso as Date).toISOString();
          } else {
            // Dernier recours: convertir en JSON et espérer qu'il y a une information de date
            createdAtIso = JSON.stringify(createdAtIso);
          }
        }
        
        // Log détaillé pour le débogage
        console.log(`Retrait ${withdrawal.id}:`, {
          created_at_brut: withdrawal.created_at,
          created_at_type: typeof withdrawal.created_at,
          created_at_iso: createdAtIso
        });
        
        // La fonction formatDate est déjà conçue pour gérer les valeurs null
        // Fixation de l'erreur TS18047 en passant createdAtIso directement, 
        // puisque formatDate gère déjà les valeurs null
        const formattedDate = formatDate(createdAtIso);
        
        return {
          ...withdrawal,
          formattedDate
        };
      });

      console.log("Retraits formatés:", formattedWithdrawals.slice(0, 2));
      setWithdrawals(formattedWithdrawals);
    } catch (error) {
      console.error("Erreur lors du chargement des retraits:", error);
      toast.error("Erreur lors du chargement des retraits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchWithdrawals();
      }
    };
    init();
  }, []);

  return {
    withdrawals,
    isLoading,
    fetchWithdrawals
  };
};
