
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Users, 
  Send, 
  ArrowLeftRight, 
  Wallet 
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardStats } from "../types";

interface StatsCardGridProps {
  stats: DashboardStats;
  currency: string;
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export const StatsCardGrid = ({ 
  stats, 
  currency, 
  onRecalculate, 
  isRecalculating 
}: StatsCardGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full px-2 sm:px-0">
      <StatsCard
        title="Solde Général"
        value={`${stats.total_balance.toLocaleString()} ${currency}`}
        subtitle="Total des soldes clients"
        icon={<Wallet className="h-4 w-4 text-blue-600" />}
        gradientFrom="blue"
        onRecalculate={onRecalculate}
        isRecalculating={isRecalculating}
      />

      <StatsCard
        title="Virements Émis"
        value={`${stats.sent_transfers.toLocaleString()} ${currency}`}
        subtitle="Total des virements envoyés"
        icon={<Send className="h-4 w-4 text-amber-600" />}
        gradientFrom="amber"
      />

      <StatsCard
        title="Virements Reçus"
        value={`${stats.received_transfers.toLocaleString()} ${currency}`}
        subtitle="Total des virements reçus"
        icon={<ArrowLeftRight className="h-4 w-4 text-purple-600" />}
        gradientFrom="purple"
      />

      <StatsCard
        title="Total Versements"
        value={`${stats.total_deposits.toLocaleString()} ${currency}`}
        subtitle={`${stats.monthly_stats[0]?.deposit_count || 0} versements ce mois`}
        icon={<ArrowUpCircle className="h-4 w-4 text-success" />}
        gradientFrom="green"
      />

      <StatsCard
        title="Total Retraits"
        value={`${stats.total_withdrawals.toLocaleString()} ${currency}`}
        subtitle={`${stats.monthly_stats[0]?.withdrawal_count || 0} retraits ce mois`}
        icon={<ArrowDownCircle className="h-4 w-4 text-danger" />}
        gradientFrom="red"
      />

      <StatsCard
        title="Clients Actifs"
        value={stats.client_count}
        subtitle={`${stats.transfer_count} transferts effectués`}
        icon={<Users className="h-4 w-4 text-primary" />}
        gradientFrom="blue"
      />
    </div>
  );
};
