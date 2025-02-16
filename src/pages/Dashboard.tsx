import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, TrendingUp, Users, AlertCircle, Sparkles, User, Settings, Bell, Shield, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";

const data = [];

const recentActivity = [];

const aiSuggestions = [];

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentUser = {
    name: "Sophie Martin",
    email: "sophie.martin@flowcash.fr",
    phone: "+33 6 12 34 56 78",
    department: "Service Caisse",
    role: "Superviseur",
    joinDate: "15/01/2023",
    employeeId: "SUP-2023-001"
  };

  const currentSettings = {
    notifications: true,
    darkMode: false,
    twoFactor: true,
    language: "fr",
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
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Profile Section */}
      <Card className="bg-gradient 
        to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 
        overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <CardContent className="p-6">
          <div className="flex items-start gap-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src="/placeholder.svg" alt="Photo de profil" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" className="text-xs">
                  Modifier
                </Button>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                    {currentUser.role}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ID: {currentUser.employeeId}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{currentUser.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Niveau d'accès : {currentUser.role === "Superviseur" ? "Complet" : "Restreint"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  <span>Notifications : {currentSettings.notifications ? 'Activées' : 'Désactivées'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>En poste depuis : {currentUser.joinDate}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <User className="h-4 w-4" />
                  Éditer le profil
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <div className="text-center p-3 space-y-1">
                <div className="text-2xl font-bold text-primary">152</div>
                <div className="text-sm text-muted-foreground">Opérations supervisées</div>
              </div>
              <div className="text-center p-3 space-y-1 border-x">
                <div className="text-2xl font-bold text-primary">45k€</div>
                <div className="text-sm text-muted-foreground">Volume géré</div>
              </div>
              <div className="text-center p-3 space-y-1">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Taux de validation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentUser={currentUser}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        currentSettings={currentSettings}
      />
    </div>
  );
};

export default Dashboard;
