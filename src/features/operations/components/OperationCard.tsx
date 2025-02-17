
import { Operation } from "../types";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";

interface OperationCardProps {
  operation: Operation;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
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

export const OperationCard = ({ operation, onEdit, onDelete }: OperationCardProps) => {
  return (
    <div className="group relative rounded-lg border bg-card p-4 hover:shadow-md transition-all">
      <div className="absolute -left-px top-4 bottom-4 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getTypeStyle(operation.type)}`}>
            {getTypeIcon(operation.type)}
            {getTypeLabel(operation.type)}
          </div>
          <div className="space-y-1">
            <p className="font-medium">{operation.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</span>
              {operation.type === "transfer" ? (
                <>
                  <span>•</span>
                  <span>De: {operation.fromClient}</span>
                  <span>•</span>
                  <span>À: {operation.toClient}</span>
                </>
              ) : (
                <>
                  <span>•</span>
                  <span>Client: {operation.fromClient}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-semibold">
              {operation.amount.toLocaleString()} €
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {operation.id}
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(operation)}
              className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4 transition-transform hover:scale-110" />
              <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(operation)}
              className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 transition-transform hover:scale-110" />
              <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
