
export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return '';
    }
    
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

export const formatISODateTime = (dateString: string) => {
  if (!dateString) return { date: '', time: '' };
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return { date: '', time: '' };
    }
    
    // Format date as YYYY-MM-DD for input type="date"
    const formattedDate = date.toISOString().split('T')[0];
    
    // Format time as HH:MM:SS for input type="time" using local time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    console.log("Date formatée:", {
      original: dateString,
      formatted: { date: formattedDate, time: formattedTime }
    });
    
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error("Error formatting ISO date:", error);
    return { date: '', time: '' };
  }
};
