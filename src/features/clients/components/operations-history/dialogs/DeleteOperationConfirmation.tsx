
import { Operation } from "@/features/operations/types";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";

interface DeleteOperationConfirmationProps {
  operation: Operation;
  loading: boolean;
}

export const DeleteOperationConfirmation = ({ 
  operation, 
  loading 
}: DeleteOperationConfirmationProps) => {
  return (
    <p>
      Êtes-vous sûr de vouloir supprimer cette opération ?
      <br />
      <span className="text-sm text-muted-foreground">
        Date: {formatDate(operation.date)}
        <br />
        Montant: {Math.abs(operation.amount).toLocaleString()} TND
        <br />
        {operation.description && `Description: ${operation.description}`}
      </span>
    </p>
  );
};
