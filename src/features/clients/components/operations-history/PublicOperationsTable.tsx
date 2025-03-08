
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
  if (operations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune opération trouvée</p>
      </div>
    );
  }

  return (
    <>
      {/* Table for desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                      {getTypeIcon(operation.type)}
                    </div>
                    <span>{getTypeLabel(operation.type)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {operation.formattedDate || operation.date}
                </TableCell>
                <TableCell>{operation.description}</TableCell>
                <TableCell className={cn("font-medium", getAmountColor(operation.type))}>
                  {operation.type === "withdrawal" ? "-" : ""}{operation.amount.toLocaleString()} {currency}
                </TableCell>
                <TableCell>
                  {operation.type === "transfer" ? (
                    <div className="flex flex-col">
                      <span className="text-sm">De: {operation.fromClient}</span>
                      <span className="text-sm">À: {operation.toClient}</span>
                    </div>
                  ) : (
                    <span>{operation.fromClient}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced cards for mobile */}
      <div className="md:hidden space-y-4 px-2">
        {operations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `${amount.toLocaleString()}`}
            currency={currency}
            showType={true}
            colorClass={getAmountColor(operation.type)}
          />
        ))}
      </div>
    </>
  );
};
