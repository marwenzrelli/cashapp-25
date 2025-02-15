
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, TrendingUp, Users, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  { month: "Jan", transactions: 65 },
  { month: "Fév", transactions: 85 },
  { month: "Mar", transactions: 73 },
  { month: "Avr", transactions: 95 },
  { month: "Mai", transactions: 120 },
  { month: "Jun", transactions: 110 },
];

const recentActivity = [
  {
    id: 1,
    type: "deposit",
    amount: 1500,
    client: "Jean Dupont",
    time: "Il y a 5 minutes",
  },
  {
    id: 2,
    type: "withdrawal",
    amount: 500,
    client: "Marie Martin",
    time: "Il y a 15 minutes",
  },
  {
    id: 3,
    type: "transfer",
    amount: 750,
    client: "Sophie Bernard",
    time: "Il y a 30 minutes",
  },
];

const aiSuggestions = [
  {
    id: 1,
    message: "Pic d'activité détecté : Augmentez temporairement les limites de retrait",
    priority: "high",
  },
  {
    id: 2,
    message: "Tendance à la hausse des virements internationaux : Optimisez les taux de change",
    priority: "medium",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble et analyses en temps réel
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Versements</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231 €</div>
            <p className="text-xs text-muted-foreground">
              +20.1% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Retraits</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,845 €</div>
            <p className="text-xs text-muted-foreground">
              -5.2% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12 nouveaux clients cette semaine
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
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3B82F6" 
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
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${
                    suggestion.priority === "high" 
                      ? "bg-red-50 border-red-200 dark:bg-red-950/20" 
                      : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20"
                  }`}
                >
                  <div className="flex gap-2">
                    <AlertCircle className={`h-5 w-5 ${
                      suggestion.priority === "high" ? "text-red-500" : "text-yellow-500"
                    }`} />
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                </div>
              ))}
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
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  {activity.type === "deposit" && (
                    <ArrowUpCircle className="h-8 w-8 text-success" />
                  )}
                  {activity.type === "withdrawal" && (
                    <ArrowDownCircle className="h-8 w-8 text-danger" />
                  )}
                  {activity.type === "transfer" && (
                    <RefreshCcw className="h-8 w-8 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{activity.client}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    activity.type === "deposit" 
                      ? "text-success"
                      : activity.type === "withdrawal"
                      ? "text-danger" 
                      : ""
                  }`}>
                    {activity.type === "withdrawal" ? "-" : ""}
                    {activity.amount.toLocaleString()} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
