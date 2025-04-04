
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine, RefreshCcw } from "lucide-react";

interface ClientActionButtonsProps {
  onDepositClick?: () => void;
  onWithdrawalClick?: () => void;
  refreshBalance?: () => Promise<void>;
  exportToExcel: () => void;
  exportToPDF: () => void;
  orientation?: "horizontal" | "vertical";
}

export const ClientActionButtons = ({
  onDepositClick,
  onWithdrawalClick,
  refreshBalance,
  exportToExcel,
  exportToPDF,
  orientation = "horizontal"
}: ClientActionButtonsProps) => {
  return (
    <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} gap-2 w-full`}>
      {onDepositClick && onWithdrawalClick && (
        <>
          <Button onClick={onDepositClick} size="sm" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full px-[59px]">
            <ArrowDownToLine className="h-4 w-4" />
            Versement
          </Button>
          <Button onClick={onWithdrawalClick} size="sm" className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full px-[73px]">
            <ArrowUpToLine className="h-4 w-4" />
            Retrait
          </Button>
        </>
      )}
      {refreshBalance && (
        <Button onClick={refreshBalance} size="sm" variant="outline" className="flex items-center justify-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Rafraîchir le solde
        </Button>
      )}
      <Button onClick={exportToExcel} size="sm" variant="outline" className="flex items-center justify-center gap-2">
        ExportExcel
      </Button>
      <Button onClick={exportToPDF} size="sm" variant="outline" className="flex items-center justify-center gap-2">
        ExportPDF
      </Button>
    </div>
  );
};
