import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Clock, Hash, User, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { formatId } from "@/utils/formatId";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { formatNumber } from "./all-operations/OperationTypeHelpers";
import { useFormatAmount } from "@/hooks/use-format-amount";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { TransferOperationDialog } from "@/features/operations/components/TransferOperationDialog";
import { toast } from "sonner";
import { deleteOperation } from "@/features/operations/utils/deletionUtils";

interface OperationsMobileCardProps {
  operation: Operation;
  formatAmount?: (amount: number) => string;
  currency?: string;
  showType?: boolean;
  colorClass?: string;
  showId?: boolean;
  typeBackgroundClass?: string;
  icon?: ReactNode;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const OperationsMobileCard = ({
  operation,
  formatAmount: customFormatAmount,
  currency = "",
  showType = true,
  colorClass,
  showId = false,
  typeBackgroundClass,
  icon,
  isPublicView = false,
  updateOperation,
  onOperationDeleted
}: OperationsMobileCardProps) => {
  const { formatAmount: defaultFormatAmount } = useFormatAmount();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatAmountValue = (amount: number) => {
    if (customFormatAmount) {
      return customFormatAmount(amount);
    }
    return operation.type === 'deposit' ? `+ ${defaultFormatAmount(amount)}` : 
           operation.type === 'withdrawal' ? `- ${defaultFormatAmount(amount)}` : 
           defaultFormatAmount(amount);
  };

  const parseDate = (dateValue: string | Date): Date => {
    if (dateValue instanceof Date) return dateValue;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date(); // Fallback to current date
    }
  };

  const formatDate = (dateValue: string | Date, formatStr: string): string => {
    try {
      const date = parseDate(dateValue);
      return format(date, formatStr, {
        locale: fr
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  const operationDate = operation.operation_date || operation.date;

  const clientName = operation.type === "transfer" ? `${operation.fromClient || ''} → ${operation.toClient || ''}` : operation.fromClient || '';

  const handleEditClick = () => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDeleteDialogOpen(true);
  };

  const handleTransferClick = () => {
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
        if (onOperationDeleted) {
          await onOperationDeleted();
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
    <>
      <div className="flex flex-col p-4 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 w-full backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {showType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  typeBackgroundClass,
                  operation.type === "deposit" 
                    ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600" 
                    : operation.type === "withdrawal" 
                    ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600" 
                    : "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600"
                )}
              >
                {operation.type === "deposit" ? "Dépôt" : operation.type === "withdrawal" ? "Retrait" : "Transfert"}
              </Badge>
            )}
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">
                {showId && operation.id}
              </span>
            </div>
          </div>
          <p className={cn(
            "text-xl font-bold px-3 py-1.5 rounded-lg shadow-sm",
            colorClass || (
              operation.type === "withdrawal" 
                ? "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" 
                : operation.type === "deposit" 
                ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" 
                : "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
            )
          )}>
            {formatAmountValue(operation.amount)}
            {currency && ` ${currency}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2 mb-3 p-2.5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <User className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-foreground flex-1 overflow-hidden text-ellipsis">
            {clientName}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-3 bg-muted/30 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            <span className="font-medium">{formatDate(operationDate, "dd MMM yyyy")}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{formatDate(operationDate, "HH:mm")}</span>
          </div>
        </div>
        
        {operation.description && (
          <p className="text-sm text-foreground/80 my-2 break-words p-3 bg-muted/40 rounded-lg border border-border/30">
            {operation.description}
          </p>
        )}
        
        {operation.type === "transfer" && (
          <div className="text-xs border-t pt-3 mt-2 space-y-2">
            <p className="truncate px-3 py-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300 font-medium">
              De: {operation.fromClient}
            </p>
            <p className="truncate px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium">
              À: {operation.toClient}
            </p>
          </div>
        )}
        
        {/* Action buttons only show if not public view */}
        {!isPublicView && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 dark:from-blue-950/30 dark:to-blue-900/30 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 dark:text-blue-400 dark:border-blue-800 dark:hover:border-blue-700 shadow-sm hover:shadow transition-all duration-200"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs font-semibold">Modifier</span>
            </Button>
            {(operation.type === 'deposit' || operation.type === 'withdrawal') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransferClick}
                className="flex-1 bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 text-purple-700 border-purple-200 hover:border-purple-300 dark:from-purple-950/30 dark:to-purple-900/30 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 dark:text-purple-400 dark:border-purple-800 dark:hover:border-purple-700 shadow-sm hover:shadow transition-all duration-200"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs font-semibold">Transférer</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 text-red-700 border-red-200 hover:border-red-300 dark:from-red-950/30 dark:to-red-900/30 dark:hover:from-red-900/40 dark:hover:to-red-800/40 dark:text-red-400 dark:border-red-800 dark:hover:border-red-700 shadow-sm hover:shadow transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs font-semibold">Supprimer</span>
            </Button>
          </div>
        )}
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
    </>
  );
};
