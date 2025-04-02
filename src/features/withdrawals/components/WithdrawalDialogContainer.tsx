
import React from "react";
import { WithdrawalFormDialog } from "./dialog/WithdrawalFormDialog";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedClient } from "../hooks/form/withdrawalFormTypes";
import { ensureValidISODate } from "../hooks/utils/formatUtils";

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
      
      // Convert string amount to number
      const amountString = data.amount.replace(',', '.');
      const amountNumber = parseFloat(amountString);
      
      if (isNaN(amountNumber) || amountNumber <= 0) {
        toast.error("Le montant doit être un nombre positif valide");
        return false;
      }
      
      // Ensure we have a valid operation_date
      let operationDate = data.operation_date;
      if (!operationDate) {
        operationDate = new Date().toISOString();
        console.log("No operation_date provided, using current date:", operationDate);
      } else {
        operationDate = ensureValidISODate(operationDate);
      }
      
      // Handle editing vs creating
      if (isEditing && selectedWithdrawal) {
        console.log("Updating withdrawal with ID:", selectedWithdrawal.id);
        
        // Validate the ID before using it
        if (!selectedWithdrawal.id) {
          console.error("Missing withdrawal ID for update operation");
          throw new Error("ID de retrait manquant pour la mise à jour");
        }
        
        // Convert ID to number if it's a string to fix the type error
        const withdrawalId = typeof selectedWithdrawal.id === 'string' 
          ? parseInt(selectedWithdrawal.id, 10) 
          : selectedWithdrawal.id;

        if (isNaN(withdrawalId)) {
          console.error("Invalid withdrawal ID:", selectedWithdrawal.id);
          throw new Error("ID de retrait invalide");
        }

        // Update existing withdrawal
        const { error } = await supabase
          .from('withdrawals')
          .update({
            client_name: data.client_name,
            amount: amountNumber,
            notes: data.notes || null,
            operation_date: operationDate,
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
        const { data: insertedData, error } = await supabase
          .from('withdrawals')
          .insert({
            client_name: data.client_name,
            amount: amountNumber,
            notes: data.notes || null,
            operation_date: operationDate
          })
          .select();
          
        if (error) {
          console.error("Error creating withdrawal:", error);
          throw error;
        }
        
        console.log("New withdrawal created successfully:", insertedData);
      }
      
      await fetchWithdrawals();
      
      toast.success("Opération réussie", {
        description: "Le retrait a été " + (isEditing ? "modifié" : "créé") + " avec succès"
      });
      
      // Close dialog after successful operation
      setShowDialog(false);
      
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
