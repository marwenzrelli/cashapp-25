import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Mail,
  Building,
  UserCog,
  ChevronDown,
  RefreshCcw,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { SystemUser, UserRole } from "@/types/admin";

const Administration = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "cashier" as UserRole,
    department: "",
  });

  const serviceExplanations = [
    {
      name: "Finance",
      description: "Gestion des ressources financières et budgets",
      roles: {
        supervisor: "Validation des opérations importantes",
        manager: "Suivi des performances financières",
        cashier: "Transactions quotidiennes"
      },
      icon: <Building className="h-6 w-6 text-blue-600" />
    },
    {
      name: "Opérations",
      description: "Exécution des processus opérationnels",
      roles: {
        supervisor: "Supervision des processus",
        manager: "Coordination des équipes",
        cashier: "Gestion des opérations"
      },
      icon: <Users className="h-6 w-6 text-green-600" />
    },
    {
      name: "Comptabilité",
      description: "Suivi comptable et reporting",
      roles: {
        supervisor: "Validation des bilans",
        manager: "Contrôle des écritures",
        cashier: "Saisie comptable"
      },
      icon: <UserCog className="h-6 w-6 text-purple-600" />
    }
  ];

  const handleAddUser = () => {
    const user: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      status: "active",
      permissions: [],
      createdAt: new Date().toISOString(),
    };

    setUsers([user, ...users]);
    setIsAddUserOpen(false);
    toast.success("Utilisateur créé avec succès");
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
    toast.success("Statut de l'utilisateur mis à jour");
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  const connectedUser: SystemUser = {
    id: "current-user",
    fullName: "Jean Dupont",
    email: "jean.dupont@example.com",
    role: "supervisor",
    status: "active",
    permissions: [],
    createdAt: new Date().toISOString(),
    department: "finance",
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "supervisor":
        return "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/20";
      case "manager":
        return "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/20";
      case "cashier":
        return "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/20";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "supervisor":
        return <Shield className="h-8 w-8 text-purple-600" />;
      case "manager":
        return <UserCog className="h-8 w-8 text-green-600" />;
      case "cashier":
        return <Users className="h-8 w-8 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Gestion des utilisateurs et des autorisations
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Superviseurs</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "supervisor").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gestionnaires</CardTitle>
            <UserCog className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "manager").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Caissiers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "cashier").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Gestion des utilisateurs
            </CardTitle>
            <div className="flex flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-[180px]">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Opérations</SelectItem>
                  <SelectItem value="accounting">Comptabilité</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={selectedRole} 
                onValueChange={(value: UserRole | "all") => setSelectedRole(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <UserCog className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="supervisor">Superviseur</SelectItem>
                  <SelectItem value="manager">Gestionnaire</SelectItem>
                  <SelectItem value="cashier">Caissier</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière Connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "supervisor"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : user.role === "manager"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }
                    >
                      {user.role === "supervisor"
                        ? "Superviseur"
                        : user.role === "manager"
                        ? "Gestionnaire"
                        : "Caissier"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {user.status === "active" ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        {user.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? user.lastLogin : "Jamais connecté"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur et définissez ses autorisations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="fullName">Nom complet</label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label>Rôle</label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Superviseur</SelectItem>
                  <SelectItem value="manager">Gestionnaire</SelectItem>
                  <SelectItem value="cashier">Caissier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Service</label>
              <Select
                value={newUser.department}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Opérations</SelectItem>
                  <SelectItem value="accounting">Comptabilité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Votre Rôle dans le Système</h2>
            <p className="text-muted-foreground">
              Aperçu de vos responsabilités et autorisations
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className={`group relative overflow-hidden bg-gradient-to-br ${getRoleColor(connectedUser.role)} hover:shadow-lg transition-all duration-300`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {getRoleIcon(connectedUser.role)}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {connectedUser.fullName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {connectedUser.email}
                  </p>
                </div>
                <div className="mt-1">
                  {getRoleIcon(connectedUser.role)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${connectedUser.role === "supervisor" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        connectedUser.role === "manager" ? "bg-green-50 text-green-700 border-green-200" :
                        "bg-orange-50 text-orange-700 border-orange-200"}
                      px-3 py-1 text-sm font-medium
                    `}
                  >
                    {connectedUser.role === "supervisor" ? "Superviseur" :
                     connectedUser.role === "manager" ? "Gestionnaire" :
                     "Caissier"}
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Informations</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>Service: {connectedUser.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Statut: Actif</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Autorisations</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Versements", "Retraits", "Virements", "Clients"].map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Services et Rôles</h2>
            <p className="text-muted-foreground">
              Vue d'ensemble des responsabilités par service
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {serviceExplanations.map((service) => (
            <Card 
              key={service.name}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {service.icon}
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Superviseur:</span>
                    <span className="text-sm text-muted-foreground">{service.roles.supervisor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Gestionnaire:</span>
                    <span className="text-sm text-muted-foreground">{service.roles.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Caissier:</span>
                    <span className="text-sm text-muted-foreground">{service.roles.cashier}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Administration;
