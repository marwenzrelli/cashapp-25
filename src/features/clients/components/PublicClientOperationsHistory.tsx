
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
}

export const PublicClientOperationsHistory = ({ operations }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  // Default to true for client ID 4 to show all operations
  const [showAllOperations, setShowAllOperations] = useState<boolean>(true);
  
  // Default to showing the last 30 days of operations unless showAllOperations is true
  const displayedOperations = showAllOperations 
    ? operations 
    : operations.filter(op => {
        const opDate = new Date(op.operation_date || op.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return opDate >= thirtyDaysAgo;
      });
  
  return (
    <Card className="shadow-sm max-w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl">Historique des opérations</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-all-operations"
              checked={showAllOperations}
              onCheckedChange={setShowAllOperations}
            />
            <Label htmlFor="show-all-operations">Afficher toutes les périodes</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <PublicOperationsTabs operations={displayedOperations} currency={currency} />
      </CardContent>
    </Card>
  );
};
