
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
  
  // Completely refactored function with new implementation approach
  const handleProfileNavigation = async () => {
    try {
      console.log("Attempting to navigate to profile for client:", clientName);
      
      // Validate client name
      if (!clientName || clientName.trim() === "") {
        toast.error("Nom du client manquant");
        return;
      }
      
      // Parse name into components
      const nameParts = clientName.split(' ');
      
      if (nameParts.length < 2) {
        console.warn("Format de nom invalide:", clientName);
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      // Extract first and last name
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      console.log(`Recherche du client avec prénom "${firstName}" et nom "${lastName}"`);
      
      // Query the database
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('prenom', firstName)
        .eq('nom', lastName)
        .maybeSingle();
      
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
        toast.info("Client non trouvé", {
          description: "Redirection vers la recherche de clients."
        });
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      console.log("ID client trouvé:", data.id);
      navigate(`/clients/${data.id}`);
    } catch (error) {
      console.error("Erreur lors de la recherche du client:", error);
      toast.error("Impossible de trouver le profil du client");
      navigate(`/clients?search=${encodeURIComponent(clientName)}`);
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
      </div>
      <div>
        <p 
          className="font-medium cursor-pointer hover:text-primary transition-colors"
          onClick={handleProfileNavigation}
        >
          {clientName}
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {formatId(depositId)}
        </p>
      </div>
    </div>
  );
};
