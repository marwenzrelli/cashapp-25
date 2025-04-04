
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { PublicOperationsTable } from "./PublicOperationsTable";
import { useEffect } from "react";

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
    
    // Log all operation IDs for debugging
    const allOperationIds = operations.map(op => `${op.type}-${op.id}`).join(', ');
    console.log(`PublicOperationsTabs - All operation IDs: ${allOperationIds}`);
    
    // Detailed withdraw info for the pepsi men client
    const withdrawals = operations.filter(op => op.type === "withdrawal");
    if (withdrawals.length > 0) {
      console.log(`PublicOperationsTabs - Withdrawal IDs: ${withdrawals.map(w => w.id).join(', ')}`);
    }
  }, [operations]);

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
    </Tabs>
  );
};
