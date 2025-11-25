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
      <div className="group flex flex-col p-3 bg-gradient-to-br from-background via-background/95 to-muted/20 rounded-xl border border-border/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 w-full backdrop-blur-xl hover:border-primary/20 animate-fade-in">
        <div className="flex items-start justify-between mb-2.5 gap-2">
          <div className="flex items-center gap-1.5">
            {showType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
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
            <div className="flex items-center gap-1 bg-muted/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-border/30">
              <Hash className="h-2.5 w-2.5 text-muted-foreground/70" />
              <span className="text-[10px] font-mono font-medium text-muted-foreground">
                {showId && operation.id}
              </span>
            </div>
          </div>
          <div className={cn(
            "text-lg font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm backdrop-blur-sm border group-hover:scale-105 transition-transform duration-200",
            colorClass || (
              operation.type === "withdrawal" 
                ? "text-red-700 bg-gradient-to-br from-red-50 to-red-100/60 border-red-200/60 dark:from-red-900/40 dark:to-red-800/30 dark:text-red-300 dark:border-red-700/40" 
                : operation.type === "deposit" 
                ? "text-green-700 bg-gradient-to-br from-green-50 to-green-100/60 border-green-200/60 dark:from-green-900/40 dark:to-green-800/30 dark:text-green-300 dark:border-green-700/40" 
                : "text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100/60 border-blue-200/60 dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-300 dark:border-blue-700/40"
            )
          )}>
            {formatAmountValue(operation.amount)} {currency}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2 p-2 bg-gradient-to-r from-primary/8 to-primary/5 rounded-lg border border-primary/20 shadow-sm">
          <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-semibold text-xs text-foreground flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {clientName}
          </span>
        </div>
        
        <div className="flex gap-2 mb-2 text-[10px]">
          <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-lg border border-border/30 flex-1">
            <CalendarClock className="h-3 w-3 text-primary/70" />
            <span className="font-semibold text-foreground">{formatDate(operationDate, "dd MMM yy")}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-lg border border-border/30">
            <Clock className="h-3 w-3 text-primary/70" />
            <span className="font-semibold text-foreground">{formatDate(operationDate, "HH:mm")}</span>
          </div>
        </div>
        
        {operation.description && (
          <p className="text-xs leading-snug text-foreground/80 my-2 break-words p-2 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/20 italic">
            {operation.description}
          </p>
        )}
        
        {operation.type === "transfer" && (
          <div className="text-xs border-t border-border/30 pt-2 mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200/60 dark:border-orange-700/30">
              <span className="text-orange-700 dark:text-orange-300 font-bold text-[10px]">DE</span>
              <span className="truncate text-orange-900 dark:text-orange-200 font-medium flex-1 text-[11px]">{operation.fromClient}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200/60 dark:border-blue-700/30">
              <span className="text-blue-700 dark:text-blue-300 font-bold text-[10px]">À</span>
              <span className="truncate text-blue-900 dark:text-blue-200 font-medium flex-1 text-[11px]">{operation.toClient}</span>
            </div>
          </div>
        )}
        
        {/* Action buttons only show if not public view */}
        {!isPublicView && (
          <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex-1 h-8 bg-gradient-to-r from-blue-50 to-blue-100/60 hover:from-blue-100 hover:to-blue-200/70 text-blue-700 border border-blue-200/70 hover:border-blue-300 dark:from-blue-950/40 dark:to-blue-900/40 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 dark:text-blue-300 dark:border-blue-700/50 shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all duration-200 rounded-lg font-bold"
            >
              <Pencil className="h-3 w-3 mr-1" />
              <span className="text-[10px]">Modifier</span>
            </Button>
            {(operation.type === 'deposit' || operation.type === 'withdrawal') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransferClick}
                className="flex-1 h-8 bg-gradient-to-r from-purple-50 to-purple-100/60 hover:from-purple-100 hover:to-purple-200/70 text-purple-700 border border-purple-200/70 hover:border-purple-300 dark:from-purple-950/40 dark:to-purple-900/40 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 dark:text-purple-300 dark:border-purple-700/50 shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all duration-200 rounded-lg font-bold"
              >
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                <span className="text-[10px]">Transférer</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 h-8 bg-gradient-to-r from-red-50 to-red-100/60 hover:from-red-100 hover:to-red-200/70 text-red-700 border border-red-200/70 hover:border-red-300 dark:from-red-950/40 dark:to-red-900/40 dark:hover:from-red-900/50 dark:hover:to-red-800/50 dark:text-red-300 dark:border-red-700/50 shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all duration-200 rounded-lg font-bold"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="text-[10px]">Supprimer</span>
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
