
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { type Deposit } from "@/features/deposits/types";
import { ClientSelectDropdown } from "../ClientSelectDropdown";
import { AmountInput } from "../AmountInput";
import { DatePickerField } from "../DatePickerField";
import { DescriptionField } from "../DescriptionField";
import { SuccessMessage } from "./SuccessMessage";

interface MobileDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<void>;
  clients: any[];
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
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  isValid: boolean;
  showSuccess: boolean;
}

export const MobileDepositDialog = ({
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
}: MobileDepositDialogProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] pb-8 rounded-t-2xl">
        <div className="w-12 h-1.5 bg-muted rounded-full mt-2 mx-auto mb-6"></div>
        
        <div className="flex flex-col gap-0.5 mb-4">
          <h2 className="text-xl font-semibold">Nouveau versement</h2>
          <p className="text-muted-foreground text-sm">
            Enregistrez un nouveau versement pour un client
          </p>
        </div>
        
        {showSuccess ? (
          <SuccessMessage />
        ) : (
          <>
            <div className="space-y-6 py-4">
              <ClientSelectDropdown 
                clients={clients}
                selectedClient={formState.selectedClient}
                onClientSelect={setSelectedClient}
              />
        
              <AmountInput 
                amount={formState.amount}
                onAmountChange={setAmount}
              />
        
              <DatePickerField 
                date={formState.date}
                onDateChange={handleDateChange}
              />
        
              <DescriptionField 
                description={formState.description}
                onDescriptionChange={setDescription}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !isValid} 
                className="w-full py-6"
                size="lg"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer le versement"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
