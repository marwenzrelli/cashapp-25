
import { Operation } from '../../types';

/**
 * Formats operations with proper date formatting
 */
export const formatOperationsWithDates = (operations: Operation[]): Operation[] => {
  return operations.map(op => {
    const operationDate = op.operation_date || op.date;
    let dateObj: Date;
    
    // Handle various date formats
    if (operationDate) {
      if (typeof operationDate === 'string') {
        dateObj = new Date(operationDate);
      } else if (operationDate && typeof operationDate === 'object' && 'getTime' in operationDate) {
        // Check if it's a Date object by checking if it has the getTime method
        dateObj = operationDate as Date;
      } else {
        // For safety, create a new date
        dateObj = new Date();
      }
    } else {
      dateObj = new Date();
    }
    
    // Format date for French locale
    const formattedDate = dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      ...op,
      formattedDate
    };
  });
};
