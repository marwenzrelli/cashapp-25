
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Hash } from "lucide-react";
import { DashboardStats } from "../types";

interface OperationTypeCardsProps {
  stats: DashboardStats;
  currency: string;
}

export const OperationTypeCards = ({ stats, currency }: OperationTypeCardsProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            Versements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.total_deposits || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Montant total: {formatAmount(stats.total_deposits || 0)}
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
          <div className="text-2xl font-bold text-red-600">{stats.total_withdrawals || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Montant total: {formatAmount(stats.total_withdrawals || 0)}
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
          <div className="text-2xl font-bold text-blue-600">{stats.transfer_count || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Montant total: {formatAmount(stats.sent_transfers || 0)}
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
          <div className="text-2xl font-bold text-purple-600">
            {(stats.total_deposits || 0) + (stats.total_withdrawals || 0) + (stats.transfer_count || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Toutes opérations confondues
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
