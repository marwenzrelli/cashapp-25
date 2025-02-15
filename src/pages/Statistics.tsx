
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

// Données de test (à remplacer par des données réelles)
const monthlyData = [
  { month: "Jan", deposits: 4000, withdrawals: 2400, transfers: 2400 },
  { month: "Fév", deposits: 3000, withdrawals: 1398, transfers: 2210 },
  { month: "Mar", deposits: 2000, withdrawals: 9800, transfers: 2290 },
  { month: "Avr", deposits: 2780, withdrawals: 3908, transfers: 2000 },
  { month: "Mai", deposits: 1890, withdrawals: 4800, transfers: 2181 },
  { month: "Jun", deposits: 2390, withdrawals: 3800, transfers: 2500 },
];

const dailyTransactions = [
  { date: "Lun", count: 12 },
  { date: "Mar", count: 19 },
  { date: "Mer", count: 15 },
  { date: "Jeu", count: 23 },
  { date: "Ven", count: 28 },
  { date: "Sam", count: 10 },
  { date: "Dim", count: 5 },
];

const Statistics = () => {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Visualisez les tendances et l'activité de votre système
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mouvements mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deposits" name="Versements" fill="#10B981" />
                  <Bar dataKey="withdrawals" name="Retraits" fill="#EF4444" />
                  <Bar dataKey="transfers" name="Virements" fill="#6B7280" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité journalière</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Transactions" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
