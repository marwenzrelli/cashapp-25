
import { User, Pencil, Trash2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "@/components/deposits/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatId } from "@/utils/formatId";

interface DepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositsTable = ({ deposits, onEdit, onDelete }: DepositsTableProps) => {
  const navigate = useNavigate();
  
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

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
    <div className="relative w-full overflow-auto rounded-lg border">
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Montant</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                    </div>
                    <div>
                      <p 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleClientClick(deposit.client_name)}
                      >
                        {deposit.client_name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {formatId(deposit.id)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className={cn("font-medium tabular-nums", getAmountColor(deposit.amount))}>
                    {deposit.amount.toLocaleString()} TND
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {deposit.date}
                </td>
                <td className="p-3 text-muted-foreground">{deposit.description}</td>
                <td className="p-3">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
                      onClick={() => onEdit(deposit)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
                      onClick={() => onDelete(deposit)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {deposits.map((deposit) => (
          <div key={deposit.id} className="p-4 border-b last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <User className="h-10 w-10 text-primary/20" />
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                </div>
                <div>
                  <p 
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleClientClick(deposit.client_name)}
                  >
                    {deposit.client_name}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {formatId(deposit.id)}
                  </p>
                </div>
              </div>
              <div className={cn("font-medium tabular-nums", getAmountColor(deposit.amount))}>
                {deposit.amount.toLocaleString()} TND
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <p>{deposit.date}</p>
              <p>{deposit.description}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
                onClick={() => onEdit(deposit)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
                onClick={() => onDelete(deposit)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
