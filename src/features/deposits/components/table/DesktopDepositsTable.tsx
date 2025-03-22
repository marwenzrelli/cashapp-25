
import { type Deposit } from "@/components/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";

interface DesktopDepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DesktopDepositsTable = ({ 
  deposits, 
  onEdit, 
  onDelete 
}: DesktopDepositsTableProps) => {
  // Calculate total deposit amount
  const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0);

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="p-3 font-medium">Client</th>
          <th className="p-3 font-medium">Montant</th>
          <th className="p-3 font-medium">Date</th>
          <th className="p-3 font-medium">Description</th>
          <th className="p-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map((deposit) => (
          <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
            <td className="p-3">
              <DepositClientInfo 
                clientName={deposit.client_name} 
                depositId={deposit.id} 
              />
            </td>
            <td className="p-3">
              <DepositAmount amount={deposit.amount} />
            </td>
            <td className="p-3 text-muted-foreground">
              <DepositDateInfo deposit={deposit} />
            </td>
            <td className="p-3 text-muted-foreground">{deposit.description}</td>
            <td className="p-3">
              <DepositActions 
                deposit={deposit} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            </td>
          </tr>
        ))}

        {/* Total row */}
        {deposits.length > 0 && (
          <tr className="border-t-2 border-primary/20 font-medium">
            <td colSpan={1} className="p-3">Total des versements:</td>
            <td className="p-3 text-green-600 dark:text-green-400">
              {totalDeposits.toLocaleString()} TND
            </td>
            <td colSpan={3}></td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
