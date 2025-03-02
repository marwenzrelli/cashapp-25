
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, TrendingUp, Users, AlertCircle, Sparkles, Send, ArrowLeftRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SystemUser } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { OperationsMobileCard } from "@/features/clients/components/operations-history/OperationsMobileCard";

interface DashboardStats {
  total_deposits: number;
  total_withdrawals: number;
  client_count: number;
  transfer_count: number;
  total_balance: number;
  sent_transfers: number;
  received_transfers: number;
  monthly_stats: any[];
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  client_name: string;
  status: string;
  description?: string;
  fromClient?: string;
  toClient?: string;
}

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_deposits: 0,
    total_withdrawals: 0,
    client_count: 0,
    transfer_count: 0,
    total_balance: 0,
    sent_transfers: 0,
    received_transfers: 0,
    monthly_stats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { currency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchStats = async () => {
    try {
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('status', 'completed');

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'completed');

      if (withdrawalsError) throw withdrawalsError;

      const { count: clientCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (clientsError) throw clientsError;

      const { data: monthlyStats, error: statsError } = await supabase
        .from('operation_statistics')
        .select('*')
        .order('day', { ascending: true })
        .limit(12);

      if (statsError) throw statsError;

      const { data: balanceData, error: balanceError } = await supabase
        .from('clients')
        .select('solde')
        .eq('status', 'active');

      if (balanceError) throw balanceError;

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('amount, from_client, to_client')
        .eq('status', 'completed');

      if (transfersError) throw transfersError;

      const total_deposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const total_withdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const total_balance = balanceData?.reduce((sum, client) => sum + Number(client.solde), 0) || 0;
      const sent_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const received_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        total_deposits,
        total_withdrawals,
        client_count: clientCount || 0,
        transfer_count: monthlyStats?.[0]?.transfer_count || 0,
        monthly_stats: monthlyStats || [],
        total_balance,
        sent_transfers,
        received_transfers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Récupérer les versements récents
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, operation_date, client_name, status, description')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (depositsError) throw depositsError;

      // Récupérer les retraits récents
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, operation_date, client_name, status, description')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les transferts récents
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, operation_date, from_client, to_client, status, reason')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (transfersError) throw transfersError;

      // Combiner et formater les résultats
      const allActivity = [
        ...(deposits?.map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.operation_date,
          client_name: d.client_name,
          fromClient: d.client_name,
          status: d.status,
          description: d.description || `Versement pour ${d.client_name}`
        })) || []),
        ...(withdrawals?.map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.operation_date,
          client_name: w.client_name,
          fromClient: w.client_name,
          status: w.status,
          description: w.description || `Retrait par ${w.client_name}`
        })) || []),
        ...(transfers?.map(t => ({
          id: t.id.toString(),
          type: 'transfer' as const,
          amount: t.amount,
          date: t.operation_date,
          client_name: `${t.from_client} → ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          status: t.status,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentActivity(allActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error("Erreur lors du chargement de l'activité récente");
    }
  };

  const handleUpdateProfile = async (updatedUser: Partial<SystemUser>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.fullName,
          email: updatedUser.email,
          department: updatedUser.department,
          phone: updatedUser.phone
        })
        .eq('id', currentUser?.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditProfileOpen(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchStats();
    toast.success("Statistiques actualisées");
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble et analyses en temps réel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solde Général</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_balance.toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des soldes clients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Virements Émis</CardTitle>
            <Send className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sent_transfers.toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des virements envoyés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Virements Reçus</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.received_transfers.toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des virements reçus
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Versements</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_deposits.toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.monthly_stats[0]?.deposit_count || 0} versements ce mois
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Retraits</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_withdrawals.toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.monthly_stats[0]?.withdrawal_count || 0} retraits ce mois
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.client_count}</div>
            <p className="text-xs text-muted-foreground">
              {stats.transfer_count} transferts effectués
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendance des Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly_stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
                  }} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    name="Versements"
                    dataKey="total_deposits" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    name="Retraits"
                    dataKey="total_withdrawals" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggestions IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                <AlertCircle className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium mb-1">Analyse des tendances</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.total_deposits > stats.total_withdrawals 
                      ? "Les versements sont supérieurs aux retraits, ce qui indique une bonne santé financière."
                      : "Les retraits sont supérieurs aux versements, surveillez les flux de trésorerie."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id}>
                {/* Desktop version */}
                <div className="hidden md:flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                  <div className="flex items-center gap-4">
                    {activity.type === 'deposit' && (
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                        <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'withdrawal' && (
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                        <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    {activity.type === 'transfer' && (
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {activity.type === 'deposit' && 'Versement'}
                        {activity.type === 'withdrawal' && 'Retrait'}
                        {activity.type === 'transfer' && 'Virement'}
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.client_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className={cn(
                      "font-medium",
                      activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
                      activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
                      "text-blue-600 dark:text-blue-400"
                    )}>
                      {activity.type === 'withdrawal' ? '-' : ''}{activity.amount.toLocaleString()} {currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.date), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                
                {/* Mobile version using OperationsMobileCard */}
                <div className="md:hidden">
                  <OperationsMobileCard 
                    operation={{
                      id: activity.id,
                      type: activity.type,
                      amount: activity.amount,
                      date: activity.date,
                      fromClient: activity.fromClient || activity.client_name,
                      toClient: activity.toClient,
                      description: activity.description || ''
                    }}
                    currency={currency}
                    colorClass={
                      activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
                      activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
                      "text-blue-600 dark:text-blue-400"
                    }
                  />
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentUser={{
          name: currentUser?.fullName || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
          department: currentUser?.department || "",
          role: currentUser?.role === "supervisor" ? "Superviseur" : 
                currentUser?.role === "manager" ? "Gestionnaire" : "Caissier",
          joinDate: currentUser?.createdAt || "",
          employeeId: currentUser?.id || ""
        }}
        onSubmit={handleUpdateProfile}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        currentSettings={{
          notifications: false,
          darkMode: false,
          twoFactor: false,
          language: "fr"
        }}
      />
    </div>
  );
};

export default Dashboard;
