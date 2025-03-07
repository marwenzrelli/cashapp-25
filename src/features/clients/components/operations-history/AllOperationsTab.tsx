
import React from "react";
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
import { formatOperationAmount, getOperationTypeIcon } from "./utils";

interface AllOperationsTabProps {
  operations: Operation[];
  currency: string;
  renderActions?: (operation: Operation) => React.ReactNode;
}

export const AllOperationsTab = ({ 
  operations, 
  currency,
  renderActions 
}: AllOperationsTabProps) => {
  const allOperations = [...operations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {allOperations.map((operation) => (
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
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>{operation.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getOperationTypeIcon(operation.type)}
                    <span className="capitalize">
                      {operation.type === "deposit"
                        ? "Versement"
                        : operation.type === "withdrawal"
                        ? "Retrait"
                        : "Virement"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{operation.description}</TableCell>
                <TableCell className="text-right">
                  {formatOperationAmount(operation, currency)}
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
