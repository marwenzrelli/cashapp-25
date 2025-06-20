
import { Operation } from "../types";
import { TotalsSection } from "./TotalsSection";
import { CircleSlash, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "../types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatAmount } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  showEmptyMessage?: boolean;
  onDelete: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
}

type SortField = 'type' | 'date' | 'client';
type SortDirection = 'asc' | 'desc' | null;

export const OperationsList = ({
  operations,
  isLoading,
  showEmptyMessage = true,
  onDelete,
  onEdit
}: OperationsListProps) => {
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const getOperationTypeStyle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  const getFormattedType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Versement';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Transfert';
      default:
        return 'Opération';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  // Sort operations
  const sortedOperations = [...operations].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'type':
        aValue = getFormattedType(a.type).toLowerCase();
        bValue = getFormattedType(b.type).toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.operation_date || a.date || '');
        bValue = new Date(b.operation_date || b.date || '');
        break;
      case 'client':
        aValue = a.fromClient.toLowerCase();
        bValue = b.fromClient.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Early return for empty operations with message
  if (operations.length === 0 && !isLoading && showEmptyMessage) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <div className="flex justify-center">
          <CircleSlash className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Aucune opération trouvée</h3>
        <p className="mt-2 text-muted-foreground">
          Aucune opération ne correspond à ces critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[15%]">
                <button 
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Type
                  {getSortIcon('type')}
                </button>
              </TableHead>
              <TableHead className="w-[20%]">
                <button 
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Date
                  {getSortIcon('date')}
                </button>
              </TableHead>
              <TableHead className="w-[20%]">
                <button 
                  onClick={() => handleSort('client')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Client
                  {getSortIcon('client')}
                </button>
              </TableHead>
              {!isMobile && <TableHead className="w-[25%]">Description</TableHead>}
              <TableHead className="text-right w-[15%]">Montant</TableHead>
              <TableHead className="text-right w-[5%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOperations.map(operation => (
              <TableRow key={operation.id}>
                <TableCell className={cn("font-medium", getOperationTypeStyle(operation.type))}>
                  {getFormattedType(operation.type)}
                </TableCell>
                <TableCell>
                  {formatDateTime(operation.operation_date || operation.date || '')}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{operation.fromClient}</p>
                    {operation.type === 'transfer' && operation.toClient && (
                      <p className="text-sm text-muted-foreground">
                        → {operation.toClient}
                      </p>
                    )}
                  </div>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-muted-foreground">
                    {operation.description || '-'}
                  </TableCell>
                )}
                <TableCell className={cn("text-right font-medium", getOperationTypeStyle(operation.type))}>
                  {operation.type === 'withdrawal' ? '- ' : ''}{formatAmount(operation.amount, currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(operation)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier l'opération</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onDelete(operation)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer l'opération</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {operations.length > 0 && <TotalsSection operations={operations} currency={currency} />}
    </div>
  );
};
