
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
  const deposits = clientOperations.filter(op => op.type === "deposit");
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal");
  const transfers = clientOperations.filter(op => op.type === "transfer");
  
  // Calculate totals for each operation type
  const totalDeposits = deposits.reduce((sum, op) => sum + op.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, op) => sum + op.amount, 0);
  const totalTransfers = transfers.reduce((sum, op) => sum + op.amount, 0);
  
  // Get the latest 3 operations of each type for display
  const latestDeposits = deposits.slice(0, 3);
  const latestWithdrawals = withdrawals.slice(0, 3);
  const latestTransfers = transfers.slice(0, 3);

  // Special debug for client ID 4
  console.log(`OperationsDetailCards - Total operations: ${clientOperations.length}`);
  console.log(`Deposits: ${deposits.length}, Withdrawals: ${withdrawals.length}, Transfers: ${transfers.length}`);
  console.log(`Missing IDs check: ${clientOperations.filter(op => [72,73,74,75,76,77,78].includes(Number(op.id))).map(op => op.id).join(', ')}`);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Versements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <ArrowUpCircle className="mr-2 h-5 w-5 text-green-500" />
              Dépôts
            </span>
            <span className="text-green-600 dark:text-green-400">
              {formatAmount(totalDeposits)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestDeposits.length > 0 ? (
            <div className="space-y-2">
              {latestDeposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      #{typeof deposit.id === 'number' ? formatId(deposit.id) : deposit.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(deposit.operation_date || deposit.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{formatAmount(deposit.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun dépôt récent</p>
          )}
          <div className="mt-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total ({deposits.length})</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {formatAmount(totalDeposits)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retraits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <ArrowDownCircle className="mr-2 h-5 w-5 text-red-500" />
              Retraits
            </span>
            <span className="text-red-600 dark:text-red-400">
              {formatAmount(totalWithdrawals)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestWithdrawals.length > 0 ? (
            <div className="space-y-2">
              {latestWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      #{typeof withdrawal.id === 'number' ? formatId(withdrawal.id) : withdrawal.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(withdrawal.operation_date || withdrawal.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    -{formatAmount(withdrawal.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun retrait récent</p>
          )}
          <div className="mt-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total ({withdrawals.length})</span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {formatAmount(totalWithdrawals)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Virements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <RefreshCcw className="mr-2 h-5 w-5 text-blue-500" />
              Virements
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatAmount(totalTransfers)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestTransfers.length > 0 ? (
            <div className="space-y-2">
              {latestTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      #{typeof transfer.id === 'number' ? formatId(transfer.id) : transfer.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(transfer.operation_date || transfer.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatAmount(transfer.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun virement récent</p>
          )}
          <div className="mt-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total ({transfers.length})</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {formatAmount(totalTransfers)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
