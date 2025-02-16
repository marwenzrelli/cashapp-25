
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";
import { type StatsCardProps } from "../types";

export const StatsCard = ({ deposits }: StatsCardProps) => {
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
          <p className="font-medium">
            Total des versements: {deposits.reduce((acc, deposit) => acc + deposit.amount, 0)} TND
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
