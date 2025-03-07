
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
import { ArrowUpCircle } from "lucide-react";
import React from "react";

interface WithdrawalOperationsTabProps {
  operations: Operation[];
  currency: string;
  renderActions?: (operation: Operation) => React.ReactNode;
}

export const WithdrawalOperationsTab = ({ 
  operations, 
  currency,
  renderActions 
}: WithdrawalOperationsTabProps) => {
  const withdrawalOperations = [...operations]
    .filter((op) => op.type === "withdrawal")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (withdrawalOperations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun retrait trouvé</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {withdrawalOperations.map((operation) => (
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
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>{operation.date}</TableCell>
                <TableCell>{operation.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-danger">
                    <ArrowUpCircle className="h-4 w-4" />
                    <span className="font-medium">
                      -{Math.abs(operation.amount).toLocaleString()} {currency}
                    </span>
                  </div>
                </TableCell>
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
