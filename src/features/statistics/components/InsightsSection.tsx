
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BanknoteIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InsightsSectionProps {
  percentageChange: number;
  averageTransactionsPerDay: number;
  totalDeposits: number;
  depositsLength: number;
}

export const InsightsSection = ({
  percentageChange,
  averageTransactionsPerDay,
  totalDeposits,
  depositsLength
}: InsightsSectionProps) => {
  const { currency } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className={cn(
            "p-4 rounded-lg border",
            percentageChange >= 0 
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-red-200 bg-red-50 dark:bg-red-955/20"
          )}>
            <div className="flex items-start gap-3">
              {percentageChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {percentageChange >= 0 ? "Croissance" : "Décroissance"} mensuelle
                </p>
                <p className="text-sm mt-1">
                  {Math.abs(percentageChange).toFixed(1)}% de {percentageChange >= 0 ? "hausse" : "baisse"} 
                  par rapport au mois précédent
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Activité journalière</p>
                <p className="text-sm mt-1">
                  En moyenne {averageTransactionsPerDay.toFixed(1)} transactions par jour
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <div className="flex items-start gap-3">
              <BanknoteIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Transaction moyenne</p>
                <p className="text-sm mt-1">
                  {depositsLength > 0 ? (totalDeposits / depositsLength).toFixed(0) : 0} {currency} par opération
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
