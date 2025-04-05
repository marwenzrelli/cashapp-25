
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";
import { getOperationTypeColor, formatNumber } from "./OperationTypeHelpers";
import { TotalsSection } from "./TotalsSection";

interface OperationsDesktopTableProps {
  operations: Operation[];
  currency: string;
}

export const OperationsDesktopTable = ({ 
  operations, 
  currency
}: OperationsDesktopTableProps) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[12%] whitespace-nowrap font-medium">Type</TableHead>
            <TableHead className="w-[10%] whitespace-nowrap font-medium">ID</TableHead>
            <TableHead className="w-[15%] whitespace-nowrap font-medium">Date</TableHead>
            <TableHead className="w-[20%] font-medium">Description</TableHead>
            <TableHead className="w-[15%] text-right whitespace-nowrap font-medium">Montant</TableHead>
            <TableHead className="w-[18%] font-medium">Client</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => {
            // Use operation_date if available, otherwise fall back to date
            const displayDate = operation.operation_date || operation.date;
            const formattedDate = typeof displayDate === 'string' 
              ? format(new Date(displayDate), "dd/MM/yyyy HH:mm") 
              : format(displayDate, "dd/MM/yyyy HH:mm");
            
            // Format operation ID
            const operationId = isNaN(parseInt(operation.id)) 
              ? operation.id 
              : formatId(parseInt(operation.id));
            
            // Add border classes based on operation type
            const rowBorderClass = operation.type === "deposit" 
              ? "border-l-4 border-green-500" 
              : operation.type === "withdrawal" 
                ? "border-l-4 border-red-500" 
                : "";
              
            return (
              <TableRow 
                key={operation.id} 
                className={cn("transition-colors hover:bg-muted/50", rowBorderClass)}
              >
                <TableCell className="whitespace-nowrap capitalize">
                  {operation.type === "deposit" && "Versement"}
                  {operation.type === "withdrawal" && "Retrait"}
                  {operation.type === "transfer" && "Virement"}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{operationId}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                <TableCell className={cn("text-right font-medium whitespace-nowrap", getOperationTypeColor(operation.type))}>
                  {operation.type === "withdrawal" ? "-" : 
                   operation.type === "deposit" ? "+" : ""}{formatNumber(operation.amount)} {currency}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {operation.type === "transfer" ? (
                    <div className="flex flex-col">
                      <span className="text-sm">De: {operation.fromClient}</span>
                      <span className="text-sm">À: {operation.toClient}</span>
                    </div>
                  ) : (
                    operation.fromClient
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* Totals section */}
          <TableRow className="border-t-2 border-primary/20 font-medium bg-muted/30">
            <TableCell colSpan={4} className="text-right">
              Totaux:
            </TableCell>
            <TableCell colSpan={2} className="px-3">
              <TotalsSection operations={operations} currency={currency} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
