
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

  // Résolution du problème: initialiser correctement le formulaire lors de l'édition
  useEffect(() => {
    if (isEditing && selectedWithdrawal) {
      // Trouver le client par nom
      const client = clients.find(c => `${c.prenom} ${c.nom}` === selectedWithdrawal.client_name);
      
      if (client) {
        setNewWithdrawal({
          clientId: client.id.toString(),
          amount: selectedWithdrawal.amount.toString(),
          notes: selectedWithdrawal.notes || "",
          date: selectedWithdrawal.date || new Date().toISOString(),
        });
      }
    } else if (selectedClient) {
      // Mise à jour du client ID quand selectedClient change
      setNewWithdrawal(prev => ({
        ...prev,
        clientId: selectedClient
      }));
    }
  }, [isEditing, selectedWithdrawal, selectedClient, clients]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Rechercher le nom du client en fonction de l'ID client sélectionné
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
        // Réinitialiser le formulaire
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
