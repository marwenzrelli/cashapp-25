
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Operation } from "@/features/operations/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { OperationActions } from "./OperationActions";

interface OperationTableRowProps {
  operation: Operation;
  index: number;
  currency: string;
  isPublicView: boolean;
  onIdClick: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onTransfer: (operation: Operation) => void;
}

export const OperationTableRow = ({
  operation,
  index,
  currency,
  isPublicView,
  onIdClick,
  onEdit,
  onDelete,
  onTransfer
}: OperationTableRowProps) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy HH:mm", {
        locale: fr
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number, type: Operation['type']): string => {
    const formattedNumber = new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
    return type === 'withdrawal' ? `- ${formattedNumber}` : formattedNumber;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'deposit':
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case 'withdrawal':
        return "bg-red-100 hover:bg-red-200 text-red-800";
      case 'transfer':
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case 'direct_transfer':
        return "bg-purple-100 hover:bg-purple-200 text-purple-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit':
        return "Versement";
      case 'withdrawal':
        return "Retrait";
      case 'transfer':
        return "Transfert";
      case 'direct_transfer':
        return "Opération Directe";
      default:
        return type;
    }
  };

  const getFormattedId = (id: string | number): string => {
    const idStr = String(id);
    if (idStr.includes('-')) {
      const parts = idStr.split('-');
      return `${parts[0]} #${parts[1]}`;
    } else if (idStr.match(/^[a-z]+\d+$/i)) {
      const numericPart = idStr.replace(/\D/g, '');
      const prefix = idStr.replace(/\d+/g, '');
      return `${prefix} #${numericPart}`;
    }
    return `#${idStr}`;
  };

  return (
    <TableRow key={`${operation.id}-${index}`} className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <button
          onClick={() => onIdClick(operation)}
          className="text-primary hover:text-primary/80 underline cursor-pointer transition-colors"
        >
          {getFormattedId(operation.id)}
        </button>
      </TableCell>
      <TableCell>
        {formatDate(operation.operation_date || operation.date)}
      </TableCell>
      <TableCell>
        <Badge className={cn("font-normal", getTypeColor(operation.type))}>
          {getTypeLabel(operation.type)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {operation.description || "-"}
      </TableCell>
      <TableCell className="text-right font-medium">
        <span className={cn(
          operation.type === 'withdrawal' ? 'text-red-600' : 
          operation.type === 'deposit' ? 'text-green-600' : 
          operation.type === 'transfer' ? 'text-blue-600' : 
          operation.type === 'direct_transfer' ? 'text-purple-600' : '', 
          'font-medium'
        )}>
          {formatAmount(operation.amount, operation.type)}
        </span>
      </TableCell>
      {!isPublicView && (
        <TableCell className="text-right">
          <OperationActions
            operation={operation}
            onEdit={onEdit}
            onDelete={onDelete}
            onTransfer={onTransfer}
          />
        </TableCell>
      )}
    </TableRow>
  );
};
