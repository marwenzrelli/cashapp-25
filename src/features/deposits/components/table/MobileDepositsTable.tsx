
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
    <div className="space-y-2 w-full">
      {deposits.map((deposit) => {
        const operationId = isNaN(parseInt(deposit.id)) ? deposit.id : formatId(parseInt(deposit.id));
        return (
          <div 
            key={deposit.id} 
            className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-sm w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">{operationId}</span>
              </div>
              <div className="flex items-center">
                <DepositAmount amount={deposit.amount} />
              </div>
            </div>
            
            <div className="mb-2">
              <DepositClientInfo 
                clientName={deposit.client_name} 
                depositId={deposit.id} 
              />
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1 mb-1">
                <DepositDateInfo deposit={deposit} />
              </div>
              <p className="mt-1 line-clamp-2">{deposit.description}</p>
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
        <div className="mt-4 border-t-2 border-primary/20 pt-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des versements {dateRangeText}:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {totalDeposits.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}
      
      {deposits.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Aucun versement trouvé
        </div>
      )}
    </div>
  );
};
