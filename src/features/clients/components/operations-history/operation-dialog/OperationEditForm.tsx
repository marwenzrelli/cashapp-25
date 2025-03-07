
import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Operation } from "@/features/operations/types";
import { useClientWithdrawal } from "@/features/clients/hooks/operations/useClientWithdrawal";
import { useClientDeposit } from "@/features/clients/hooks/operations/useClientDeposit";

interface OperationEditFormProps {
  operation: Operation;
  onClose: () => void;
  clientId?: number;
  refetchClient?: () => void;
}

export const OperationEditForm = ({
  operation,
  onClose,
  clientId,
  refetchClient
}: OperationEditFormProps) => {
  const [amount, setAmount] = useState<number>(Math.abs(operation.amount));
  const [notes, setNotes] = useState<string>(operation.description || '');
  const [loading, setLoading] = useState(false);
  
  // Update form when operation changes
  useEffect(() => {
    setAmount(Math.abs(operation.amount));
    setNotes(operation.description || '');
  }, [operation]);

  // Update imports to use the functions directly from the hooks
  const { handleWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { handleDeposit } = useClientDeposit(clientId, refetchClient);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation || !clientId) {
      toast.error("Données manquantes", { description: "Information d'opération ou client invalide" });
      return;
    }
    
    setLoading(true);
    
    try {
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

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {`Modifier ${operation.type === 'withdrawal' ? 'le retrait' : 'le versement'}`}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
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
            disabled={loading}
          >
            {loading ? "Traitement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
