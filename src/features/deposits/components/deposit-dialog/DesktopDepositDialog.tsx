
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Client } from "@/features/clients/types";
import { Deposit } from "@/components/deposits/types";
import { Loader2 } from "lucide-react";
import { SuccessMessage } from "./SuccessMessage";

interface DesktopDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  clients: Client[];
  formState: {
    selectedClient: string;
    amount: string;
    date: Date;
    description: string;
  };
  setSelectedClient: (clientId: string) => void;
  setAmount: (amount: string) => void;
  setDescription: (description: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isValid: boolean;
  showSuccess: boolean;
}

export const DesktopDepositDialog: React.FC<DesktopDepositDialogProps> = ({
  open,
  onOpenChange,
  clients,
  formState,
  setSelectedClient,
  setAmount,
  setDescription,
  handleDateChange,
  handleSubmit,
  isLoading,
  isValid,
  showSuccess
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Créez un nouveau versement pour un client
          </DialogDescription>
        </DialogHeader>
        
        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={formState.selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.prenom} {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (TND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formState.amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date du versement</Label>
              <div className="border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={formState.date}
                  onSelect={handleDateChange}
                  locale={fr}
                  className="mx-auto"
                />
              </div>
              <div className="text-center text-sm text-gray-500">
                {format(formState.date, 'dd MMMM yyyy', { locale: fr })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                placeholder="Entrez une description..."
                value={formState.description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                "Confirmer le versement"
              )}
            </Button>
          </form>
        ) : (
          <SuccessMessage amount={formState.amount} />
        )}
      </DialogContent>
    </Dialog>
  );
};
