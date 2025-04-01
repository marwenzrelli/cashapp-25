
/**
 * Formats a date string to a localized date-time format
 * @param dateString - ISO date string to format
 * @returns Formatted date string in local time
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Date inconnue";
  
  try {
    // Create date object - this will interpret the date in local time
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Date invalide";
    }
    
    // Format using local time (French style)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Erreur de date";
  }
};

/**
 * Parses a date string to ensure it's a valid ISO format
 * @param dateString - Date string to parse
 * @returns Valid ISO date string or current date if invalid
 */
export const ensureValidISODate = (dateString?: string | null): string => {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Try to create a valid date object
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error("Invalid date during ISO conversion:", dateString);
      return new Date().toISOString();
    }
    
    // Return as ISO string
    return date.toISOString();
  } catch (error) {
    console.error("Error parsing date for ISO format:", error);
    return new Date().toISOString();
  }
};
