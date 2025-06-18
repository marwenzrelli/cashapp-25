
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { Operation } from "@/features/operations/types";

interface OperationActionsProps {
  operation: Operation;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onTransfer: (operation: Operation) => void;
}

export const OperationActions = ({
  operation,
  onEdit,
  onDelete,
  onTransfer
}: OperationActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(operation)}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        {(operation.type === 'deposit' || operation.type === 'withdrawal') && (
          <DropdownMenuItem onClick={() => onTransfer(operation)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transférer
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(operation)} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
