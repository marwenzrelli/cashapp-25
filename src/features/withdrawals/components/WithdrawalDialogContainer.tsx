
import React from "react";
import { WithdrawalFormDialog } from "./dialog/WithdrawalFormDialog";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const selectedClientObj = clients.find(c => `${c.prenom} ${c.nom}` === data.client_name);
      
      if (selectedClientObj) {
        const clientIdNum = typeof selectedClientObj.id === 'string' 
          ? parseInt(selectedClientObj.id, 10) 
          : selectedClientObj.id;
          
        await refreshClientBalance(clientIdNum.toString());
      }
      
      console.log("Processing withdrawal with data:", data);
      console.log("Is editing mode:", isEditing);
      
      // Handle editing vs creating
      if (isEditing && selectedWithdrawal) {
        console.log("Updating withdrawal with ID:", selectedWithdrawal.id);
        
        // Convert ID to number if it's a string to fix the type error
        const withdrawalId = typeof selectedWithdrawal.id === 'string' 
          ? parseInt(selectedWithdrawal.id, 10) 
          : selectedWithdrawal.id;

        // Update existing withdrawal
        const { error } = await supabase
          .from('withdrawals')
          .update({
            client_name: data.client_name,
            amount: parseFloat(data.amount),
            notes: data.notes || null,
            operation_date: data.operation_date || new Date().toISOString(),
            last_modified_at: new Date().toISOString()
          })
          .eq('id', withdrawalId);
          
        if (error) {
          console.error("Error updating withdrawal:", error);
          throw error;
        }
        
        console.log("Withdrawal updated successfully");
      } else {
        console.log("Creating new withdrawal");
        
        // Create new withdrawal
        const { error } = await supabase
          .from('withdrawals')
          .insert({
            client_name: data.client_name,
            amount: parseFloat(data.amount),
            notes: data.notes || null,
            operation_date: data.operation_date || new Date().toISOString()
          });
          
        if (error) {
          console.error("Error creating withdrawal:", error);
          throw error;
        }
        
        console.log("New withdrawal created successfully");
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

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

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
