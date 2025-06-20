import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentActivity } from "../../types";
import { formatDateTime } from "@/features/operations/types";
import { OperationsMobileCard } from "@/features/clients/components/operations-history/OperationsMobileCard";
import { formatOperationId } from "@/features/operations/utils/display-helpers";
import { useState } from "react";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { Operation } from "@/features/operations/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface RecentActivityItemProps {
  activity: RecentActivity;
  currency: string;
  index: number;
}

export const RecentActivityItem = ({ activity, currency, index }: RecentActivityItemProps) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const safeFormatId = (id: string) => {
    try {
      return formatOperationId(id);
    } catch (error) {
      console.error("Error formatting operation ID:", error);
      return id.slice(0, 6); // Fallback to first 6 chars
    }
  };

  const signPrefix = activity.type === "withdrawal" ? "- " : 
                     activity.type === "deposit" ? "+ " : "";

  const activityToOperation = (): Operation => ({
    id: activity.id,
    type: activity.type,
    amount: activity.amount,
    date: activity.date,
    fromClient: activity.client_name,
    description: activity.description || "",
    operation_date: activity.date
  });

  const handleClientClick = async (clientName: string) => {
    try {
      // Pour les virements, extraire le premier nom avant "→"
      let searchName = clientName;
      if (clientName.includes('→')) {
        searchName = clientName.split('→')[0].trim();
      }

      console.log("Searching for client:", searchName);

      // Méthode similaire à celle utilisée dans les autres pages
      // 1. Recherche par nom complet exact
      let { data: clients, error } = await supabase
        .from('clients')
        .select('id, nom, prenom')
        .or(`nom.eq.${searchName},prenom.eq.${searchName}`)
        .limit(5);

      if (error) {
        console.error("Error in exact search:", error);
      }

      // 2. Si pas trouvé, recherche par nom + prénom combiné
      if (!clients || clients.length === 0) {
        const { data: combinedClients, error: combinedError } = await supabase
          .from('clients')
          .select('id, nom, prenom')
          .textSearch('nom || \' \' || prenom', searchName, { type: 'plain' })
          .limit(5);

        if (!combinedError && combinedClients) {
          clients = combinedClients;
        }
      }

      // 3. Si toujours pas trouvé, recherche partielle avec ilike
      if (!clients || clients.length === 0) {
        const searchParts = searchName.split(' ');
        
        if (searchParts.length === 1) {
          // Un seul mot - rechercher dans nom et prénom
          const { data: partialClients, error: partialError } = await supabase
            .from('clients')
            .select('id, nom, prenom')
            .or(`nom.ilike.%${searchName}%,prenom.ilike.%${searchName}%`)
            .limit(5);

          if (!partialError && partialClients) {
            clients = partialClients;
          }
        } else {
          // Plusieurs mots - essayer différentes combinaisons
          const [firstPart, ...restParts] = searchParts;
          const secondPart = restParts.join(' ');
          
          const { data: multiPartClients, error: multiPartError } = await supabase
            .from('clients')
            .select('id, nom, prenom')
            .or(`and(nom.ilike.%${firstPart}%,prenom.ilike.%${secondPart}%),and(prenom.ilike.%${firstPart}%,nom.ilike.%${secondPart}%)`)
            .limit(5);

          if (!multiPartError && multiPartClients) {
            clients = multiPartClients;
          }
        }
      }

      console.log("Found clients:", clients);

      if (clients && clients.length > 0) {
        // Prendre le premier client trouvé
        navigate(`/clients/${clients[0].id}`);
        toast.success(`Redirection vers le profil de ${clients[0].prenom} ${clients[0].nom}`);
      } else {
        toast.error(`Client "${searchName}" non trouvé`);
      }
    } catch (error) {
      console.error("Error navigating to client:", error);
      toast.error("Erreur lors de la navigation");
    }
  };

  const handleEditOperation = async (updatedOperation: Operation) => {
    try {
      console.log("Saving edited operation:", updatedOperation);
      
      const operationType = updatedOperation.type;
      const operationIdParts = updatedOperation.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        console.error("Invalid operation ID:", operationIdString);
        toast.error("Format d'ID invalide");
        return;
      }
      
      let error = null;
      
      if (operationType === 'deposit') {
        const { error: updateError } = await supabase
          .from('deposits')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'withdrawal') {
        const { error: updateError } = await supabase
          .from('withdrawals')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'transfer') {
        const { error: updateError } = await supabase
          .from('transfers')
          .update({
            from_client: updatedOperation.fromClient,
            to_client: updatedOperation.toClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            reason: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      }
      
      if (error) {
        console.error("Error updating operation:", error);
        toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        return;
      }
      
      toast.success("Opération modifiée avec succès");
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Edit operation error:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailsModalOpen(true);
  };

  return (
    <div key={`${activity.id}-${index}`}>
      <div className="hidden md:flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
        <div className="flex items-center gap-4">
          {activity.type === 'deposit' && (
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          )}
          {activity.type === 'withdrawal' && (
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
              <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          )}
          {activity.type === 'transfer' && (
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {activity.type === 'deposit' && 'Versement'}
                {activity.type === 'withdrawal' && 'Retrait'}
                {activity.type === 'transfer' && 'Virement'}
              </p>
              <span 
                onClick={handleOpenModal}
                className="text-xs font-mono text-muted-foreground flex items-center cursor-pointer hover:text-primary hover:underline"
              >
                <Hash className="h-3 w-3 mr-1" />
                #{safeFormatId(activity.id)}
              </span>
            </div>
            <button 
              onClick={() => handleClientClick(activity.client_name)}
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors cursor-pointer text-left"
            >
              {activity.client_name}
            </button>
            {activity.description && (
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-[300px] truncate">
                {activity.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className={cn(
            "font-medium",
            activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
            activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
            "text-blue-600 dark:text-blue-400"
          )}>
            {signPrefix}{activity.amount.toLocaleString()} {currency}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(activity.date)}
          </p>
        </div>
      </div>
      
      <div className="md:hidden">
        <OperationsMobileCard 
          operation={{
            id: activity.id,
            type: activity.type,
            amount: activity.amount,
            date: activity.date,
            fromClient: activity.fromClient || activity.client_name,
            toClient: activity.toClient,
            description: activity.description || `${
              activity.type === 'deposit' 
                ? 'Versement pour' 
                : activity.type === 'withdrawal' 
                  ? 'Retrait par' 
                  : 'Virement impliquant'
            } ${activity.client_name}`
          }}
          formatAmount={(amount) => `${amount.toLocaleString()}`}
          currency={currency}
          colorClass={
            activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
            activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
            "text-blue-600 dark:text-blue-400"
          }
          showId={true}
        />
      </div>

      <OperationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        operation={activityToOperation()}
        onEdit={handleEditOperation}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteOperationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        operation={activityToOperation()}
        onDelete={async () => {
          toast.success("Opération supprimée avec succès");
          setIsDeleteDialogOpen(false);
          return true;
        }}
      />
    </div>
  );
};
