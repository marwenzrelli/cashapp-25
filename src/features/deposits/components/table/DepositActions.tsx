
import { Deposit } from "@/features/deposits/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

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
  return (
    <div className={`flex ${isMobile ? 'justify-end' : 'justify-center'} space-x-2`}>
      <Button
        onClick={() => onEdit(deposit)}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
      >
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        onClick={() => onDelete(deposit)}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
};
