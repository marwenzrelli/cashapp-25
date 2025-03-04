
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = async () => {
    try {
      console.log("Fetching deposits...");
      setIsLoading(true);
      
      // Vérifier que la connexion Supabase est disponible
      if (!supabase) {
        console.error("La connexion Supabase n'est pas disponible");
        toast.error("Erreur de connexion à la base de données");
        return;
      }
      
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des versements:", error);
        toast.error("Erreur lors du chargement des versements", {
          description: error.message,
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log("Aucun versement trouvé");
        setDeposits([]);
        return;
      }

      console.log("Nombre de versements récupérés:", data.length);
      console.log("Premier versement:", data[0]);

      const formattedDeposits: Deposit[] = data.map(d => {
        // Toujours utiliser created_at pour la date d'affichage principale
        const displayDate = formatDateTime(d.created_at);
        
        return {
          id: d.id,
          amount: Number(d.amount),
          date: displayDate,
          description: d.notes || '',
          client_name: d.client_name,
          status: d.status,
          created_at: d.created_at,
          created_by: d.created_by || null,
          operation_date: d.operation_date,
          last_modified_at: d.last_modified_at
        };
      });

      console.log("Versements formatés (premier élément):", formattedDeposits[0] || "aucun élément");
      setDeposits(formattedDeposits);
    } catch (error: any) {
      console.error("Erreur inattendue lors du chargement des versements:", error);
      toast.error("Erreur lors du chargement des versements", {
        description: error.message || "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsLoading(false);
      console.log("Chargement des versements terminé");
    }
  };

  return { fetchDeposits };
};
