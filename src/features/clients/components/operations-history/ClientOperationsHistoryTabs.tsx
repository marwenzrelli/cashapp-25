
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { AllOperationsTab } from "./AllOperationsTab";
import { DepositOperationsTab } from "./DepositOperationsTab";
import { WithdrawalOperationsTab } from "./WithdrawalOperationsTab";
import { TransferOperationsTab } from "./TransferOperationsTab";
import { EmptyOperations } from "./EmptyOperations";
import { useState } from "react";
import { OperationActionsDialog } from "./OperationActionsDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ClientOperationsHistoryTabsProps {
  operations: Operation[];
  filteredOperations?: Operation[];
  selectedType: "all" | "deposits" | "withdrawals" | "transfers";
  onEdit?: (operation: Operation) => void;
  onDelete?: (operation: Operation) => void;
  currency?: string;
  clientId?: number;
  refetchClient?: () => void;
}

export const ClientOperationsHistoryTabs = ({
  operations,
  filteredOperations = operations,
  selectedType,
  onEdit,
  onDelete,
  currency = "FCFA",
  clientId,
  refetchClient
}: ClientOperationsHistoryTabsProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditOperation = (operation: Operation) => {
    if (onEdit) {
      onEdit(operation);
      return;
    }
    setSelectedOperation(operation);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOperation = (operation: Operation) => {
    if (onDelete) {
      onDelete(operation);
      return;
    }
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedOperation(null);
  };

  // Render action buttons for each operation
  const renderActionButtons = (operation: Operation) => {
    // Only allow editing withdrawals and deposits for now
    const canEdit = ['withdrawal', 'deposit'].includes(operation.type);
    const canDelete = ['withdrawal', 'deposit'].includes(operation.type); // Allow deleting both withdrawals and deposits
    
    return (
      <div className="flex space-x-2 justify-end">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditOperation(operation);
            }}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOperation(operation);
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    );
  };

  if (operations.length === 0) {
    return <EmptyOperations />;
  }

  return (
    <>
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="deposits">Versements</TabsTrigger>
          <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
          <TabsTrigger value="transfers">Virements</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AllOperationsTab 
            operations={filteredOperations} 
            currency={currency} 
            renderActions={renderActionButtons} 
          />
        </TabsContent>
        <TabsContent value="deposits">
          <DepositOperationsTab 
            operations={filteredOperations} 
            currency={currency} 
            renderActions={renderActionButtons} 
          />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalOperationsTab 
            operations={filteredOperations} 
            currency={currency} 
            renderActions={renderActionButtons} 
          />
        </TabsContent>
        <TabsContent value="transfers">
          <TransferOperationsTab 
            operations={filteredOperations} 
            currency={currency} 
            renderActions={renderActionButtons} 
          />
        </TabsContent>
      </Tabs>

      {/* Only render these dialogs if onEdit/onDelete are not provided */}
      {!onEdit && !onDelete && (
        <>
          <OperationActionsDialog
            operation={selectedOperation}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            clientId={clientId}
            refetchClient={refetchClient}
            mode="edit"
          />

          <OperationActionsDialog
            operation={selectedOperation}
            isOpen={isDeleteDialogOpen}
            onClose={handleCloseDialog}
            clientId={clientId}
            refetchClient={refetchClient}
            mode="delete"
          />
        </>
      )}
    </>
  );
};
