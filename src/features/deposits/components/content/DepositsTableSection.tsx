
import { Deposit } from "@/features/deposits/types"; // Use consistent type
import { DepositsTable } from "@/features/deposits/components/DepositsTable";
import { Skeleton } from "@/components/ui/skeleton";

interface DepositsTableSectionProps {
  isLoading: boolean;
  paginatedDeposits: Deposit[];
  searchTerm: string;
  handleEdit: (deposit: Deposit) => void;
  handleDelete: (deposit: Deposit) => void;
}

export const DepositsTableSection = ({
  isLoading,
  paginatedDeposits,
  searchTerm,
  handleEdit,
  handleDelete
}: DepositsTableSectionProps) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Show empty state
  if (!paginatedDeposits || paginatedDeposits.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        {searchTerm ? (
          <p className="text-muted-foreground">
            Aucun versement ne correspond à votre recherche.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Aucun versement n'a encore été effectué.
          </p>
        )}
      </div>
    );
  }
  
  // Show deposits table
  return (
    <DepositsTable 
      deposits={paginatedDeposits} 
      onEdit={handleEdit} 
      onDelete={handleDelete} 
    />
  );
};
