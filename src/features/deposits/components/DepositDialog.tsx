
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
import { CalendarIcon } from "lucide-react";
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

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { clients, fetchClients } = useClients();

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

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

      const newDeposit: Deposit = {
        id: "",
        client_name: `${selectedClientData.prenom} ${selectedClientData.nom}`,
        amount: Number(amount),
        date: format(date, "yyyy-MM-dd"),
        description
      };

      await onConfirm(newDeposit);
      
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
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.prenom} {client.nom}
                  </SelectItem>
                ))}
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
            <div className="grid gap-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("2023-01-01")
                }
                initialFocus
                className="rounded-md border"
              />
            </div>
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
