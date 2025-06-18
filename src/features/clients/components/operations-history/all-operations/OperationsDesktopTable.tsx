import React, { useState } from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { TransferOperationDialog } from "@/features/operations/components/TransferOperationDialog";
import { toast } from "sonner";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { deleteOperation } from "@/features/operations/utils/deletionUtils";
import { TotalsSection } from "./TotalsSection";

interface OperationsDesktopTableProps {
  operations: Operation[];
  currency?: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const OperationsDesktopTable = ({
  operations,
  currency = "TND",
  isPublicView = false,
  updateOperation,
  onOperationDeleted
}: OperationsDesktopTableProps) => {
  const {
    refreshOperations
  } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy HH:mm", {
        locale: fr
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number, type: Operation['type']): string => {
    const formattedNumber = new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
    return type === 'withdrawal' ? `- ${formattedNumber}` : formattedNumber;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'deposit':
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case 'withdrawal':
        return "bg-red-100 hover:bg-red-200 text-red-800";
      case 'transfer':
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case 'direct_transfer':
        return "bg-purple-100 hover:bg-purple-200 text-purple-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'deposit':
        return "Versement";
      case 'withdrawal':
        return "Retrait";
      case 'transfer':
        return "Transfert";
      case 'direct_transfer':
        return "Opération Directe";
      default:
        return type;
    }
  };

  const getFormattedId = (id: string | number): string => {
    const idStr = String(id);
    if (idStr.includes('-')) {
      const parts = idStr.split('-');
      return `${parts[0]} #${parts[1]}`;
    } else if (idStr.match(/^[a-z]+\d+$/i)) {
      const numericPart = idStr.replace(/\D/g, '');
      const prefix = idStr.replace(/\d+/g, '');
      return `${prefix} #${numericPart}`;
    }
    return `#${idStr}`;
  };

  const handleEditClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDeleteDialogOpen(true);
  };

  const handleTransferClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsTransferDialogOpen(true);
  };

  const handleOperationUpdate = async (updatedOperation: Operation) => {
    if (updateOperation) {
      try {
        await updateOperation(updatedOperation);
        toast.success("Opération modifiée avec succès");
        setIsDetailsModalOpen(false);
        if (onOperationDeleted) {
          await onOperationDeleted();
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'opération:", error);
        toast.error("Erreur lors de la modification");
      }
    } else {
      console.warn("Fonction updateOperation non disponible");
      toast.error("Fonction de modification non disponible");
    }
  };

  const performDeleteOperation = async (): Promise<boolean> => {
    if (!selectedOperation) {
      toast.error("Aucune opération sélectionnée");
      return false;
    }
    setIsDeleting(true);
    try {
      const success = await deleteOperation(selectedOperation);
      if (success) {
        setIsDeleteDialogOpen(false);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (onOperationDeleted) {
          await onOperationDeleted();
          setTimeout(async () => {
            if (onOperationDeleted) {
              await onOperationDeleted();
            }
          }, 3000);
        }
        return true;
      } else {
        toast.error("Erreur lors de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur s'est produite");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferComplete = async () => {
    if (onOperationDeleted) {
      await onOperationDeleted();
    }
  };

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              {!isPublicView && <TableHead className="w-[80px] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isPublicView ? 5 : 6} className="h-24 text-center">
                  Aucune opération trouvée
                </TableCell>
              </TableRow>
            ) : (
              operations.map((operation, index) => (
                <TableRow key={`${operation.id}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {getFormattedId(operation.id)}
                  </TableCell>
                  <TableCell>
                    {formatDate(operation.operation_date || operation.date)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("font-normal", getTypeColor(operation.type))}>
                      {getTypeLabel(operation.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {operation.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={cn(
                      operation.type === 'withdrawal' ? 'text-red-600' : 
                      operation.type === 'deposit' ? 'text-green-600' : 
                      operation.type === 'transfer' ? 'text-blue-600' : 
                      operation.type === 'direct_transfer' ? 'text-purple-600' : '', 
                      'font-medium'
                    )}>
                      {formatAmount(operation.amount, operation.type)}
                    </span>
                  </TableCell>
                  {!isPublicView && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(operation)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {(operation.type === 'deposit' || operation.type === 'withdrawal') && (
                            <DropdownMenuItem onClick={() => handleTransferClick(operation)}>
                              <ArrowRightLeft className="mr-2 h-4 w-4" />
                              Transférer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteClick(operation)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <TotalsSection operations={operations} currency={currency} />
      </div>

      {!isPublicView && (
        <>
          <OperationDetailsModal 
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            operation={selectedOperation}
            onEdit={handleOperationUpdate}
            onDelete={handleDeleteClick}
          />
          
          <DeleteOperationDialog 
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onDelete={performDeleteOperation}
            operation={selectedOperation}
            isLoading={isDeleting}
          />

          <TransferOperationDialog
            isOpen={isTransferDialogOpen}
            onClose={() => setIsTransferDialogOpen(false)}
            operation={selectedOperation}
            onTransferComplete={handleTransferComplete}
          />
        </>
      )}
    </div>
  );
};
