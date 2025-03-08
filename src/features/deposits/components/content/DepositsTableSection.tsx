
import { DepositsTable } from "../DepositsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Deposit } from "../../types";

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
  return (
    <>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        paginatedDeposits && paginatedDeposits.length > 0 ? (
          <DepositsTable 
            deposits={paginatedDeposits} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Aucun versement trouvé</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            )}
          </div>
        )
      )}
    </>
  );
};
