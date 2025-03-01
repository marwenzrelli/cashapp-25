import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/features/deposits/components/StatsCard";
import { SearchBar } from "@/features/deposits/components/SearchBar";
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { DepositsTable } from "@/features/deposits/components/DepositsTable";
import { type Deposit, type EditFormData } from "@/components/deposits/types";
import { DepositDialog } from "@/features/deposits/components/DepositDialog";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { toast } from "sonner";
import { EditDepositDialog } from "@/components/deposits/EditDepositDialog";

const Deposits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [editForm, setEditForm] = useState<EditFormData>({
    clientName: "",
    amount: "",
    notes: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    deposits, 
    createDeposit, 
    deleteDeposit, 
    updateDeposit, 
    confirmDeleteDeposit, 
    setShowDeleteDialog, 
    setDepositToDelete 
  } = useDeposits();

  const handleDelete = (deposit: Deposit) => {
    console.log("Demande de suppression pour le versement:", deposit);
    setSelectedDeposit(deposit);
    setDepositToDelete(deposit);
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeposit) {
      toast.error("Aucun versement sélectionné");
      return;
    }
    
    setIsDeleting(true);
    console.log("Confirmation de suppression pour:", selectedDeposit);
    
    try {
      const success = await confirmDeleteDeposit();
      
      if (success) {
        setIsDeleteDialogOpen(false);
        toast.success("Versement supprimé avec succès", {
          description: `Le versement de ${selectedDeposit.amount} TND a été supprimé.`
        });
      } else {
        console.error("La suppression a échoué mais sans erreur lancée");
        toast.error("Échec de la suppression du versement", {
          description: "La suppression n'a pas pu être effectuée. Veuillez réessayer."
        });
      }
    } catch (error: any) {
      console.error("Erreur détaillée lors de la suppression:", {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      toast.error("Échec de la suppression du versement", {
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditForm({
      clientName: deposit.client_name,
      amount: deposit.amount.toString(),
      notes: deposit.description
    });
    setIsEditDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du versement de ${deposit.amount} TND`
    });
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmEdit = async () => {
    if (!selectedDeposit) return;

    const updates = {
      client_name: editForm.clientName,
      amount: Number(editForm.amount),
      notes: editForm.notes
    };

    const success = await updateDeposit(selectedDeposit.id, updates);
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Versement mis à jour", {
        description: `Le versement a été modifié avec succès.`
      });
    }
  };

  const handleCreateDeposit = async (deposit: Deposit) => {
    const success = await createDeposit(deposit);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const filteredDeposits = deposits.filter(deposit => 
    deposit.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Gestion des versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements de vos clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard deposits={deposits} />
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onNewDeposit={() => setIsDialogOpen(true)}
          totalDeposits={filteredDeposits.length}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-primary" />
              Liste des versements
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Affichage de {Math.min(parseInt(itemsPerPage), filteredDeposits.length)} sur {filteredDeposits.length} versements
              </span>
            </div>
          </div>
          <CardDescription>
            Gérez les versements et accédez à leurs informations détaillées avec horodatage précis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepositsTable
            deposits={filteredDeposits}
            itemsPerPage={itemsPerPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <DeleteDepositDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedDeposit={selectedDeposit}
        onConfirm={confirmDelete}
      />

      <DepositDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleCreateDeposit}
      />

      <EditDepositDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedDeposit={selectedDeposit}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onConfirm={handleConfirmEdit}
      />
    </div>
  );
};

export default Deposits;
