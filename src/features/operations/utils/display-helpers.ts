
/**
 * Format an operation ID to a consistent display format
 * @param id The operation ID
 * @returns Formatted operation ID
 */
export const formatOperationId = (id: string): string => {
  // If it's already a numeric string, just pad it
  if (/^\d+$/.test(id)) {
    return id.padStart(6, '0');
  }
  
  // Extract numeric part from complex operation IDs (like "operation-type-123")
  const numericId = id.split('-').pop() || '';
  return numericId.padStart(6, '0');
};

/**
 * Get the appropriate CSS color class for an operation type
 * @param type Operation type
 * @returns CSS class for text color
 */
export const getAmountColor = (type: string): string => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "";
  }
};

/**
 * Checks if a source text contains a partial search term
 * @param source The source text to search in
 * @param searchTerm The search term to look for
 * @returns Boolean indicating if the search term is found
 */
export const containsPartialText = (
  source: string | undefined | null,
  searchTerm: string
): boolean => {
  if (!source) return false;
  return source.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Check if an operation matches a search term
 * Searches across multiple fields (client names, description, amount, id)
 * @param operation The operation to check
 * @param searchTerm The search term to look for
 * @returns Boolean indicating if the operation matches the search
 */
export const operationMatchesSearch = (
  operation: any,
  searchTerm: string
): boolean => {
  if (!searchTerm.trim()) return true;
  
  const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
  
  return searchTerms.some(term => {
    // Check fromClient (if available)
    if (operation.fromClient && containsPartialText(operation.fromClient, term)) return true;
    
    // Check toClient (if available)
    if (operation.toClient && containsPartialText(operation.toClient, term)) return true;
    
    // Check client_name (for withdrawals)
    if (operation.client_name && containsPartialText(operation.client_name, term)) return true;
    
    // Check description or reason
    const description = operation.description || operation.reason || operation.notes;
    if (description && containsPartialText(description, term)) return true;
    
    // Check ID
    if (operation.id && operation.id.toString().includes(term)) return true;
    
    // Check amount
    if (operation.amount && operation.amount.toString().includes(term)) return true;
    
    return false;
  });
};
