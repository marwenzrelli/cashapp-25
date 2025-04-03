
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
