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
      <div className="group flex flex-col p-5 bg-gradient-to-br from-background via-background/95 to-muted/20 rounded-2xl border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 w-full backdrop-blur-xl hover:border-primary/20 animate-fade-in">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="flex flex-col gap-2">
            {showType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-bold px-3 py-1.5 rounded-full border-2 shadow-sm w-fit",
                  typeBackgroundClass,
                  operation.type === "deposit" 
                    ? "border-green-500/50 bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 dark:from-green-900/40 dark:to-green-800/30 dark:text-green-300 dark:border-green-500/40" 
                    : operation.type === "withdrawal" 
                    ? "border-red-500/50 bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 dark:from-red-900/40 dark:to-red-800/30 dark:text-red-300 dark:border-red-500/40" 
                    : "border-blue-500/50 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-300 dark:border-blue-500/40"
                )}
              >
                {operation.type === "deposit" ? "Dépôt" : operation.type === "withdrawal" ? "Retrait" : "Transfert"}
              </Badge>
            )}
            <div className="flex items-center gap-1.5 bg-muted/40 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-border/30">
              <Hash className="h-3 w-3 text-muted-foreground/70" />
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {showId && operation.id}
              </span>
            </div>
          </div>
          <div className={cn(
            "text-2xl font-extrabold px-4 py-2.5 rounded-xl shadow-md backdrop-blur-sm border-2 group-hover:scale-105 transition-transform duration-300",
            colorClass || (
              operation.type === "withdrawal" 
                ? "text-red-700 bg-gradient-to-br from-red-50 via-red-100/80 to-red-50 border-red-200/60 dark:from-red-900/40 dark:via-red-800/30 dark:to-red-900/40 dark:text-red-300 dark:border-red-700/40" 
                : operation.type === "deposit" 
                ? "text-green-700 bg-gradient-to-br from-green-50 via-green-100/80 to-green-50 border-green-200/60 dark:from-green-900/40 dark:via-green-800/30 dark:to-green-900/40 dark:text-green-300 dark:border-green-700/40" 
                : "text-blue-700 bg-gradient-to-br from-blue-50 via-blue-100/80 to-blue-50 border-blue-200/60 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-blue-900/40 dark:text-blue-300 dark:border-blue-700/40"
            )
          )}>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold opacity-70 -mb-1">{currency}</span>
              <span>{formatAmountValue(operation.amount)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 mb-4 p-3.5 bg-gradient-to-r from-primary/8 via-primary/5 to-primary/8 rounded-xl border border-primary/30 shadow-sm backdrop-blur-sm group-hover:border-primary/40 transition-colors duration-300">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground flex-1 overflow-hidden text-ellipsis">
            {clientName}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 bg-muted/30 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-border/30">
            <CalendarClock className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-xs font-semibold text-foreground">{formatDate(operationDate, "dd MMM yyyy")}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/30 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-border/30">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-xs font-semibold text-foreground">{formatDate(operationDate, "HH:mm")}</span>
          </div>
        </div>
        
        {operation.description && (
          <p className="text-sm leading-relaxed text-foreground/90 my-3 break-words p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 backdrop-blur-sm italic">
            {operation.description}
          </p>
        )}
        
        {operation.type === "transfer" && (
          <div className="text-sm border-t border-border/40 pt-4 mt-3 space-y-2.5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-orange-50 via-orange-50/80 to-orange-100/50 dark:from-orange-900/30 dark:via-orange-900/20 dark:to-orange-800/30 border-2 border-orange-200/60 dark:border-orange-700/40 shadow-sm backdrop-blur-sm">
              <span className="text-orange-700 dark:text-orange-300 font-bold text-xs">DE</span>
              <span className="truncate text-orange-900 dark:text-orange-200 font-semibold flex-1">{operation.fromClient}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/50 dark:from-blue-900/30 dark:via-blue-900/20 dark:to-blue-800/30 border-2 border-blue-200/60 dark:border-blue-700/40 shadow-sm backdrop-blur-sm">
              <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">À</span>
              <span className="truncate text-blue-900 dark:text-blue-200 font-semibold flex-1">{operation.toClient}</span>
            </div>
          </div>
        )}
        
        {/* Action buttons only show if not public view */}
        {!isPublicView && (
          <div className="flex gap-2 mt-5 pt-5 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex-1 h-11 bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/60 hover:from-blue-100 hover:via-blue-100/90 hover:to-blue-200/70 text-blue-700 border-2 border-blue-200/70 hover:border-blue-300 dark:from-blue-950/40 dark:via-blue-950/30 dark:to-blue-900/40 dark:hover:from-blue-900/50 dark:hover:via-blue-900/40 dark:hover:to-blue-800/50 dark:text-blue-300 dark:border-blue-700/50 dark:hover:border-blue-600 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm rounded-xl font-bold"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Modifier</span>
            </Button>
            {(operation.type === 'deposit' || operation.type === 'withdrawal') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransferClick}
                className="flex-1 h-11 bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/60 hover:from-purple-100 hover:via-purple-100/90 hover:to-purple-200/70 text-purple-700 border-2 border-purple-200/70 hover:border-purple-300 dark:from-purple-950/40 dark:via-purple-950/30 dark:to-purple-900/40 dark:hover:from-purple-900/50 dark:hover:via-purple-900/40 dark:hover:to-purple-800/50 dark:text-purple-300 dark:border-purple-700/50 dark:hover:border-purple-600 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm rounded-xl font-bold"
              >
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                <span className="text-xs">Transférer</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 h-11 bg-gradient-to-br from-red-50 via-red-50/80 to-red-100/60 hover:from-red-100 hover:via-red-100/90 hover:to-red-200/70 text-red-700 border-2 border-red-200/70 hover:border-red-300 dark:from-red-950/40 dark:via-red-950/30 dark:to-red-900/40 dark:hover:from-red-900/50 dark:hover:via-red-900/40 dark:hover:to-red-800/50 dark:text-red-300 dark:border-red-700/50 dark:hover:border-red-600 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm rounded-xl font-bold"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Supprimer</span>
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
