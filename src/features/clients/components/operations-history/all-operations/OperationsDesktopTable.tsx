import { Operation } from "@/features/operations/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "./OperationTypeHelpers";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { TotalsSection } from "./TotalsSection";
import { formatId } from "@/utils/formatId";
import { OperationIdActionModal } from "@/features/operations/components/OperationIdActionModal";
import { useState } from "react";

interface OperationsDesktopTableProps {
  operations: Operation[];
  currency: string;
}

export const OperationsDesktopTable = ({
  operations,
  currency
}: OperationsDesktopTableProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Function to handle clicking on an operation ID
  const handleOperationClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setShowActionModal(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  <button 
                    onClick={() => handleOperationClick(operation)}
                    className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    #{formatId(operation.id)}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {operation.type === "deposit" && <ArrowUpCircle className="mr-1 h-3 w-3" />}
                    {operation.type === "withdrawal" && <ArrowDownCircle className="mr-1 h-3 w-3" />}
                    {operation.type === "transfer" && <RefreshCcw className="mr-1 h-3 w-3" />}
                    {operation.type}
                  </Badge>
                </TableCell>
                <TableCell>{operation.description}</TableCell>
                <TableCell>{operation.date}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(operation.amount)} {currency}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TotalsSection operations={operations} currency={currency} />

      {selectedOperation && (
        <OperationIdActionModal
          open={showActionModal}
          onOpenChange={setShowActionModal}
          operation={selectedOperation}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </>
  );
};
