
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/features/operations/types";
import { useClientWithdrawal } from "../../hooks/operations/useClientWithdrawal";
import { useClientDeposit } from "../../hooks/operations/useClientDeposit";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OperationActionsDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  refetchClient?: () => void;
  mode: "edit" | "delete";
}

export function OperationActionsDialog({
  operation,
  isOpen,
  onClose,
  clientId,
  refetchClient,
  mode
}: OperationActionsDialogProps) {
  // Extract operation ID (remove prefix if exists)
  const getOperationId = () => {
    if (!operation?.id) return null;
    
    // Handle prefixed IDs (like "withdrawal-123" or "deposit-123")
    const idParts = operation.id.split('-');
    return idParts.length > 1 ? idParts[1] : operation.id;
  };

  const operationId = getOperationId();
  const { handleWithdrawal, deleteWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { handleDeposit } = useClientDeposit(clientId, refetchClient);
  
  // Form state
  const [amount, setAmount] = useState(operation?.amount ? Math.abs(operation.amount) : 0);
  const [notes, setNotes] = useState(operation?.notes || operation?.description || "");
  const [date, setDate] = useState<Date | undefined>(
    operation?.operation_date 
      ? new Date(operation.operation_date) 
      : operation?.date 
        ? new Date(operation.date) 
        : new Date()
  );
  
  const resetForm = () => {
    setAmount(operation?.amount ? Math.abs(operation.amount) : 0);
    setNotes(operation?.notes || operation?.description || "");
    setDate(
      operation?.operation_date 
        ? new Date(operation.operation_date) 
        : operation?.date 
          ? new Date(operation.date) 
          : new Date()
    );
  };

  const handleSave = async () => {
    if (!operation) return;
    
    const operationData = {
      client_name: operation.fromClient || "",
      amount: amount,
      date: date?.toISOString() || new Date().toISOString(),
      notes: notes
    };
    
    let success = false;
    
    if (operation.type === "withdrawal") {
      success = await handleWithdrawal(operationData, true, operationId);
    } else if (operation.type === "deposit") {
      success = await handleDeposit({
        ...operationData,
        description: notes
      });
    }
    
    if (success) {
      onClose();
    }
  };
  
  const handleDelete = async () => {
    if (!operation || !operationId) return;
    
    let success = false;
    
    if (operation.type === "withdrawal") {
      success = await deleteWithdrawal(operationId);
    }
    
    if (success) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
      if (open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" 
              ? `Modifier ${operation?.type === "withdrawal" ? "le retrait" : operation?.type === "deposit" ? "le versement" : "l'opération"}` 
              : `Supprimer ${operation?.type === "withdrawal" ? "le retrait" : operation?.type === "deposit" ? "le versement" : "l'opération"}`}
          </DialogTitle>
        </DialogHeader>
        
        {mode === "edit" && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "P", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        )}
        
        {mode === "delete" && (
          <div className="py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible.
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {mode === "edit" ? (
            <Button onClick={handleSave}>Enregistrer</Button>
          ) : (
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
