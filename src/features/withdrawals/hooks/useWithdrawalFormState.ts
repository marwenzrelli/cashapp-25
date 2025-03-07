
import { useState, useEffect } from "react";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface UseWithdrawalFormStateProps {
  isOpen: boolean;
  clients: ExtendedClient[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  isEditing: boolean;
  selectedWithdrawal: Withdrawal | null;
}

interface WithdrawalFormState {
  clientId: string;
  amount: string;
  notes: string;
  date: string;
}

export const useWithdrawalFormState = ({
  isOpen,
  clients,
  selectedClient,
  setSelectedClient,
  isEditing,
  selectedWithdrawal
}: UseWithdrawalFormStateProps) => {
  const [formState, setFormState] = useState<WithdrawalFormState>({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize the form as soon as the modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when dialog closes
      setFormInitialized(false);
      return;
    }

    // Initialize form immediately without delay
    initializeForm();
    
  }, [isOpen, isEditing, selectedWithdrawal, selectedClient, clients]);

  const initializeForm = () => {
    try {
      console.log("Initializing withdrawal form with:", { 
        isEditing, 
        selectedWithdrawal, 
        selectedClient 
      });
      
      if (isEditing && selectedWithdrawal) {
        // Find client by name when editing
        const clientFullName = selectedWithdrawal.client_name;
        
        // More flexible client matching
        const normalizeString = (str: string) => str ? str.toLowerCase().trim() : '';
        
        const client = clients.find(c => {
          const fullName = `${c.prenom} ${c.nom}`;
          const reversedName = `${c.nom} ${c.prenom}`;
          
          const normalizedFullName = normalizeString(fullName);
          const normalizedReversedName = normalizeString(reversedName);
          const normalizedClientName = normalizeString(clientFullName);
          
          return normalizedFullName === normalizedClientName || 
                 normalizedReversedName === normalizedClientName ||
                 normalizedFullName.includes(normalizedClientName) ||
                 normalizedClientName.includes(normalizedFullName);
        });
        
        if (client) {
          const clientId = client.id.toString();
          
          // Convert amount to string safely
          const amountStr = selectedWithdrawal.amount !== undefined && selectedWithdrawal.amount !== null
            ? selectedWithdrawal.amount.toString()
            : "";
          
          // Parse date from the formatted string back to ISO format if needed
          let dateValue = new Date().toISOString();
          
          // First check operation_date, then date, then created_at
          const sourceDate = selectedWithdrawal.operation_date || selectedWithdrawal.date || selectedWithdrawal.created_at;
          
          if (sourceDate) {
            // Handle formatting differences - the date might come formatted or as ISO string
            if (sourceDate.includes('T')) {
              // Already in ISO format
              dateValue = sourceDate;
            } else {
              try {
                // Try to parse formatted date back to ISO
                const parts = sourceDate.split(' ');
                if (parts.length >= 2) {
                  const dateParts = parts[0].split('/');
                  const timeParts = parts[1].split(':');
                  
                  if (dateParts.length === 3 && timeParts.length >= 2) {
                    const day = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
                    const year = parseInt(dateParts[2]);
                    const hours = parseInt(timeParts[0]);
                    const minutes = parseInt(timeParts[1]);
                    
                    const date = new Date(year, month, day, hours, minutes);
                    if (!isNaN(date.getTime())) {
                      dateValue = date.toISOString();
                    }
                  }
                }
              } catch (error) {
                console.error("Error parsing date:", error);
                // Fallback to current date
                dateValue = new Date().toISOString();
              }
            }
          }
          
          const formData = {
            clientId: clientId,
            amount: amountStr,
            notes: selectedWithdrawal.notes || "",
            date: dateValue,
          };
          
          console.log("Setting withdrawal form data:", formData);
          setFormState(formData);
          
          // Update selected client in parent
          setSelectedClient(clientId);
        } else {
          console.error("Client not found for withdrawal:", selectedWithdrawal);
          // Fallback to empty form if client not found
          resetForm();
        }
      } else if (selectedClient) {
        // Just update the client ID when not editing but client is preselected
        setFormState(prev => ({
          ...prev,
          clientId: selectedClient
        }));
      } else {
        // Fresh new withdrawal
        resetForm();
      }
      
    } catch (error) {
      console.error("Error initializing form:", error);
      resetForm(); // Fall back to empty form on error
    } finally {
      setFormInitialized(true);
    }
  };

  // Helper to reset form
  const resetForm = () => {
    setFormState({
      clientId: "",
      amount: "",
      notes: "",
      date: new Date().toISOString(),
    });
  };

  const handleInputChange = (field: keyof WithdrawalFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formState,
    setFormState,
    isLoading,
    setIsLoading,
    formInitialized,
    handleInputChange
  };
};
