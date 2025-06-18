
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Operation } from "@/features/operations/types";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PublicOperationsTableProps {
  operations: Operation[];
  currency: string;
}

export const PublicOperationsTable: React.FC<PublicOperationsTableProps> = ({ operations, currency }) => {
  // Calculate total amounts by type
  const totalDeposits = operations
    .filter(op => op.type === 'deposit')
    .reduce((sum, op) => sum + op.amount, 0);
    
  const totalWithdrawals = operations
    .filter(op => op.type === 'withdrawal')
    .reduce((sum, op) => sum + op.amount, 0);
    
  const totalTransfers = operations
    .filter(op => op.type === 'transfer')
    .reduce((sum, op) => sum + op.amount, 0);
    
  const totalDirectTransfers = operations
    .filter(op => op.type === 'direct_transfer')
    .reduce((sum, op) => sum + op.amount, 0);
    
  // Calculate net movement using the SAME unified formula as "Solde Net"
  // Note: For this table, we consider all transfers and direct operations as positive movements
  // since we're showing operations for a specific client context
  const netMovement = totalDeposits - totalWithdrawals + totalTransfers + totalDirectTransfers;

  const getRowBackgroundColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-50/50 hover:bg-green-100/50';
      case 'withdrawal':
        return 'bg-red-50/50 hover:bg-red-100/50';
      case 'transfer':
        return 'bg-blue-50/50 hover:bg-blue-100/50';
      case 'direct_transfer':
        return 'bg-purple-50/50 hover:bg-purple-100/50';
      default:
        return '';
    }
  };

  const getOperationBadgeStyle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'withdrawal':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'transfer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'direct_transfer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Versement';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Virement';
      case 'direct_transfer':
        return 'Opération Directe';
      default:
        return type;
    }
  };

  // Check if we're showing a specific operation type
  const showingSpecificType = operations.length > 0 && operations.every(op => op.type === operations[0].type);

  return (
    <div className="w-full">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              {!showingSpecificType && <TableHead>Type</TableHead>}
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showingSpecificType ? 3 : 4} className="h-20 text-center">
                  Aucune opération trouvée.
                </TableCell>
              </TableRow>
            ) : (
              operations.map((operation) => (
                <TableRow 
                  key={operation.id}
                  className={getRowBackgroundColor(operation.type)}
                >
                  <TableCell className="font-medium text-xs">
                    {format(new Date(operation.operation_date || operation.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  {!showingSpecificType && (
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getOperationBadgeStyle(operation.type)} text-xs capitalize`}
                      >
                        {getOperationLabel(operation.type)}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-xs">{operation.description}</TableCell>
                  <TableCell className="text-right text-xs">
                    <span className={`${operation.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                      {operation.type === 'withdrawal' ? '-' : '+'}{operation.amount.toLocaleString()} {currency}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totals section - Updated to use unified calculation */}
      {operations.length > 0 && (
        <div className="mt-4 space-y-1 border-t pt-3 px-2">
          <div className="grid grid-cols-2 text-xs">
            <div className="font-medium">Total Versements:</div>
            <div className="text-right text-green-500">{totalDeposits.toLocaleString()} {currency}</div>
          </div>
          <div className="grid grid-cols-2 text-xs">
            <div className="font-medium">Total Retraits:</div>
            <div className="text-right text-red-500">{totalWithdrawals.toLocaleString()} {currency}</div>
          </div>
          <div className="grid grid-cols-2 text-xs">
            <div className="font-medium">Total Virements:</div>
            <div className="text-right text-blue-500">{totalTransfers.toLocaleString()} {currency}</div>
          </div>
          {totalDirectTransfers > 0 && (
            <div className="grid grid-cols-2 text-xs">
              <div className="font-medium">Total Opérations Directes:</div>
              <div className="text-right text-purple-500">{totalDirectTransfers.toLocaleString()} {currency}</div>
            </div>
          )}
          <div className="grid grid-cols-2 text-xs font-bold border-t pt-1 mt-1">
            <div>Mouvement Net:</div>
            <div className={`text-right ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netMovement.toLocaleString()} {currency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
