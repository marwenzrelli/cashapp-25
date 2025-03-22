
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "@/components/deposits/types";

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
          className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
          onClick={() => onEdit(deposit)}
        >
          <Pencil className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full bg-blue-100/50 dark:bg-blue-900/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-105"
          onClick={() => onDelete(deposit)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full bg-red-100/50 dark:bg-red-900/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 rounded-lg transition-all duration-200"
        onClick={() => onEdit(deposit)}
      >
        <Pencil className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span className="absolute inset-0 rounded-lg bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 rounded-lg transition-all duration-200"
        onClick={() => onDelete(deposit)}
      >
        <Trash2 className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span className="absolute inset-0 rounded-lg bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </div>
  );
};
