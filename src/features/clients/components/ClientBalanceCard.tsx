
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Client } from "../types";
import { Button } from "@/components/ui/button";
import { ClientQRCode } from "./ClientQRCode";

interface ClientBalanceCardProps {
  client: Client;
  clientId: number;
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
  showQRCode?: boolean;
}

export function ClientBalanceCard({
  client,
  clientId,
  exportToExcel,
  exportToPDF,
  formatAmount,
  showQRCode = true
}: ClientBalanceCardProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium">Solde du client</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={exportToExcel} className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Solde actuel au {new Date().toLocaleDateString()}
            </p>
          </div>
          
          {showQRCode && clientId && (
            <div className="mt-4 md:mt-0">
              <ClientQRCode clientId={clientId} clientName={`${client.prenom} ${client.nom}`} size={100} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
