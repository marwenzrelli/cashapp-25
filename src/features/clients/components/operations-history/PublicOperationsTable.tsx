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
    
  // Calculate net movement (deposits - withdrawals)
  const netMovement = totalDeposits - totalWithdrawals;

  const getRowBackgroundColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-50/50 hover:bg-green-100/50';
      case 'withdrawal':
        return 'bg-red-50/50 hover:bg-red-100/50';
      case 'transfer':
        return 'bg-blue-50/50 hover:bg-blue-100/50';
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
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
                        {operation.type === 'deposit' ? 'Versement' : 
                         operation.type === 'withdrawal' ? 'Retrait' : 
                         'Virement'}
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

      {/* Totals section */}
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
