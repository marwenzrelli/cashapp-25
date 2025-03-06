
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogEntryRenderer } from "./LogEntryRenderer";
import { AuditLogEntry, OperationLogEntry } from "@/types/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/features/operations/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const DeletedOperationsTab = () => {
  const [data, setData] = useState<(AuditLogEntry | OperationLogEntry)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("deposits");

  const fetchDeletedOperations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les dépôts supprimés
      const { data: deletedDeposits, error: depositsError } = await supabase
        .from("deleted_deposits")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (depositsError) throw depositsError;

      // Récupérer les retraits supprimés
      const { data: deletedWithdrawals, error: withdrawalsError } = await supabase
        .from("deleted_withdrawals")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les transferts supprimés
      const { data: deletedTransfers, error: transfersError } = await supabase
        .from("deleted_transfers")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (transfersError) throw transfersError;

      // Récupérer les informations d'utilisateur pour les associer aux opérations
      const uniqueUserIds = new Set([
        ...deletedDeposits.map(d => d.deleted_by),
        ...deletedWithdrawals.map(w => w.deleted_by),
        ...deletedTransfers.map(t => t.deleted_by)
      ].filter(Boolean));

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

      // Transformer les données pour le format d'affichage
      const formattedDeposits = deletedDeposits.map(deposit => {
        const userName = deposit.deleted_by && userMap.get(deposit.deleted_by)
          ? userMap.get(deposit.deleted_by).name
          : "Système";
          
        return {
          id: deposit.id.toString(), // Convert to string
          type: "deposit",
          amount: deposit.amount,
          date: formatDateTime(deposit.deleted_at),
          client_name: deposit.client_name,
          created_by: deposit.deleted_by || "",
          created_by_name: userName,
          description: deposit.notes || `Versement supprimé de ${deposit.client_name}`
        };
      });

      const formattedWithdrawals = deletedWithdrawals.map(withdrawal => {
        const userName = withdrawal.deleted_by && userMap.get(withdrawal.deleted_by)
          ? userMap.get(withdrawal.deleted_by).name
          : "Système";
          
        return {
          id: withdrawal.id.toString(), // Convert to string
          type: "withdrawal",
          amount: withdrawal.amount,
          date: formatDateTime(withdrawal.deleted_at),
          client_name: withdrawal.client_name,
          created_by: withdrawal.deleted_by || "",
          created_by_name: userName,
          description: withdrawal.notes || `Retrait supprimé de ${withdrawal.client_name}`
        };
      });

      const formattedTransfers = deletedTransfers.map(transfer => {
        const userName = transfer.deleted_by && userMap.get(transfer.deleted_by)
          ? userMap.get(transfer.deleted_by).name
          : "Système";
          
        return {
          id: transfer.id.toString(), // Convert to string
          type: "transfer",
          amount: transfer.amount,
          date: formatDateTime(transfer.deleted_at),
          from_client: transfer.from_client,
          to_client: transfer.to_client,
          created_by: transfer.deleted_by || "",
          created_by_name: userName,
          description: transfer.reason || `Virement supprimé de ${transfer.from_client} vers ${transfer.to_client}`
        };
      });

      // Combiner toutes les données et trier par date
      const allDeletedOperations = [
        ...formattedDeposits,
        ...formattedWithdrawals,
        ...formattedTransfers
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData(allDeletedOperations);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des opérations supprimées:", error);
      setError(error.message || "Une erreur est survenue lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedOperations();
  }, []);

  const handleRetry = () => {
    fetchDeletedOperations();
  };

  const filteredData = data.filter(entry => {
    if (activeTab === "all") return true;
    return entry.type === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div key={index} className="flex flex-col space-y-2 border rounded-lg p-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
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
          {filteredData.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              Aucune opération supprimée trouvée.
            </div>
          ) : (
            filteredData.map((entry) => (
              <LogEntryRenderer key={`${entry.type}-${entry.id}`} entry={entry} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
