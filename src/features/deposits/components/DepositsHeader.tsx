
import { StatsCard } from "@/features/deposits/components/StatsCard";
import { SearchBar } from "@/features/deposits/components/SearchBar";
import { type Deposit } from "@/components/deposits/types";

interface DepositsHeaderProps {
  deposits: Deposit[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  onNewDeposit: () => void;
  filteredDeposits: Deposit[];
}

export const DepositsHeader = ({
  deposits,
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  onNewDeposit,
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

      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard deposits={deposits} />
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          onNewDeposit={onNewDeposit}
          totalDeposits={filteredDeposits.length}
        />
      </div>
    </>
  );
};
