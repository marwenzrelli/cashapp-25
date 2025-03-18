
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
  
  const handleClientClick = async () => {
    try {
      console.log("Looking up client:", clientName);
      
      if (!clientName || clientName.trim() === "") {
        toast.error("Nom du client manquant");
        return;
      }
      
      // Split the full name into first name and last name
      const nameParts = clientName.split(' ');
      
      if (nameParts.length < 2) {
        console.warn("Client name format invalid:", clientName);
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      // The first part is the first name, the rest combined is the last name
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      console.log(`Searching for client with first name "${firstName}" and last name "${lastName}"`);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('prenom', firstName)
        .eq('nom', lastName)
        .maybeSingle();
      
      if (error) {
        console.error("Database error while looking up client:", error);
        toast.error("Erreur de recherche", {
          description: "Impossible de trouver le client dans la base de données."
        });
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      if (!data) {
        console.warn("No client found with name:", clientName);
        toast.info("Client non trouvé", {
          description: "Redirection vers la recherche de clients."
        });
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
      console.log("Found client ID:", data.id);
      navigate(`/clients/${data.id}`);
    } catch (error) {
      console.error("Error during client lookup:", error);
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
          onClick={handleClientClick}
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
