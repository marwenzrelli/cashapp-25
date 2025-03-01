
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, ArrowDownUp, PlusCircle, Calendar, FileText, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  action_type: 'user_creation' | 'deposit' | 'withdrawal' | 'transfer' | 'transfer_deleted';
  action_date: string;
  performed_by: string;
  details: string;
  target_id: string;
  target_name?: string;
  amount?: number;
}

export const SystemAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Récupère les utilisateurs créés
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');
      
      if (profilesError) throw profilesError;

      // Récupère les versements
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, client_name, created_at, created_by, status');
      
      if (depositsError) throw depositsError;

      // Récupère les retraits
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, client_name, created_at, created_by, status');
      
      if (withdrawalsError) throw withdrawalsError;

      // Récupère les virements
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, from_client, to_client, created_at, created_by, status');
      
      if (transfersError) throw transfersError;
      
      // Récupère les virements supprimés depuis la table des logs
      const { data: deletedTransfers, error: deletedTransfersError } = await supabase
        .from('deleted_transfers_log')
        .select('*');
      
      if (deletedTransfersError) {
        console.error("Erreur lors de la récupération des virements supprimés:", deletedTransfersError);
        // Continue execution even if there's an error (table might not exist yet)
      }

      // Récupère les détails des utilisateurs pour les IDs created_by
      const allCreatorIds = [
        ...deposits.map(d => d.created_by),
        ...withdrawals.map(w => w.created_by),
        ...transfers.map(t => t.created_by),
        ...(deletedTransfers ? deletedTransfers.map(dt => dt.deleted_by) : [])
      ].filter(id => id !== null);
      
      const uniqueCreatorIds = [...new Set(allCreatorIds)];
      
      let creatorDetails: Record<string, string> = {};
      
      if (uniqueCreatorIds.length > 0) {
        const { data: creators, error: creatorsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueCreatorIds);
        
        if (creatorsError) throw creatorsError;
        
        creatorDetails = creators.reduce((acc, creator) => {
          acc[creator.id] = creator.full_name;
          return acc;
        }, {} as Record<string, string>);
      }

      // Transforme les données en logs d'audit uniformes
      const userCreationLogs: AuditLogEntry[] = profiles.map(profile => ({
        id: `user-${profile.id}`,
        action_type: 'user_creation',
        action_date: profile.created_at,
        performed_by: 'system', // Généralement créé par le système lors de l'inscription
        details: `Création d'un nouvel utilisateur: ${profile.full_name}`,
        target_id: profile.id,
        target_name: profile.full_name
      }));

      const depositLogs: AuditLogEntry[] = deposits.map(deposit => ({
        id: `deposit-${deposit.id}`,
        action_type: 'deposit',
        action_date: deposit.created_at,
        performed_by: creatorDetails[deposit.created_by] || 'Inconnu',
        details: `Versement pour ${deposit.client_name}`,
        target_id: deposit.id.toString(),
        target_name: deposit.client_name,
        amount: deposit.amount
      }));

      const withdrawalLogs: AuditLogEntry[] = withdrawals.map(withdrawal => ({
        id: `withdrawal-${withdrawal.id}`,
        action_type: 'withdrawal',
        action_date: withdrawal.created_at,
        performed_by: creatorDetails[withdrawal.created_by] || 'Inconnu',
        details: `Retrait pour ${withdrawal.client_name}`,
        target_id: withdrawal.id,
        target_name: withdrawal.client_name,
        amount: withdrawal.amount
      }));

      const transferLogs: AuditLogEntry[] = transfers.map(transfer => ({
        id: `transfer-${transfer.id}`,
        action_type: 'transfer',
        action_date: transfer.created_at,
        performed_by: creatorDetails[transfer.created_by] || 'Inconnu',
        details: `Virement de ${transfer.from_client} à ${transfer.to_client}`,
        target_id: transfer.id,
        target_name: `${transfer.from_client} → ${transfer.to_client}`,
        amount: transfer.amount
      }));
      
      // Ajouter les virements supprimés s'ils existent
      const deletedTransferLogs: AuditLogEntry[] = deletedTransfers ? deletedTransfers.map(transfer => ({
        id: `deleted-transfer-${transfer.id}`,
        action_type: 'transfer_deleted',
        action_date: transfer.deleted_at,
        performed_by: creatorDetails[transfer.deleted_by] || 'Inconnu',
        details: `Virement supprimé de ${transfer.from_client} à ${transfer.to_client}`,
        target_id: transfer.original_id,
        target_name: `${transfer.from_client} → ${transfer.to_client}`,
        amount: transfer.amount
      })) : [];

      // Combine tous les logs et trie par date (plus récents en premier)
      const allLogs = [
        ...userCreationLogs,
        ...depositLogs,
        ...withdrawalLogs,
        ...transferLogs,
        ...deletedTransferLogs
      ].sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());

      setAuditLogs(allLogs);
    } catch (error) {
      console.error("Erreur lors du chargement des logs d'audit:", error);
      toast.error("Impossible de charger les logs d'audit du système");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = activeTab === "all" 
    ? auditLogs 
    : auditLogs.filter(log => log.action_type === activeTab);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'user_creation': return <User className="h-4 w-4 text-blue-500" />;
      case 'deposit': return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <CreditCard className="h-4 w-4 text-red-500" />;
      case 'transfer': return <ArrowDownUp className="h-4 w-4 text-orange-500" />;
      case 'transfer_deleted': return <Trash2 className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'user_creation': return "Création d'utilisateur";
      case 'deposit': return "Versement";
      case 'withdrawal': return "Retrait";
      case 'transfer': return "Virement";
      case 'transfer_deleted': return "Virement supprimé";
      default: return "Action inconnue";
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'user_creation': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'deposit': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'withdrawal': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'transfer': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case 'transfer_deleted': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Journal des activités du système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="user_creation">Utilisateurs</TabsTrigger>
            <TabsTrigger value="deposit">Versements</TabsTrigger>
            <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
            <TabsTrigger value="transfer">Virements</TabsTrigger>
            <TabsTrigger value="transfer_deleted">Virements supprimés</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune activité trouvée
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[150px]">Type</TableHead>
                      <TableHead>Effectué par</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.action_date)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${getActionColor(log.action_type)}`}
                          >
                            {getActionIcon(log.action_type)}
                            <span>{getActionText(log.action_type)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.performed_by}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.details}</div>
                          {log.target_name && (
                            <div className="text-xs text-muted-foreground">
                              {log.action_type === 'user_creation' ? `ID: ${log.target_id}` : log.target_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.amount !== undefined ? (
                            <span className={log.action_type === 'withdrawal' || log.action_type === 'transfer_deleted' ? 'text-red-600' : 'text-green-600'}>
                              {log.amount.toLocaleString()} TND
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
