
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { formatId } from "@/utils/formatId";

interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}

export const OperationsDetailCards = ({
  clientOperations,
  formatAmount
}: OperationsDetailCardsProps) => {
  // Get the latest deposit, withdrawal, and transfer operations
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Versements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            Derniers versements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length > 0 ? (
            <ul className="space-y-2">
              {deposits.map(deposit => {
                const displayDate = deposit.operation_date || deposit.date;
                const operationId = isNaN(parseInt(deposit.id)) ? deposit.id : formatId(parseInt(deposit.id));
                
                return (
                  <li key={deposit.id} className="flex justify-between items-center py-1 border-b">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{operationId}</span>
                      </div>
                      <div className="text-sm">{format(new Date(displayDate), "dd/MM/yyyy")}</div>
                    </div>
                    <div className="text-green-600 font-medium">+{formatAmount(deposit.amount)}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun versement</p>
          )}
        </CardContent>
      </Card>

      {/* Retraits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            Derniers retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <ul className="space-y-2">
              {withdrawals.map(withdrawal => {
                const displayDate = withdrawal.operation_date || withdrawal.date;
                const operationId = isNaN(parseInt(withdrawal.id)) ? withdrawal.id : formatId(parseInt(withdrawal.id));
                
                return (
                  <li key={withdrawal.id} className="flex justify-between items-center py-1 border-b">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{operationId}</span>
                      </div>
                      <div className="text-sm">{format(new Date(displayDate), "dd/MM/yyyy")}</div>
                    </div>
                    <div className="text-red-600 font-medium">-{formatAmount(withdrawal.amount)}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun retrait</p>
          )}
        </CardContent>
      </Card>

      {/* Virements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-blue-500" />
            Derniers virements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length > 0 ? (
            <ul className="space-y-2">
              {transfers.map(transfer => {
                const displayDate = transfer.operation_date || transfer.date;
                const operationId = isNaN(parseInt(transfer.id)) ? transfer.id : formatId(parseInt(transfer.id));
                
                return (
                  <li key={transfer.id} className="flex justify-between items-center py-1 border-b">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{operationId}</span>
                      </div>
                      <div className="text-sm">{format(new Date(displayDate), "dd/MM/yyyy")}</div>
                      <div className="text-xs text-muted-foreground">
                        {transfer.fromClient} → {transfer.toClient}
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium">{formatAmount(transfer.amount)}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun virement</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
