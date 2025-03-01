
import React, { useState } from "react";
import { Withdrawal } from "@/features/withdrawals/types";
import { Client } from "@/features/clients/types";
import { WithdrawalHeader } from "./WithdrawalHeader";
import { QuickActions } from "./QuickActions";
import { WithdrawalTable } from "./WithdrawalTable";
import { useClientLookup } from "./useClientLookup";
import { WithdrawalDialogContainer } from "./WithdrawalDialogContainer";

interface WithdrawalsContentProps {
  withdrawals: Withdrawal[];
  clients: Client[];
  fetchWithdrawals: () => Promise<void>;
  fetchClients: () => Promise<void>;
  refreshClientBalance: (clientId: number) => Promise<void>;
  deleteWithdrawal: (withdrawal: Withdrawal) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDeleteWithdrawal: () => void;
}

export const WithdrawalsContent: React.FC<WithdrawalsContentProps> = ({
  withdrawals,
  clients,
  fetchWithdrawals,
  fetchClients,
  refreshClientBalance,
  deleteWithdrawal,
  showDeleteDialog,
  setShowDeleteDialog,
  confirmDeleteWithdrawal,
}) => {
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  const { findClientById } = useClientLookup(clients);

  const handleDelete = (withdrawal: Withdrawal) => {
    deleteWithdrawal(withdrawal);
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    const clientName = withdrawal.client_name.split(' ');
    const client = clients.find(c => 
      c.prenom === clientName[0] && c.nom === clientName[1]
    );
    
    setSelectedWithdrawal(withdrawal);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in">
      <WithdrawalHeader />

      <QuickActions 
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        withdrawalsCount={withdrawals.length}
        onNewWithdrawal={() => setIsDialogOpen(true)}
      />

      <WithdrawalDialogContainer
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedWithdrawal={selectedWithdrawal}
        setSelectedWithdrawal={setSelectedWithdrawal}
        clients={clients}
        fetchWithdrawals={fetchWithdrawals}
        refreshClientBalance={refreshClientBalance}
        fetchClients={fetchClients}
      />

      <WithdrawalTable 
        withdrawals={withdrawals}
        itemsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        findClientById={findClientById}
      />

      {withdrawals.length > 0 && (
        <DeleteWithdrawalDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDeleteWithdrawal}
          withdrawalToDelete={withdrawals[0] || null}
        />
      )}
    </div>
  );
};
