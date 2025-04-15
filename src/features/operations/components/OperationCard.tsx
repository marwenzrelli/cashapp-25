import { Operation } from "../types";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, RefreshCcw, User, Hash } from "lucide-react";
import { formatDateTime } from "../types";
import { formatId } from "@/utils/formatId";
import { useState } from "react";
import { OperationIdActionModal } from "./OperationIdActionModal";

interface OperationCardProps {
  operation: Operation;
  onEdit?: (operation: Operation) => void;
  onDelete?: (operation: Operation) => void;
}

const getTypeStyle = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "bg-green-50 text-green-600 dark:bg-green-950/50";
    case "withdrawal":
      return "bg-red-50 text-red-600 dark:bg-red-950/50";
    case "transfer":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
  }
};

const getAmountColor = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-purple-600 dark:text-purple-400";
  }
};

const getTypeIcon = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return <ArrowUpCircle className="h-4 w-4" />;
    case "withdrawal":
      return <ArrowDownCircle className="h-4 w-4" />;
    case "transfer":
      return <RefreshCcw className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "Versement";
    case "withdrawal":
      return "Retrait";
    case "transfer":
      return "Virement";
  }
};

// Format transaction ID to 6 digits
const formatOperationId = (id: string) => {
  // If the ID is numeric or can be converted to a number
  if (!isNaN(Number(id))) {
    // Pad with leading zeros to get 6 digits
    return id.padStart(6, '0');
  }
  
  // For UUID format, take first 6 characters
  return id.slice(0, 6);
};

export const OperationCard = ({ operation, onEdit, onDelete }: OperationCardProps) => {
  const [showActionModal, setShowActionModal] = useState(false);

  return (
    <div className="group flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
          {getTypeIcon(operation.type)}
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{operation.description}</span>
            <button
              onClick={() => setShowActionModal(true)}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Hash className="h-3 w-3" />
              {formatOperationId(operation.id.slice(0, 4))}
            </button>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5 overflow-hidden">
            <span className="whitespace-nowrap">{operation.formattedDate || formatDateTime(operation.createdAt || operation.date)}</span>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {operation.type === "transfer" ? (
                <span className="truncate">
                  De: {operation.fromClient} • À: {operation.toClient}
                </span>
              ) : (
                <span className="truncate">
                  {operation.fromClient}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-right font-semibold whitespace-nowrap ${getAmountColor(operation.type)}`}>
          {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount)} TND
        </span>
        
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(operation)}
                className="h-8 w-8 relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
              >
                <Edit2 className="h-4 w-4 transition-transform hover:scale-110" />
                <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(operation)}
                className="h-8 w-8 relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 transition-transform hover:scale-110" />
                <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
              </Button>
            )}
          </div>
        )}
      </div>

      <OperationIdActionModal
        open={showActionModal}
        onOpenChange={setShowActionModal}
        operation={operation}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};
