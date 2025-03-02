
import { Operation } from "@/features/operations/types";

// Format transaction ID to 6 digits
export const formatOperationId = (id: string) => {
  // If the ID is numeric or can be converted to a number
  if (!isNaN(Number(id))) {
    // Pad with leading zeros to get 6 digits
    return id.padStart(6, '0');
  }
  
  // For UUID format, take first 6 characters
  return id.slice(0, 6);
};

export const getAmountColor = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-purple-600 dark:text-purple-400";
  }
};

// Utility function to check if a string contains another string, case insensitive
export const containsText = (text: string, searchTerm: string): boolean => {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

// Check if an operation matches the search term
export const operationMatchesSearch = (operation: Operation, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
  
  return searchTerms.some(term => {
    // Check operation ID
    if (containsText(operation.id.toString(), term)) return true;
    
    // Check formatted operation ID (with leading zeros)
    if (containsText(formatOperationId(operation.id.toString()), term)) return true;
    
    // Check client names
    if (operation.fromClient && containsText(operation.fromClient, term)) return true;
    if (operation.toClient && containsText(operation.toClient, term)) return true;
    
    // Check description
    if (operation.description && containsText(operation.description, term)) return true;
    
    // Check amount
    if (operation.amount.toString().includes(term)) return true;
    
    return false;
  });
};
