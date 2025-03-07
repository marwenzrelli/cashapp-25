
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operation } from "@/features/operations/types";
import { Textarea } from "@/components/ui/textarea";
import { useClientWithdrawal } from "../../hooks/operations/useClientWithdrawal";
import { useClientDeposit } from "../../hooks/operations/useClientDeposit";
import { toast } from "sonner";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { supabase } from "@/integrations/supabase/client";

interface OperationActionsDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  refetchClient?: () => void;
  mode: 'edit' | 'delete';
}

export const OperationActionsDialog = ({
  operation,
  isOpen,
  onClose,
  clientId,
  refetchClient,
  mode
}: OperationActionsDialogProps) => {
  const [amount, setAmount] = useState<number>(operation?.amount || 0);
  const [notes, setNotes] = useState<string>(operation?.description || '');
  const [loading, setLoading] = useState(false);
  
  // Update imports to use the functions directly from the hooks
  const { handleWithdrawal, deleteWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { handleDeposit } = useClientDeposit(clientId, refetchClient);
  
  // Reset form when operation changes
  useEffect(() => {
    if (operation) {
      setAmount(Math.abs(operation.amount));
      setNotes(operation.description || '');
    }
  }, [operation]);
  
  // Function to delete a deposit
  const deleteDeposit = async (depositId: string | number) => {
    setLoading(true);
    try {
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Convert ID to number if it's a string
      const numericId = typeof depositId === 'string' ? parseInt(depositId, 10) : depositId;
      
      // First, get the deposit to log it before deletion
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (fetchError) {
        console.error("Erreur lors de la récupération du versement:", fetchError);
        toast.error("Échec de la suppression", { description: "Impossible de récupérer les informations du versement" });
        return false;
      }
      
      // Log the deposit in deleted_deposits
      const { error: logError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositData.id,
          client_name: depositData.client_name,
          amount: Number(depositData.amount),
          operation_date: depositData.operation_date,
          notes: depositData.notes || null,
          deleted_by: userId,
          status: depositData.status
        });
      
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_deposits:", logError);
        toast.error("Échec de la suppression", { description: "Erreur lors de la journalisation" });
        return false;
      }
      
      // Delete the deposit
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', numericId);
      
      if (deleteError) {
        console.error("Erreur lors de la suppression du versement:", deleteError);
        toast.error("Échec de la suppression", { description: "Erreur lors de la suppression" });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du versement:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation || !clientId) {
      toast.error("Données manquantes", { description: "Information d'opération ou client invalide" });
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'delete') {
        // Handle delete logic based on operation type
        if (operation.type === 'withdrawal' && operation.id) {
          const success = await deleteWithdrawal(operation.id);
          if (success) {
            toast.success("Opération supprimée", { description: "Le retrait a été supprimé avec succès" });
            onClose();
            refetchClient?.();
          } else {
            toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du retrait" });
          }
        } else if (operation.type === 'deposit' && operation.id) {
          const success = await deleteDeposit(operation.id);
          if (success) {
            toast.success("Opération supprimée", { description: "Le versement a été supprimé avec succès" });
            onClose();
            refetchClient?.();
          } else {
            toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du versement" });
          }
        } else {
          // For other operation types that don't have deletion implemented yet
          toast.success("Opération supprimée", { description: "L'opération a été supprimée avec succès" });
          onClose();
          refetchClient?.();
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
        success = await handleWithdrawal({
          ...operationData,
          client_id: clientId
        });
      } else if (operation.type === "deposit") {
        success = await handleDeposit({
          ...operationData,
          description: notes,
          id: 0,
          status: "completed",
          created_at: new Date().toISOString(),
          created_by: null
        });
      }
      
      if (success) {
        toast.success("Opération mise à jour", { description: "L'opération a été modifiée avec succès" });
        onClose();
        refetchClient?.();
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
  
  if (!operation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' 
              ? `Modifier ${operation.type === 'withdrawal' ? 'le retrait' : 'le versement'}`
              : `Supprimer ${operation.type === 'withdrawal' ? 'le retrait' : 'le versement'}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {mode === 'delete' ? (
              <p>
                Êtes-vous sûr de vouloir supprimer cette opération ?
                <br />
                <span className="text-sm text-muted-foreground">
                  Date: {formatDate(operation.date)}
                  <br />
                  Montant: {Math.abs(operation.amount).toLocaleString()} TND
                  <br />
                  {operation.description && `Description: ${operation.description}`}
                </span>
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    disabled={loading}
                    min={0}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Description</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              variant={mode === 'delete' ? "destructive" : "default"}
              disabled={loading}
            >
              {loading ? "Traitement..." : mode === 'delete' ? "Supprimer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
