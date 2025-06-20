
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { LogEntryRenderer, OperationLogEntry } from "./LogEntryRenderer";
import { formatDateTime } from "@/features/operations/types";

export const OperationsHistoryTab = () => {
  const { operations, isLoading: operationsLoading, error: operationsError } = useOperations();
  const [directOperations, setDirectOperations] = useState([]);
  const [isLoadingDirect, setIsLoadingDirect] = useState(true);
  const [directError, setDirectError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchDirectOperations = async () => {
    setIsLoadingDirect(true);
    setDirectError(null);
    
    try {
      const { data, error } = await supabase
        .from("direct_operations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique user IDs from direct operations
      const uniqueUserIds = new Set(data.map(op => op.created_by).filter(Boolean));
      
      // Fetch user profiles separately
      const userMap = new Map();
      for (const userId of uniqueUserIds) {
        if (!userId) continue;
        
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", userId)
          .single();
          
        if (!userError && userData) {
          userMap.set(userId, {
            name: userData.full_name || userData.email || "Utilisateur inconnu",
            email: userData.email
          });
        }
      }

      const formattedDirectOperations = data.map(op => ({
        id: op.id.toString(),
        type: "direct_transfer",
        amount: op.amount,
        date: formatDateTime(op.created_at),
        raw_date: op.created_at,
        from_client: op.from_client_name,
        to_client: op.to_client_name,
        created_by: op.created_by || "",
        created_by_name: op.created_by && userMap.get(op.created_by) 
          ? userMap.get(op.created_by).name 
          : "Système",
        description: op.notes || `Opération directe de ${op.from_client_name} vers ${op.to_client_name}`
      }));

      setDirectOperations(formattedDirectOperations);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des opérations directes:", error);
      setDirectError(error.message || "Une erreur est survenue lors du chargement des opérations directes");
    } finally {
      setIsLoadingDirect(false);
    }
  };

  useEffect(() => {
    fetchDirectOperations();
  }, []);

  const handleRetry = () => {
    fetchDirectOperations();
  };

  // Combiner toutes les opérations
  const allOperations = [
    ...operations.map(op => ({
      ...op,
      raw_date: op.createdAt || op.date
    })),
    ...directOperations
  ];

  // Filtrer selon l'onglet actif
  const filteredOperations = allOperations.filter(entry => {
    const typedEntry = entry as OperationLogEntry;
    if (activeTab === "all") return true;
    return typedEntry.type === activeTab;
  });

  // Trier par date
  const sortedOperations = filteredOperations.sort((a, b) => {
    const dateA = new Date(a.raw_date || a.date).getTime();
    const dateB = new Date(b.raw_date || b.date).getTime();
    return dateB - dateA;
  });

  if (operationsLoading || isLoadingDirect) {
    return <LoadingState />;
  }

  if (operationsError || directError) {
    return <ErrorState message={operationsError || directError} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="deposit">Versements</TabsTrigger>
          <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
          <TabsTrigger value="transfer">Virements</TabsTrigger>
          <TabsTrigger value="direct_transfer">Opérations directes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {sortedOperations.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              Aucune opération trouvée.
            </div>
          ) : (
            sortedOperations.map((entry, index) => (
              <LogEntryRenderer 
                key={`${entry.type}-${entry.id}`} 
                entry={entry as OperationLogEntry} 
                index={index} 
                type="operation" 
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
