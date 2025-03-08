
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";

interface ClientActionButtonsProps {
  onDepositClick: () => void;
  onWithdrawalClick: () => void;
}

export const ClientActionButtons = ({
  onDepositClick,
  onWithdrawalClick
}: ClientActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onDepositClick} 
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white" 
        size="sm"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Versement
      </Button>
      <Button 
        onClick={onWithdrawalClick} 
        size="sm" 
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-[19px]"
      >
        <ArrowUpToLine className="h-4 w-4" />
        Retrait
      </Button>
    </div>
  );
};
