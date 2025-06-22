
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine, Download, FileText } from "lucide-react";
import { ClientQRCode } from "./ClientQRCode";
import { Client } from "../types";

interface ClientBalanceCardProps {
  client: Client;
  clientId: number;
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
  onDepositClick?: () => void;
  onWithdrawalClick?: () => void;
}

export const ClientBalanceCard = ({
  client,
  clientId,
  exportToExcel,
  exportToPDF,
  formatAmount,
  onDepositClick,
  onWithdrawalClick
}: ClientBalanceCardProps) => {
  const isPositiveBalance = (client.solde || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Solde */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Solde actuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${isPositiveBalance ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(client.solde || 0)}
          </div>
        </CardContent>
      </Card>

      {/* QR Code avec boutons d'action */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accès client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientQRCode 
            clientId={clientId} 
            clientName={`${client.prenom} ${client.nom}`} 
          />
          
          {/* Boutons Versement et Retrait dans la section QR */}
          {onDepositClick && onWithdrawalClick && (
            <div className="flex flex-col gap-2 w-full pt-2">
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
        </CardContent>
      </Card>

      {/* Boutons d'export */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={exportToExcel} size="sm" variant="outline" className="flex items-center justify-center gap-2 transition-colors duration-200">
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button onClick={exportToPDF} size="sm" variant="outline" className="flex items-center justify-center gap-2 transition-colors duration-200">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
