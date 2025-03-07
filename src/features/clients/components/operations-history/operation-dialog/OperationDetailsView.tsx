
import { Operation } from "@/features/operations/types";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";

interface OperationDetailsViewProps {
  operation: Operation;
}

export const OperationDetailsView = ({ operation }: OperationDetailsViewProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <span className="text-muted-foreground">Type:</span>
      <span className="font-medium capitalize">
        {operation.type === 'withdrawal' ? 'Retrait' : 
         operation.type === 'deposit' ? 'Versement' : 'Virement'}
      </span>
      
      <span className="text-muted-foreground">Date:</span>
      <span className="font-medium">{formatDate(operation.date)}</span>
      
      <span className="text-muted-foreground">Montant:</span>
      <span className="font-medium">{Math.abs(operation.amount).toLocaleString()} TND</span>
      
      <span className="text-muted-foreground">Client:</span>
      <span className="font-medium">{operation.fromClient}</span>
      
      {operation.description && (
        <>
          <span className="text-muted-foreground">Description:</span>
          <span className="font-medium">{operation.description}</span>
        </>
      )}
    </div>
  );
};
