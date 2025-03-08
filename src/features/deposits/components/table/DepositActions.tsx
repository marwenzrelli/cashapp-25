
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "@/features/deposits/types";

interface DepositActionsProps {
  deposit: Deposit;
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
  isMobile?: boolean;
}

export const DepositActions = ({ 
  deposit, 
  onEdit, 
  onDelete, 
  isMobile = false 
}: DepositActionsProps) => {
  if (isMobile) {
    return (
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
          onClick={() => onEdit(deposit)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
          onClick={() => onDelete(deposit)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
        onClick={() => onEdit(deposit)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
        onClick={() => onDelete(deposit)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
