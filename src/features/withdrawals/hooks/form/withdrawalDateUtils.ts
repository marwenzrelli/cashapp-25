
/**
 * Parses a formatted date string to ISO format
 * @param formattedDate A date string in format "DD/MM/YYYY HH:MM"
 * @returns ISO date string
 */
export const parseFormattedDate = (formattedDate: string): string => {
  try {
    // Try to parse formatted date back to ISO
    const parts = formattedDate.split(' ');
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
          return date.toISOString();
        }
      }
    }
    throw new Error("Invalid date format");
  } catch (error) {
    console.error("Error parsing date:", error);
    // Fallback to current date
    return new Date().toISOString();
  }
};
