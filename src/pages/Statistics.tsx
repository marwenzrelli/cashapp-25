
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { 
  Sparkles, TrendingUp, Users, ArrowUpCircle, ArrowDownCircle, 
  AlertTriangle, UserCheck, Calendar, ArrowLeftRight, Activity,
  TrendingDown, BanknoteIcon
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

const Statistics = () => {
  const { deposits, isLoading } = useDeposits();
  const { currency } = useCurrency();

  // Calculs des totaux
  const totalDeposits = deposits.reduce((acc, dep) => acc + (dep.amount > 0 ? dep.amount : 0), 0);
  const totalWithdrawals = deposits.reduce((acc, dep) => acc + (dep.amount < 0 ? Math.abs(dep.amount) : 0), 0);
  const activeClients = new Set(deposits.map(dep => dep.client_name)).size;
  const netFlow = totalDeposits - totalWithdrawals;

  // Analyse temporelle
  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  const currentMonthDeposits = deposits.filter(dep => 
    new Date(dep.created_at) >= startOfCurrentMonth && 
    new Date(dep.created_at) <= endOfCurrentMonth
  );

  const lastMonth = subDays(startOfCurrentMonth, 1);
  const startOfLastMonth = startOfMonth(lastMonth);
  const endOfLastMonth = endOfMonth(lastMonth);

  const lastMonthDeposits = deposits.filter(dep => 
    new Date(dep.created_at) >= startOfLastMonth && 
    new Date(dep.created_at) <= endOfLastMonth
  );

  // Calcul des tendances
  const currentMonthTotal = currentMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0);
  const lastMonthTotal = lastMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0);
  const percentageChange = lastMonthTotal !== 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  // Analyse des transactions par jour
  const dailyTransactions = deposits.reduce((acc, dep) => {
    const date = format(new Date(dep.created_at), 'dd/MM/yyyy');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Moyenne des transactions par jour
  const averageTransactionsPerDay = Object.values(dailyTransactions).reduce((a, b) => a + b, 0) / 
    Object.keys(dailyTransactions).length || 0;

  // Données pour le graphique d'évolution
  const last30DaysData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'dd/MM');
    const dayDeposits = deposits.filter(dep => 
      format(new Date(dep.created_at), 'dd/MM') === formattedDate
    );
    return {
      date: formattedDate,
      montant: dayDeposits.reduce((acc, dep) => acc + dep.amount, 0),
      transactions: dayDeposits.length
    };
  }).reverse();

  // Analyse des clients
  const clientStats = deposits.reduce((acc, dep) => {
    if (!acc[dep.client_name]) {
      acc[dep.client_name] = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0
      };
    }
    acc[dep.client_name].totalAmount += dep.amount;
    acc[dep.client_name].transactionCount += 1;
    acc[dep.client_name].averageAmount = 
      acc[dep.client_name].totalAmount / acc[dep.client_name].transactionCount;
    return acc;
  }, {} as Record<string, { totalAmount: number; transactionCount: number; averageAmount: number }>);

  const topClients = Object.entries(clientStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, 5);

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getPercentageColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et analyses détaillées
        </p>
      </div>

      {/* Cartes principales */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entrées Totales</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getAmountColor(totalDeposits)
            )}>
              {totalDeposits.toLocaleString()} TND
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={getPercentageColor(percentageChange)}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </span>
              {' '}vs mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sorties Totales</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getAmountColor(-totalWithdrawals)
            )}>
              {totalWithdrawals.toLocaleString()} TND
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={getPercentageColor(-percentageChange)}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </span>
              {' '}vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Flux Net</CardTitle>
            {netFlow >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getAmountColor(netFlow)
            )}>
              {netFlow.toLocaleString()} TND
            </div>
            <p className="text-xs text-muted-foreground">
              Balance des mouvements
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {averageTransactionsPerDay.toFixed(1)} transactions/jour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Évolution sur 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30DaysData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top 5 Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topClients.map(([name, stats]) => ({
                    name,
                    montant: stats.totalAmount,
                    transactions: stats.transactionCount
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="montant" fill="#8884d8" />
                  <Bar dataKey="transactions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className={cn(
              "p-4 rounded-lg border",
              percentageChange >= 0 
                ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                : "border-red-200 bg-red-50 dark:bg-red-950/20"
            )}>
              <div className="flex items-start gap-3">
                {percentageChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {percentageChange >= 0 ? "Croissance" : "Décroissance"} mensuelle
                  </p>
                  <p className="text-sm mt-1">
                    {Math.abs(percentageChange).toFixed(1)}% de {percentageChange >= 0 ? "hausse" : "baisse"} 
                    par rapport au mois précédent
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Activité journalière</p>
                  <p className="text-sm mt-1">
                    En moyenne {averageTransactionsPerDay.toFixed(1)} transactions par jour
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-start gap-3">
                <BanknoteIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Transaction moyenne</p>
                  <p className="text-sm mt-1">
                    {(totalDeposits / deposits.length).toFixed(0)} TND par opération
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
