
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
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
      <CardHeader className="pb-2">
        {/* Removed export buttons section */}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-center items-center">
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
