
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { PublicOperationsTable } from "./PublicOperationsTable";

interface PublicOperationsTabsProps {
  operations: Operation[];
  currency: string;
}

export const PublicOperationsTabs = ({ operations, currency }: PublicOperationsTabsProps) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full flex overflow-x-auto no-scrollbar p-0 rounded-none border-b">
        <TabsTrigger value="all" className="flex-1 text-sm">
          Tout
        </TabsTrigger>
        <TabsTrigger value="deposits" className="flex-1 text-sm">
          <ArrowUpCircle className="h-4 w-4 mr-1" />
          Versements
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex-1 text-sm">
          <ArrowDownCircle className="h-4 w-4 mr-1" />
          Retraits
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex-1 text-sm">
          <RefreshCcw className="h-4 w-4 mr-1" />
          Virements
        </TabsTrigger>
      </TabsList>

      <div className="px-0 py-4">
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
