
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, UserCircle, BadgeDollarSign, ScrollText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Client } from "@/features/clients/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

// Define the props for the standalone form used in WithdrawalsContent
export interface StandaloneWithdrawalFormProps {
  clients: ExtendedClient[];
  fetchWithdrawals: () => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

// Define the props for the form used in the dialog
export interface WithdrawalFormProps {
  clients: ExtendedClient[];
  newWithdrawal: {
    clientId: string;
    amount: string;
    notes: string;
    date: string;
  };
  setNewWithdrawal: (withdrawal: {
    clientId: string;
    amount: string;
    notes: string;
    date: string;
  }) => void;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
}

// This is the original component used in the dialog
export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  clients,
  newWithdrawal,
  setNewWithdrawal,
  onClose,
  onSubmit,
  isEditing,
}) => {
  const { currency } = useCurrency();

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <div className="rounded-xl bg-red-100 dark:bg-red-900/20 p-2">
            <ArrowDownCircle className="h-6 w-6 text-red-600" />
          </div>
          {isEditing ? "Modifier le retrait" : "Nouveau retrait"}
        </DialogTitle>
        <DialogDescription className="text-base">
          {isEditing
            ? "Modifiez les informations du retrait"
            : "Enregistrez un nouveau retrait pour un client"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/50 p-6">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date du retrait</Label>
              <Input
                id="date"
                type="date"
                value={newWithdrawal.date}
                onChange={(e) => setNewWithdrawal({ ...newWithdrawal, date: e.target.value })}
                className="transition-all focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={newWithdrawal.clientId}
                onValueChange={(value) => setNewWithdrawal({ ...newWithdrawal, clientId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id.toString()}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-primary/50" />
                        <span>
                          {client.prenom} {client.nom}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-sm ${
                          client.solde >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {client.solde.toLocaleString()} {currency}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <div className="relative">
                <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newWithdrawal.amount}
                  onChange={(e) =>
                    setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })
                  }
                  className="pl-9 transition-all focus-visible:ring-primary/50"
                />
                <span className="absolute right-3 top-3 text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <div className="relative">
                <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="notes"
                  placeholder="Motif du retrait..."
                  value={newWithdrawal.notes}
                  onChange={(e) =>
                    setNewWithdrawal({ ...newWithdrawal, notes: e.target.value })
                  }
                  className="pl-9 transition-all focus-visible:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          Annuler
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[200px]"
        >
          <ArrowDownCircle className="h-4 w-4" />
          {isEditing ? "Modifier le retrait" : "Effectuer le retrait"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Add a new standalone form component
export const StandaloneWithdrawalForm: React.FC<StandaloneWithdrawalFormProps> = ({
  clients,
  fetchWithdrawals,
  refreshClientBalance,
}) => {
  const { currency } = useCurrency();
  const [newWithdrawal, setNewWithdrawal] = React.useState({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!newWithdrawal.clientId || !newWithdrawal.amount) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Submit logic would go here
      
      // Refresh data
      fetchWithdrawals();
      
      // Refresh client balance if needed
      if (newWithdrawal.clientId) {
        await refreshClientBalance(newWithdrawal.clientId);
      }
      
      // Reset form
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArrowDownCircle className="h-5 w-5 text-red-500" />
        Nouveau retrait
      </h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="standalone-date">Date du retrait</Label>
          <Input
            id="standalone-date"
            type="date"
            value={newWithdrawal.date}
            onChange={(e) => setNewWithdrawal({ ...newWithdrawal, date: e.target.value })}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="standalone-clientId">Client</Label>
          <Select
            value={newWithdrawal.clientId}
            onValueChange={(value) => setNewWithdrawal({ ...newWithdrawal, clientId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem
                  key={client.id}
                  value={client.id.toString()}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-primary/50" />
                    <span>
                      {client.prenom} {client.nom}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm ${
                      client.solde >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {client.solde.toLocaleString()} {currency}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="standalone-amount">Montant</Label>
          <div className="relative">
            <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="standalone-amount"
              type="number"
              placeholder="0.00"
              value={newWithdrawal.amount}
              onChange={(e) =>
                setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })
              }
              className="pl-9 transition-all focus-visible:ring-primary/50"
            />
            <span className="absolute right-3 top-3 text-muted-foreground">
              {currency}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="standalone-notes">Notes</Label>
          <div className="relative">
            <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="standalone-notes"
              placeholder="Motif du retrait..."
              value={newWithdrawal.notes}
              onChange={(e) =>
                setNewWithdrawal({ ...newWithdrawal, notes: e.target.value })
              }
              className="pl-9 transition-all focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 text-white w-full mt-4"
        >
          <ArrowDownCircle className="h-4 w-4 mr-2" />
          Effectuer le retrait
        </Button>
      </div>
    </div>
  );
};
