
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Operation } from "@/features/operations/types";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOperationStatusBadge } from './utils';

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

  return (
    <div className="w-full">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="w-[80px] text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center">
                  Aucune opération trouvée.
                </TableCell>
              </TableRow>
            ) : (
              operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium text-xs">
                    {format(new Date(operation.operation_date || operation.date), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {operation.type === 'deposit' ? 'Versement' : 
                      operation.type === 'withdrawal' ? 'Retrait' : 
                      'Virement'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{operation.description}</TableCell>
                  <TableCell className="text-right text-xs">
                    <span className={`${operation.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                      {operation.type === 'withdrawal' ? '-' : '+'}{operation.amount.toLocaleString()} {currency}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getOperationStatusBadge(operation.status || 'completed')}
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
