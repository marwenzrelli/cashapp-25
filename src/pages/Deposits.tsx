import { useState } from "react";
import { Plus, Search, ArrowRight, AlertCircle, Pencil, Trash2, Store, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
  dateCreation: string;
}

const mockClients: Client[] = [
  {
    id: "1",
    nom: "Dupont",
    prenom: "Jean",
    telephone: "0612345678",
    email: "jean.dupont@email.com",
    solde: 15000,
    dateCreation: "2024-01-15",
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Marie",
    telephone: "0687654321",
    email: "marie.martin@email.com",
    solde: 8000,
    dateCreation: "2024-02-01",
  },
  {
    id: "3",
    nom: "Durant",
    prenom: "Pierre",
    telephone: "0654321789",
    email: "pierre.durant@email.com",
    solde: 3000,
    dateCreation: "2024-02-10",
  },
];

interface Deposit {
  id: string;
  client: string;
  amount: number;
  date: string;
  description: string;
}

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => void;
}

const Deposits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([
    {
      id: "1",
      client: "1",
      amount: 1000,
      date: "2024-03-01",
      description: "Versement initial",
    },
    {
      id: "2",
      client: "2",
      amount: 500,
      date: "2024-03-05",
      description: "Versement mensuel",
    },
  ]);

  const handleDelete = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedDeposit) return;
    setDeposits(prevDeposits =>
      prevDeposits.filter(deposit => deposit.id !== selectedDeposit.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Versement supprimé", {
      description: `Le versement a été retiré de la base de données.`
    });
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const client = mockClients.find(client => client.id === deposit.client);
    if (!client) return false;

    return `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateDeposit = (deposit: Deposit) => {
    setDeposits(prev => [...prev, deposit]);
    setIsDialogOpen(false);
    toast.success("Nouveau versement créé", {
      description: `Un nouveau versement de ${deposit.amount}€ a été ajouté pour ${mockClients.find(c => c.id === deposit.client)?.prenom} ${mockClients.find(c => c.id === deposit.client)?.nom}.`
    });
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Gestion des versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements de vos clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Statistiques
            </CardTitle>
            <CardDescription>
              Suivez l'évolution des versements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="font-medium">
                Total des versements: {deposits.reduce((acc, deposit) => acc + deposit.amount, 0)}€
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recherche intelligente</CardTitle>
            <CardDescription>
              Trouvez rapidement un versement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom du client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau versement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-primary" />
            Liste des versements ({filteredDeposits.length})
          </CardTitle>
          <CardDescription>
            Gérez les versements et accédez à leurs informations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Montant</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => {
                  const client = mockClients.find(client => client.id === deposit.client);
                  if (!client) return null;

                  return (
                    <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {client.prenom} {client.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {client.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium tabular-nums">
                          {deposit.amount.toLocaleString()} €
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {deposit.date}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {deposit.description}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                            onClick={() => handleDelete(deposit)}
                          >
                            <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                            <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Êtes-vous sûr de vouloir supprimer ce versement ?</p>
              {selectedDeposit && (
                <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                  Versement de {selectedDeposit.amount}€
                </div>
              )}
              <p className="text-destructive font-medium">Cette action est irréversible.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DepositDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleCreateDeposit}
      />
    </div>
  );
};

const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!selectedClient || !amount || !date || !description) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const deposit = {
      id: Math.random().toString(),
      client: selectedClient,
      amount: parseFloat(amount),
      date: date.toISOString(),
      description,
    };

    onConfirm(deposit);
    
    setSelectedClient("");
    setAmount("");
    setDate(undefined);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau versement pour un client
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select 
              value={selectedClient} 
              onValueChange={setSelectedClient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.prenom} {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Montant</Label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate: Date | undefined) => setDate(newDate)}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du versement"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Créer le versement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Deposits;
