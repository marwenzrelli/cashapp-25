
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { formatId } from "@/utils/formatId";
import { formatOperationId } from "@/features/operations/utils/display-helpers";

interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}

export const OperationsDetailCards = ({
  clientOperations,
  formatAmount
}: OperationsDetailCardsProps) => {
  console.log(`OperationsDetailCards - Total operations: ${clientOperations.length}`);
  
  // Get the latest deposit, withdrawal, and transfer operations
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);
  
  // Calculate totals for each operation type
  const depositTotal = clientOperations
    .filter(op => op.type === "deposit")
    .reduce((total, op) => total + op.amount, 0);
    
  const withdrawalTotal = clientOperations
    .filter(op => op.type === "withdrawal")
    .reduce((total, op) => total + op.amount, 0);
    
  const transferTotal = clientOperations
    .filter(op => op.type === "transfer")
    .reduce((total, op) => total + op.amount, 0);
  
  console.log(`Client operations summary - Deposits: ${deposits.length} (${depositTotal}), Withdrawals: ${withdrawals.length} (${withdrawalTotal}), Transfers: ${transfers.length} (${transferTotal})`);

  // Helper function to format date
  const formatDate = (date: string | Date) => {
    return typeof date === 'string' ? format(new Date(date), "dd/MM/yyyy") : format(date, "dd/MM/yyyy");
  };

  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Versements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ArrowUpCircle className="h-5 w-5 mr-2 text-green-500" />
            Versements récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length > 0 ? (
            <div className="space-y-3">
              {deposits.map(deposit => (
                <div key={deposit.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{formatDate(deposit.operation_date || deposit.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      #{formatOperationId(deposit.id.toString())}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">+{formatAmount(deposit.amount)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total ({clientOperations.filter(op => op.type === "deposit").length})</p>
                <p className="font-semibold text-green-600">+{formatAmount(depositTotal)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun versement récent</p>
          )}
        </CardContent>
      </Card>

      {/* Retraits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ArrowDownCircle className="h-5 w-5 mr-2 text-red-500" />
            Retraits récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map(withdrawal => (
                <div key={withdrawal.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{formatDate(withdrawal.operation_date || withdrawal.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      #{formatOperationId(withdrawal.id.toString())}
                    </p>
                  </div>
                  <span className="font-semibold text-red-600">-{formatAmount(withdrawal.amount)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total ({clientOperations.filter(op => op.type === "withdrawal").length})</p>
                <p className="font-semibold text-red-600">-{formatAmount(withdrawalTotal)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun retrait récent</p>
          )}
        </CardContent>
      </Card>

      {/* Virements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <RefreshCcw className="h-5 w-5 mr-2 text-blue-500" />
            Virements récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length > 0 ? (
            <div className="space-y-3">
              {transfers.map(transfer => (
                <div key={transfer.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{formatDate(transfer.operation_date || transfer.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      #{formatOperationId(transfer.id.toString())}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {transfer.fromClient} → {transfer.toClient}
                    </p>
                  </div>
                  <span className="font-semibold text-blue-600">{formatAmount(transfer.amount)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total ({clientOperations.filter(op => op.type === "transfer").length})</p>
                <p className="font-semibold text-blue-600">{formatAmount(transferTotal)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun virement récent</p>
          )}
        </CardContent>
      </Card>
    </div>;
};
