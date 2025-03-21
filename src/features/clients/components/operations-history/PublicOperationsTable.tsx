
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { getAmountColor } from "@/features/operations/utils/display-helpers";
import { formatOperationId } from "@/features/operations/utils/display-helpers";

interface PublicOperationsTableProps {
  operations: Operation[];
  currency: string;
}

export const PublicOperationsTable = ({ operations, currency }: PublicOperationsTableProps) => {
  // Sort operations by operation_date if available, otherwise by date
  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date).getTime();
    const dateB = new Date(b.operation_date || b.date).getTime();
    return dateB - dateA; // DESC order (newest first)
  });

  if (sortedOperations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune opération trouvée</p>
      </div>
    );
  }

  return (
    <>
      {/* Table for desktop */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="whitespace-nowrap">Montant</TableHead>
              <TableHead className="whitespace-nowrap">Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  #{formatOperationId(operation.id)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                      {getTypeIcon(operation.type)}
                    </div>
                    <span>{getTypeLabel(operation.type)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {operation.formattedDate || new Date(operation.operation_date || operation.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">{operation.description}</TableCell>
                <TableCell className={cn("font-medium whitespace-nowrap", getAmountColor(operation.type))}>
                  {operation.type === "withdrawal" ? "-" : ""}{operation.amount.toLocaleString()} {currency}
                </TableCell>
                <TableCell className="max-w-[150px]">
                  {operation.type === "transfer" ? (
                    <div className="flex flex-col">
                      <span className="text-sm truncate">De: {operation.fromClient}</span>
                      <span className="text-sm truncate">À: {operation.toClient}</span>
                    </div>
                  ) : (
                    <span className="truncate">{operation.fromClient}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced cards for mobile */}
      <div className="md:hidden space-y-4 px-0 py-2 sm:py-4 w-full">
        {sortedOperations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `${amount.toLocaleString()}`}
            currency={currency}
            showType={true}
            colorClass={getAmountColor(operation.type)}
            showId={true}
          />
        ))}
      </div>
    </>
  );
};
