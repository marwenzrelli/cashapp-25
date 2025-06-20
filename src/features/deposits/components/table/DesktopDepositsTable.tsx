
import { type Deposit } from "@/components/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatId } from "@/utils/formatId";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface DesktopDepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
  dateRange?: DateRange;
}

type SortField = 'id' | 'client' | 'amount' | 'date';
type SortDirection = 'asc' | 'desc' | null;

export const DesktopDepositsTable = ({
  deposits,
  onEdit,
  onDelete,
  dateRange
}: DesktopDepositsTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Get currency formatting from context
  const {
    currency
  } = useCurrency();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  // Sort deposits
  const sortedDeposits = [...deposits].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'id':
        aValue = typeof a.id === 'number' ? a.id : parseInt(a.id.toString());
        bValue = typeof b.id === 'number' ? b.id : parseInt(b.id.toString());
        break;
      case 'client':
        aValue = a.client_name.toLowerCase();
        bValue = b.client_name.toLowerCase();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'date':
        aValue = new Date(a.operation_date || a.created_at || a.date);
        bValue = new Date(b.operation_date || b.created_at || b.date);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate total deposit amount
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);

  // Format date range for display - convert Date objects to ISO strings first
  const dateRangeText = dateRange?.from && dateRange?.to ? `du ${formatDate(dateRange.from.toISOString())} au ${formatDate(dateRange.to.toISOString())}` : "pour toute la période";
  
  return <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="p-3 font-medium">
            <button 
              onClick={() => handleSort('id')}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              ID
              {getSortIcon('id')}
            </button>
          </th>
          <th className="p-3 font-medium">
            <button 
              onClick={() => handleSort('client')}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              Client
              {getSortIcon('client')}
            </button>
          </th>
          <th className="p-3 font-medium text-center">
            <button 
              onClick={() => handleSort('amount')}
              className="flex items-center gap-2 hover:text-primary transition-colors mx-auto"
            >
              Montant
              {getSortIcon('amount')}
            </button>
          </th>
          <th className="p-3 font-medium">
            <button 
              onClick={() => handleSort('date')}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              Date
              {getSortIcon('date')}
            </button>
          </th>
          <th className="p-3 font-medium">Notes</th>
          <th className="p-3 font-medium text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedDeposits.map(deposit => {
        const operationId = typeof deposit.id === 'number' ? formatId(deposit.id) : deposit.id;
        return <tr key={deposit.id.toString()} className="group border-b transition-colors hover:bg-muted/50">
              <td className="p-3 font-mono text-xs">{operationId}</td>
              <td className="p-3">
                <DepositClientInfo clientName={deposit.client_name} depositId={deposit.id} // No need for toString here, updated interface accepts number
            clientId={deposit.client_id} // No need for toString here, updated interface accepts number
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
                <DepositActions deposit={deposit} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>;
      })}

        {/* Total row */}
        {deposits.length > 0 && <tr className="border-t-2 border-primary/20 font-medium">
            <td colSpan={2} className="p-3 text-right">
              Total des versements {dateRangeText}:
            </td>
            <td className="p-3 text-center text-green-600 dark:text-green-400">
              {totalDeposits.toLocaleString()} {currency}
            </td>
            <td colSpan={3}></td>
          </tr>}
      </tbody>
    </table>;
};
