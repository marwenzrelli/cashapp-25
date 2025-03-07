
import React from "react";
import { WithdrawalFormDialog } from "./dialog/WithdrawalFormDialog";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";
import { toast } from "sonner";

interface WithdrawalDialogContainerProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  clients: Client[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  isEditing: boolean;
  selectedWithdrawal: Withdrawal | null;
  fetchWithdrawals: () => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

interface ExtendedClient extends Client {
  dateCreation: string;
}

export const WithdrawalDialogContainer: React.FC<WithdrawalDialogContainerProps> = ({
  showDialog,
  setShowDialog,
  clients,
  selectedClient,
  setSelectedClient,
  isEditing,
  selectedWithdrawal,
  fetchWithdrawals,
  refreshClientBalance
}) => {
  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleCreateWithdrawal = async (data: {
    client_name: string;
    amount: string;
    notes?: string;
    operation_date?: string;
  }) => {
    try {
      // Find the client ID from the client name
      const selectedClientObj = clients.find(c => `${c.prenom} ${c.nom}` === data.client_name);
      
      if (selectedClientObj) {
        // Convert client ID to number for refreshClientBalance
        const clientIdNum = typeof selectedClientObj.id === 'string' 
          ? parseInt(selectedClientObj.id, 10) 
          : selectedClientObj.id;
          
        await refreshClientBalance(clientIdNum.toString());
      }
      
      await fetchWithdrawals();
      setShowDialog(false);
      
      toast.success("Opération réussie", {
        description: "Le retrait a été " + (isEditing ? "modifié" : "créé") + " avec succès"
      });
      
      return true;
    } catch (error) {
      console.error("Error in handleCreateWithdrawal:", error);
      
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du " + (isEditing ? "la modification" : "la création") + " du retrait"
      });
      
      return false;
    }
  };

  // Convert clients to ExtendedClients by adding the dateCreation property
  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  // Only render the dialog if showDialog is true to prevent unnecessary renders
  if (!showDialog) {
    return null;
  }

  return (
    <WithdrawalFormDialog
      isOpen={showDialog}
      onClose={handleCloseDialog}
      clients={extendedClients}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      isEditing={isEditing}
      selectedWithdrawal={selectedWithdrawal}
      onCreateWithdrawal={handleCreateWithdrawal}
    />
  );
};
