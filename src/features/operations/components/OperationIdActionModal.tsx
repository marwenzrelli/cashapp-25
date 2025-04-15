
import { Operation } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatId } from "@/utils/formatId";

interface OperationIdActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
}

export const OperationIdActionModal = ({
  open,
  onOpenChange,
  operation,
  onEdit,
  onDelete,
}: OperationIdActionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opération #{formatId(operation.id)}</DialogTitle>
          <DialogDescription>
            Choisissez l'action que vous souhaitez effectuer sur cette opération
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            onClick={() => {
              onEdit(operation);
              onOpenChange(false);
            }}
          >
            <Edit2 className="h-4 w-4 text-blue-600" />
            Modifier
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => {
              onDelete(operation);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
