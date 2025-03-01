import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useClients } from "@/features/clients/hooks/useClients";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { supabase } from "@/integrations/supabase/client";
import { Withdrawal } from "@/features/withdrawals/types";
import { Client } from "@/features/clients/types";

// Import the new components
import { WithdrawalHeader } from "@/features/withdrawals/components/WithdrawalHeader";
import { QuickActions } from "@/features/withdrawals/components/QuickActions";
import { WithdrawalForm } from "@/features/withdrawals/components/WithdrawalForm";
import { WithdrawalTable } from "@/features/withdrawals/components/WithdrawalTable";
import { DeleteWithdrawalDialog } from "@/features/withdrawals/components/DeleteWithdrawalDialog";

const Withdrawals = () => {
  const { currency } = useCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const { 
    withdrawals, 
    isLoading,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog
  } = useWithdrawals();

  const { clients, fetchClients, refreshClientBalance } = useClients();

  useEffect(() => {
    fetchClients();
    fetchWithdrawals();
  }, []);

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

  const handleDelete = (withdrawal: Withdrawal) => {
    deleteWithdrawal(withdrawal);
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    const clientName = withdrawal.client_name.split(' ');
    const client = clients.find(c => 
      c.prenom === clientName[0] && c.nom === clientName[1]
    );
    
    setSelectedWithdrawal(withdrawal);
    setNewWithdrawal({
      clientId: client?.id.toString() || "",
      amount: withdrawal.amount.toString(),
      notes: withdrawal.notes || "",
      date: new Date(withdrawal.operation_date || withdrawal.created_at).toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du retrait de ${withdrawal.amount} ${currency}`
    });
  };

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

        await refreshClientBalance(selectedClient.id);
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

        await refreshClientBalance(selectedClient.id);
      }

      setIsDialogOpen(false);
      setSelectedWithdrawal(null);
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      });
      
      await fetchWithdrawals();
      await fetchClients();
    } catch (error) {
      console.error("Error in handleCreateWithdrawal:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const findClientById = (clientFullName: string): (Client & { dateCreation: string }) | null => {
    if (!clientFullName) return null;
    
    const [firstName, lastName] = clientFullName.split(' ');
    
    const client = clients.find(c => 
      c.prenom.toLowerCase() === firstName?.toLowerCase() && 
      c.nom.toLowerCase() === lastName?.toLowerCase()
    );
    
    if (client) {
      return {
        ...client,
        dateCreation: client.date_creation || new Date().toISOString()
      };
    }
    
    const fallbackClient = clients.find(c => 
      `${c.prenom} ${c.nom}`.toLowerCase().includes(clientFullName.toLowerCase())
    );
    
    if (fallbackClient) {
      return {
        ...fallbackClient,
        dateCreation: fallbackClient.date_creation || new Date().toISOString()
      };
    }
    
    return null;
  };
  
  return (
    <div className="space-y-8 animate-in">
      <WithdrawalHeader />

      <QuickActions 
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        withdrawalsCount={withdrawals.length}
        onNewWithdrawal={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <WithdrawalForm 
          clients={clients.map(client => ({
            ...client,
            dateCreation: client.date_creation || new Date().toISOString()
          }))}
          newWithdrawal={newWithdrawal}
          setNewWithdrawal={setNewWithdrawal}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedWithdrawal(null);
            setNewWithdrawal({
              clientId: "",
              amount: "",
              notes: "",
              date: new Date().toISOString().split('T')[0]
            });
          }}
          onSubmit={handleCreateWithdrawal}
          isEditing={!!selectedWithdrawal}
        />
      </Dialog>

      <WithdrawalTable 
        withdrawals={withdrawals}
        itemsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        findClientById={findClientById}
      />

      <DeleteWithdrawalDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteWithdrawal}
        withdrawalToDelete={withdrawals[0] || null}
      />
    </div>
  );
};

export default Withdrawals;
