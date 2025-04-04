
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { PublicOperationsTable } from "./PublicOperationsTable";
import { useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface PublicOperationsTabsProps {
  operations: Operation[];
  currency: string;
}

export const PublicOperationsTabs = ({ operations, currency }: PublicOperationsTabsProps) => {
  // Log operations count for debugging
  useEffect(() => {
    console.log(`PublicOperationsTabs - Total operations: ${operations.length}`);
    console.log(`PublicOperationsTabs - Operations by type:`,
      {
        deposits: operations.filter(op => op.type === "deposit").length,
        withdrawals: operations.filter(op => op.type === "withdrawal").length,
        transfers: operations.filter(op => op.type === "transfer").length
      }
    );
    
    // For debugging, log all operation types
    const depositIds = operations.filter(op => op.type === "deposit").map(op => op.id).join(', ');
    const withdrawalIds = operations.filter(op => op.type === "withdrawal").map(op => op.id).join(', ');
    
    console.log(`PublicOperationsTabs - Deposit IDs: ${depositIds}`);
    console.log(`PublicOperationsTabs - Withdrawal IDs: ${withdrawalIds}`);
  }, [operations]);

  // Calculate totals for the summary footer
  const depositsTotal = operations
    .filter(op => op.type === "deposit")
    .reduce((total, op) => total + op.amount, 0);
    
  const withdrawalsTotal = operations
    .filter(op => op.type === "withdrawal")
    .reduce((total, op) => total + op.amount, 0);
    
  const transfersTotal = operations
    .filter(op => op.type === "transfer")
    .reduce((total, op) => total + op.amount, 0);
    
  // Calculate net balance movement
  const netMovement = depositsTotal - withdrawalsTotal;

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full flex overflow-x-auto no-scrollbar p-0 rounded-none border-b">
        <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm py-2">
          Tout <span className="ml-1 text-xs opacity-75">({operations.length})</span>
        </TabsTrigger>
        <TabsTrigger value="deposits" className="flex-1 text-xs sm:text-sm py-2">
          <ArrowUpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">Versements</span>
          <span className="xs:hidden">Vers.</span>
          <span className="ml-1 text-xs opacity-75">({operations.filter(op => op.type === "deposit").length})</span>
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex-1 text-xs sm:text-sm py-2">
          <ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">Retraits</span>
          <span className="xs:hidden">Ret.</span>
          <span className="ml-1 text-xs opacity-75">({operations.filter(op => op.type === "withdrawal").length})</span>
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex-1 text-xs sm:text-sm py-2">
          <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">Virements</span>
          <span className="xs:hidden">Vir.</span>
          <span className="ml-1 text-xs opacity-75">({operations.filter(op => op.type === "transfer").length})</span>
        </TabsTrigger>
      </TabsList>

      <div className="px-0 py-2 sm:py-4">
        <TabsContent value="all" className="mt-0">
          <PublicOperationsTable operations={operations} currency={currency} />
        </TabsContent>

        <TabsContent value="deposits" className="mt-0">
          <PublicOperationsTable operations={operations.filter(op => op.type === "deposit")} currency={currency} />
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-0">
          <PublicOperationsTable operations={operations.filter(op => op.type === "withdrawal")} currency={currency} />
        </TabsContent>

        <TabsContent value="transfers" className="mt-0">
          <PublicOperationsTable operations={operations.filter(op => op.type === "transfer")} currency={currency} />
        </TabsContent>
      </div>

      {/* Summary footer with totals */}
      <Card className="mt-4 border-t">
        <CardFooter className="px-4 py-3">
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-2 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Versements</p>
              <p className="text-lg font-semibold text-green-600">{depositsTotal.toLocaleString()} {currency}</p>
            </div>
            <div className="text-center p-2 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Retraits</p>
              <p className="text-lg font-semibold text-red-600">{withdrawalsTotal.toLocaleString()} {currency}</p>
            </div>
            <div className="text-center p-2 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Virements</p>
              <p className="text-lg font-semibold text-blue-600">{transfersTotal.toLocaleString()} {currency}</p>
            </div>
            <div className="text-center p-2 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Mouvement Net</p>
              <p className={`text-lg font-semibold ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netMovement.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Tabs>
  );
};
