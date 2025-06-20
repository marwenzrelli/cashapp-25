
import { Operation } from "@/features/operations/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Wallet } from "lucide-react";

interface TreasuryTotalsProps {
  operations: Operation[];
  finalBalance: number; // Solde système réel
}

export const TreasuryTotals = ({ operations, finalBalance }: TreasuryTotalsProps) => {
  // Calculate totals
  const totalDeposits = operations
    .filter(op => op.type === "deposit")
    .reduce((sum, op) => sum + op.amount, 0);
    
  const totalWithdrawals = operations
    .filter(op => op.type === "withdrawal")
    .reduce((sum, op) => sum + op.amount, 0);
    
  const totalTransfers = operations
    .filter(op => op.type === "transfer")
    .reduce((sum, op) => sum + op.amount, 0);

  // Calcul du solde de trésorerie (uniquement basé sur les entrées et sorties réelles)
  const treasuryBalance = totalDeposits - totalWithdrawals;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium">Total Versements</p>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatAmount(totalDeposits)}</p>
          <p className="text-xs text-muted-foreground mt-1">Entrées de trésorerie</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium">Total Retraits</p>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatAmount(totalWithdrawals)}</p>
          <p className="text-xs text-muted-foreground mt-1">Sorties de trésorerie</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium">Total Virements</p>
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatAmount(totalTransfers)}</p>
          <p className="text-xs text-muted-foreground mt-1">Mouvements internes</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <p className="text-sm font-medium">Solde Système</p>
            <Wallet className="h-4 w-4 text-purple-500" />
          </div>
          <p className={cn(
            "text-2xl font-bold",
            finalBalance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatAmount(finalBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Solde trésorerie: {formatAmount(treasuryBalance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
