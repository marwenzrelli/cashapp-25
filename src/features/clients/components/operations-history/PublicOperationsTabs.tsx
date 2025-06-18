
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicOperationsTable } from "./PublicOperationsTable";
import { PublicAccountFlowTab } from "./PublicAccountFlowTab";
import { Client } from "../../types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PublicOperationsTabsProps {
  operations: any[];
  client: Client; // Add client prop
}

export const PublicOperationsTabs = ({ operations, client }: PublicOperationsTabsProps) => {
  const { currency } = useCurrency();
  
  return (
    <Tabs defaultValue="operations" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="operations">Toutes les opérations</TabsTrigger>
        <TabsTrigger value="flow">Aperçu public</TabsTrigger>
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
