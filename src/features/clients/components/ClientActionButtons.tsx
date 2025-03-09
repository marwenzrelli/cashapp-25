import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
interface ClientActionButtonsProps {
  onDepositClick: () => void;
  onWithdrawalClick: () => void;
  orientation?: "horizontal" | "vertical";
}
export const ClientActionButtons = ({
  onDepositClick,
  onWithdrawalClick,
  orientation = "horizontal"
}: ClientActionButtonsProps) => {
  return <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} gap-2 w-full`}>
      <Button onClick={onDepositClick} size="sm" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full">
        <ArrowDownToLine className="h-4 w-4" />
        Versement
      </Button>
      <Button onClick={onWithdrawalClick} size="sm" className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full px-[73px]">
        <ArrowUpToLine className="h-4 w-4" />
        Retrait
      </Button>
    </div>;
};