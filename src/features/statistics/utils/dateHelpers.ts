
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export const getMonthBoundaries = () => {
  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);
  
  const lastMonth = subDays(startOfCurrentMonth, 1);
  const startOfLastMonth = startOfMonth(lastMonth);
  const endOfLastMonth = endOfMonth(lastMonth);
  
  return {
    currentMonth: {
      start: startOfCurrentMonth,
      end: endOfCurrentMonth
    },
    lastMonth: {
      start: startOfLastMonth,
      end: endOfLastMonth
    }
  };
};

/**
 * Safely checks if a date is valid
 */
const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Filters items by date range, handling invalid dates safely
 */
export const filterByDateRange = (items: any[], startDate: Date, endDate: Date, dateField: string = 'created_at') => {
  if (!Array.isArray(items)) return [];
  
  // Use proper date boundaries for more accurate comparison
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  console.log(`Filtering items by date range: ${start.toISOString()} to ${end.toISOString()}`);
  
  return items.filter(item => {
    if (!item) return false;
    
    try {
      // Try operation_date first, then fall back to created_at
      const dateStr = item[dateField] || item.operation_date || item.created_at || '';
      if (!dateStr) return false;
      
      const itemDate = new Date(dateStr);
      
      // Skip invalid dates
      if (isNaN(itemDate.getTime())) {
        console.log(`Skipping item with invalid date: ${dateStr}`);
        return false;
      }
      
      const isInRange = isWithinInterval(itemDate, { start, end });
      
      if (!isInRange) {
        // console.log(`Item with date ${itemDate.toISOString()} excluded - outside range`);
      }
      
      return isInRange;
    } catch (error) {
      console.error("Error filtering by date range:", error);
      return false;
    }
  });
};

/**
 * Generates last 30 days data with improved date validation
 */
export const generateLast30DaysData = (deposits: any[], withdrawals: any[], transfers: any[]) => {
  // Ensure all arrays are valid
  const safeDeposits = Array.isArray(deposits) ? deposits : [];
  const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];
  const safeTransfers = Array.isArray(transfers) ? transfers : [];
  
  // Pre-filter to remove invalid data
  const validDeposits = safeDeposits.filter(dep => dep && (isValidDate(dep.created_at) || isValidDate(dep.operation_date)));
  const validWithdrawals = safeWithdrawals.filter(w => w && (isValidDate(w.created_at) || isValidDate(w.operation_date)));
  const validTransfers = safeTransfers.filter(t => t && (isValidDate(t.created_at) || isValidDate(t.operation_date)));
  
  // Generate data for last 30 days
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'dd/MM');
    
    const dayDeposits = validDeposits.filter(dep => {
      try {
        const depDate = new Date(dep.created_at || dep.operation_date || '');
        return !isNaN(depDate.getTime()) && format(depDate, 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    const dayWithdrawals = validWithdrawals.filter(w => {
      try {
        const wDate = new Date(w.created_at || w.operation_date || '');
        return !isNaN(wDate.getTime()) && format(wDate, 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    const dayTransfers = validTransfers.filter(transfer => {
      try {
        const transferDate = new Date(transfer.operation_date || transfer.created_at || '');
        return !isNaN(transferDate.getTime()) && format(transferDate, 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    // Safely calculate totals
    const safeAmount = (val: unknown) => {
      const num = Number(val);
      return isNaN(num) ? 0 : Math.max(num, 0);
    };
    
    return {
      date: formattedDate,
      versements: dayDeposits.reduce((acc, dep) => acc + safeAmount(dep.amount), 0),
      retraits: dayWithdrawals.reduce((acc, w) => acc + safeAmount(w.amount), 0),
      virements: dayTransfers.reduce((acc, transfer) => acc + safeAmount(transfer.amount), 0),
      transactions: dayDeposits.length + dayWithdrawals.length + dayTransfers.length
    };
  }).reverse();
};

/**
 * Creates date range boundaries for filtering with proper day boundaries
 */
export const createDateRangeBoundaries = (dateRange: { from?: Date, to?: Date } | undefined) => {
  if (!dateRange?.from || !dateRange?.to) {
    return null;
  }
  
  return {
    start: startOfDay(dateRange.from),
    end: endOfDay(dateRange.to)
  };
};

/**
 * Checks if a date is within a date range with proper day boundaries
 */
export const isDateInRange = (date: Date | string, dateRange: { from?: Date, to?: Date } | undefined): boolean => {
  if (!dateRange?.from || !dateRange?.to) {
    return true; // No range provided means include all
  }
  
  try {
    const itemDate = new Date(date);
    
    // Skip invalid dates
    if (isNaN(itemDate.getTime())) {
      return false;
    }
    
    // Use proper date boundaries
    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);
    
    return isWithinInterval(itemDate, { start, end });
  } catch (error) {
    console.error("Error checking if date is in range:", error);
    return false;
  }
};
