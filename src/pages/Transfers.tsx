import { useState } from "react";
import { toast } from "sonner";
import { ListFilter } from "lucide-react";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { TransferSuggestions } from "@/features/transfers/components/TransferSuggestions";
import { TransferList } from "@/features/transfers/components/TransferList";
import { EditTransferDialog } from "@/features/transfers/components/EditTransferDialog";
import { DeleteTransferDialog } from "@/features/transfers/components/DeleteTransferDialog";
import { type Transfer, type Suggestion, type EditFormData } from "@/features/transfers/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [itemsPerPage, setItemsPerPage] = useState("10");
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
        <TransferForm onSuccess={() => {}} />
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
