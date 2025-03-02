
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Withdrawal } from "@/features/withdrawals/types";
import { WithdrawalForm } from "./WithdrawalForm";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface WithdrawalDialogContainerProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  clients: Client[];
  selectedClient: string;
  setSelectedClient: (clientName: string) => void;
  isEditing: boolean;
  selectedWithdrawal: Withdrawal | null;
  fetchWithdrawals: () => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const WithdrawalDialogContainer: React.FC<WithdrawalDialogContainerProps> = ({
  showDialog,
  setShowDialog,
  clients,
  selectedClient,
  setSelectedClient,
  isEditing,
  selectedWithdrawal,
  fetchWithdrawals,
  refreshClientBalance,
}) => {
  const { currency } = useCurrency();
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleCreateWithdrawal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour effectuer un retrait");
        return;
      }

      if (!newWithdrawal.clientId || !newWithdrawal.amount || !newWithdrawal.notes || !newWithdrawal.date) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      
      const selectedClient = clients.find(c => c.id.toString() === newWithdrawal.clientId);
      if (!selectedClient) {
        toast.error("Client non trouvé");
        return;
      }

      const clientFullName = `${selectedClient.prenom} ${selectedClient.nom}`;
      const operationDate = new Date(newWithdrawal.date);
      
      if (selectedWithdrawal) {
        const { error } = await supabase
          .from('withdrawals')
          .update({
            client_name: clientFullName,
            amount: parseFloat(newWithdrawal.amount),
            operation_date: operationDate.toISOString(),
            notes: newWithdrawal.notes,
            created_by: session.user.id,
            status: 'completed'
          })
          .eq('id', selectedWithdrawal.id);

        if (error) {
          toast.error("Erreur lors de la modification du retrait");
          console.error("Error updating withdrawal:", error);
          return;
        }

        toast.success("Retrait modifié", {
          description: `Le retrait de ${parseFloat(newWithdrawal.amount)} ${currency} pour ${clientFullName} a été modifié.`
        });

        await refreshClientBalance(selectedClient.id.toString());
      } else {
        const { error } = await supabase
          .from('withdrawals')
          .insert({
            client_name: clientFullName,
            amount: parseFloat(newWithdrawal.amount),
            operation_date: operationDate.toISOString(),
            notes: newWithdrawal.notes,
            created_by: session.user.id,
            status: 'completed'
          });

        if (error) {
          toast.error("Erreur lors de l'enregistrement du retrait");
          console.error("Error creating withdrawal:", error);
          return;
        }

        toast.success("Retrait enregistré", {
          description: `Le retrait de ${parseFloat(newWithdrawal.amount)} ${currency} pour ${clientFullName} a été enregistré.`
        });

        await refreshClientBalance(selectedClient.id.toString());
      }

      setShowDialog(false);
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      });
      
      fetchWithdrawals();
    } catch (error) {
      console.error("Error in handleCreateWithdrawal:", error);
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <WithdrawalForm 
        clients={clients.map(client => ({
          ...client,
          dateCreation: client.date_creation || new Date().toISOString()
        }))}
        newWithdrawal={newWithdrawal}
        setNewWithdrawal={setNewWithdrawal}
        onClose={() => setShowDialog(false)}
        onSubmit={handleCreateWithdrawal}
        isEditing={isEditing}
      />
    </Dialog>
  );
};
