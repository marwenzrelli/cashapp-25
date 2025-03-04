
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
  
  const handleClientClick = async (clientName: string) => {
    try {
      const [firstName, lastName] = clientName.split(' ');
      
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .or(`prenom.ilike.${firstName},nom.ilike.${lastName}`)
        .limit(1)
        .single();
      
      if (error || !data) {
        navigate(`/clients?search=${encodeURIComponent(clientName)}`);
        return;
      }
      
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
          onClick={() => handleClientClick(clientName)}
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
