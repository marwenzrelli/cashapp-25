
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, UserCircle, Search } from "lucide-react";
import { useClients } from "@/features/clients/hooks/useClients";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DepositDialogProps } from "@/features/deposits/types";
import { type Deposit } from "@/components/deposits/types";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const { currency } = useCurrency();
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const { clients, fetchClients } = useClients();

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  // Écouter les changements en temps réel sur la table clients
  useEffect(() => {
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Mise à jour des soldes détectée');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedClient || !amount || !date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const selectedClientData = clients.find(c => c.id.toString() === selectedClient);
      if (!selectedClientData) {
        toast.error("Client non trouvé");
        return;
      }

      const newDeposit: Omit<Deposit, 'id' | 'status' | 'created_at' | 'created_by'> = {
        client_name: `${selectedClientData.prenom} ${selectedClientData.nom}`,
        amount: Number(amount),
        date: format(date, "yyyy-MM-dd"),
        description
      };

      await onConfirm(newDeposit as Deposit);
      
      setSelectedClient("");
      setAmount("");
      setDescription("");
      
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du versement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      console.log("Nouvelle date sélectionnée:", newDate);
      setDate(newDate);
    }
  };

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client => {
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const searchTerm = clientSearch.toLowerCase();
    return fullName.includes(searchTerm) || client.telephone.includes(searchTerm);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau versement pour un client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select 
              value={selectedClient} 
              onValueChange={setSelectedClient}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[70vh] overflow-hidden" 
                position="popper"
                sideOffset={5}
              >
                <div className="p-2 sticky top-0 bg-popover z-10 border-b mb-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un client..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[50vh] touch-auto overflow-y-auto overscroll-contain">
                  {filteredClients.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Aucun client trouvé
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id.toString()}
                        className="flex items-center justify-between py-4 px-2 cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-primary/80 flex-shrink-0" />
                          <span className="font-medium">
                            {client.prenom} {client.nom}
                          </span>
                        </div>
                        <span className={`font-mono text-sm ${client.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {client.solde.toLocaleString()} {currency}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              placeholder="Entrez le montant"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
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
                  {date ? format(date, "P") : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2023-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Ajouter une description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
