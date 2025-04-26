
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFormatAmount } from "@/hooks/use-format-amount";

interface AccountFlowMobileViewProps {
  operations: (Operation & { balanceBefore: number, balanceAfter: number })[];
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AccountFlowMobileView = ({ operations, updateOperation }: AccountFlowMobileViewProps) => {
  const isMobile = useIsMobile();
  const { formatAmount } = useFormatAmount();
  const operationsWithBalance = operations;

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const getAmountClass = (type: string) => {
    if (type === "deposit") return "text-green-600 font-medium";
    if (type === "withdrawal") return "text-red-600 font-medium";
    if (type === "transfer") return "text-blue-600 font-medium";
    return "font-medium";
  };

  const handleCardClick = (op: Operation & { balanceBefore: number, balanceAfter: number }) => {
    if (updateOperation) {
      updateOperation(op);
    }
  };

  if (operationsWithBalance.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-center">
          Aucune opération trouvée
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      <ScrollArea 
        className="w-full" 
        style={{ 
          height: isMobile ? 'calc(100vh - 280px)' : '600px',
          minHeight: '400px',
          maxHeight: '80vh'
        }}
      >
        <div className="px-1 py-1">
          {operationsWithBalance.map((op: any) => (
            <Card 
              key={op.id} 
              className="mb-3 border shadow-sm" 
              onClick={() => updateOperation ? handleCardClick(op) : undefined}
            >
              <CardContent className="p-3">
                <div className="flex flex-col space-y-2 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">
                        {formatDateTime(op.operation_date || op.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {op.id.toString().split('-')[1] || op.id}
                      </div>
                    </div>
                    <Badge className={`${getTypeStyle(op.type)} flex items-center gap-1 whitespace-nowrap`}>
                      {getTypeIcon(op.type)}
                      {getTypeLabel(op.type)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-0.5">Solde avant</span>
                    <span className="font-medium text-xs">{formatAmount(op.balanceBefore)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-0.5">Montant</span>
                    <span className={`${getAmountClass(op.type)} text-xs`}>
                      {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-0.5">Solde après</span>
                    <span className="font-bold text-xs">{formatAmount(op.balanceAfter)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
