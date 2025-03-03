
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useClients } from "@/features/clients/hooks/useClients";
import { toast } from "sonner";
import { type DepositDialogProps } from "@/features/deposits/types";
import { type Deposit } from "@/components/deposits/types";
import { supabase } from "@/integrations/supabase/client";
import { ClientSelectDropdown } from "./ClientSelectDropdown";
import { AmountInput } from "./AmountInput";
import { DatePickerField } from "./DatePickerField";
import { DescriptionField } from "./DescriptionField";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ArrowDown, Check } from "lucide-react";

export const DepositDialog = ({ open, onOpenChange, onConfirm }: DepositDialogProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { clients, fetchClients } = useClients();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open, fetchClients]);

  useEffect(() => {
    setIsValid(!!selectedClient && !!amount && parseFloat(amount) > 0);
  }, [selectedClient, amount]);

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
  }, [fetchClients]);

  const handleSubmit = async () => {
    if (!isValid) {
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
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onOpenChange(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du versement");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClient("");
    setAmount("");
    setDescription("");
    setIsLoading(false);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  // Mobile version using Sheet
  if (window.innerWidth < 768) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] pb-8 rounded-t-2xl">
          <div className="w-12 h-1.5 bg-muted rounded-full mt-2 mx-auto mb-6"></div>
          
          <div className="flex flex-col gap-0.5 mb-4">
            <h2 className="text-xl font-semibold">Nouveau versement</h2>
            <p className="text-muted-foreground text-sm">
              Enregistrez un nouveau versement pour un client
            </p>
          </div>
          
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium">Versement enregistré</h3>
              <p className="text-muted-foreground text-center mt-2">
                Le versement a été enregistré avec succès
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6 py-4">
                <ClientSelectDropdown 
                  clients={clients}
                  selectedClient={selectedClient}
                  onClientSelect={setSelectedClient}
                />
          
                <AmountInput 
                  amount={amount}
                  onAmountChange={setAmount}
                />
          
                <DatePickerField 
                  date={date}
                  onDateChange={handleDateChange}
                />
          
                <DescriptionField 
                  description={description}
                  onDescriptionChange={setDescription}
                />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !isValid} 
                  className="w-full py-6"
                  size="lg"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer le versement"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version using Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={contentRef}
        className="sm:max-w-md w-[calc(100%-2rem)] max-h-[95vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-center">
          <div className="w-12 h-1.5 bg-muted rounded-full mt-2"></div>
        </div>
        
        <DialogHeader className="pt-4">
          <DialogTitle>Nouveau versement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau versement pour un client.
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-medium">Versement enregistré</h3>
            <p className="text-muted-foreground text-center mt-2">
              Le versement a été enregistré avec succès
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-5 py-4">
              <ClientSelectDropdown 
                clients={clients}
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
              
              <AmountInput 
                amount={amount}
                onAmountChange={setAmount}
              />
              
              <DatePickerField 
                date={date}
                onDateChange={handleDateChange}
              />
              
              <DescriptionField 
                description={description}
                onDescriptionChange={setDescription}
              />
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !isValid} 
                className="w-full sm:w-auto"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
