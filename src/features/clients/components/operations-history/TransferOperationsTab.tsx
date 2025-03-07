
import { Operation } from "@/features/operations/types";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { ArrowLeftRight } from "lucide-react";
import React from "react";

interface TransferOperationsTabProps {
  operations: Operation[];
  currency: string;
  renderActions?: (operation: Operation) => React.ReactNode;
}

export const TransferOperationsTab = ({ 
  operations, 
  currency,
  renderActions 
}: TransferOperationsTabProps) => {
  const transferOperations = [...operations]
    .filter((op) => op.type === "transfer")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transferOperations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun virement trouvé</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {transferOperations.map((operation) => (
          <OperationsMobileCard
            key={operation.id}
            operation={operation}
            currency={currency}
            renderActions={renderActions}
          />
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>De</TableHead>
              <TableHead>À</TableHead>
              <TableHead>Description</TableHead>
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transferOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>{operation.date}</TableCell>
                <TableCell>
                  <div
                    className={`flex items-center gap-2 ${
                      operation.amount > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="font-medium">
                      {operation.amount > 0 ? "+" : "-"}
                      {Math.abs(operation.amount).toLocaleString()} {currency}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{operation.fromClient}</TableCell>
                <TableCell>{operation.toClient}</TableCell>
                <TableCell>{operation.description}</TableCell>
                {renderActions && (
                  <TableCell className="text-right">
                    {renderActions(operation)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
