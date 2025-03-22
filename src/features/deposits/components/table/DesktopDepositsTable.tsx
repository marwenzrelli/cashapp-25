
import { type Deposit } from "@/components/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatId } from "@/utils/formatId";

interface DesktopDepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
  dateRange?: DateRange;
}

export const DesktopDepositsTable = ({ 
  deposits, 
  onEdit, 
  onDelete,
  dateRange
}: DesktopDepositsTableProps) => {
  // Get currency formatting from context
  const { currency } = useCurrency();
  
  // Calculate total deposit amount
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);
  
  // Format date range for display - convert Date objects to ISO strings first
  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}`
    : "pour toute la période";

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="p-3 font-medium">ID</th>
          <th className="p-3 font-medium">Client</th>
          <th className="p-3 font-medium text-center">Montant</th>
          <th className="p-3 font-medium">Date d'opération</th>
          <th className="p-3 font-medium">Notes</th>
          <th className="p-3 font-medium text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map((deposit) => {
          const operationId = isNaN(parseInt(deposit.id)) ? deposit.id : formatId(parseInt(deposit.id));
          return (
            <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
              <td className="p-3 font-mono text-xs">{operationId}</td>
              <td className="p-3">
                <DepositClientInfo 
                  clientName={deposit.client_name} 
                  depositId={deposit.id} 
                />
              </td>
              <td className="p-3 text-center">
                <DepositAmount amount={deposit.amount} />
              </td>
              <td className="p-3 text-muted-foreground">
                <DepositDateInfo deposit={deposit} />
              </td>
              <td className="p-3 text-muted-foreground">{deposit.description}</td>
              <td className="p-3 text-center">
                <DepositActions 
                  deposit={deposit} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              </td>
            </tr>
          );
        })}

        {/* Total row */}
        {deposits.length > 0 && (
          <tr className="border-t-2 border-primary/20 font-medium">
            <td colSpan={2} className="p-3 text-right">
              Total des versements {dateRangeText}:
            </td>
            <td className="p-3 text-center text-green-600 dark:text-green-400">
              {totalDeposits.toLocaleString()} {currency}
            </td>
            <td colSpan={3}></td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
