
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { formatDateTime, formatAmount, getAmountClass, getAmountPrefix, getBalanceClass } from "../utils/accountFlowFormatters";

interface AccountFlowDesktopTableProps {
  processedOperations: any[];
  clientFullName: string;
}

export const AccountFlowDesktopTable = ({ processedOperations, clientFullName }: AccountFlowDesktopTableProps) => {
  return (
    <div className="hidden md:block">
      <ScrollArea className="h-[600px] w-full rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px] text-right">Solde avant</TableHead>
              <TableHead className="w-[120px] text-right">Montant</TableHead>
              <TableHead className="w-[150px] text-right">Solde après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedOperations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune opération trouvée
                </TableCell>
              </TableRow>
            ) : (
              processedOperations.map((op: any) => (
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
                  <TableCell className="max-w-[200px] truncate">
                    {op.description || "-"}
                  </TableCell>
                  <TableCell className={`text-right ${getBalanceClass(op.balanceBefore)}`}>
                    {formatAmount(op.balanceBefore)}
                  </TableCell>
                  <TableCell className={`text-right ${getAmountClass(op.type, clientFullName, op)}`}>
                    {getAmountPrefix(op.type, clientFullName, op)}{formatAmount(op.amount)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                    {formatAmount(op.balanceAfter)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
