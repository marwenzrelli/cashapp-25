import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";
import { type StatsCardProps } from "../types";
import { cn } from "@/lib/utils";

export const StatsCard = ({ deposits }: StatsCardProps) => {
  const totalAmount = deposits.reduce((acc, deposit) => acc + deposit.amount, 0);

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Statistiques
        </CardTitle>
        <CardDescription>
          Suivez l'évolution des versements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className={cn(
            "font-medium",
            getAmountColor(totalAmount)
          )}>
            Total des versements: {totalAmount.toLocaleString()} TND
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
