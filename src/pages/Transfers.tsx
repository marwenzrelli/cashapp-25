
import { useState } from "react";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Transfer } from "@/features/transfers/types";
import { TransferHeader } from "@/features/transfers/components/TransferHeader";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useTransferActions } from "@/features/transfers/hooks/useTransferActions";
import { Loader2 } from "lucide-react";
import { NewTransferButton } from "@/features/transfers/components/NewTransferButton";

const Transfers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTransferForm, setShowTransferForm] = useState(false);
  
  const { transfers, isLoading, fetchTransfers } = useTransfersList();
  const {
    selectedTransfer,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editForm,
    setEditForm,
    handleEdit,
    handleDelete,
    confirmEdit,
    confirmDelete
  } = useTransferActions(fetchTransfers);

  // Ensure transfers is always treated as an array
  const transfersArray: Transfer[] = Array.isArray(transfers) ? transfers : [];
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const visibleTransfers = transfersArray.slice(startIndex, startIndex + parseInt(itemsPerPage));

  const handleTransferSuccess = () => {
    fetchTransfers();
    setShowTransferForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <TransferHeader />

      <NewTransferButton 
        onClick={() => setShowTransferForm(true)}
        isVisible={!showTransferForm}
      />

      {showTransferForm && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <TransferForm 
              onSuccess={handleTransferSuccess}
              onCancel={() => setShowTransferForm(false)}
            />
          </div>
        </div>
      )}

      <TransferPagination
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={transfersArray.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

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
