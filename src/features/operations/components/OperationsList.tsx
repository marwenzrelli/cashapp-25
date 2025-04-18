import { Operation } from "../types";
import { TotalsSection } from "./TotalsSection";
import { CircleSlash } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "../types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatAmount } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  showEmptyMessage?: boolean;
  onDelete: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
}
export const OperationsList = ({
  operations,
  isLoading,
  showEmptyMessage = true,
  onDelete,
  onEdit
}: OperationsListProps) => {
  const {
    currency
  } = useCurrency();
  const isMobile = useIsMobile();
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

  // Early return for empty operations with message
  if (operations.length === 0 && !isLoading && showEmptyMessage) {
    return <div className="text-center py-12 border rounded-lg bg-muted/20">
        <div className="flex justify-center">
          <CircleSlash className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Aucune opération trouvée</h3>
        <p className="mt-2 text-muted-foreground">
          Aucune opération ne correspond à ces critères de recherche.
        </p>
      </div>;
  }
  return <div className="space-y-6 print:space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[15%]">                 Type</TableHead>
              <TableHead className="w-[20%]">                         Date</TableHead>
              <TableHead className="w-[20%]">                       Client</TableHead>
              {!isMobile && <TableHead className="w-[25%]">                         Description</TableHead>}
              <TableHead className="text-right w-[15%]">Montant      </TableHead>
              <TableHead className="text-right w-[5%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map(operation => <TableRow key={operation.id}>
                <TableCell className={cn("font-medium", getOperationTypeStyle(operation.type))}>
                  {getFormattedType(operation.type)}
                </TableCell>
                <TableCell>
                  {formatDateTime(operation.operation_date || operation.date || '')}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{operation.fromClient}</p>
                    {operation.type === 'transfer' && operation.toClient && <p className="text-sm text-muted-foreground">
                        → {operation.toClient}
                      </p>}
                  </div>
                </TableCell>
                {!isMobile && <TableCell className="text-muted-foreground">
                    {operation.description || '-'}
                  </TableCell>}
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
              </TableRow>)}
          </TableBody>
        </Table>
      </div>

      {operations.length > 0 && <TotalsSection operations={operations} currency={currency} />}
    </div>;
};