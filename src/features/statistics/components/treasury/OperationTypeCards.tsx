
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Hash } from "lucide-react";

interface OperationTypeCardsProps {
  operations: Operation[];
}

export const OperationTypeCards = ({ operations }: OperationTypeCardsProps) => {
  // Calculs par type d'opération
  const deposits = operations.filter(op => op.type === "deposit");
  const withdrawals = operations.filter(op => op.type === "withdrawal");
  const transfers = operations.filter(op => op.type === "transfer");

  const totalDeposits = deposits.reduce((sum, op) => sum + op.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, op) => sum + op.amount, 0);
  const totalTransfers = transfers.reduce((sum, op) => sum + op.amount, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            Versements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{deposits.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatAmount(totalDeposits)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            Retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{withdrawals.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatAmount(totalWithdrawals)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
            Virements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{transfers.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatAmount(totalTransfers)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4 text-purple-500" />
            Total Opérations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{operations.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Toutes opérations
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
