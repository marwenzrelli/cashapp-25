
import { type Deposit } from "@/components/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatId } from "@/utils/formatId";
import { Hash } from "lucide-react";

interface MobileDepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
  dateRange?: DateRange;
}

export const MobileDepositsTable = ({ 
  deposits, 
  onEdit, 
  onDelete,
  dateRange
}: MobileDepositsTableProps) => {
  // Get currency formatting from context
  const { currency } = useCurrency();
  
  // Calculate total deposit amount
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);

  // Format date range for display - convert Date objects to ISO strings first
  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}`
    : "pour toute la période";

  return (
    <div className="space-y-4 w-full">
      {deposits.map((deposit) => {
        const operationId = typeof deposit.id === 'number' 
          ? formatId(deposit.id) 
          : deposit.id;
          
        return (
          <div 
            key={deposit.id.toString()} 
            className="bg-gradient-to-br from-gray-50 to-gray-100/95 dark:from-gray-800/95 dark:to-gray-850/90 p-4 border border-gray-200/60 dark:border-gray-700/40 rounded-xl shadow-sm hover:shadow-md w-full transition-all duration-300 hover:translate-y-[-3px] backdrop-blur-sm animate-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/60 px-2 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/30">
                <Hash className="h-3.5 w-3.5 text-gray-500/90 dark:text-gray-400/90" />
                <span className="text-xs font-mono text-gray-600/90 dark:text-gray-300/90 tracking-wide">{operationId}</span>
              </div>
              <div className="flex items-center">
                <DepositAmount amount={deposit.amount} />
              </div>
            </div>
            
            <div className="mb-3">
              <DepositClientInfo 
                clientName={deposit.client_name} 
                depositId={deposit.id}
                clientId={deposit.client_id}
              />
            </div>
            
            <div className="text-sm text-muted-foreground mb-3 px-2">
              <div className="flex items-center gap-1 mb-1.5">
                <DepositDateInfo deposit={deposit} />
              </div>
              <p className="mt-1.5 line-clamp-2 text-gray-600/90 dark:text-gray-300/80 bg-gray-50/90 dark:bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-100/50 dark:border-gray-700/30">{deposit.description}</p>
            </div>
            
            <div className="flex justify-end">
              <DepositActions 
                deposit={deposit} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                isMobile={true} 
              />
            </div>
          </div>
        );
      })}
      
      {/* Total section for mobile */}
      {deposits.length > 0 && (
        <div className="mt-5 border-t border-gray-200/50 dark:border-gray-700/30 pt-4 bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-800/90 dark:to-gray-850/80 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm text-gray-700/90 dark:text-gray-300/90">Total des versements {dateRangeText}:</span>
            <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-100/50 dark:border-green-800/30">
              {totalDeposits.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}
      
      {deposits.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-850/60 rounded-lg border border-gray-200/50 dark:border-gray-700/30 backdrop-blur-sm">
          Aucun versement trouvé
        </div>
      )}
    </div>
  );
};
