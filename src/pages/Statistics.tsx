import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Sparkles, TrendingUp, Users, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const Statistics = () => {
  const { currency } = useCurrency();
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Analyses et prévisions intelligentes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Versements</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 TND</div>
            <p className="text-xs text-muted-foreground">
              +0% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Retraits</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 TND</div>
            <p className="text-xs text-muted-foreground">
              +0% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 nouveaux clients ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="versements"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="retraits"
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
            <CardTitle>Répartition de l'Activité Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
