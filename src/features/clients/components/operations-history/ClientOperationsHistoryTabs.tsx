
import { Operation } from "@/features/operations/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { OperationsTable } from "./OperationsTable";
import { useState } from "react";
import { useOperationsLogs } from "@/features/clients/hooks/debugging/useOperationsLogs";

interface ClientOperationsHistoryTabsProps {
  filteredOperations: Operation[];
}

export const ClientOperationsHistoryTabs = ({ filteredOperations }: ClientOperationsHistoryTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Log operations for debugging - especially for client ID 4
  useOperationsLogs(filteredOperations);
  
  // Filter operations by type based on active tab
  const operations = filteredOperations.filter((operation) => {
    return activeTab === "all" || operation.type === activeTab;
  });

  return (
    <Tabs
      defaultValue="all"
      className="w-full"
      onValueChange={setActiveTab}
    >
      <div className="border-b">
        <TabsList className="h-12 bg-transparent mb-0.5">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12"
          >
            Toutes ({filteredOperations.length})
          </TabsTrigger>
          <TabsTrigger
            value="deposit"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12"
          >
            Versements ({filteredOperations.filter((op) => op.type === "deposit").length})
          </TabsTrigger>
          <TabsTrigger
            value="withdrawal"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12"
          >
            Retraits ({filteredOperations.filter((op) => op.type === "withdrawal").length})
          </TabsTrigger>
          <TabsTrigger
            value="transfer"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12"
          >
            Virements ({filteredOperations.filter((op) => op.type === "transfer").length})
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all" className="p-0 sm:p-0">
        {operations.length > 0 ? (
          <OperationsTable operations={operations} />
        ) : (
          <EmptyState
            title="Aucune opération"
            description="Il n'y a aucune opération à afficher."
          />
        )}
      </TabsContent>
      
      <TabsContent value="deposit" className="p-0 sm:p-0">
        {operations.length > 0 ? (
          <OperationsTable operations={operations} />
        ) : (
          <EmptyState
            title="Aucun versement"
            description="Il n'y a aucun versement à afficher."
          />
        )}
      </TabsContent>
      
      <TabsContent value="withdrawal" className="p-0 sm:p-0">
        {operations.length > 0 ? (
          <OperationsTable operations={operations} />
        ) : (
          <EmptyState
            title="Aucun retrait"
            description="Il n'y a aucun retrait à afficher."
          />
        )}
      </TabsContent>
      
      <TabsContent value="transfer" className="p-0 sm:p-0">
        {operations.length > 0 ? (
          <OperationsTable operations={operations} />
        ) : (
          <EmptyState
            title="Aucun virement"
            description="Il n'y a aucun virement à afficher."
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
