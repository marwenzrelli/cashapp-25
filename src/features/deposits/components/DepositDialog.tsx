
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useClients } from "@/features/clients/hooks/useClients";
import { toast } from "sonner";
import { type DepositDialogProps } from "@/features/deposits/types";
import { type Deposit } from "@/components/deposits/types";
import { supabase } from "@/integrations/supabase/client";
import { ClientSelectDropdown } from "./ClientSelectDropdown";
import { AmountInput } from "./AmountInput";
import { DatePickerField } from "./DatePickerField";
import { DescriptionField } from "./DescriptionField";

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { clients, fetchClients } = useClients();

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open, fetchClients]);

  // Écouter les changements en temps réel sur la table clients
  useEffect(() => {
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Mise à jour des soldes détectée');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClients]);

  const handleSubmit = async () => {
    if (!selectedClient || !amount || !date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const selectedClientData = clients.find(c => c.id.toString() === selectedClient);
      if (!selectedClientData) {
        toast.error("Client non trouvé");
        return;
      }

      const newDeposit: Omit<Deposit, 'id' | 'status' | 'created_at' | 'created_by'> = {
        client_name: `${selectedClientData.prenom} ${selectedClientData.nom}`,
        amount: Number(amount),
        date: format(date, "yyyy-MM-dd"),
        description
      };

      await onConfirm(newDeposit as Deposit);
      
      setSelectedClient("");
      setAmount("");
      setDescription("");
      
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du versement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      console.log("Nouvelle date sélectionnée:", newDate);
      setDate(newDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau versement pour un client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Client</label>
              <ClientSelectDropdown 
                clients={clients}
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
            </div>
          </div>

          <AmountInput 
            amount={amount}
            onAmountChange={setAmount}
          />

          <DatePickerField 
            date={date}
            onDateChange={handleDateChange}
          />

          <DescriptionField 
            description={description}
            onDescriptionChange={setDescription}
          />
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
