
/**
 * Utility functions for handling date formatting and conversion
 */

/**
 * Formats a date string into a localized date-time string
 * @param dateString - ISO date string to format
 * @returns Formatted date string in local time
 */
export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return '';
    }
    
    // Format using local time zone (French style)
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

/**
 * Converts an ISO date string to separate date and time components
 * for input fields, respecting the local timezone
 * @param dateString - ISO date string to format
 * @returns Object with separated date and time strings
 */
export const formatISODateTime = (dateString: string) => {
  if (!dateString) return { date: '', time: '' };
  
  try {
    // Create date object - this will be in local time
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return { date: '', time: '' };
    }
    
    // Format date as YYYY-MM-DD for input type="date" using local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Format time as HH:MM:SS for input type="time" using local time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    console.log("Formatted to local time:", {
      original: dateString,
      formatted: { date: formattedDate, time: formattedTime },
      localDate: date.toString()
    });
    
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error("Error formatting ISO date:", error);
    return { date: '', time: '' };
  }
};

/**
 * Creates an ISO string from date and time inputs, properly handling timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timeString - Time string in HH:MM:SS format
 * @returns ISO date string
 */
export const createISOString = (dateString: string, timeString: string) => {
  if (!dateString) return null;
  
  try {
    // Parse date components
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Parse time components (using defaults if not provided)
    const [hours, minutes, seconds] = (timeString || '00:00:00').split(':').map(Number);
    
    // Create a date in local time zone
    const localDate = new Date();
    localDate.setFullYear(year, month - 1, day);
    localDate.setHours(hours, minutes, seconds || 0);
    
    console.log("Created date from local inputs:", {
      dateInput: dateString,
      timeInput: timeString,
      localDate: localDate.toString(),
      resultingISO: localDate.toISOString()
    });
    
    // Convert to ISO string
    return localDate.toISOString();
  } catch (error) {
    console.error("Error creating ISO string:", error);
    return null;
  }
};
