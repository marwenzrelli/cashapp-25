
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowLeftRight, 
  UserCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface StatisticsCardsProps {
  totalDeposits: number;
  totalWithdrawals: number;
  sentTransfers: number;
  transferCount: number;
  netFlow: number;
  clientCount: number;
  percentageChange: number;
  averageTransactionsPerDay: number;
  // Ajouter les montants réels
  totalDepositsAmount?: number;
  totalWithdrawalsAmount?: number;
  depositsCount?: number;
  withdrawalsCount?: number;
}

export const StatisticsCards = ({
  totalDeposits,
  totalWithdrawals,
  sentTransfers,
  transferCount,
  netFlow,
  clientCount,
  percentageChange,
  averageTransactionsPerDay,
  totalDepositsAmount,
  totalWithdrawalsAmount,
  depositsCount,
  withdrawalsCount
}: StatisticsCardsProps) => {
  const { currency } = useCurrency();

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getPercentageColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  // Utiliser les montants réels si disponibles, sinon les totaux existants
  const depositsAmount = totalDepositsAmount || totalDeposits;
  const withdrawalsAmount = totalWithdrawalsAmount || totalWithdrawals;
  const depositsOpsCount = depositsCount || totalDeposits;
  const withdrawalsOpsCount = withdrawalsCount || totalWithdrawals;

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Entrées Totales</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            getAmountColor(depositsAmount)
          )}>
            {depositsAmount.toLocaleString()} {currency}
          </div>
          <p className="text-xs text-muted-foreground">
            {depositsOpsCount} versements • 
            <span className={getPercentageColor(percentageChange)}>
              {percentageChange > 0 ? '+' : ''}{Math.abs(percentageChange).toFixed(1)}%
            </span>
            {' '}vs mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Sorties Totales</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-danger" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            getAmountColor(-withdrawalsAmount)
          )}>
            {withdrawalsAmount.toLocaleString()} {currency}
          </div>
          <p className="text-xs text-muted-foreground">
            {withdrawalsOpsCount} retraits • 
            <span className={getPercentageColor(-percentageChange)}>
              {percentageChange > 0 ? '+' : ''}{Math.abs(percentageChange).toFixed(1)}%
            </span>
            {' '}vs mois dernier
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Virements</CardTitle>
          <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            getAmountColor(sentTransfers)
          )}>
            {sentTransfers.toLocaleString()} {currency}
          </div>
          <p className="text-xs text-muted-foreground">
            {transferCount} virements effectués
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Flux Net</CardTitle>
          {netFlow >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            getAmountColor(netFlow)
          )}>
            {netFlow.toLocaleString()} {currency}
          </div>
          <p className="text-xs text-muted-foreground">
            Entrées Totales - Sorties Totales
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
          <UserCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientCount}</div>
          <p className="text-xs text-muted-foreground">
            {averageTransactionsPerDay.toFixed(1)} transactions/jour
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
