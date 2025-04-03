
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
  clientId?: number;
}

export const PublicClientOperationsHistory = ({ operations, clientId }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  // Default to true for client ID 4 to show all operations
  const isPepsiMen = clientId === 4;
  const [showAllOperations, setShowAllOperations] = useState<boolean>(true);
  
  // For pepsi men (ID 4), always ensure we show all operations
  useEffect(() => {
    if (isPepsiMen && !showAllOperations) {
      setShowAllOperations(true);
    }
  }, [isPepsiMen, showAllOperations]);
  
  // Default to showing the last 30 days of operations unless showAllOperations is true
  const displayedOperations = showAllOperations 
    ? operations 
    : operations.filter(op => {
        const opDate = new Date(op.operation_date || op.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return opDate >= thirtyDaysAgo;
      });
  
  // Debug logging to verify we're showing the right operations
  useEffect(() => {
    if (isPepsiMen) {
      console.log(`Public client operations for pepsi men (ID 4): ${displayedOperations.length} operations`);
      // Check for specific withdrawal IDs
      const withdrawals = displayedOperations.filter(op => op.type === 'withdrawal');
      console.log(`Withdrawal operations for pepsi men: ${withdrawals.length}`, 
        withdrawals.map(w => ({ id: w.id, amount: w.amount })));
      
      // Check specifically for IDs 72-78
      const criticalIds = ['72', '73', '74', '75', '76', '77', '78', 72, 73, 74, 75, 76, 77, 78];
      const foundCriticalIds = withdrawals.filter(w => 
        criticalIds.includes(w.id) || criticalIds.includes(parseInt(String(w.id), 10))
      );
      console.log(`Found ${foundCriticalIds.length} withdrawals with IDs 72-78:`, foundCriticalIds.map(w => w.id));
    }
  }, [displayedOperations, isPepsiMen]);
  
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
              disabled={isPepsiMen} // Disable the switch for pepsi men to prevent hiding operations
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
