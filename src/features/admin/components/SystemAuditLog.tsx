
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Trash, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Activity } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLogEntry {
  id: string;
  action_type: string;
  action_date: string;
  performed_by: string;
  details: string;
  target_id: string;
  target_name: string;
  amount?: number;
}

interface DeletedTransaction {
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

interface OperationLogEntry {
  id: string;
  type: string;
  amount: number;
  date: string;
  client_name?: string;
  from_client?: string;
  to_client?: string;
  created_by?: string;
  created_by_name?: string;
  description: string;
}

export const SystemAuditLog = () => {
  const [activeTab, setActiveTab] = useState("user-activity");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [deletedDeposits, setDeletedDeposits] = useState<AuditLogEntry[]>([]);
  const [deletedWithdrawals, setDeletedWithdrawals] = useState<AuditLogEntry[]>([]);
  const [deletedTransfers, setDeletedTransfers] = useState<AuditLogEntry[]>([]);
  const [operationsLog, setOperationsLog] = useState<OperationLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user login activity
        const { data: loginData, error: loginError } = await supabase
          .from('profiles')
          .select('id, full_name, last_login')
          .order('last_login', { ascending: false })
          .limit(50);

        if (loginError) throw loginError;

        // Format login data for the audit log
        const formattedLoginData = loginData.map(user => ({
          id: `login-${user.id}`,
          action_type: 'Connexion',
          action_date: user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm') : 'Jamais',
          performed_by: user.full_name,
          details: 'Connexion au système',
          target_id: user.id,
          target_name: user.full_name
        }));

        // Fetch deleted transactions logs
        const { data: deletedData, error: deletedError } = await supabase
          .from('deleted_transfers_log')
          .select('*')
          .order('deleted_at', { ascending: false });

        if (deletedError) throw deletedError;

        // Get user details for deleted_by IDs
        const userIds = [...new Set(deletedData.map(item => item.deleted_by))].filter(Boolean);
        
        let usersMap: Record<string, string> = {};
        
        if (userIds.length > 0) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);
          
          usersMap = (userData || []).reduce((acc, user) => {
            acc[user.id] = user.full_name;
            return acc;
          }, {} as Record<string, string>);
        }

        // Process deleted transactions by type
        const deposits = deletedData
          .filter(transaction => transaction.operation_type === 'deposit')
          .map((transaction: DeletedTransaction) => ({
            id: transaction.id,
            action_type: 'Versement supprimé',
            action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
            performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
            details: `Versement supprimé pour ${transaction.client_name}`,
            target_id: transaction.original_id,
            target_name: transaction.client_name || '',
            amount: transaction.amount
          }));

        const withdrawals = deletedData
          .filter(transaction => transaction.operation_type === 'withdrawal')
          .map((transaction: DeletedTransaction) => ({
            id: transaction.id,
            action_type: 'Retrait supprimé',
            action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
            performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
            details: `Retrait supprimé pour ${transaction.client_name}`,
            target_id: transaction.original_id,
            target_name: transaction.client_name || '',
            amount: transaction.amount
          }));

        const transfers = deletedData
          .filter(transaction => transaction.operation_type === 'transfer')
          .map((transaction: DeletedTransaction) => ({
            id: transaction.id,
            action_type: 'Virement supprimé',
            action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
            performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
            details: `Virement de ${transaction.from_client} vers ${transaction.to_client}`,
            target_id: transaction.original_id,
            target_name: `${transaction.from_client} → ${transaction.to_client}`,
            amount: transaction.amount
          }));

        // Fetch recent operations (new code)
        await fetchRecentOperations();

        setAuditLogs(formattedLoginData);
        setDeletedDeposits(deposits);
        setDeletedWithdrawals(withdrawals);
        setDeletedTransfers(transfers);
      } catch (error) {
        console.error("Erreur lors du chargement des logs d'audit:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch recent operations
  const fetchRecentOperations = async () => {
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

      // Combine and format all operations
      const formattedDeposits = deposits.map(d => ({
        id: `deposit-${d.id}`,
        type: 'deposit',
        amount: d.amount,
        date: format(new Date(d.operation_date), 'dd/MM/yyyy HH:mm'),
        client_name: d.client_name,
        created_by: d.created_by,
        created_by_name: d.created_by ? usersMap[d.created_by] || 'Utilisateur inconnu' : 'Système',
        description: `Versement pour ${d.client_name}`
      }));

      const formattedWithdrawals = withdrawals.map(w => ({
        id: `withdrawal-${w.id}`,
        type: 'withdrawal',
        amount: w.amount,
        date: format(new Date(w.operation_date), 'dd/MM/yyyy HH:mm'),
        client_name: w.client_name,
        created_by: w.created_by,
        created_by_name: w.created_by ? usersMap[w.created_by] || 'Utilisateur inconnu' : 'Système',
        description: `Retrait par ${w.client_name}`
      }));

      const formattedTransfers = transfers.map(t => ({
        id: `transfer-${t.id}`,
        type: 'transfer',
        amount: t.amount,
        date: format(new Date(t.operation_date), 'dd/MM/yyyy HH:mm'),
        from_client: t.from_client,
        to_client: t.to_client,
        created_by: t.created_by,
        created_by_name: t.created_by ? usersMap[t.created_by] || 'Utilisateur inconnu' : 'Système',
        description: `Virement de ${t.from_client} vers ${t.to_client}`
      }));

      // Combine all operations and sort by date (newest first)
      const allOperations = [...formattedDeposits, ...formattedWithdrawals, ...formattedTransfers]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50); // Limit to 50 most recent

      setOperationsLog(allOperations);
    } catch (error) {
      console.error("Erreur lors du chargement des opérations récentes:", error);
    }
  };

  // Function to render transaction log entry
  const renderTransactionLogEntry = (log: AuditLogEntry, index: number) => (
    <div 
      key={log.id} 
      className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
    >
      <div className="flex-shrink-0 mt-1">
        <Trash className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{log.action_type}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{log.action_date}</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            {log.performed_by}
          </Badge>
        </div>
        <p className="text-sm mt-1">{log.details}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">ID: {log.target_id}</span>
          {log.amount && (
            <Badge variant="secondary" className="font-semibold">
              {log.amount.toLocaleString()} TND
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  // Function to render operation log entry
  const renderOperationLogEntry = (operation: OperationLogEntry, index: number) => (
    <div 
      key={operation.id} 
      className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
    >
      <div className="flex-shrink-0 mt-1">
        {getOperationIcon(operation.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-medium text-sm">
              {operation.type === 'deposit' ? 'Versement' : 
               operation.type === 'withdrawal' ? 'Retrait' : 'Virement'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{operation.date}</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            {operation.created_by_name || 'Système'}
          </Badge>
        </div>
        <p className="text-sm mt-1">{operation.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{operation.id.split('-')[1]}</span>
          <Badge 
            variant="secondary" 
            className={`font-semibold ${
              operation.type === 'deposit' ? 'bg-green-100 text-green-800' : 
              operation.type === 'withdrawal' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}
          >
            {operation.amount.toLocaleString()} TND
          </Badge>
        </div>
      </div>
    </div>
  );

  // Function to render audit log entry
  const renderAuditLogEntry = (log: AuditLogEntry, index: number) => (
    <div 
      key={log.id} 
      className={`flex items-start p-3 gap-4 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}
    >
      <div className="flex-shrink-0 mt-1">
        {log.action_type === 'Connexion' ? (
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{log.action_type}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{log.action_date}</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            {log.performed_by}
          </Badge>
        </div>
        <p className="text-sm mt-1">{log.details}</p>
      </div>
    </div>
  );

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <RefreshCcw className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Journal d'audit du système</CardTitle>
        <CardDescription>
          Historique des connexions, des opérations réalisées et supprimées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="user-activity">Connexions</TabsTrigger>
            <TabsTrigger value="operations-history">Opérations réalisées</TabsTrigger>
            <TabsTrigger value="deleted-deposits">Versements supprimés</TabsTrigger>
            <TabsTrigger value="deleted-withdrawals">Retraits supprimés</TabsTrigger>
            <TabsTrigger value="deleted-transfers">Virements supprimés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user-activity">
            <ScrollArea className="h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucune activité enregistrée
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {auditLogs.map((log, index) => renderAuditLogEntry(log, index))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="operations-history">
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
                  {operationsLog.map((operation, index) => renderOperationLogEntry(operation, index))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="deleted-deposits">
            <ScrollArea className="h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : deletedDeposits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun versement supprimé
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {deletedDeposits.map((log, index) => renderTransactionLogEntry(log, index))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="deleted-withdrawals">
            <ScrollArea className="h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : deletedWithdrawals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun retrait supprimé
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {deletedWithdrawals.map((log, index) => renderTransactionLogEntry(log, index))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="deleted-transfers">
            <ScrollArea className="h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : deletedTransfers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun virement supprimé
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {deletedTransfers.map((log, index) => renderTransactionLogEntry(log, index))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
