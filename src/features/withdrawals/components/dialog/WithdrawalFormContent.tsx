
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, Loader2 } from "lucide-react";
import { DateField } from "../form-fields/DateField";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { Client } from "@/features/clients/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface WithdrawalFormContentProps {
  formState: {
    clientId: string;
    amount: string;
    notes: string;
    date: string;
  };
  onInputChange: (field: string, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEditing: boolean;
  clients: ExtendedClient[];
  setSelectedClient: (clientId: string) => void;
}

export const WithdrawalFormContent: React.FC<WithdrawalFormContentProps> = ({
  formState,
  onInputChange,
  onClose,
  onSubmit,
  isLoading,
  isEditing,
  clients,
  setSelectedClient
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
              value={formState.date}
              onChange={(value) => onInputChange("date", value)}
            />

            <ClientSelectField
              value={formState.clientId}
              onChange={(value) => {
                onInputChange("clientId", value);
                setSelectedClient(value);
              }}
              clients={clients}
            />

            <AmountField
              value={formState.amount}
              onChange={(value) => onInputChange("amount", value)}
            />

            <NotesField
              value={formState.notes}
              onChange={(value) => onInputChange("notes", value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-2" disabled={isLoading}>
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[200px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              En cours...
            </>
          ) : (
            <>
              <ArrowDownCircle className="h-4 w-4" />
              {isEditing ? "Modifier le retrait" : "Effectuer le retrait"}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
