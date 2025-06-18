
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { OperationTableRow } from "./OperationTableRow";

interface OperationsTableProps {
  operations: Operation[];
  currency: string;
  isPublicView: boolean;
  onIdClick: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onTransfer: (operation: Operation) => void;
}

export const OperationsTable = ({
  operations,
  currency,
  isPublicView,
  onIdClick,
  onEdit,
  onDelete,
  onTransfer
}: OperationsTableProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            {!isPublicView && <TableHead className="w-[80px] text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isPublicView ? 5 : 6} className="h-24 text-center">
                Aucune opération trouvée
              </TableCell>
            </TableRow>
          ) : (
            operations.map((operation, index) => (
              <OperationTableRow
                key={`${operation.id}-${index}`}
                operation={operation}
                index={index}
                currency={currency}
                isPublicView={isPublicView}
                onIdClick={onIdClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onTransfer={onTransfer}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
