
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
    <div className="space-y-3 w-full">
      {deposits.map((deposit) => {
        const operationId = typeof deposit.id === 'number' 
          ? formatId(deposit.id) 
          : deposit.id;
          
        return (
          <div 
            key={deposit.id.toString()} 
            className="bg-white dark:bg-gray-800/90 p-4 border-0 rounded-xl shadow-md w-full transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-xs font-mono text-muted-foreground/70 tracking-wide">{operationId}</span>
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
              <p className="mt-1.5 line-clamp-2 text-muted-foreground/80">{deposit.description}</p>
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
        <div className="mt-5 border-t border-primary/10 pt-4 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/80 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Total des versements {dateRangeText}:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {totalDeposits.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}
      
      {deposits.length === 0 && (
        <div className="text-center py-6 text-muted-foreground bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/30 backdrop-blur-sm">
          Aucun versement trouvé
        </div>
      )}
    </div>
  );
};
