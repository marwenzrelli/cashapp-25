
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientActionButtonsProps {
  onDepositClick: () => void;
  onWithdrawalClick: () => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const ClientActionButtons = ({
  onDepositClick,
  onWithdrawalClick,
  orientation = "horizontal",
  className
}: ClientActionButtonsProps) => {
  return (
    <div className={cn(
      `flex ${orientation === "vertical" ? "flex-col" : "flex-row"} gap-2 w-full`,
      className
    )}>
      <Button 
        onClick={onDepositClick} 
        size="sm" 
        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full px-2 sm:px-3"
      >
        <ArrowDownToLine className="h-4 w-4" />
        <span className="text-xs sm:text-sm">Versement</span>
      </Button>
      
      <Button 
        onClick={onWithdrawalClick} 
        size="sm" 
        className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white w-full px-2 sm:px-3"
      >
        <ArrowUpToLine className="h-4 w-4" />
        <span className="text-xs sm:text-sm">Retrait</span>
      </Button>
    </div>
  );
};
