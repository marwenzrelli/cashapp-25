
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine, RefreshCcw } from "lucide-react";

interface ClientActionButtonsProps {
  onDepositClick?: () => void;
  onWithdrawalClick?: () => void;
  refreshBalance?: () => Promise<void>;
  exportToExcel?: () => void;
  exportToPDF?: () => void;
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
          <Button onClick={onDepositClick} size="sm" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full transition-colors duration-200">
            <ArrowDownToLine className="h-4 w-4" />
            Versement
          </Button>
          <Button onClick={onWithdrawalClick} size="sm" className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full transition-colors duration-200">
            <ArrowUpToLine className="h-4 w-4" />
            Retrait
          </Button>
        </>
      )}
      {refreshBalance && (
        <Button onClick={refreshBalance} size="sm" variant="outline" className="flex items-center justify-center gap-2 transition-colors duration-200">
          <RefreshCcw className="h-4 w-4" />
          Rafraîchir le solde
        </Button>
      )}
      {(exportToExcel || exportToPDF) && !onDepositClick && !onWithdrawalClick && (
        <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} gap-2 w-full`}>
          {exportToExcel && (
            <Button onClick={exportToExcel} size="sm" variant="outline" className="flex items-center justify-center gap-2 w-full">
              Excel
            </Button>
          )}
          {exportToPDF && (
            <Button onClick={exportToPDF} size="sm" variant="outline" className="flex items-center justify-center gap-2 w-full">
              PDF
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
