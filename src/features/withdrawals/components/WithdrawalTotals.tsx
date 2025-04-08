
import { type Withdrawal } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface WithdrawalTotalsProps {
  withdrawals: Withdrawal[];
  paginatedWithdrawals: Withdrawal[];
  dateRangeText?: string;
}

export const WithdrawalTotals = ({ 
  withdrawals, 
  paginatedWithdrawals, 
  dateRangeText = "pour toute la période" 
}: WithdrawalTotalsProps) => {
  const { currency } = useCurrency();
  
  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  // Calculate total amounts
  const totalAllWithdrawals = withdrawals.reduce((acc, withdrawal) => acc + withdrawal.amount, 0);
  const totalPageWithdrawals = paginatedWithdrawals.reduce((acc, withdrawal) => acc + withdrawal.amount, 0);

  return (
    <div className="space-y-4 mt-6 bg-muted/30 p-4 rounded-lg border">
      <h3 className="font-medium">Résumé des montants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-muted">
          <div className="font-medium text-sm text-muted-foreground">Total par page</div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Retraits affichés:</span>
            <span className="font-medium px-3 py-1 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              {formatNumber(totalPageWithdrawals)} {currency}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Basé sur {paginatedWithdrawals.length} retraits affichés sur cette page
          </div>
        </div>
        
        <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-muted">
          <div className="font-medium text-sm text-muted-foreground">Total général {dateRangeText}</div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Tous les retraits:</span>
            <span className="font-medium px-3 py-1 rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              {formatNumber(totalAllWithdrawals)} {currency}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Basé sur {withdrawals.length} retraits au total
          </div>
        </div>
      </div>
    </div>
  );
};
