
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
    paginatedDeposits,
    filteredDeposits,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit,
    fetchDeposits,
    isLoading
  } = useDepositsPage();

  // Fetch deposits only when the component mounts
  useEffect(() => {
    console.log("Deposits page mounted - fetching deposits");
    fetchDeposits();
    // Intentionally not including fetchDeposits in the dependency array
    // to prevent multiple fetches
  }, []);

  console.log("Deposits page render - deposits count:", deposits?.length);
  console.log("Deposits page render - filtered deposits count:", filteredDeposits?.length);
  console.log("Deposits page render - paginated deposits count:", paginatedDeposits?.length);
  console.log("Deposits page render - isLoading:", isLoading);
  
  return (
    <DepositsContent
      deposits={deposits}
      filteredDeposits={filteredDeposits}
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
      isLoading={isLoading}
    />
  );
};

export default Deposits;
