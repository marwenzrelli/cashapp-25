
import { Card, CardContent } from "@/components/ui/card";
import { ClientPersonalInfo } from "./ClientPersonalInfo";
import { ClientBalanceCard } from "./ClientBalanceCard";
import { ClientActionButtons } from "./ClientActionButtons";
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

        {/* Solde et boutons d'action */}
        <div className="space-y-6">
          <ClientBalanceCard 
            client={client} 
            clientId={clientId}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
            formatAmount={formatAmount} 
          />
          
          {/* Restore action buttons */}
          <ClientActionButtons 
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
            orientation="vertical"
          />
        </div>
      </div>
    </div>
  );
};
