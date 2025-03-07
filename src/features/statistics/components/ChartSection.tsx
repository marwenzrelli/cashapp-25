
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
  );
};
