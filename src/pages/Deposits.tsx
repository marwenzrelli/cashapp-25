
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { DepositDialog } from "@/features/deposits/components/DepositDialog";
import { EditDepositDialog } from "@/components/deposits/EditDepositDialog";
import { DepositsHeader } from "@/features/deposits/components/DepositsHeader";
import { DepositsTableSection } from "@/features/deposits/components/DepositsTableSection";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";

const Deposits = () => {
  const {
    searchTerm, 
    setSearchTerm,
    isDialogOpen, 
    setIsDialogOpen,
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    isEditDialogOpen, 
    setIsEditDialogOpen,
    selectedDeposit,
    itemsPerPage, 
    setItemsPerPage,
    editForm,
    deposits,
    filteredDeposits,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit
  } = useDepositsPage();

  return (
    <div className="space-y-8 animate-in">
      <DepositsHeader 
        deposits={deposits}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        onNewDeposit={() => setIsDialogOpen(true)}
        filteredDeposits={filteredDeposits}
      />

      <DepositsTableSection 
        filteredDeposits={filteredDeposits}
        itemsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
