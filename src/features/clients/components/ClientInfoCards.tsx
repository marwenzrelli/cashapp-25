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

export function ClientInfoCards({
  client,
  clientId,
  clientOperations,
  exportToExcel,
  exportToPDF,
  formatAmount
}: ClientInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      
    </div>
  );
}
