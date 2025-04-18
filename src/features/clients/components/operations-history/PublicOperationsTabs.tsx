
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicOperationsTable } from "./PublicOperationsTable";
import { Operation } from "@/features/operations/types";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PublicOperationsTabsProps {
  operations: Operation[];
  currency: string;
}

export const PublicOperationsTabs = ({ operations, currency }: PublicOperationsTabsProps) => {
  // Count operations by type
  const depositsCount = operations.filter(op => op.type === "deposit").length;
  const withdrawalsCount = operations.filter(op => op.type === "withdrawal").length;
  const transfersCount = operations.filter(op => op.type === "transfer").length;

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger 
          value="all" 
          className="flex items-center justify-center gap-2 text-sm"
        >
          <List className="h-4 w-4" />
          Tout
          <Badge variant="secondary" className="ml-1">{operations.length}</Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="deposits" 
          className={cn(
            "flex items-center justify-center gap-2 text-sm",
            "text-green-700 data-[state=active]:bg-green-50 data-[state=active]:text-green-800",
            "hover:bg-green-50/50"
          )}
        >
          <ArrowUpCircle className="h-4 w-4" />
          Versements
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">{depositsCount}</Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="withdrawals" 
          className={cn(
            "flex items-center justify-center gap-2 text-sm",
            "text-red-700 data-[state=active]:bg-red-50 data-[state=active]:text-red-800",
            "hover:bg-red-50/50"
          )}
        >
          <ArrowDownCircle className="h-4 w-4" />
          Retraits
          <Badge variant="secondary" className="ml-1 bg-red-100 text-red-800">{withdrawalsCount}</Badge>
        </TabsTrigger>
        
        <TabsTrigger 
          value="transfers" 
          className={cn(
            "flex items-center justify-center gap-2 text-sm",
            "text-blue-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800",
            "hover:bg-blue-50/50"
          )}
        >
          <ArrowLeftRight className="h-4 w-4" />
          Virements
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">{transfersCount}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <PublicOperationsTable operations={operations} currency={currency} />
      </TabsContent>
      
      <TabsContent value="deposits">
        <PublicOperationsTable 
          operations={operations.filter(op => op.type === "deposit")} 
          currency={currency}
        />
      </TabsContent>
      
      <TabsContent value="withdrawals">
        <PublicOperationsTable 
          operations={operations.filter(op => op.type === "withdrawal")} 
          currency={currency}
        />
      </TabsContent>
      
      <TabsContent value="transfers">
        <PublicOperationsTable 
          operations={operations.filter(op => op.type === "transfer")} 
          currency={currency}
        />
      </TabsContent>
    </Tabs>
  );
};
