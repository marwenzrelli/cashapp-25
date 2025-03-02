
import React, { useState } from "react";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalTable } from "./WithdrawalTable";
import { WithdrawalHeader } from "./WithdrawalHeader";
import { QuickActions } from "./QuickActions";
import { DeleteWithdrawalDialog } from "./DeleteWithdrawalDialog";
import { WithdrawalDialogContainer } from "./WithdrawalDialogContainer";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface WithdrawalsContentProps {
  withdrawals: Withdrawal[];
  clients: Client[];
  fetchWithdrawals: () => void;
  fetchClients: () => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
  deleteWithdrawal: (withdrawal: Withdrawal) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDeleteWithdrawal: () => Promise<boolean>;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
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
  searchTerm = "",
  setSearchTerm = () => {},
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("10");

  const findClientById = (clientName: string) => {
    const client = clients.find(c => `${c.prenom} ${c.nom}` === clientName);
    return client ? { ...client, dateCreation: client.date_creation || new Date().toISOString() } : null;
  };

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    deleteWithdrawal(withdrawal);
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedClient(withdrawal.client_name);
    setIsEditing(true);
    setShowDialog(true);
  };

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <div className="space-y-8 animate-in">
      <WithdrawalHeader />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WithdrawalForm
            clients={extendedClients}
            fetchWithdrawals={fetchWithdrawals}
            refreshClientBalance={refreshClientBalance}
          />
        </div>
        
        <div className="space-y-6">
          <QuickActions
            onCreateClick={() => {
              setIsEditing(false);
              setShowDialog(true);
            }}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            withdrawalsCount={withdrawals.length}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Recherche intelligente</CardTitle>
              <CardDescription>
                Trouvez rapidement un retrait
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, notes, ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={itemsPerPage}
                  onValueChange={setItemsPerPage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre d'éléments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 éléments</SelectItem>
                    <SelectItem value="25">25 éléments</SelectItem>
                    <SelectItem value="50">50 éléments</SelectItem>
                    <SelectItem value="100">100 éléments</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {withdrawals.length} résultats trouvés
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WithdrawalTable
        withdrawals={withdrawals}
        itemsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDeleteWithdrawal}
        findClientById={findClientById}
      />

      <WithdrawalDialogContainer
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        clients={clients}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        isEditing={isEditing}
        selectedWithdrawal={selectedWithdrawal}
        fetchWithdrawals={async () => {
          fetchWithdrawals();
          return Promise.resolve();
        }}
        refreshClientBalance={refreshClientBalance}
      />

      <DeleteWithdrawalDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteWithdrawal}
        withdrawal={selectedWithdrawal}
      />
    </div>
  );
};
