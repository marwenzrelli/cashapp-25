
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { WithdrawalFormLoading } from "./WithdrawalFormLoading";
import { WithdrawalFormContent } from "./WithdrawalFormContent";
import { useWithdrawalFormState } from "../../hooks/useWithdrawalFormState";
import { Withdrawal } from "@/features/withdrawals/types";
import { ExtendedClient } from "../../hooks/form/withdrawalFormTypes";
import { ensureValidISODate } from "../../hooks/utils/formatUtils";

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
  const {
    formState,
    isLoading,
    setIsLoading,
    formInitialized,
    handleInputChange
  } = useWithdrawalFormState({
    isOpen,
    clients,
    selectedClient,
    setSelectedClient,
    isEditing,
    selectedWithdrawal
  });

  const handleSubmit = async () => {
    if (!formInitialized) {
      console.error("Form not initialized yet");
      return;
    }
    
    setIsLoading(true);
    try {
      // Find the client to get full name
      const client = clients.find(c => c.id.toString() === formState.clientId);
      if (!client) {
        console.error("Client not found");
        setIsLoading(false);
        return;
      }

      const clientName = `${client.prenom} ${client.nom}`;
      
      // Ensure we have a valid date
      const operationDate = ensureValidISODate(formState.date);
      
      console.log("Submitting withdrawal form with:", {
        clientName,
        amount: formState.amount,
        notes: formState.notes,
        date: operationDate
      });
      
      const success = await onCreateWithdrawal({
        client_name: clientName,
        amount: formState.amount,
        notes: formState.notes,
        operation_date: operationDate, // Make sure to provide a valid ISO date
      });

      if (success) {
        // Form will be reset by the useEffect when dialog closes
        onClose();
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <>
          {!formInitialized ? (
            <WithdrawalFormLoading />
          ) : (
            <WithdrawalFormContent
              formState={formState}
              onInputChange={handleInputChange}
              onClose={onClose}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isEditing={isEditing}
              clients={clients}
              setSelectedClient={setSelectedClient}
            />
          )}
        </>
      )}
    </Dialog>
  );
};
