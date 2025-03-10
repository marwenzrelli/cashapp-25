
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface ChartSectionProps {
  last30DaysData: {
    date: string;
    versements: number;
    retraits: number;
    virements: number;
    transactions: number;
  }[];
  topClients: [string, { totalAmount: number; transactionCount: number; averageAmount: number }][];
}

export const ChartSection = ({ last30DaysData, topClients }: ChartSectionProps) => {
  // Format data for the top clients chart to ensure it displays correctly
  const topClientsData = topClients.map(([name, stats]) => ({
    name: name || "Client sans nom",
    montant: parseFloat(stats.totalAmount.toFixed(2)),
    transactions: stats.transactionCount
  }));

  console.log("Top Clients Data for chart:", topClientsData);

  return (
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
            {last30DaysData.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune donnée disponible pour les 30 derniers jours
              </div>
            )}
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
            {topClientsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar 
                    dataKey="montant" 
                    name="Montant Total" 
                    fill="#8884d8" 
                  />
                  <Bar 
                    dataKey="transactions" 
                    name="Nombre de Transactions" 
                    fill="#82ca9d" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <p>Aucune donnée client disponible</p>
                <p className="text-sm">Rafraîchissez la page ou vérifiez les filtres appliqués</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
