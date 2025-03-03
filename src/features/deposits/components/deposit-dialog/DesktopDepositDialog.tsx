
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Deposit } from "@/features/deposits/types";
import { ClientSelectDropdown } from "../ClientSelectDropdown";
import { AmountInput } from "../AmountInput";
import { DatePickerField } from "../DatePickerField";
import { DescriptionField } from "../DescriptionField";
import { SuccessMessage } from "./SuccessMessage";

interface DesktopDepositDialogProps {
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

export const DesktopDepositDialog = ({
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
}: DesktopDepositDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={contentRef}
        className="sm:max-w-md w-[calc(100%-2rem)] max-h-[95vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-center">
          <div className="w-12 h-1.5 bg-muted rounded-full mt-2"></div>
        </div>
        
        <DialogHeader className="pt-4">
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau versement pour un client.
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <SuccessMessage />
        ) : (
          <>
            <div className="space-y-5 py-4">
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
            
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !isValid} 
                className="w-full sm:w-auto"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
