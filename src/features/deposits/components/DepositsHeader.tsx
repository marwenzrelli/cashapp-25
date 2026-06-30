
import { StatsCard } from "@/features/deposits/components/StatsCard";
import { type Deposit } from "@/features/deposits/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DepositsHeaderProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
  isLoading?: boolean;
}

export const DepositsHeader = ({
  deposits,
  filteredDeposits,
  isLoading = false
}: DepositsHeaderProps) => {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Versements</h1>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <StatsCard deposits={deposits} />
      )}
    </div>
  );
};
