
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, TrendingUp, Users, AlertCircle, Sparkles, User, Settings, Bell, Shield, Building, Calendar, Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SystemUser } from "@/types/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const data = [];
const recentActivity = [];
const aiSuggestions = [];

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<"EUR" | "USD" | "TND" | "AED">(currency);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      const usersData = localStorage.getItem('admin_users');
      const users = JSON.parse(usersData || '[]');
      const user = users.find((u: SystemUser) => u.id === currentUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  const handleCurrencySelect = (value: "EUR" | "USD" | "TND" | "AED") => {
    setSelectedCurrency(value);
  };

  const handleConfirmCurrency = async () => {
    await setCurrency(selectedCurrency);
  };

  const handleUpdateProfile = (updatedUser: Partial<SystemUser>) => {
    const usersData = localStorage.getItem('admin_users');
    let users = JSON.parse(usersData || '[]');
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      users = users.map((u: SystemUser) => 
        u.id === currentUserId ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem('admin_users', JSON.stringify(users));
      const updatedCurrentUser = users.find((u: SystemUser) => u.id === currentUserId);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }
    }
    setIsEditProfileOpen(false);
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
          <div className="flex items-center gap-2">
            <Select value={selectedCurrency} onValueChange={handleCurrencySelect}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Sélectionner la devise" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="TND">TND (د.ت)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleConfirmCurrency}
              disabled={selectedCurrency === currency}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Versements</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0 {currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TND" ? "د.ت" : "د.إ"}
            </div>
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
            <div className="text-2xl font-bold">
              0 {currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TND" ? "د.ت" : "د.إ"}
            </div>
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
              +0 nouveaux clients cette semaine
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
                <LineChart data={[]}>
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de devise</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir changer la devise vers {selectedCurrency} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmCurrencyChange}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
