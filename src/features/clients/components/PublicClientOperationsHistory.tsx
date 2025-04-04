
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
  clientId?: number;
}

export const PublicClientOperationsHistory = ({ operations, clientId }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  // Determine if this is for "pepsi men" (client ID 4)
  const isPepsiMen = clientId === 4;
  
  // Always show all operations for pepsi men, default to true for other clients too
  const [showAllOperations, setShowAllOperations] = useState<boolean>(true);
  
  // Ensure we always show all operations for pepsi men
  useEffect(() => {
    if (isPepsiMen && !showAllOperations) {
      setShowAllOperations(true);
    }
  }, [isPepsiMen, showAllOperations]);
  
  // Log operations data for debugging
  useEffect(() => {
    if (isPepsiMen) {
      const allWithdrawals = operations.filter(op => op.type === 'withdrawal');
      console.log(`PublicClientOperationsHistory - Total operations for pepsi men: ${operations.length}`);
      console.log(`PublicClientOperationsHistory - Total withdrawals for pepsi men: ${allWithdrawals.length}`);
      console.log(`Withdrawal IDs: ${allWithdrawals.map(w => w.id).join(', ')}`);
    }
  }, [operations, isPepsiMen]);
  
  // Determine which operations to display based on the filter
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
            <div className="relative">
              <Switch 
                id="show-all-operations"
                checked={showAllOperations}
                onCheckedChange={isPepsiMen ? undefined : setShowAllOperations}
                disabled={isPepsiMen} // Disable the switch for pepsi men to prevent hiding operations
              />
              {isPepsiMen && (
                <Lock className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
              )}
            </div>
            <Label htmlFor="show-all-operations" className="flex items-center">
              Afficher toutes les périodes
              {isPepsiMen && <span className="text-xs text-muted-foreground ml-1">(verrouillé)</span>}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <PublicOperationsTabs operations={displayedOperations} currency={currency} />
      </CardContent>
    </Card>
  );
};
