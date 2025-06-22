
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CalendarClock, TrendingUp, TrendingDown, Hash } from "lucide-react";

interface AccountFlowMobileViewProps {
  operations: (Operation & { balanceBefore: number; balanceAfter: number; balanceChange: number })[];
  isPublicView?: boolean;
  clientId?: number;
}

export const AccountFlowMobileView = ({ operations, isPublicView = false, clientId }: AccountFlowMobileViewProps) => {
  const { currency } = useCurrency();

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return Math.abs(amount).toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const getAmountClass = (balanceChange: number) => {
    if (balanceChange > 0) return "text-green-600 dark:text-green-400";
    if (balanceChange < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getAmountDisplay = (op: any) => {
    const sign = op.balanceChange >= 0 ? "+" : "-";
    return `${sign} ${formatAmount(Math.abs(op.balanceChange))} TND`;
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  return (
    <div className="md:hidden space-y-3 p-4">
      {operations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucune opération trouvée</p>
          </CardContent>
        </Card>
      ) : (
        operations.map((op, index) => (
          <Card key={op.id} className="shadow-sm border-l-4 border-l-primary/20">
            <CardContent className="p-4 space-y-4">
              {/* Header with operation number, type and date */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1.5 px-2 py-1`}>
                      {getTypeIcon(op.type)}
                      <span className="text-xs font-medium">{getTypeLabel(op.type)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">ID: {op.id.toString().split('-')[1] || op.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <CalendarClock className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground text-right leading-tight">
                    {formatDateTime(op.operation_date || op.date)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {op.description && (
                <div className="bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 rounded-lg">
                  <p className="text-sm text-muted-foreground">{op.description}</p>
                </div>
              )}

              {/* Financial details */}
              <div className="space-y-3 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/20 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Solde avant</span>
                    <div className={`text-sm font-semibold ${getBalanceClass(op.balanceBefore)}`}>
                      {formatAmount(op.balanceBefore)} TND
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Variation</span>
                    <div className={`text-sm font-semibold flex items-center gap-1 ${getAmountClass(op.balanceChange)}`}>
                      {op.balanceChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {getAmountDisplay(op)}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Solde après</span>
                    <span className={`text-lg font-bold ${getBalanceClass(op.balanceAfter)}`}>
                      {formatAmount(op.balanceAfter)} TND
                    </span>
                  </div>
                </div>
              </div>
              
              {!isPublicView && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {/* Action buttons for private view - currently empty but can be added */}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
