
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

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

export const filterByDateRange = (items: any[], startDate: Date, endDate: Date, dateField: string = 'created_at') => {
  return items.filter(item => {
    try {
      const itemDate = new Date(item[dateField] || item.operation_date || '');
      return !isNaN(itemDate.getTime()) && itemDate >= startDate && itemDate <= endDate;
    } catch (error) {
      console.warn("Invalid date:", item[dateField] || item.operation_date);
      return false;
    }
  });
};

export const generateLast30DaysData = (deposits: any[], withdrawals: any[], transfers: any[]) => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'dd/MM');
    
    const dayDeposits = deposits.filter(dep => {
      try {
        return format(new Date(dep.created_at || dep.operation_date || ''), 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    const dayWithdrawals = withdrawals.filter(w => {
      try {
        return format(new Date(w.created_at || w.operation_date || ''), 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    const dayTransfers = transfers.filter(transfer => {
      try {
        const transferDate = new Date(transfer.operation_date || transfer.created_at || '');
        return !isNaN(transferDate.getTime()) && 
          format(transferDate, 'dd/MM') === formattedDate;
      } catch (error) {
        return false;
      }
    });
    
    return {
      date: formattedDate,
      versements: dayDeposits.reduce((acc, dep) => acc + Math.max(dep.amount, 0), 0),
      retraits: dayWithdrawals.reduce((acc, w) => acc + w.amount, 0),
      virements: dayTransfers.reduce((acc, transfer) => acc + transfer.amount, 0),
      transactions: dayDeposits.length + dayWithdrawals.length + dayTransfers.length
    };
  }).reverse();
};
