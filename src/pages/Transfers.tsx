
import { useState } from "react";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferSuggestions } from "@/features/transfers/components/TransferSuggestions";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Suggestion, type Transfer } from "@/features/transfers/types";
import { TransferHeader } from "@/features/transfers/components/TransferHeader";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useTransferActions } from "@/features/transfers/hooks/useTransferActions";
import { Loader2 } from "lucide-react";

const defaultSuggestions: Suggestion[] = [];

const Transfers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const applySuggestion = (suggestion: Suggestion) => {
    setEditForm({
      fromClient: suggestion.fromClient,
      toClient: suggestion.toClient,
      amount: suggestion.amount.toString(),
      reason: suggestion.reason,
    });
  };

  // Ensure transfers is always treated as an array
  const transfersArray: Transfer[] = Array.isArray(transfers) ? transfers : [];
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const visibleTransfers = transfersArray.slice(startIndex, startIndex + parseInt(itemsPerPage));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8 animate-in">
        <TransferHeader />

        <div className="grid gap-6 md:grid-cols-2">
          <TransferForm onSuccess={fetchTransfers} />
          <TransferSuggestions
            suggestions={defaultSuggestions}
            onApply={applySuggestion}
          />
        </div>

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
    </div>
  );
};

export default Transfers;
