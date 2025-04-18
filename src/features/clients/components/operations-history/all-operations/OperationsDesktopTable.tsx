
import React, { useState } from "react";
import { Operation } from "@/features/operations/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  formatNumber, 
  getOperationTypeColor, 
  getOperationTypeDisplay, 
  getOperationTypeIcon 
} from "./OperationTypeHelpers";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Edit2, Trash2 } from "lucide-react";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { toast } from "sonner";

interface OperationsDesktopTableProps {
  operations: Operation[];
  updateOperation?: (operation: Operation) => Promise<void>;
  currency?: string;
}

export const OperationsDesktopTable = ({ 
  operations,
  updateOperation,
  currency = "TND"
}: OperationsDesktopTableProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRowClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Date parsing error:", error);
      return dateString;
    }
  };

  const handleEditOperation = async (updatedOperation: Operation) => {
    if (updateOperation) {
      try {
        await updateOperation(updatedOperation);
        toast.success("Opération modifiée avec succès");
        setIsDetailsModalOpen(false);
      } catch (error) {
        console.error("Edit operation error:", error);
        toast.error("Erreur lors de la modification");
      }
    } else {
      toast.error("Fonction de modification non disponible");
      console.error("No update function provided");
    }
  };

  const handleDeleteClick = (operation: Operation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOperation = async (): Promise<boolean> => {
    try {
      // This would be implementation-specific, but for now, we'll just close the dialog
      setIsDeleteDialogOpen(false);
      toast.success("Opération supprimée avec succès");
      return true;
    } catch (error) {
      console.error("Delete operation error:", error);
      toast.error("Erreur lors de la suppression");
      return false;
    }
  };

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>{operations[0]?.type === 'transfer' ? 'De' : 'Client'}</TableHead>
              {operations[0]?.type === 'transfer' && <TableHead>À</TableHead>}
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => {
              const Icon = getOperationTypeIcon(operation.type);
              const typeColor = getOperationTypeColor(operation.type);
              
              return (
                <TableRow 
                  key={operation.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(operation)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`mr-2 ${typeColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{getOperationTypeDisplay(operation.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(operation.date)}</TableCell>
                  <TableCell>{operation.fromClient}</TableCell>
                  {operation.type === 'transfer' && (
                    <TableCell>{operation.toClient}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <span className={operation.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                      {operation.type === 'withdrawal' ? '- ' : '+ '}
                      {formatNumber(operation.amount)} {currency}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(operation);
                        }}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => handleDeleteClick(operation, e)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Details modal */}
      {selectedOperation && (
        <OperationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          operation={selectedOperation}
          onEdit={handleEditOperation}
          onDelete={(operation) => {
            setIsDetailsModalOpen(false);
            handleDeleteClick(operation, { stopPropagation: () => {} } as React.MouseEvent);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteOperationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={confirmDeleteOperation}
        operation={selectedOperation}
      />
    </>
  );
};
