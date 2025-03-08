
import { WithdrawalFormState, ExtendedClient } from "./withdrawalFormTypes";
import { Withdrawal } from "@/features/withdrawals/types";

export const initializeNewForm = (): WithdrawalFormState => {
  return {
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString(),
  };
};

export const initializeFormFromWithdrawal = (
  selectedWithdrawal: Withdrawal,
  clients: ExtendedClient[]
): WithdrawalFormState | null => {
  try {
    console.log("Initializing form from withdrawal:", selectedWithdrawal);
    
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
    
    if (!client) {
      console.error("Client not found for withdrawal:", selectedWithdrawal);
      return null;
    }
    
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
    
    return {
      clientId: clientId,
      amount: amountStr,
      notes: selectedWithdrawal.notes || "",
      date: dateValue,
    };
  } catch (error) {
    console.error("Error initializing form from withdrawal:", error);
    return null;
  }
};
