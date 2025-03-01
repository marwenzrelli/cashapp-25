
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
        .order('operation_date', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des retraits");
        console.error("Erreur:", error);
        return;
      }

      console.log("Données brutes des retraits:", data);
      
      if (data && data.length > 0) {
        // Log pour vérifier les données du premier retrait
        console.log("Hook useWithdrawals - Premier retrait (données brutes):", {
          id: data[0].id,
          created_at: data[0].created_at,
          operation_date: data[0].operation_date,
          operation_date_type: typeof data[0].operation_date
        });
      }

      const formattedWithdrawals = data.map(withdrawal => {
        try {
          // Vérification stricte de la date
          if (!withdrawal.operation_date) {
            console.error(`Date d'opération manquante pour le retrait ${withdrawal.id}`);
            return {
              ...withdrawal,
              formattedDate: "Date inconnue"
            };
          }
          
          // Forcer la date en format string si nécessaire
          const dateStr = String(withdrawal.operation_date);
          const formatted = formatDateTime(dateStr);
          
          console.log(`Hook useWithdrawals - Retrait ${withdrawal.id}:`, {
            date_brute: dateStr,
            date_formatee: formatted,
            date_type: typeof dateStr
          });
          
          return {
            ...withdrawal,
            formattedDate: formatted
          };
        } catch (err) {
          console.error(`Erreur lors du formatage de la date pour le retrait ${withdrawal.id}:`, err);
          return {
            ...withdrawal,
            formattedDate: "Erreur de date"
          };
        }
      });

      console.log("Retraits avec dates formatées:", formattedWithdrawals);
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
