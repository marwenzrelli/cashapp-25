
import { useState } from "react";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferSuggestions } from "@/features/transfers/components/TransferSuggestions";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Suggestion } from "@/features/transfers/types";
import { TransferHeader } from "@/features/transfers/components/TransferHeader";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useTransferActions } from "@/features/transfers/hooks/useTransferActions";
import { Loader2 } from "lucide-react";

const defaultSuggestions: Suggestion[] = [];

const Transfers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  
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

  const visibleTransfers = transfers.slice(0, parseInt(itemsPerPage));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
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
        totalTransfers={transfers.length}
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
