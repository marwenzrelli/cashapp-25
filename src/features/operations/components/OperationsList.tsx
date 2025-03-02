
import { Operation } from "@/features/operations/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trash2 } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Liste des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table pour la vue desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Client(s)</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operationsWithFormattedDates.map((operation) => (
                <TableRow key={`${operation.type}-${operation.id}`} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span>{getTypeLabel(operation.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{formatOperationId(operation.id)}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {operation.formattedDate}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {operation.description}
                  </TableCell>
                  <TableCell>
                    {operation.type === "transfer" ? (
                      <div className="flex flex-col">
                        <span className="text-sm flex items-center gap-1"><User className="h-3 w-3" /> De: {operation.fromClient}</span>
                        <span className="text-sm flex items-center gap-1"><User className="h-3 w-3" /> À: {operation.toClient}</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {operation.fromClient}</span>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getAmountColor(operation.type)}`}>
                    {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
                  </TableCell>
                  <TableCell className="text-right">
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
        <div className="md:hidden divide-y">
          {operationsWithFormattedDates.map((operation) => (
            <div key={`${operation.type}-${operation.id}`} className="p-4 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                    {getTypeIcon(operation.type)}
                  </div>
                  <span className="font-medium">{getTypeLabel(operation.type)}</span>
                  <span className="text-xs text-muted-foreground">#{formatOperationId(operation.id)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">
                  {operation.formattedDate}
                </p>
                
                <p className="mb-1 truncate">{operation.description}</p>
                
                <div className="text-xs text-muted-foreground">
                  {operation.type === "transfer" ? (
                    <>
                      <div className="flex items-center gap-1"><User className="h-3 w-3" /> De: {operation.fromClient}</div>
                      <div className="flex items-center gap-1"><User className="h-3 w-3" /> À: {operation.toClient}</div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1"><User className="h-3 w-3" /> {operation.fromClient}</div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`font-semibold whitespace-nowrap ${getAmountColor(operation.type)}`}>
                  {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(operation)}
                  className="h-8 w-8 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
