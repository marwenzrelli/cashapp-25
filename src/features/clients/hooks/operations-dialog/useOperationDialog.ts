
import { useState, useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { useClientWithdrawal } from "../../hooks/operations/useClientWithdrawal";
import { useClientDeposit } from "../../hooks/operations/useClientDeposit";
import { toast } from "sonner";

export const useOperationDialog = (
  operation: Operation | null,
  mode: 'edit' | 'delete',
  onClose: () => void,
  clientId?: number,
  refetchClient?: () => void
) => {
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Update imports to use the functions directly from the hooks
  const { handleWithdrawal, deleteWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { handleDeposit, deleteDeposit } = useClientDeposit(clientId, refetchClient);
  
  // Reset form when operation changes
  useEffect(() => {
    if (operation) {
      setAmount(Math.abs(operation.amount));
      setNotes(operation.description || '');
    }
  }, [operation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation || !clientId) {
      toast.error("Données manquantes", { description: "Information d'opération ou client invalide" });
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'delete') {
        console.log("Traitement de la suppression:", operation.type, operation.id);
        
        // Handle delete logic based on operation type
        if (operation.type === 'withdrawal' && operation.id) {
          const success = await deleteWithdrawal(operation.id);
          if (success) {
            toast.success("Opération supprimée", { description: "Le retrait a été supprimé avec succès" });
            onClose();
            if (refetchClient) {
              console.log("Actualisation des données du client après suppression de retrait");
              await refetchClient();
            }
          } else {
            toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du retrait" });
          }
        } else if (operation.type === 'deposit' && operation.id) {
          console.log("Tentative de suppression du dépôt:", operation.id);
          const success = await deleteDeposit(operation.id);
          if (success) {
            toast.success("Opération supprimée", { description: "Le versement a été supprimé avec succès" });
            onClose();
            if (refetchClient) {
              console.log("Actualisation des données du client après suppression de versement");
              await refetchClient();
            }
          } else {
            toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du versement" });
          }
        } else {
          // Pour les autres types d'opérations qui n'ont pas encore de suppression implémentée
          toast.error("Non implémenté", { description: `La suppression des opérations de type ${operation.type} n'est pas encore supportée` });
        }
        return;
      }
      
      // Prepare operation data
      const operationData = {
        client_name: operation.fromClient,
        amount: Math.abs(amount),
        date: new Date().toISOString(),
        notes: notes
      };
      
      // Call appropriate API based on operation type
      let success = false;
      
      if (operation.type === "withdrawal") {
        success = await handleWithdrawal(
          {
            ...operationData,
            client_id: clientId
          }, 
          true, 
          operation.id
        );
      } else if (operation.type === "deposit") {
        success = await handleDeposit({
          client_name: operationData.client_name,
          amount: operationData.amount,
          date: operationData.date,
          description: notes,
          id: operation.id as any,
          status: "completed",
          created_at: new Date().toISOString(),
          created_by: null,
          // Pass isEditing and depositId as properties of the object
          isEditing: true,
          depositId: operation.id
        });
      }
      
      if (success) {
        toast.success("Opération mise à jour", { description: "L'opération a été modifiée avec succès" });
        onClose();
        if (refetchClient) {
          console.log("Actualisation des données du client après modification");
          await refetchClient();
        }
      } else {
        toast.error("Échec de l'opération", { description: "Une erreur s'est produite lors de la modification" });
      }
    } catch (error) {
      console.error("Error in operation action:", error);
      toast.error("Erreur", { description: "Une erreur s'est produite, veuillez réessayer" });
    } finally {
      setLoading(false);
    }
  };

  return {
    amount,
    setAmount,
    notes,
    setNotes,
    loading,
    handleSubmit
  };
};
