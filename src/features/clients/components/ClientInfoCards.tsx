
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { ClientPersonalInfo } from "./ClientPersonalInfo";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";

interface ClientInfoCardsProps {
  client: Client;
  clientId: number;
  clientOperations: Operation[];
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
  onDepositClick?: () => void;
  onWithdrawalClick?: () => void;
}

export const ClientInfoCards = ({
  client,
  clientId,
  clientOperations,
  exportToExcel,
  exportToPDF,
  formatAmount,
  onDepositClick,
  onWithdrawalClick
}: ClientInfoCardsProps) => {
  return (
    <div className="space-y-6">
      {/* Carte principale avec informations et QR code */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <ClientPersonalInfo 
            client={client} 
            formatAmount={formatAmount} 
            clientOperations={clientOperations}
          />
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      {onDepositClick && onWithdrawalClick && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={onDepositClick} 
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 py-3 transition-colors duration-200"
          >
            <ArrowDownToLine className="h-5 w-5" />
            Nouveau versement
          </Button>
          <Button 
            onClick={onWithdrawalClick} 
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white flex-1 py-3 transition-colors duration-200"
          >
            <ArrowUpToLine className="h-5 w-5" />
            Nouveau retrait
          </Button>
        </div>
      )}
    </div>
  );
};
