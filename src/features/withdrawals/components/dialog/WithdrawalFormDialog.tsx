
import React, { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";
import { DateField } from "../form-fields/DateField";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

export interface WithdrawalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ExtendedClient[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  isEditing: boolean;
  selectedWithdrawal: Withdrawal | null;
  onCreateWithdrawal: (data: {
    client_name: string;
    amount: string;
    notes?: string;
    operation_date?: string;
  }) => Promise<boolean>;
}

export const WithdrawalFormDialog: React.FC<WithdrawalFormDialogProps> = ({
  isOpen,
  onClose,
  clients,
  selectedClient,
  setSelectedClient,
  isEditing,
  selectedWithdrawal,
  onCreateWithdrawal,
}) => {
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens/closes or when editing status changes
  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: new Date().toISOString(),
      });
      return;
    }
    
    if (isEditing && selectedWithdrawal) {
      // Find client by name when editing
      const clientFullName = selectedWithdrawal.client_name;
      const client = clients.find(c => `${c.prenom} ${c.nom}` === clientFullName);
      
      if (client) {
        const clientId = client.id.toString();
        
        // Convert amount to string safely
        const amountStr = selectedWithdrawal.amount !== undefined && selectedWithdrawal.amount !== null
          ? selectedWithdrawal.amount.toString()
          : "";
          
        setNewWithdrawal({
          clientId: clientId,
          amount: amountStr,
          notes: selectedWithdrawal.notes || "",
          date: selectedWithdrawal.date || new Date().toISOString(),
        });
        
        // Update selected client in parent
        setSelectedClient(clientId);
      } else {
        console.error("Client not found for withdrawal:", selectedWithdrawal);
      }
    } else if (selectedClient) {
      // Just update the client ID when not editing
      setNewWithdrawal(prev => ({
        ...prev,
        clientId: selectedClient
      }));
    }
  }, [isOpen, isEditing, selectedWithdrawal, selectedClient, clients, setSelectedClient]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Find the client to get full name
      const client = clients.find(c => c.id.toString() === newWithdrawal.clientId);
      if (!client) {
        console.error("Client not found");
        setIsLoading(false);
        return;
      }

      const clientName = `${client.prenom} ${client.nom}`;
      
      const success = await onCreateWithdrawal({
        client_name: clientName,
        amount: newWithdrawal.amount,
        notes: newWithdrawal.notes,
        operation_date: newWithdrawal.date,
      });

      if (success) {
        // Reset form after successful submission
        setNewWithdrawal({
          clientId: "",
          amount: "",
          notes: "",
          date: new Date().toISOString(),
        });
        onClose();
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <div className="rounded-xl bg-red-100 dark:bg-red-900/20 p-2">
            <ArrowDownCircle className="h-6 w-6 text-red-600" />
          </div>
          {isEditing ? "Modifier le retrait" : "Nouveau retrait"}
        </DialogTitle>
        <DialogDescription className="text-base">
          {isEditing
            ? "Modifiez les informations du retrait"
            : "Enregistrez un nouveau retrait pour un client"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/50 p-6">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative grid gap-4">
            <DateField 
              value={newWithdrawal.date}
              onChange={(value) => setNewWithdrawal({ ...newWithdrawal, date: value })}
            />

            <ClientSelectField
              value={newWithdrawal.clientId}
              onChange={(value) => {
                setNewWithdrawal({ ...newWithdrawal, clientId: value });
                setSelectedClient(value);
              }}
              clients={clients}
            />

            <AmountField
              value={newWithdrawal.amount}
              onChange={(value) => setNewWithdrawal({ ...newWithdrawal, amount: value })}
            />

            <NotesField
              value={newWithdrawal.notes}
              onChange={(value) => setNewWithdrawal({ ...newWithdrawal, notes: value })}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[200px]"
          disabled={isLoading}
        >
          <ArrowDownCircle className="h-4 w-4" />
          {isLoading 
            ? "En cours..." 
            : isEditing 
              ? "Modifier le retrait" 
              : "Effectuer le retrait"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
