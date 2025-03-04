
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";
import { DateField } from "../form-fields/DateField";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { Client } from "@/features/clients/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

export interface WithdrawalFormDialogProps {
  clients: ExtendedClient[];
  newWithdrawal: {
    clientId: string;
    amount: string;
    notes: string;
    date: string;
  };
  setNewWithdrawal: (withdrawal: {
    clientId: string;
    amount: string;
    notes: string;
    date: string;
  }) => void;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  isLoading?: boolean;
}

export const WithdrawalFormDialog: React.FC<WithdrawalFormDialogProps> = ({
  clients,
  newWithdrawal,
  setNewWithdrawal,
  onClose,
  onSubmit,
  isEditing,
  isLoading = false,
}) => {
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
              onChange={(value) => setNewWithdrawal({ ...newWithdrawal, clientId: value })}
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
          onClick={onSubmit}
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
