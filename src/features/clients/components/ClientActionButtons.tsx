
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
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button 
        onClick={onDepositClick} 
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" 
        size="sm"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Versement
      </Button>
      <Button 
        onClick={onWithdrawalClick} 
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
        size="sm"
      >
        <ArrowUpToLine className="h-4 w-4" />
        Retrait
      </Button>
    </div>
  );
};
