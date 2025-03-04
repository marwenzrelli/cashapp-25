
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { LogEntryRenderer, OperationLogEntry } from "./LogEntryRenderer";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateTime } from "@/features/operations/types";

export const fetchRecentOperations = async () => {
  try {
    // Récupérer les opérateurs
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, full_name');
    
    const usersMap = (usersData || []).reduce((acc, user) => {
      acc[user.id] = user.full_name;
      return acc;
    }, {} as Record<string, string>);

    // Fetch deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .order('operation_date', { ascending: false })
      .limit(20);

    if (depositsError) throw depositsError;

    // Fetch withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .order('operation_date', { ascending: false })
      .limit(20);

    if (withdrawalsError) throw withdrawalsError;

    // Fetch transfers
    const { data: transfers, error: transfersError } = await supabase
      .from('transfers')
      .select('*')
      .order('operation_date', { ascending: false })
      .limit(20);

    if (transfersError) throw transfersError;

    // Combine and format all operations with the exact dates as stored in the database
    const formattedDeposits = deposits.map(d => ({
      id: `deposit-${d.id}`,
      type: 'deposit',
      amount: d.amount,
      date: d.operation_date,
      raw_date: d.operation_date, // Keep the raw date for exact formatting
      client_name: d.client_name,
      created_by: d.created_by,
      created_by_name: d.created_by ? usersMap[d.created_by] || 'Utilisateur inconnu' : 'Système',
      description: d.notes || `Versement pour ${d.client_name}`
    }));

    const formattedWithdrawals = withdrawals.map(w => ({
      id: `withdrawal-${w.id}`,
      type: 'withdrawal',
      amount: w.amount,
      date: w.operation_date,
      raw_date: w.operation_date, // Keep the raw date for exact formatting
      client_name: w.client_name,
      created_by: w.created_by,
      created_by_name: w.created_by ? usersMap[w.created_by] || 'Utilisateur inconnu' : 'Système',
      description: w.notes || `Retrait par ${w.client_name}`
    }));

    const formattedTransfers = transfers.map(t => ({
      id: `transfer-${t.id}`,
      type: 'transfer',
      amount: t.amount,
      date: t.operation_date,
      raw_date: t.operation_date, // Keep the raw date for exact formatting
      from_client: t.from_client,
      to_client: t.to_client,
      created_by: t.created_by,
      created_by_name: t.created_by ? usersMap[t.created_by] || 'Utilisateur inconnu' : 'Système',
      description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`
    }));

    // Combine all operations and sort by date (newest first)
    const allOperations = [...formattedDeposits, ...formattedWithdrawals, ...formattedTransfers]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50); // Limit to 50 most recent

    return allOperations;
  } catch (error) {
    console.error("Erreur lors du chargement des opérations récentes:", error);
    toast.error("Erreur lors du chargement des opérations récentes");
    throw error;
  }
};

export const OperationsHistoryTab = () => {
  const { data: operationsLog = [], isLoading } = useQuery({
    queryKey: ['recent-operations'],
    queryFn: fetchRecentOperations,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  const renderOperationsByType = (type: string) => {
    const filteredOperations = operationsLog.filter(op => op.type === type);
    
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
          Aucune opération de ce type
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
        <TabsTrigger value="deposit">Versements</TabsTrigger>
        <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
        <TabsTrigger value="transfer">Virements</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ScrollArea className="h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : operationsLog.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune opération enregistrée
            </div>
          ) : (
            <div className="divide-y divide-border">
              {operationsLog.map((operation, index) => (
                <LogEntryRenderer key={operation.id} entry={operation} index={index} type="operation" />
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="deposit">
        <ScrollArea className="h-[50vh]">
          {renderOperationsByType('deposit')}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="withdrawal">
        <ScrollArea className="h-[50vh]">
          {renderOperationsByType('withdrawal')}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="transfer">
        <ScrollArea className="h-[50vh]">
          {renderOperationsByType('transfer')}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
