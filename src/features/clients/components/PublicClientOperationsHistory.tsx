
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
  const [showAllOperations, setShowAllOperations] = useState<boolean>(true); // Default to showing all operations
  
  // Log operations for debugging
  console.log(`PublicClientOperationsHistory - Total operations: ${operations.length}`);
  console.log(`PublicClientOperationsHistory - Operations types breakdown: 
    Deposits: ${operations.filter(op => op.type === "deposit").length},
    Withdrawals: ${operations.filter(op => op.type === "withdrawal").length},
    Transfers: ${operations.filter(op => op.type === "transfer").length}`
  );
  
  // Default to showing all operations, but filter to last 30 days if showAllOperations is false
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
