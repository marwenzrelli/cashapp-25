
import { useState } from "react";
import { toast } from "sonner";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferSuggestions } from "@/features/transfers/components/TransferSuggestions";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Transfer, type Suggestion, type EditFormData } from "@/features/transfers/types";

const defaultSuggestions: Suggestion[] = [
  {
    id: "1",
    fromClient: "Jean Dupont",
    toClient: "Marie Martin",
    amount: 1500,
    reason: "Paiement mensuel récurrent",
  },
  {
    id: "2",
    fromClient: "Marie Martin",
    toClient: "Pierre Durant",
    amount: 800,
    reason: "Remboursement prévu",
  },
];

const defaultTransfers: Transfer[] = [
  {
    id: "1",
    fromClient: "Jean Dupont",
    toClient: "Marie Martin",
    amount: 1500,
    date: "2024-02-23",
    reason: "Paiement mensuel",
  },
  {
    id: "2",
    fromClient: "Marie Martin",
    toClient: "Pierre Durant",
    amount: 750,
    date: "2024-02-22",
    reason: "Remboursement",
  },
  {
    id: "3",
    fromClient: "Pierre Durant",
    toClient: "Jean Dupont",
    amount: 2000,
    date: "2024-02-21",
    reason: "Investissement",
  },
];

const Transfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>(defaultTransfers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    fromClient: "",
    toClient: "",
    amount: "",
    reason: "",
  });

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

  const confirmEdit = () => {
    if (!selectedTransfer) return;

    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === selectedTransfer.id
          ? {
              ...transfer,
              fromClient: editForm.fromClient,
              toClient: editForm.toClient,
              amount: parseFloat(editForm.amount),
              reason: editForm.reason,
            }
          : transfer
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Virement modifié avec succès");
  };

  const confirmDelete = () => {
    if (!selectedTransfer) return;

    setTransfers((prev) =>
      prev.filter((transfer) => transfer.id !== selectedTransfer.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Virement supprimé avec succès");
  };

  const applySuggestion = (suggestion: Suggestion) => {
    setEditForm({
      fromClient: suggestion.fromClient,
      toClient: suggestion.toClient,
      amount: suggestion.amount.toString(),
      reason: suggestion.reason,
    });
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Virements</h1>
        <p className="text-muted-foreground">
          Effectuez des virements entre comptes avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TransferForm onSuccess={() => {}} />
        <TransferSuggestions
          suggestions={defaultSuggestions}
          onApply={applySuggestion}
        />
      </div>

      <TransferList
        transfers={transfers}
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
