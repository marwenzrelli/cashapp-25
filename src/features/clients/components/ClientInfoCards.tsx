
import { Card, CardContent } from "@/components/ui/card";
import { ClientPersonalInfo } from "./ClientPersonalInfo";
import { ClientBalanceCard } from "./ClientBalanceCard";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";

interface ClientInfoCardsProps {
  client: Client;
  clientId: number;
  clientOperations: Operation[];
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
}

export const ClientInfoCards = ({
  client,
  clientId,
  clientOperations,
  exportToExcel,
  exportToPDF,
  formatAmount
}: ClientInfoCardsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <ClientPersonalInfo 
                client={client} 
                formatAmount={formatAmount} 
                clientOperations={clientOperations}
              />
            </CardContent>
          </Card>
        </div>

        {/* Solde et QR code seulement */}
        <div className="space-y-6">
          <ClientBalanceCard 
            client={client} 
            clientId={clientId}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
            formatAmount={formatAmount} 
          />
          {/* Removed ClientActionButtons - no more export buttons */}
        </div>
      </div>
    </div>
  );
};
