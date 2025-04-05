import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { formatId } from "@/utils/formatId";
interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}
export const OperationsDetailCards = ({
  clientOperations,
  formatAmount
}: OperationsDetailCardsProps) => {
  // Critical Withdrawal IDs that must be prioritized for display
  const criticalWithdrawalIds = ['72', '73', '74', '75', '76', '77', '78'];

  // Check if this is for pepsi men
  const isPepsiMen = clientOperations.some(op => {
    const client = (op.fromClient || '').toLowerCase();
    return client.includes('pepsi') || client.includes('men');
  });

  // Special handling for withdrawals if this is pepsi men
  const withdrawals = clientOperations.filter(op => op.type === "withdrawal");

  // First, include any critical withdrawals
  const criticalWithdrawals = withdrawals.filter(op => criticalWithdrawalIds.includes(op.id.toString()));

  // Then add other withdrawals up to a total of 3
  const otherWithdrawals = withdrawals.filter(op => !criticalWithdrawalIds.includes(op.id.toString())).slice(0, Math.max(0, 3 - criticalWithdrawals.length));

  // Combine critical and other withdrawals, ensuring critical ones are included
  const displayWithdrawals = [...criticalWithdrawals, ...otherWithdrawals].slice(0, 3);

  // Regular handling for deposits and transfers
  const deposits = clientOperations.filter(op => op.type === "deposit").slice(0, 3);
  const transfers = clientOperations.filter(op => op.type === "transfer").slice(0, 3);
  if (isPepsiMen) {
    // Log all withdrawal IDs for debugging
    const allWithdrawalIds = clientOperations.filter(op => op.type === "withdrawal").map(op => op.id);
    console.log(`OperationsDetailCards for pepsi men:`);
    console.log(`- Found ${displayWithdrawals.length} withdrawals to display (showing max 3)`);
    console.log(`- All withdrawals: ${withdrawals.length}`);
    console.log(`- All withdrawal IDs: ${allWithdrawalIds.join(', ')}`);

    // Check specifically for critical IDs
    const hasCriticalIds = criticalWithdrawalIds.some(id => allWithdrawalIds.includes(id));
    console.log(`- Has critical IDs 72-78: ${hasCriticalIds}`);

    // List all found critical IDs
    const foundCriticalIds = criticalWithdrawalIds.filter(id => allWithdrawalIds.includes(id));
    console.log(`- Found critical IDs: ${foundCriticalIds.join(', ')}`);

    // Check for specific critical withdrawals
    if (criticalWithdrawals.length > 0) {
      console.log(`- Critical withdrawals to display: ${criticalWithdrawals.map(w => w.id).join(', ')}`);
    }
  }

  // Format date helper
  const formatOperationDate = (date: string | Date) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy");
  };
  return;
};