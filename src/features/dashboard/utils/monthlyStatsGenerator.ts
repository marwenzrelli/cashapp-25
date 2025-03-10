
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const generateMonthlyStats = async () => {
  try {
    const today = new Date();
    const monthlyData = [];

    for (let i = 0; i < 12; i++) {
      const month = subMonths(today, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthLabel = format(month, 'MMM');
      const startStr = monthStart.toISOString();
      const endStr = monthEnd.toISOString();
      
      const { data: monthDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .eq('status', 'completed');
        
      if (depositsError) throw depositsError;
      
      const { data: monthWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .eq('status', 'completed');
        
      if (withdrawalsError) throw withdrawalsError;
      
      const total_deposits = monthDeposits?.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) || 0;
      const total_withdrawals = monthWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;
      
      monthlyData.unshift({
        day: monthLabel,
        total_deposits,
        total_withdrawals,
        deposits_count: monthDeposits?.length || 0,
        withdrawals_count: monthWithdrawals?.length || 0
      });
    }
    
    return monthlyData;
  } catch (error) {
    console.error("Error generating monthly stats:", error);
    return [];
  }
};
