
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ListFilter } from "lucide-react";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferSuggestions } from "@/features/transfers/components/TransferSuggestions";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Transfer, type Suggestion, type EditFormData } from "@/features/transfers/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/features/clients/hooks/useClients";

const defaultSuggestions: Suggestion[] = [];

const Transfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [editForm, setEditForm] = useState<EditFormData>({
    fromClient: "",
    toClient: "",
    amount: "",
    reason: "",
  });
  const { currency } = useCurrency();
  const { refreshClientBalance } = useClients();

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('operation_date', { ascending: false });

      if (error) {
        console.error("Error fetching transfers:", error);
        toast.error("Erreur lors du chargement des virements");
        return;
      }

      if (data) {
        const formattedTransfers: Transfer[] = data.map(transfer => ({
          id: transfer.id,
          fromClient: transfer.from_client,
          toClient: transfer.to_client,
          amount: transfer.amount,
          date: new Date(transfer.operation_date).toLocaleDateString(),
          reason: transfer.reason
        }));
        setTransfers(formattedTransfers);
      }
    } catch (error) {
      console.error("Error in fetchTransfers:", error);
      toast.error("Une erreur est survenue");
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleEdit = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setEditForm({
      fromClient: transfer.fromClient,
      toClient: transfer.toClient,
      amount: transfer.amount.toString(),
      reason: transfer.reason,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedTransfer) return;

    try {
      const { error } = await supabase
        .from('transfers')
        .update({
          from_client: editForm.fromClient,
          to_client: editForm.toClient,
          amount: parseFloat(editForm.amount),
          reason: editForm.reason
        })
        .eq('id', selectedTransfer.id);

      if (error) {
        console.error("Error updating transfer:", error);
        toast.error("Erreur lors de la modification du virement");
        return;
      }

      setIsEditDialogOpen(false);
      toast.success("Virement modifié avec succès");
      fetchTransfers(); // Refresh the list
    } catch (error) {
      console.error("Error in confirmEdit:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedTransfer) return;

    try {
      // Recherche des clients avec une requête optimisée
      const { data: fromClient, error: fromError } = await supabase
        .from('clients')
        .select('id')
        .filter('prenom', 'ilike', selectedTransfer.fromClient.split(' ')[0])
        .filter('nom', 'ilike', selectedTransfer.fromClient.split(' ')[1])
        .single();

      const { data: toClient, error: toError } = await supabase
        .from('clients')
        .select('id')
        .filter('prenom', 'ilike', selectedTransfer.toClient.split(' ')[0])
        .filter('nom', 'ilike', selectedTransfer.toClient.split(' ')[1])
        .single();

      if (fromError || toError) {
        console.error("Error finding clients:", fromError || toError);
        toast.error("Erreur lors de la recherche des clients");
        return;
      }

      // Supprimer le transfert
      const { error: deleteError } = await supabase
        .from('transfers')
        .delete()
        .eq('id', selectedTransfer.id);

      if (deleteError) {
        console.error("Error deleting transfer:", deleteError);
        toast.error("Erreur lors de la suppression du virement");
        return;
      }

      // Mettre à jour les soldes
      await Promise.all([
        refreshClientBalance(fromClient.id),
        refreshClientBalance(toClient.id)
      ]);

      setIsDeleteDialogOpen(false);
      toast.success("Virement supprimé avec succès");
      fetchTransfers(); // Refresh the list
    } catch (error) {
      console.error("Error in confirmDelete:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    setEditForm({
      fromClient: suggestion.fromClient,
      toClient: suggestion.toClient,
      amount: suggestion.amount.toString(),
      reason: suggestion.reason,
    });
  };

  const visibleTransfers = transfers.slice(0, parseInt(itemsPerPage));

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Virements</h1>
        <p className="text-muted-foreground">
          Effectuez des virements entre comptes avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TransferForm onSuccess={fetchTransfers} />
        <TransferSuggestions
          suggestions={defaultSuggestions}
          onApply={applySuggestion}
        />
      </div>

      <div className="flex items-center justify-end gap-4 mb-4">
        <div className="text-sm text-muted-foreground">
          Affichage de {Math.min(parseInt(itemsPerPage), transfers.length)} sur {transfers.length} virements
        </div>
        <Select
          value={itemsPerPage}
          onValueChange={setItemsPerPage}
        >
          <SelectTrigger className="w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
            <ListFilter className="h-4 w-4 mr-2 text-primary" />
            <SelectValue placeholder="Nombre d'éléments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 éléments</SelectItem>
            <SelectItem value="25">25 éléments</SelectItem>
            <SelectItem value="50">50 éléments</SelectItem>
            <SelectItem value="100">100 éléments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TransferList
        transfers={visibleTransfers}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditTransferDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        transfer={selectedTransfer}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onConfirm={confirmEdit}
      />

      <DeleteTransferDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        transfer={selectedTransfer}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Transfers;
