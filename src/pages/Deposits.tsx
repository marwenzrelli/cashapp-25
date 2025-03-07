
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect } from "react";

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
    fetchDeposits
  } = useDepositsPage();

  // Fetch deposits when the component mounts
  useEffect(() => {
    console.log("Deposits page mounted - fetching deposits");
    fetchDeposits();
  }, [fetchDeposits]);

  console.log("Deposits page render - deposits count:", deposits?.length);
  console.log("Deposits page render - isEditDialogOpen:", isEditDialogOpen);
  
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
