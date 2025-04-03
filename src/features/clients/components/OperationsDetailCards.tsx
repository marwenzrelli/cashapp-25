import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { formatId } from "@/utils/formatId";
interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}
export const OperationsDetailCards = ({
  clientOperations,
  formatAmount
}: OperationsDetailCardsProps) => {
  // Get the latest deposit, withdrawal, and transfer operations
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Versements */}
      

      {/* Retraits */}
      <Card>
        
        
      </Card>

      {/* Virements */}
      
    </div>;
};