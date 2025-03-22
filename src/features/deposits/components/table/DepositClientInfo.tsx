
import { User, Hash } from "lucide-react";
import { formatId } from "@/utils/formatId";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DepositClientInfoProps {
  clientName: string;
  depositId: number;
}

export const DepositClientInfo = ({ clientName, depositId }: DepositClientInfoProps) => {
  const navigate = useNavigate();
  
  const navigateToProfile = async () => {
    try {
      console.log("Navigation vers le profil client:", clientName);
      
      // Show feedback toast
      toast.loading(`Recherche du client ${clientName}...`);
      
      // Validate client name
      if (!clientName || clientName.trim() === "") {
        toast.dismiss();
        toast.error("Nom du client manquant");
        return;
      }
      
      // Parse name into components - in French format, first name comes first
      const nameParts = clientName.split(' ');
      
      if (nameParts.length < 2) {
        console.warn("Format de nom invalide:", clientName);
        toast.dismiss();
        toast.error("Format de nom invalide");
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      // Extract first and last name - correctly formatted for French names
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      console.log(`Recherche du client avec prénom "${firstName}" et nom "${lastName}"`);
      
      // Query the database
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .ilike('prenom', firstName) // Using case-insensitive search
        .ilike('nom', lastName)     // Using case-insensitive search
        .maybeSingle();
      
      // Dismiss loading toast
      toast.dismiss();
      
      if (error) {
        console.error("Erreur de base de données lors de la recherche du client:", error);
        toast.error("Erreur de recherche", {
          description: "Impossible de trouver le client dans la base de données."
        });
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      if (!data) {
        console.warn("Aucun client trouvé avec le nom:", clientName);
        
        // Try a broader search using just one of the name parts
        const { data: broadSearchData, error: broadSearchError } = await supabase
          .from('clients')
          .select('id')
          .or(`prenom.ilike.%${firstName}%,nom.ilike.%${lastName}%`)
          .limit(1);
          
        if (broadSearchError || !broadSearchData || broadSearchData.length === 0) {
          toast.info("Client non trouvé", {
            description: "Redirection vers la recherche de clients."
          });
          navigate(`/clients?search=${encodeURIComponent(clientName)}`);
          return;
        }
        
        // Use the first match from broad search
        console.log("Client trouvé avec recherche élargie:", broadSearchData[0].id);
        toast.success("Client trouvé", {
          description: "Redirection vers le profil..."
        });
        navigate(`/clients/${broadSearchData[0].id}`);
        return;
      }
      
      console.log("ID client trouvé:", data.id);
      toast.success("Client trouvé", {
        description: "Redirection vers le profil..."
      });
      navigate(`/clients/${data.id}`);
    } catch (error) {
      console.error("Erreur lors de la recherche du client:", error);
      toast.dismiss();
      toast.error("Impossible de trouver le profil du client");
      navigate(`/clients?search=${encodeURIComponent(clientName)}`);
    }
  };
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div className="relative">
          <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
        </div>
        <p 
          className="font-medium cursor-pointer hover:text-primary hover:underline transition-colors flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20"
          onClick={navigateToProfile}
        >
          {clientName}
        </p>
      </div>
      <p className="text-sm text-muted-foreground flex items-center gap-1 ml-12">
        <Hash className="h-3 w-3" />
        {formatId(depositId)}
      </p>
    </div>
  );
};
