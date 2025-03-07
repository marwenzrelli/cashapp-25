
import { Operation } from "@/features/operations/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatOperationAmount, getOperationTypeIcon } from "./utils";
import React from "react";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";

interface OperationsMobileCardProps {
  operation: Operation;
  currency: string;
  renderActions?: (operation: Operation) => React.ReactNode;
  colorClass?: string;
  formatAmount?: (amount: number) => string;
}

export const OperationsMobileCard = ({ 
  operation, 
  currency,
  renderActions,
  colorClass,
  formatAmount
}: OperationsMobileCardProps) => {
  // Custom or default formatting based on props
  const renderAmount = () => {
    if (formatAmount) {
      return (
        <div className={colorClass || ""}>
          {operation.type === "withdrawal" ? "-" : "+"}
          {formatAmount(Math.abs(operation.amount))}
        </div>
      );
    }
    return formatOperationAmount(operation, currency);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{operation.date}</span>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="flex items-center gap-1">
                {getOperationTypeIcon(operation.type)}
                <span className="capitalize">
                  {operation.type === "deposit"
                    ? "Versement"
                    : operation.type === "withdrawal"
                    ? "Retrait"
                    : "Virement"}
                </span>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            {renderAmount()}
          </div>
        </div>

        <div>
          <p className="text-sm mb-1">{operation.description}</p>
          {operation.type === "transfer" && (
            <div className="text-xs text-muted-foreground">
              <div>De: {operation.fromClient}</div>
              <div>À: {operation.toClient}</div>
            </div>
          )}
        </div>

        {renderActions && (
          <div className="mt-3 border-t pt-2 flex justify-end">
            {renderActions(operation)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
