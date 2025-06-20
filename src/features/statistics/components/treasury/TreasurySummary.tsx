
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Calculator, Hash } from "lucide-react";

interface TreasurySummaryProps {
  operations: Operation[];
  finalTreasuryBalance: number;
}

export const TreasurySummary = ({ operations, finalTreasuryBalance }: TreasurySummaryProps) => {
  // Calculs détaillés
  const deposits = operations.filter(op => op.type === "deposit");
  const withdrawals = operations.filter(op => op.type === "withdrawal");
  const transfers = operations.filter(op => op.type === "transfer");

  const totalDeposits = deposits.reduce((sum, op) => sum + op.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, op) => sum + op.amount, 0);
  const totalTransfers = transfers.reduce((sum, op) => sum + op.amount, 0);

  // Calcul de la différence de trésorerie
  const treasuryBalance = totalDeposits - totalWithdrawals;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Résumé des opérations</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
                Versements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatAmount(totalDeposits)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {deposits.length} opération{deposits.length > 1 ? 's' : ''}
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
              <div className="text-2xl font-bold text-red-600">{formatAmount(totalWithdrawals)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {withdrawals.length} opération{withdrawals.length > 1 ? 's' : ''}
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
              <div className="text-2xl font-bold text-blue-600">{formatAmount(totalTransfers)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {transfers.length} opération{transfers.length > 1 ? 's' : ''}
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-orange-500" />
                Solde Trésorerie Calculé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                treasuryBalance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatAmount(treasuryBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Versements - Retraits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-slate-500" />
                Solde Final Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                finalTreasuryBalance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatAmount(finalTreasuryBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Solde réel du système
              </p>
            </CardContent>
          </Card>
        </div>

        {Math.abs(treasuryBalance - finalTreasuryBalance) > 0.01 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Différence détectée</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Différence de {formatAmount(Math.abs(treasuryBalance - finalTreasuryBalance))} entre le calcul théorique et le solde système.
              Vérifiez les opérations pour identifier les écarts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
