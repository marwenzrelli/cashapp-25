
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
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full h-10 rounded-md shadow-md transition-all duration-300"
      >
        <div className="p-1 bg-white/20 rounded-full">
          <ArrowDownToLine className="h-3.5 w-3.5" />
        </div>
        Versement
      </Button>
      
      <Button 
        onClick={onWithdrawalClick} 
        size="sm" 
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-full h-10 rounded-md shadow-md transition-all duration-300"
      >
        <div className="p-1 bg-white/20 rounded-full">
          <ArrowUpToLine className="h-3.5 w-3.5" />
        </div>
        Retrait
      </Button>
    </div>
  );
};
