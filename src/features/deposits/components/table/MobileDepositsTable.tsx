
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
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  // Track which deposit is expanded
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  
  // Calculate total deposit amount
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);

  // Format date range for display - convert Date objects to ISO strings first
  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}`
    : "pour toute la période";

  // Toggle expanded deposit
  const toggleExpanded = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 w-full">
      {deposits.map((deposit) => {
        const operationId = typeof deposit.id === 'number' 
          ? formatId(deposit.id) 
          : deposit.id;
        
        const isExpanded = expandedId === deposit.id;
          
        return (
          <Collapsible 
            key={deposit.id.toString()} 
            open={isExpanded}
            onOpenChange={() => toggleExpanded(deposit.id)}
            className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800/95 dark:to-purple-900/10 p-4 border border-purple-100/40 dark:border-purple-800/20 rounded-xl shadow-sm hover:shadow-md w-full transition-all duration-300 hover:translate-y-[-2px] backdrop-blur-sm animate-in"
          >
            <CollapsibleTrigger className="w-full text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 bg-purple-50/80 dark:bg-purple-900/30 px-2 py-1 rounded-md">
                    <Hash className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-xs font-mono text-primary/70 tracking-wide">{operationId}</span>
                  </div>
                  <div className="flex items-center">
                    <DepositAmount amount={deposit.amount} />
                  </div>
                </div>
                
                <div className="mb-2">
                  <DepositClientInfo 
                    clientName={deposit.client_name} 
                    depositId={deposit.id}
                    clientId={deposit.client_id}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DepositDateInfo deposit={deposit} />
                  </div>
                  <p className={`line-clamp-2 text-muted-foreground/80 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg mt-1 ${isExpanded ? 'line-clamp-none' : ''}`}>
                    {deposit.description}
                  </p>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-2 animate-accordion-down">
              <div className="flex justify-end">
                <DepositActions 
                  deposit={deposit} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  isMobile={true} 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      
      {/* Total section for mobile */}
      {deposits.length > 0 && (
        <div className="mt-5 border-t border-primary/10 pt-4 bg-gradient-to-br from-white to-purple-50/80 dark:from-gray-800/90 dark:to-purple-900/20 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm text-primary/80">Total des versements {dateRangeText}:</span>
            <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/20 px-3 py-1 rounded-lg">
              {totalDeposits.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      )}
      
      {deposits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-gradient-to-br from-white/70 to-purple-50/50 dark:from-gray-800/70 dark:to-gray-800/40 rounded-lg border border-gray-100/70 dark:border-gray-700/30 backdrop-blur-sm">
          Aucun versement trouvé
        </div>
      )}
    </div>
  );
};
