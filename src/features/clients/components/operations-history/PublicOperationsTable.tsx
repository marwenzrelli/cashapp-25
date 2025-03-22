
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { getAmountColor } from "@/features/operations/utils/display-helpers";

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

  // Function to format the operation ID as a 6-digit number
  const formatOperationId = (id: string): string => {
    // Extract numeric part from the operation ID
    const numericId = id.split('-').pop() || '';
    // Pad with leading zeros to get 6 digits
    return numericId.padStart(6, '0');
  };

  // Calculate totals for each operation type
  const calculateTotals = () => {
    const totals = {
      deposit: 0,
      withdrawal: 0,
      transfer: 0
    };

    sortedOperations.forEach(operation => {
      switch (operation.type) {
        case "deposit":
          totals.deposit += operation.amount;
          break;
        case "withdrawal":
          totals.withdrawal += operation.amount;
          break;
        case "transfer":
          totals.transfer += operation.amount;
          break;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

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
              <TableHead className="whitespace-nowrap text-right">Montant</TableHead>
              <TableHead className="whitespace-nowrap">Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatOperationId(operation.id)}
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
                <TableCell className="max-w-[250px] truncate">{operation.description}</TableCell>
                <TableCell className={cn("font-medium whitespace-nowrap text-right", getAmountColor(operation.type))}>
                  {operation.type === "withdrawal" || (operation.type === "transfer" && operation.amount < 0) 
                    ? "-" 
                    : "+"}{Math.abs(operation.amount).toLocaleString()} {currency}
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
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20">
              <TableCell colSpan={4} className="font-medium">Totaux par type d'opération:</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={2} className="font-medium">Dépôts:</TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                +{totals.deposit.toLocaleString()} {currency}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={2} className="font-medium">Retraits:</TableCell>
              <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                -{totals.withdrawal.toLocaleString()} {currency}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={2} className="font-medium">Transferts:</TableCell>
              <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                {totals.transfer.toLocaleString()} {currency}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced cards for mobile */}
      <div className="md:hidden space-y-4 px-0 py-2 sm:py-4 w-full">
        {sortedOperations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={{
              ...operation,
              id: formatOperationId(operation.id) // Pass formatted ID to mobile card
            }}
            formatAmount={(amount) => `${amount < 0 ? "-" : "+"}${Math.abs(amount).toLocaleString()}`}
            currency={currency}
            showType={true}
            colorClass={getAmountColor(operation.type)}
            showId={true}
          />
        ))}

        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <h3 className="font-medium text-base mb-3">Totaux par type d'opération:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Dépôts:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{totals.deposit.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Retraits:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{totals.withdrawal.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Transferts:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {totals.transfer.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
