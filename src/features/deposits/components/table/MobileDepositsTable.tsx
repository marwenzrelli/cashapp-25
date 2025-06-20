
import { type Deposit } from "@/components/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatId } from "@/utils/formatId";
import { Hash, CalendarClock, User, FileText } from "lucide-react";
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
  const { currency } = useCurrency();
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);

  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}`
    : "pour toute la période";

  const toggleExpanded = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3 w-full p-4">
      {deposits.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 p-3 rounded-lg border border-green-200/30 dark:border-green-800/20 mb-4">
          <div className="text-xs text-green-700 dark:text-green-300 mb-1 font-medium">
            {deposits.length} versement{deposits.length > 1 ? 's' : ''} trouvé{deposits.length > 1 ? 's' : ''}
          </div>
          <div className="text-sm font-semibold text-green-800 dark:text-green-200">
            Total: {totalDeposits.toLocaleString()} {currency}
          </div>
        </div>
      )}

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
            className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800/95 dark:to-green-900/10 p-4 border border-green-100/40 dark:border-green-800/20 rounded-xl shadow-sm hover:shadow-md w-full transition-all duration-300 hover:translate-y-[-1px] backdrop-blur-sm"
          >
            <CollapsibleTrigger className="w-full text-left">
              <div className="space-y-3">
                {/* Header with ID and amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-green-50/80 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                    <Hash className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-xs font-mono text-primary/70 tracking-wide">{operationId}</span>
                  </div>
                  <div className="text-right">
                    <DepositAmount amount={deposit.amount} />
                  </div>
                </div>
                
                {/* Client info */}
                <div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <DepositClientInfo 
                    clientName={deposit.client_name} 
                    depositId={deposit.id}
                    clientId={deposit.client_id}
                  />
                </div>
                
                {/* Date info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 rounded-lg">
                  <CalendarClock className="h-4 w-4" />
                  <DepositDateInfo deposit={deposit} />
                </div>

                {/* Description preview */}
                {deposit.description && (
                  <div className="flex items-start gap-2 bg-orange-50/50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <p className={`text-sm text-muted-foreground/80 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {deposit.description}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-4 animate-accordion-down">
              <div className="border-t pt-3">
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
      
      {deposits.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/30">
            <p className="text-muted-foreground text-base">Aucun versement trouvé</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Essayez d'ajuster vos filtres de recherche</p>
          </div>
        </div>
      )}
    </div>
  );
};
