
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";

interface ClientBalanceCardProps {
  client: Client;
  clientId: number;
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
  showQRCode?: boolean;
  onDepositClick?: () => void;
  onWithdrawalClick?: () => void;
}

export function ClientBalanceCard({
  client,
  clientId,
  exportToExcel,
  exportToPDF,
  formatAmount,
  showQRCode = true,
  onDepositClick,
  onWithdrawalClick
}: ClientBalanceCardProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Solde actuel</CardTitle>
        <div className="text-3xl font-bold text-primary">
          {formatAmount(client.solde)} TND
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Boutons d'action */}
          {onDepositClick && onWithdrawalClick && (
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onDepositClick} 
                size="sm" 
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full transition-colors duration-200"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Versement
              </Button>
              <Button 
                onClick={onWithdrawalClick} 
                size="sm" 
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full transition-colors duration-200"
              >
                <ArrowUpToLine className="h-4 w-4" />
                Retrait
              </Button>
            </div>
          )}
          
          {/* QR Code */}
          {showQRCode && clientId && (
            <div className="flex justify-center pt-4">
              <ClientQRCode clientId={clientId} clientName={`${client.prenom} ${client.nom}`} size={100} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
