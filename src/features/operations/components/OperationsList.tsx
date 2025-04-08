import { Operation } from "@/features/operations/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trash2, CalendarIcon, ClockIcon } from "lucide-react";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { formatOperationId, getAmountColor } from "../utils/display-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { TotalsSection } from "./TotalsSection";

interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsList = ({ operations, isLoading, onDelete }: OperationsListProps) => {
  // Format transactions with formatted dates
  const operationsWithFormattedDates = operations;

  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // Render loading skeletons
  const renderSkeletons = () => {
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
  };

  // Render mobile skeletons
  const renderMobileSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={`mobile-skeleton-${index}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Liste des opérations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Loading skeletons for desktop */}
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
                {renderSkeletons()}
              </TableBody>
            </Table>
          </div>
          
          {/* Loading skeletons for mobile */}
          <div className="md:hidden space-y-3 p-3 w-full">
            {renderMobileSkeletons()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (operationsWithFormattedDates.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
              ))}
            </TableBody>
          </Table>
          
          {/* Totals section for desktop */}
          {operations.length > 0 && (
            <TotalsSection operations={operations} currency="TND" />
          )}
        </div>

        {/* Liste pour mobile */}
        <div className="md:hidden space-y-3 p-3 w-full">
          {operationsWithFormattedDates.map((operation) => (
            <div key={`${operation.type}-${operation.id}`} 
                 className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                    {getTypeIcon(operation.type)}
                  </div>
                  <div>
                    <span className="font-medium">{getTypeLabel(operation.type)}</span>
                    <p className="text-xs text-muted-foreground">#{formatOperationId(operation.id)}</p>
                  </div>
                </div>
                
                <span className={`text-lg font-semibold px-3 py-1 rounded-md ${getAmountColor(operation.type)}`}>
                  {operation.type === "withdrawal" ? "-" : ""}{formatNumber(operation.amount)} TND
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
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
                <p className="text-sm mb-3 line-clamp-2 break-words px-3 py-2 bg-gray-50 dark:bg-gray-700/20 rounded-md">
                  {operation.description}
                </p>
              )}
              
              <div className="text-xs text-muted-foreground mb-3">
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
                  className="h-10 px-4 text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
          
          {/* Totals section for mobile */}
          {operations.length > 0 && (
            <div className="mt-4">
              <TotalsSection operations={operations} currency="TND" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
