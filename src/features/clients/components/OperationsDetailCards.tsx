import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}
export const OperationsDetailCards = ({
  clientOperations,
  formatAmount
}: OperationsDetailCardsProps) => {
  return <>
      {/* Versements */}
      <Card>
        
        
      </Card>

      {/* Retraits */}
      <Card>
        
        
      </Card>

      {/* Virements */}
      <Card>
        
        
      </Card>
    </>;
};