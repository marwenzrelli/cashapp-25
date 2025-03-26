
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
    
    // Use the appropriate date field from the withdrawal, prioritize operation_date
    let dateValue = selectedWithdrawal.operation_date || 
                   selectedWithdrawal.date || 
                   selectedWithdrawal.created_at ||
                   new Date().toISOString();
    
    // If we received a formatted date string (not ISO), try to convert it to ISO
    if (dateValue && !dateValue.includes('T')) {
      try {
        // Try to parse French formatted date (DD/MM/YYYY HH:MM)
        const parts = dateValue.split(' ');
        if (parts.length >= 2) {
          const dateParts = parts[0].split('/').map(Number);
          const timeParts = parts[1].split(':').map(Number);
          
          if (dateParts.length === 3 && timeParts.length >= 2) {
            const date = new Date();
            date.setFullYear(dateParts[2], dateParts[1] - 1, dateParts[0]);
            date.setHours(timeParts[0], timeParts[1], timeParts[2] || 0);
            
            if (!isNaN(date.getTime())) {
              dateValue = date.toISOString();
              console.log("Converted formatted date to ISO:", dateValue);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing formatted date:", error);
      }
    }
    
    console.log("Form initialized with date:", dateValue);
    
    return {
      clientId,
      amount: amountStr,
      notes: selectedWithdrawal.notes || "",
      date: dateValue,
    };
  } catch (error) {
    console.error("Error initializing form from withdrawal:", error);
    return null;
  }
};
