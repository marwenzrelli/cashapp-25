
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OperationsDesktopTable } from "./desktop/OperationsDesktopTable";
import { OperationsMobileList } from "./mobile/OperationsMobileList";
import { EmptyOperationsList } from "./EmptyOperationsList";

interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsList = ({ operations, isLoading, onDelete }: OperationsListProps) => {
  if (!isLoading && operations.length === 0) {
    return <EmptyOperationsList />;
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Liste des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table for desktop view */}
        <OperationsDesktopTable 
          operations={operations} 
          isLoading={isLoading} 
          onDelete={onDelete} 
        />

        {/* List for mobile view */}
        <OperationsMobileList 
          operations={operations} 
          isLoading={isLoading} 
          onDelete={onDelete} 
        />
      </CardContent>
    </Card>
  );
};
