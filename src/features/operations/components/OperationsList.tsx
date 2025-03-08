
import { Operation } from "@/features/operations/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trash2, CalendarIcon, ClockIcon } from "lucide-react";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { formatOperationId, getAmountColor } from "../utils/display-helpers";

interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsList = ({ operations, isLoading, onDelete }: OperationsListProps) => {
  // Format transactions with formatted dates
  const operationsWithFormattedDates = operations;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (operationsWithFormattedDates.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune opération trouvée</p>
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Liste des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table pour la vue desktop */}
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
              {operationsWithFormattedDates.map((operation) => (
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
                    {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Liste pour mobile */}
        <div className="md:hidden space-y-2 p-2">
          {operationsWithFormattedDates.map((operation) => (
            <div key={`${operation.type}-${operation.id}`} 
                 className="p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                    {getTypeIcon(operation.type)}
                  </div>
                  <div>
                    <span className="font-medium">{getTypeLabel(operation.type)}</span>
                    <p className="text-xs text-muted-foreground">#{formatOperationId(operation.id)}</p>
                  </div>
                </div>
                
                <span className={`font-semibold ${getAmountColor(operation.type)}`}>
                  {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{operation.formattedDate?.split(' ')[0] || ''}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{operation.formattedDate?.split(' ')[1] || ''}</span>
                </div>
              </div>
              
              {operation.description && (
                <p className="text-sm mb-2 line-clamp-2 break-words">{operation.description}</p>
              )}
              
              <div className="text-xs text-muted-foreground mb-2">
                {operation.type === "transfer" ? (
                  <>
                    <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> De: {operation.fromClient}</div>
                    <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> À: {operation.toClient}</div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> {operation.fromClient}</div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(operation)}
                  className="h-8 text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
