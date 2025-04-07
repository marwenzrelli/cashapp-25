
import { Operation } from "@/features/operations/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, User } from "lucide-react";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { formatOperationId, getAmountColor } from "../../utils/display-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "../utils/format-helpers";

interface OperationsDesktopTableProps {
  operations: Operation[];
  isLoading: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsDesktopTable = ({ 
  operations, 
  isLoading, 
  onDelete 
}: OperationsDesktopTableProps) => {
  return (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="whitespace-nowrap">ID</TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="whitespace-nowrap">Client(s)</TableHead>
            <TableHead className="text-center whitespace-nowrap">Montant</TableHead>
            <TableHead className="text-center whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? renderSkeletons() : renderOperationRows(operations, onDelete)}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper function to render skeleton rows during loading
function renderSkeletons() {
  return Array(5).fill(0).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  ));
}

// Helper function to render operations rows
function renderOperationRows(operations: Operation[], onDelete: (operation: Operation) => void) {
  if (operations.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
          Aucune opération trouvée
        </TableCell>
      </TableRow>
    );
  }

  return operations.map((operation) => (
    <TableRow key={`${operation.type}-${operation.id}`} className="group">
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
            {getTypeIcon(operation.type)}
          </div>
          <span>{getTypeLabel(operation.type)}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
        #{formatOperationId(operation.id)}
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {operation.formattedDate}
      </TableCell>
      <TableCell className="max-w-[150px] truncate">
        {operation.description}
      </TableCell>
      <TableCell className="max-w-[150px]">
        {operation.type === "transfer" ? (
          <div className="flex flex-col">
            <span className="text-sm truncate flex items-center gap-1"><User className="h-3 w-3" /> De: {operation.fromClient}</span>
            <span className="text-sm truncate flex items-center gap-1"><User className="h-3 w-3" /> À: {operation.toClient}</span>
          </div>
        ) : (
          <span className="truncate flex items-center gap-1"><User className="h-3 w-3" /> {operation.fromClient}</span>
        )}
      </TableCell>
      <TableCell className={`text-center font-medium whitespace-nowrap ${getAmountColor(operation.type)}`}>
        {operation.type === "withdrawal" ? "-" : ""}{formatNumber(operation.amount)} TND
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(operation)}
          className="h-8 w-8 relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  ));
}
