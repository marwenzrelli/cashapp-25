import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Trash, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Activity, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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

const fetchDeletedOperations = async () => {
  console.log("Début de la récupération des opérations supprimées");
  const { data: deletedData, error: deletedError } = await supabase
    .from('deleted_transfers_log')
    .select('*')
    .order('deleted_at', { ascending: false });

  if (deletedError) {
    console.error("Erreur lors de la récupération des opérations supprimées:", deletedError);
    toast.error("Erreur lors de la récupération des opérations supprimées");
    throw deletedError;
  }

  // Log the data to help debug
  console.log("Données des opérations supprimées:", deletedData);
  console.log("Nombre d'opérations supprimées récupérées:", deletedData ? deletedData.length : 0);

  // Get user details for deleted_by IDs
  const userIds = [...new Set(deletedData.map(item => item.deleted_by))].filter(Boolean);
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

  // Format deleted operations for unified view
  const formattedDeletedOperations = deletedData.map((transaction: DeletedTransaction) => {
    let type = transaction.operation_type;
    let description = '';
    let clientInfo: any = {};

    if (type === 'deposit') {
      description = `Versement supprimé pour ${transaction.client_name}`;
      clientInfo = { client_name: transaction.client_name };
    } else if (type === 'withdrawal') {
      description = `Retrait supprimé pour ${transaction.client_name}`;
      clientInfo = { client_name: transaction.client_name };
    } else if (type === 'transfer') {
      description = `Virement supprimé de ${transaction.from_client} vers ${transaction.to_client}`;
      clientInfo = { 
        from_client: transaction.from_client,
        to_client: transaction.to_client
      };
    }

    return {
      id: transaction.id,
      type,
      amount: transaction.amount,
      date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
      created_by: transaction.deleted_by,
      created_by_name: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
      description,
      ...clientInfo
    };
  });

  return {
    deletedOperations: formattedDeletedOperations,
    deposits: deletedData.filter(transaction => transaction.operation_type === 'deposit')
      .map((transaction: DeletedTransaction) => ({
        id: transaction.id,
        action_type: 'Versement supprimé',
        action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
        details: `Versement supprimé pour ${transaction.client_name}`,
        target_id: transaction.original_id,
        target_name: transaction.client_name || '',
        amount: transaction.amount
      })),
    withdrawals: deletedData.filter(transaction => transaction.operation_type === 'withdrawal')
      .map((transaction: DeletedTransaction) => ({
        id: transaction.id,
        action_type: 'Retrait supprimé',
        action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
        details: `Retrait supprimé pour ${transaction.client_name}`,
        target_id: transaction.original_id,
        target_name: transaction.client_name || '',
        amount: transaction.amount
      })),
    transfers: deletedData.filter(transaction => transaction.operation_type === 'transfer')
      .map((transaction: DeletedTransaction) => ({
        id: transaction.id,
        action_type: 'Virement supprimé',
        action_date: format(new Date(transaction.deleted_at), 'dd/MM/yyyy HH:mm'),
        performed_by: usersMap[transaction.deleted_by] || 'Utilisateur inconnu',
        details: `Virement de ${transaction.from_client} vers ${transaction.to_client}`,
        target_id: transaction.original_id,
        target_name: `${transaction.from_client} → ${transaction.to_client}`,
        amount: transaction.amount
      }))
  };
};

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

    return allOperations;
  } catch (error) {
    console.error("Erreur lors du chargement des opérations récentes:", error);
    toast.error("Erreur lors du chargement des opérations récentes");
    throw error;
  }
};

export const SystemAuditLog = () => {
  const [activeTab, setActiveTab] = useState("user-activity");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Utilisez React Query pour charger les données des opérations supprimées
  const { data: deletedData, isLoading: isLoadingDeleted, refetch: refetchDeleted } = useQuery({
    queryKey: ['deleted-operations'],
    queryFn: fetchDeletedOperations,
    staleTime: 60000, // Les données restent "fresh" pendant 1 minute
    refetchOnWindowFocus: true
  });
  
  // Utilisez React Query pour charger les données des opérations récentes
  const { data: operationsLog = [], isLoading: isLoadingOperations, refetch: refetchOperations } = useQuery({
    queryKey: ['recent-operations'],
    queryFn: fetchRecentOperations,
    staleTime: 60000,
    refetchOnWindowFocus: true
  });

  const isLoading = isLoadingDeleted || isLoadingOperations;
  const deletedDeposits = deletedData?.deposits || [];
  const deletedWithdrawals = deletedData?.withdrawals || [];
  const deletedTransfers = deletedData?.transfers || [];
  const deletedOperationsLog = deletedData?.deletedOperations || [];

  useEffect(() => {
    const fetchLoginActivity = async () => {
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

        setAuditLogs(formattedLoginData);
      } catch (error) {
        console.error("Erreur lors du chargement des logs d'audit:", error);
        toast.error("Erreur lors du chargement des logs d'audit");
      }
    };

    fetchLoginActivity();
  }, []);

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
          <span className="text-xs text-muted-foreground">
            {operation.id.includes("deposit-") || operation.id.includes("withdrawal-") || operation.id.includes("transfer-")
              ? operation.id.split('-')[1]
              : operation.id}
          </span>
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
        {filteredOperations.map((operation, index) => renderOperationLogEntry(operation, index))}
      </div>
    );
  };
  
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
        {filteredOperations.map((operation, index) => renderOperationLogEntry(operation, index))}
      </div>
    );
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="user-activity">Connexions</TabsTrigger>
            <TabsTrigger value="operations-history">Opérations réalisées</TabsTrigger>
            <TabsTrigger value="deleted-operations">Opérations supprimées</TabsTrigger>
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
                      {operationsLog.map((operation, index) => renderOperationLogEntry(operation, index))}
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
          </TabsContent>
          
          <TabsContent value="deleted-operations">
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
                      {deletedOperationsLog.map((operation, index) => renderOperationLogEntry(operation, index))}
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
