import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { 
  Sparkles, TrendingUp, Users, ArrowUpCircle, ArrowDownCircle, 
  AlertTriangle, UserCheck, Calendar, ArrowLeftRight, Activity,
  TrendingDown, BanknoteIcon
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, parse, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { addDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ClientStats } from "@/features/operations/types";
import { Transfer } from "@/features/transfers/types";

interface FilteredData {
  client_name?: string;
  fromClient?: string;
  toClient?: string;
  amount: number;
  created_at?: string;
  operation_date?: string;
}

const Statistics = () => {
  const { deposits, isLoading: isLoadingDeposits } = useDeposits();
  const { withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawals();
  const { transfers } = useTransfersList();
  const { currency } = useCurrency();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [clientFilter, setClientFilter] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");

  const filterData = (data: FilteredData[], type: string) => {
    return data.filter(item => {
      const itemDate = new Date(item.operation_date || item.created_at || '');
      const dateMatch = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(itemDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        });
      
      const clientMatch = !clientFilter || 
        (type === "transfers" 
          ? (item.fromClient?.toLowerCase().includes(clientFilter.toLowerCase()) ||
             item.toClient?.toLowerCase().includes(clientFilter.toLowerCase()))
          : item.client_name?.toLowerCase().includes(clientFilter.toLowerCase()));

      const typeMatch = transactionType === "all" || 
        (transactionType === "deposits" && type === "deposits") ||
        (transactionType === "withdrawals" && type === "withdrawals") ||
        (transactionType === "transfers" && type === "transfers");

      return dateMatch && clientMatch && typeMatch;
    });
  };

  const filteredDeposits = filterData(deposits as FilteredData[], "deposits");
  const filteredWithdrawals = filterData(withdrawals as FilteredData[], "withdrawals");
  const filteredTransfers = filterData(
    transfers.map(t => ({
      fromClient: t.fromClient,
      toClient: t.toClient,
      amount: t.amount,
      operation_date: t.date,
    })) as FilteredData[],
    "transfers"
  );

  const totalDeposits = filteredDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0);
  const totalWithdrawals = filteredWithdrawals.reduce((acc, withdrawal) => acc + (withdrawal.amount || 0), 0);
  const totalTransfers = filteredTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);

  const activeClients = new Set([
    ...filteredDeposits.map(dep => dep.client_name),
    ...filteredWithdrawals.map(w => w.client_name),
    ...filteredTransfers.map(transfer => transfer.fromClient),
    ...filteredTransfers.map(transfer => transfer.toClient)
  ]).size;
  const netFlow = totalDeposits - totalWithdrawals;

  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);

  const currentMonthDeposits = filteredDeposits.filter(dep => {
    const depositDate = new Date(dep.created_at || dep.operation_date || '');
    return depositDate >= startOfCurrentMonth && depositDate <= endOfCurrentMonth;
  });

  const currentMonthWithdrawals = filteredWithdrawals.filter(w => {
    const withdrawalDate = new Date(w.created_at || w.operation_date || '');
    return withdrawalDate >= startOfCurrentMonth && withdrawalDate <= endOfCurrentMonth;
  });

  const currentMonthTransfers = filteredTransfers.filter(transfer => {
    const transferDate = new Date(transfer.operation_date || transfer.created_at || '');
    return !isNaN(transferDate.getTime()) && transferDate >= startOfCurrentMonth && transferDate <= endOfCurrentMonth;
  });

  const lastMonth = subDays(startOfCurrentMonth, 1);
  const startOfLastMonth = startOfMonth(lastMonth);
  const endOfLastMonth = endOfMonth(lastMonth);

  const lastMonthDeposits = filteredDeposits.filter(dep => {
    const depositDate = new Date(dep.created_at || dep.operation_date || '');
    return depositDate >= startOfLastMonth && depositDate <= endOfLastMonth;
  });

  const lastMonthWithdrawals = filteredWithdrawals.filter(w => {
    const withdrawalDate = new Date(w.created_at || w.operation_date || '');
    return withdrawalDate >= startOfLastMonth && withdrawalDate <= endOfLastMonth;
  });

  const lastMonthTransfers = filteredTransfers.filter(transfer => {
    const transferDate = new Date(transfer.operation_date || transfer.created_at || '');
    return !isNaN(transferDate.getTime()) && transferDate >= startOfLastMonth && transferDate <= endOfLastMonth;
  });

  const currentMonthTotal = currentMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0) -
    currentMonthWithdrawals.reduce((acc, w) => acc + w.amount, 0) +
    currentMonthTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);
  
  const lastMonthTotal = lastMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0) -
    lastMonthWithdrawals.reduce((acc, w) => acc + w.amount, 0) +
    lastMonthTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);
  
  const percentageChange = lastMonthTotal !== 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  const dailyTransactionsBase = filteredDeposits.reduce((acc, dep) => {
    try {
      const date = format(new Date(dep.created_at), 'dd/MM/yyyy');
      acc[date] = (acc[date] || 0) + 1;
    } catch (error) {
      console.error("Error formatting date:", dep.created_at);
    }
    return acc;
  }, {} as Record<string, number>);

  const dailyTransactions = [...filteredDeposits, ...filteredWithdrawals, ...filteredTransfers].reduce((acc, op) => {
    try {
      const date = format(
        new Date('created_at' in op ? op.created_at : op.date), 
        'dd/MM/yyyy'
      );
      acc[date] = (acc[date] || 0) + 1;
    } catch (error) {
      console.error("Error formatting date for operation:", op);
    }
    return acc;
  }, {} as Record<string, number>);

  const averageTransactionsPerDay = Object.values(dailyTransactions).reduce((a, b) => a + b, 0) / 
    Math.max(Object.keys(dailyTransactions).length, 1);

  const last30DaysData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'dd/MM');
    
    const dayDeposits = filteredDeposits.filter(dep => {
      try {
        return format(new Date(dep.created_at), 'dd/MM') === formattedDate;
      } catch (error) {
        console.error("Error filtering deposit date:", dep.created_at);
        return false;
      }
    });
    
    const dayWithdrawals = filteredWithdrawals.filter(w => {
      try {
        return format(new Date(w.created_at), 'dd/MM') === formattedDate;
      } catch (error) {
        console.error("Error filtering withdrawal date:", w.created_at);
        return false;
      }
    });
    
    const dayTransfers = filteredTransfers.filter(transfer => {
      try {
        const transferDate = new Date(transfer.date);
        return !isNaN(transferDate.getTime()) && 
          format(transferDate, 'dd/MM') === formattedDate;
      } catch (error) {
        console.error("Error filtering transfer date:", transfer.date);
        return false;
      }
    });
    
    return {
      date: formattedDate,
      versements: dayDeposits.reduce((acc, dep) => acc + Math.max(dep.amount, 0), 0),
      retraits: dayWithdrawals.reduce((acc, w) => acc + w.amount, 0),
      virements: dayTransfers.reduce((acc, transfer) => acc + transfer.amount, 0),
      transactions: dayDeposits.length + dayWithdrawals.length + dayTransfers.length
    };
  }).reverse();

  const clientStats: Record<string, ClientStats> = {};
  
  filteredDeposits.forEach(dep => {
    if (!dep.client_name) return;
    
    if (!clientStats[dep.client_name]) {
      clientStats[dep.client_name] = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0
      };
    }
    clientStats[dep.client_name].totalAmount += dep.amount || 0;
    clientStats[dep.client_name].transactionCount += 1;
    clientStats[dep.client_name].averageAmount = 
      clientStats[dep.client_name].totalAmount / clientStats[dep.client_name].transactionCount;
  });

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

  if (isLoadingDeposits || isLoadingWithdrawals) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et analyses détaillées
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Input
                placeholder="Rechercher un client..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de transaction</label>
              <Select 
                value={transactionType} 
                onValueChange={(value: "all" | "deposits" | "withdrawals" | "transfers") => 
                  setTransactionType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les transactions</SelectItem>
                  <SelectItem value="deposits">Versements</SelectItem>
                  <SelectItem value="withdrawals">Retraits</SelectItem>
                  <SelectItem value="transfers">Virements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

        <Card className="bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Virements</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getAmountColor(totalTransfers)
            )}>
              {totalTransfers.toLocaleString()} TND
            </div>
            <p className="text-xs text-muted-foreground">
              {transfers.length} virements effectués
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
                    <linearGradient id="colorVersements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRetraits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVirements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="versements"
                    name="Versements"
                    stroke="#10B981"
                    fill="url(#colorVersements)"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="retraits"
                    name="Retraits"
                    stroke="#EF4444"
                    fill="url(#colorRetraits)"
                    stackId="2"
                  />
                  <Area
                    type="monotone"
                    dataKey="virements"
                    name="Virements"
                    stroke="#6366F1"
                    fill="url(#colorVirements)"
                    stackId="3"
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
                : "border-red-200 bg-red-50 dark:bg-red-955/20"
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
