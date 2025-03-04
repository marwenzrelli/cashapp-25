
/**
 * Formats a date string to a localized date-time format
 * @param dateString - ISO date string to format
 * @returns Formatted date string in local time
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Date inconnue";
  
  // Create date object - this will interpret the date in local time
  const date = new Date(dateString);
  
  // Format using local time
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
