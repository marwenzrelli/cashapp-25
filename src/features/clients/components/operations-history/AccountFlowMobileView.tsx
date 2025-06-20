
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AccountFlowMobileViewProps {
  operations: (Operation & { balanceBefore: number; balanceAfter: number })[];
  isPublicView?: boolean;
  clientId?: number;
}

export const AccountFlowMobileView = ({ operations, isPublicView = false, clientId }: AccountFlowMobileViewProps) => {
  const { currency } = useCurrency();

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
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

  const getAmountClass = (op: any) => {
    if (op.type === "deposit") return "text-green-600 dark:text-green-400";
    if (op.type === "withdrawal") return "text-red-600 dark:text-red-400";
    if (op.type === "direct_transfer" || op.type === "transfer") {
      const isReceiving = op.to_client_id === clientId;
      return isReceiving ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    }
    return "";
  };

  const getAmountDisplay = (op: any) => {
    // For direct transfers and transfers, show + or - based on whether client receives or sends
    if (op.type === "direct_transfer" || op.type === "transfer") {
      const isReceiving = op.to_client_id === clientId;
      return `${isReceiving ? "" : "- "}${formatAmount(op.amount)} TND`;
    } else if (op.type === "withdrawal") {
      return `- ${formatAmount(op.amount)} TND`;
    } else {
      return `${formatAmount(op.amount)} TND`;
    }
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  return (
    <div className="md:hidden space-y-4 p-4">
      {operations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucune opération trouvée</p>
          </CardContent>
        </Card>
      ) : (
        operations.map((op) => (
          <Card key={op.id} className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                    {getTypeIcon(op.type)}
                    {getTypeLabel(op.type)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    ID: {op.id.toString().split('-')[1] || op.id}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(op.operation_date || op.date)}
                </p>
              </div>

              {op.description && (
                <p className="text-sm text-muted-foreground">{op.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Solde avant:</span>
                  <span className={`text-sm font-medium ${getBalanceClass(op.balanceBefore)}`}>
                    {formatAmount(op.balanceBefore)} TND
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Montant:</span>
                  <span className={`text-sm font-medium ${getAmountClass(op)}`}>
                    {getAmountDisplay(op)}
                  </span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Solde après:</span>
                  <span className={`text-sm font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                    {formatAmount(op.balanceAfter)} TND
                  </span>
                </div>
              </div>
              
              {!isPublicView && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {/* Boutons d'action pour la vue privée - actuellement vides mais peuvent être ajoutés */}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
