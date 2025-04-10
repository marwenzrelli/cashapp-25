
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "../DatePickerField";
import { Client } from "@/features/clients/types";
import { Deposit } from "@/components/deposits/types";
import { Loader2, Clock } from "lucide-react";
import { SuccessMessage } from "./SuccessMessage";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileDepositDialogProps {
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

export const MobileDepositDialog: React.FC<MobileDepositDialogProps> = ({
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
  const isMobile = useIsMobile();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="h-[90vh] overflow-y-auto w-full max-w-md">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-xl">Nouveau versement</SheetTitle>
          <SheetDescription>
            Créez un nouveau versement pour un client
          </SheetDescription>
        </SheetHeader>
        
        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="client" className="text-base">Client</Label>
              <Select value={formState.selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full h-14">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()} className="py-3">
                      {client.prenom} {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-base">Montant (TND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formState.amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-lg"
              />
            </div>
            
            <div className="space-y-3">
              <DatePickerField 
                date={formState.date} 
                onDateChange={handleDateChange}
                label="Date du versement"
              />
              
              <div className="relative mt-4">
                <Label htmlFor="timeInput" className="text-base">Heure du versement</Label>
                <div className="flex items-center mt-2">
                  <Input
                    id="timeInput"
                    type="time"
                    className="h-14 text-lg pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base">Description (optionnel)</Label>
              <Input
                id="description"
                placeholder="Entrez une description..."
                value={formState.description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-14"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-14 text-base mt-6"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
      </SheetContent>
    </Sheet>
  );
};
