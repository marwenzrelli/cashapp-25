
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BadgeDollarSign } from "lucide-react";
import { type Withdrawal } from "../types";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  withdrawals: Withdrawal[];
}

export const StatsCard = ({ withdrawals }: StatsCardProps) => {
  const totalAmount = withdrawals.reduce((acc, withdrawal) => acc + withdrawal.amount, 0);

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-primary" />
          Statistiques
        </CardTitle>
        <CardDescription>
          Suivez l'évolution des retraits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className={cn(
            "font-medium",
            getAmountColor(totalAmount)
          )}>
            Total des retraits: {totalAmount.toLocaleString()} TND
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
