
import { ClientBalanceCard } from "./ClientBalanceCard";
import { OperationsDetailCards } from "./OperationsDetailCards";
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

export function ClientInfoCards({
  client,
  clientId,
  clientOperations,
  exportToExcel,
  exportToPDF,
  formatAmount
}: ClientInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <ClientBalanceCard
          client={client}
          clientId={clientId}
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
          formatAmount={formatAmount}
          showQRCode={false}
        />
      </div>
      
      <div className="md:col-span-2">
        <OperationsDetailCards 
          clientOperations={clientOperations}
          formatAmount={formatAmount}
        />
      </div>
    </div>
  );
}
