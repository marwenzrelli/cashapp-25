
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
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm"
          onClick={() => onEdit(deposit)}
        >
          <Pencil className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full bg-gray-200/40 dark:bg-gray-700/40 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm"
          onClick={() => onDelete(deposit)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full bg-gray-200/40 dark:bg-gray-700/40 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-300 hover:shadow-sm"
        onClick={() => onEdit(deposit)}
      >
        <Pencil className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span className="absolute inset-0 rounded-lg bg-gray-200/40 dark:bg-gray-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-300 hover:shadow-sm"
        onClick={() => onDelete(deposit)}
      >
        <Trash2 className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span className="absolute inset-0 rounded-lg bg-gray-200/40 dark:bg-gray-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </div>
  );
};
