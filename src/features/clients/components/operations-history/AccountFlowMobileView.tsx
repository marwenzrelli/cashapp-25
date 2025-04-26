
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AccountFlowMobileViewProps {
  operations: Operation[];
}

export const AccountFlowMobileView = ({ operations }: AccountFlowMobileViewProps) => {
  // Sort operations from newest to oldest
  const displayOperations = operations.sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getAmountClass = (type: string) => {
    if (type === "deposit") return "text-green-600 font-medium";
    if (type === "withdrawal") return "text-red-600 font-medium";
    if (type === "transfer") return "text-blue-600 font-medium";
    return "font-medium";
  };

  if (displayOperations.length === 0) {
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
      <ScrollArea className="h-[600px]">
        {displayOperations.map((op) => (
          <Card key={op.id} className="mb-3 shadow-sm">
            <CardContent className="p-4">
              {/* Header with Date, ID and Type */}
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">
                      {formatDateTime(op.operation_date || op.date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {op.id.toString().split('-')[1] || op.id}
                    </div>
                  </div>
                  <Badge className={`${getTypeStyle(op.type)} flex items-center gap-1`}>
                    {getTypeIcon(op.type)}
                    {getTypeLabel(op.type)}
                  </Badge>
                </div>
              </div>

              {/* Balance Information */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Solde avant</span>
                  <span className="font-medium">{formatAmount(op.balanceBefore)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Montant</span>
                  <span className={getAmountClass(op.type)}>
                    {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">Solde après</span>
                  <span className="font-bold">{formatAmount(op.balanceAfter)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
};
