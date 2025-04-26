
import { Operation } from "@/features/operations/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface PublicAccountFlowTabProps {
  operations: Operation[];
}

export const PublicAccountFlowTab = ({ operations }: PublicAccountFlowTabProps) => {
  const { currency } = useCurrency();
  
  // Sort operations by date and calculate running balance
  const processedOperations = useMemo(() => {
    // Sort operations from oldest to newest first
    const sortedOps = [...operations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate running balance
    let runningBalance = 0;
    const opsWithBalance = sortedOps.map(op => {
      const balanceBefore = runningBalance;
      
      // Update running balance based on operation type
      if (op.type === "deposit") {
        runningBalance += op.amount;
      } else if (op.type === "withdrawal") {
        runningBalance -= op.amount;
      } else if (op.type === "transfer") {
        runningBalance -= op.amount; // Assuming transfer out
      }

      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance
      };
    });

    // Return sorted from newest to oldest for display
    return opsWithBalance.reverse();
  }, [operations]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getAmountClass = (type: string) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") return "text-blue-600";
    return "";
  };

  return (
    <Card className="mt-4">
      <ScrollArea className="h-[600px] w-full rounded-md">
        {/* Mobile view */}
        <AccountFlowMobileView operations={processedOperations} />

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[150px] text-right">Solde avant</TableHead>
                <TableHead className="w-[120px] text-right">Montant</TableHead>
                <TableHead className="w-[150px] text-right">Solde après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucune opération trouvée
                  </TableCell>
                </TableRow>
              ) : (
                processedOperations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">
                      {formatDateTime(op.operation_date || op.date)}
                    </TableCell>
                    <TableCell>{op.id.toString().split('-')[1] || op.id}</TableCell>
                    <TableCell>
                      <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                        {getTypeIcon(op.type)}
                        {getTypeLabel(op.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(op.balanceBefore)}
                    </TableCell>
                    <TableCell className={`text-right ${getAmountClass(op.type)}`}>
                      {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAmount(op.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
};
