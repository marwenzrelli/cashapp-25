
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect } from "react";
import { toast } from "sonner";

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
    currentPage,
    setCurrentPage,
    editForm,
    deposits,
    filteredDeposits,
    paginatedDeposits,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit,
    isLoading,
    error
  } = useDepositsPage();

  useEffect(() => {
    console.log("Deposits page mounted");
    
    return () => {
      console.log("Deposits page unmounted");
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Erreur lors du chargement des versements", {
        description: error
      });
    }
  }, [error]);

  console.log("Deposits page render:", { 
    depositsCount: deposits.length,
    paginatedCount: paginatedDeposits.length,
    isLoading,
    isEditDialogOpen
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin"></div>
          <p className="text-lg">Chargement des versements...</p>
        </div>
      </div>
    );
  }
  
  return (
    <DepositsContent
      deposits={deposits}
      paginatedDeposits={paginatedDeposits}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      setIsEditDialogOpen={setIsEditDialogOpen}
      selectedDeposit={selectedDeposit}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      editForm={editForm}
      handleDelete={handleDelete}
      confirmDelete={confirmDelete}
      handleEdit={handleEdit}
      handleEditFormChange={handleEditFormChange}
      handleConfirmEdit={handleConfirmEdit}
      handleCreateDeposit={handleCreateDeposit}
    />
  );
};

export default Deposits;
