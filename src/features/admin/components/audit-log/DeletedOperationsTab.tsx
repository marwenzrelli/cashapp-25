
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { LogEntryRenderer, OperationLogEntry } from "./LogEntryRenderer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export interface DeletedTransaction {
  id: string;
  original_id: string;
  operation_type: string;
  from_client?: string;
  to_client?: string;
  client_name?: string; 
  amount: number;
  reason?: string;
  operation_date: string;
  deleted_by: string;
  deleted_at: string;
}

export const fetchDeletedOperations = async () => {
  console.log("Début de la récupération des opérations supprimées");
  try {
    // Récupérer les opérations supprimées depuis les trois tables
    const { data: deletedDeposits, error: depositsError } = await supabase
      .from('deleted_deposits')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (depositsError) {
      console.error("Erreur lors de la récupération des versements supprimés:", depositsError);
      toast.error("Erreur lors de la récupération des versements supprimés");
      throw depositsError;
    }

    const { data: deletedWithdrawals, error: withdrawalsError } = await supabase
      .from('deleted_withdrawals')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (withdrawalsError) {
      console.error("Erreur lors de la récupération des retraits supprimés:", withdrawalsError);
      toast.error("Erreur lors de la récupération des retraits supprimés");
      throw withdrawalsError;
    }

    const { data: deletedTransfers, error: transfersError } = await supabase
      .from('deleted_transfers')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (transfersError) {
      console.error("Erreur lors de la récupération des virements supprimés:", transfersError);
      toast.error("Erreur lors de la récupération des virements supprimés");
      throw transfersError;
    }

    // Log the data to help debug
    console.log("Données des versements supprimés:", deletedDeposits);
    console.log("Données des retraits supprimés:", deletedWithdrawals);
    console.log("Données des virements supprimés:", deletedTransfers);
    console.log("Nombre total d'opérations supprimées récupérées:", 
      (deletedDeposits ? deletedDeposits.length : 0) + 
      (deletedWithdrawals ? deletedWithdrawals.length : 0) + 
      (deletedTransfers ? deletedTransfers.length : 0));

    // Récupérer tous les IDs d'utilisateurs pour obtenir leurs noms
    const userIds = [
      ...(deletedDeposits || []).map(item => item.deleted_by),
      ...(deletedWithdrawals || []).map(item => item.deleted_by),
      ...(deletedTransfers || []).map(item => item.deleted_by)
    ].filter(id => id !== null && id !== undefined);
      
    console.log("Récupération des détails pour les utilisateurs:", userIds);
    
    let usersMap: Record<string, string> = {};
    
    if (userIds.length > 0) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      if (userError) {
        console.error("Erreur lors de la récupération des utilisateurs:", userError);
      } else {
        console.log("Données utilisateurs récupérées:", userData);
        usersMap = (userData || []).reduce((acc, user) => {
          acc[user.id] = user.full_name;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Formatter les versements supprimés
    const formattedDeposits = (deletedDeposits || []).map(deposit => ({
      id: deposit.id,
      type: 'deposit',
      amount: deposit.amount,
      date: format(new Date(deposit.deleted_at), 'dd/MM/yyyy HH:mm'),
      client_name: deposit.client_name,
      created_by: deposit.deleted_by,
      created_by_name: usersMap[deposit.deleted_by] || 'Utilisateur inconnu',
      description: `Versement supprimé pour ${deposit.client_name}`
    }));

    // Formatter les retraits supprimés
    const formattedWithdrawals = (deletedWithdrawals || []).map(withdrawal => ({
      id: withdrawal.id,
      type: 'withdrawal',
      amount: withdrawal.amount,
      date: format(new Date(withdrawal.deleted_at), 'dd/MM/yyyy HH:mm'),
      client_name: withdrawal.client_name,
      created_by: withdrawal.deleted_by,
      created_by_name: usersMap[withdrawal.deleted_by] || 'Utilisateur inconnu',
      description: `Retrait supprimé pour ${withdrawal.client_name}`
    }));

    // Formatter les virements supprimés
    const formattedTransfers = (deletedTransfers || []).map(transfer => ({
      id: transfer.id,
      type: 'transfer',
      amount: transfer.amount,
      date: format(new Date(transfer.deleted_at), 'dd/MM/yyyy HH:mm'),
      from_client: transfer.from_client,
      to_client: transfer.to_client,
      created_by: transfer.deleted_by,
      created_by_name: usersMap[transfer.deleted_by] || 'Utilisateur inconnu',
      description: `Virement supprimé de ${transfer.from_client} vers ${transfer.to_client}`
    }));

    // Combiner toutes les opérations supprimées
    const allDeletedOperations = [
      ...formattedDeposits,
      ...formattedWithdrawals,
      ...formattedTransfers
    ];

    return {
      deletedOperations: allDeletedOperations,
      deposits: (deletedDeposits || []).map(deposit => ({
        id: deposit.id,
        action_type: 'Versement supprimé',
        action_date: format(new Date(deposit.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[deposit.deleted_by] || 'Utilisateur inconnu',
        details: `Versement supprimé pour ${deposit.client_name}`,
        target_id: deposit.original_id.toString(),
        target_name: deposit.client_name || '',
        amount: deposit.amount
      })),
      withdrawals: (deletedWithdrawals || []).map(withdrawal => ({
        id: withdrawal.id,
        action_type: 'Retrait supprimé',
        action_date: format(new Date(withdrawal.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[withdrawal.deleted_by] || 'Utilisateur inconnu',
        details: `Retrait supprimé pour ${withdrawal.client_name}`,
        target_id: withdrawal.original_id.toString(),
        target_name: withdrawal.client_name || '',
        amount: withdrawal.amount
      })),
      transfers: (deletedTransfers || []).map(transfer => ({
        id: transfer.id,
        action_type: 'Virement supprimé',
        action_date: format(new Date(transfer.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[transfer.deleted_by] || 'Utilisateur inconnu',
        details: `Virement de ${transfer.from_client} vers ${transfer.to_client}`,
        target_id: transfer.original_id.toString(),
        target_name: `${transfer.from_client} → ${transfer.to_client}`,
        amount: transfer.amount
      }))
    };
  } catch (error) {
    console.error("Erreur complète dans fetchDeletedOperations:", error);
    throw error;
  }
};

export const DeletedOperationsTab = () => {
  const { data: deletedData, isLoading } = useQuery({
    queryKey: ['deleted-operations'],
    queryFn: fetchDeletedOperations,
    staleTime: 5000, // Reduce stale time to 5 seconds for faster refreshes
    refetchOnWindowFocus: true,
    refetchInterval: 5000 // Auto refresh every 5 seconds
  });

  const deletedOperationsLog = deletedData?.deletedOperations || [];

  const renderDeletedOperationsByType = (type: string) => {
    const filteredOperations = deletedOperationsLog.filter(op => op.type === type);
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (filteredOperations.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          Aucune opération de ce type supprimée
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-border">
        {filteredOperations.map((operation, index) => (
          <LogEntryRenderer key={operation.id} entry={operation} index={index} type="operation" />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="all">Toutes les opérations</TabsTrigger>
        <TabsTrigger value="deposit">Versements supprimés</TabsTrigger>
        <TabsTrigger value="withdrawal">Retraits supprimés</TabsTrigger>
        <TabsTrigger value="transfer">Virements supprimés</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ScrollArea className="h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : deletedOperationsLog.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune opération supprimée
            </div>
          ) : (
            <div className="divide-y divide-border">
              {deletedOperationsLog.map((operation, index) => (
                <LogEntryRenderer key={operation.id} entry={operation} index={index} type="operation" />
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="deposit">
        <ScrollArea className="h-[50vh]">
          {renderDeletedOperationsByType('deposit')}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="withdrawal">
        <ScrollArea className="h-[50vh]">
          {renderDeletedOperationsByType('withdrawal')}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="transfer">
        <ScrollArea className="h-[50vh]">
          {renderDeletedOperationsByType('transfer')}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
