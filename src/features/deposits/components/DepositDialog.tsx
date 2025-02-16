
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, User, BadgeDollarSign, ScrollText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useClients } from "@/features/clients/hooks/useClients";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { type DepositDialogProps } from "../types";

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { clients } = useClients();

  const fetchDailyTotal = async (selectedDate: Date) => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('deposits')
        .select('amount')
        .gte('operation_date', startOfDay.toISOString())
        .lte('operation_date', endOfDay.toISOString());

      if (error) {
        console.error("Error fetching daily total:", error);
        return;
      }

      const total = data?.reduce((sum, deposit) => sum + Number(deposit.amount), 0) || 0;
      setDailyTotal(total);
    } catch (error) {
      console.error("Error calculating daily total:", error);
    }
  };

  useEffect(() => {
    if (date) {
      fetchDailyTotal(date);
    }
  }, [date]);

  const handleSubmit = async () => {
    if (!selectedClient || !amount || !date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    const success = await onConfirm({
      id: "",
      client: selectedClient,
      amount: Number(amount),
      date: format(date, "yyyy-MM-dd"),
      description
    });

    if (success) {
      setSelectedClient("");
      setAmount("");
      setDescription("");
      fetchDailyTotal(date);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="rounded-xl bg-green-100 dark:bg-green-900/20 p-2">
              <BadgeDollarSign className="h-6 w-6 text-green-600" />
            </div>
            Nouveau versement
          </DialogTitle>
          <DialogDescription className="text-base">
            Enregistrez un nouveau versement client
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full pl-9">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={`${client.prenom} ${client.nom}`}>
                        {client.prenom} {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
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
                      onSelect={(newDate) => {
                        setDate(newDate || new Date());
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dailyTotal > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total des versements du jour: {dailyTotal.toLocaleString()} TND
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <div className="relative">
                  <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-3 text-muted-foreground">TND</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-9"
                  placeholder="Description du versement..."
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2 min-w-[200px]"
            disabled={isLoading}
          >
            {isLoading ? "En cours..." : "Effectuer le versement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

