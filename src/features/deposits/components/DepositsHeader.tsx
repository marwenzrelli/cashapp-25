
import { StatsCard } from "@/features/deposits/components/StatsCard";
import { type Deposit } from "@/components/deposits/types";

interface DepositsHeaderProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
}

export const DepositsHeader = ({
  deposits,
  filteredDeposits
}: DepositsHeaderProps) => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Gestion des versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements de vos clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <StatsCard deposits={deposits} />
      </div>
    </>
  );
};
