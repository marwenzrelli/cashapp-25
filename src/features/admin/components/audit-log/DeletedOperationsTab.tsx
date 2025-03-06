
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeletedOperations } from "../../hooks/useDeletedOperations";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { OperationsList } from "./OperationsList";
import { OperationLogEntry } from "./LogEntryRenderer";

export const DeletedOperationsTab = () => {
  const { data, isLoading, error, fetchDeletedOperations } = useDeletedOperations();
  const [activeTab, setActiveTab] = useState("all");

  const handleRetry = () => {
    fetchDeletedOperations();
  };

  const filteredData = data.filter(entry => {
    const typedEntry = entry as OperationLogEntry;
    if (activeTab === "all") return true;
    return typedEntry.type === activeTab;
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="deposit">Versements</TabsTrigger>
          <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
          <TabsTrigger value="transfer">Virements</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <OperationsList operations={filteredData as OperationLogEntry[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
