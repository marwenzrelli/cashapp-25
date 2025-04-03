
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
  // Get the latest deposit, withdrawal, and transfer operations
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);
  
  // For debugging client with ID 4 (pepsi men)
  const isPepsiMen = clientOperations.some(op => 
    op.fromClient?.toLowerCase().includes('pepsi') || 
    op.fromClient?.toLowerCase().includes('men'));
  
  if (isPepsiMen) {
    console.log("OperationsDetailCards for pepsi men:");
    console.log(`- Found ${withdrawals.length} withdrawals to display (showing max 3)`);
    console.log(`- All withdrawals: ${clientOperations.filter(op => op.type === "withdrawal").length}`);
    console.log(`- Sample withdrawal IDs:`, clientOperations
      .filter(op => op.type === "withdrawal")
      .map(op => op.id)
      .slice(0, 10));
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
          {withdrawals.length > 0 ? (
            <ul className="space-y-2">
              {withdrawals.map(op => (
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
                  {/* Add ID debug info for pepsi men */}
                  {isPepsiMen && (
                    <div className="text-xs text-gray-500">ID: {op.id}</div>
                  )}
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
