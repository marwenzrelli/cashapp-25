
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicOperationsTable } from "./PublicOperationsTable";
import { PublicAccountFlowTab } from "./PublicAccountFlowTab";
import { Client } from "../../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { FileText, TrendingUp } from "lucide-react";

interface PublicOperationsTabsProps {
  operations: any[];
  client: Client; // Add client prop
}

export const PublicOperationsTabs = ({ operations, client }: PublicOperationsTabsProps) => {
  const { currency } = useCurrency();
  
  return (
    <Tabs defaultValue="operations" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
        <TabsTrigger value="operations" className="flex items-center gap-2 py-3 px-4 text-sm">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Toutes les</span> opérations
        </TabsTrigger>
        <TabsTrigger value="flow" className="flex items-center gap-2 py-3 px-4 text-sm">
          <TrendingUp className="h-4 w-4" />
          Aperçu <span className="hidden sm:inline">public</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations">
        <PublicOperationsTable operations={operations} currency={currency} />
      </TabsContent>
      
      <TabsContent value="flow">
        <PublicAccountFlowTab operations={operations} client={client} />
      </TabsContent>
    </Tabs>
  );
};
