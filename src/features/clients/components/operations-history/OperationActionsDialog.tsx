
import { useState } from "react";
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
  
  const { mutateAsync: handleWithdrawal } = useClientWithdrawal();
  const { mutateAsync: handleDeposit } = useClientDeposit();
  
  // Reset form when operation changes
  React.useEffect(() => {
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
        // Handle delete logic
        toast.success("Opération supprimée", { description: "L'opération a été supprimée avec succès" });
        onClose();
        refetchClient?.();
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
