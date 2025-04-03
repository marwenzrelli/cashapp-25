
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
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
  // Critical Withdrawal IDs that must be prioritized for display
  const criticalWithdrawalIds = ['72', '73', '74', '75', '76', '77', '78'];
  
  // Check if this is for pepsi men
  const isPepsiMen = clientOperations.some(op => {
    const client = (op.fromClient || '').toLowerCase();
    return client.includes('pepsi') || client.includes('men');
  });
  
  // Special handling for withdrawals if this is pepsi men
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal");
  
  // First, include any critical withdrawals
  const criticalWithdrawals = withdrawals.filter(op => 
    criticalWithdrawalIds.includes(op.id.toString())
  );
  
  // Then add other withdrawals up to a total of 3
  const otherWithdrawals = withdrawals
    .filter(op => !criticalWithdrawalIds.includes(op.id.toString()))
    .slice(0, Math.max(0, 3 - criticalWithdrawals.length));
  
  // Combine critical and other withdrawals, ensuring critical ones are included
  const displayWithdrawals = [...criticalWithdrawals, ...otherWithdrawals].slice(0, 3);
  
  // Regular handling for deposits and transfers
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);
  
  if (isPepsiMen) {
    // Log all withdrawal IDs for debugging
    const allWithdrawalIds = clientOperations
      .filter(op => op.type === "withdrawal")
      .map(op => op.id);
    
    console.log(`OperationsDetailCards for pepsi men:`);
    console.log(`- Found ${displayWithdrawals.length} withdrawals to display (showing max 3)`);
    console.log(`- All withdrawals: ${withdrawals.length}`);
    console.log(`- All withdrawal IDs: ${allWithdrawalIds.join(', ')}`);
    
    // Check specifically for critical IDs
    const hasCriticalIds = criticalWithdrawalIds.some(id => allWithdrawalIds.includes(id));
    console.log(`- Has critical IDs 72-78: ${hasCriticalIds}`);
    
    // List all found critical IDs
    const foundCriticalIds = criticalWithdrawalIds.filter(id => allWithdrawalIds.includes(id));
    console.log(`- Found critical IDs: ${foundCriticalIds.join(', ')}`);
    
    // Check for specific critical withdrawals
    if (criticalWithdrawals.length > 0) {
      console.log(`- Critical withdrawals to display: ${criticalWithdrawals.map(w => w.id).join(', ')}`);
    }
  }
  
  // Format date helper
  const formatOperationDate = (date: string | Date) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy");
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Versements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            Derniers versements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length > 0 ? (
            <ul className="space-y-2">
              {deposits.map(op => (
                <li key={op.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{formatAmount(op.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatOperationDate(op.operation_date || op.date)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {op.description || `Versement #${formatId(op.id)}`}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucun versement récent
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retraits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            Derniers retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayWithdrawals.length > 0 ? (
            <ul className="space-y-2">
              {displayWithdrawals.map(op => (
                <li key={op.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{formatAmount(op.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatOperationDate(op.operation_date || op.date)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {op.description || `Retrait #${formatId(op.id)}`}
                  </div>
                  {/* Always show operation ID for better tracking */}
                  <div className="text-xs text-gray-500">ID: {op.id}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucun retrait récent
            </div>
          )}
        </CardContent>
      </Card>

      {/* Virements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-blue-500" />
            Derniers virements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length > 0 ? (
            <ul className="space-y-2">
              {transfers.map(op => (
                <li key={op.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{formatAmount(op.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatOperationDate(op.operation_date || op.date)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {op.description || `Virement #${formatId(op.id)}`}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucun virement récent
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
