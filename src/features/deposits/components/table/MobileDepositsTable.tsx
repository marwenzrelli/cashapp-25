
import { Deposit } from "@/features/deposits/types";
import { DepositClientInfo } from "./DepositClientInfo";
import { DepositAmount } from "./DepositAmount";
import { DepositDateInfo } from "./DepositDateInfo";
import { DepositActions } from "./DepositActions";

interface MobileDepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const MobileDepositsTable = ({ 
  deposits, 
  onEdit, 
  onDelete 
}: MobileDepositsTableProps) => {
  return (
    <div className="space-y-4">
      {deposits.map((deposit) => (
        <div key={deposit.id} className="p-4 border-b last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <DepositClientInfo 
              clientName={deposit.client_name} 
              depositId={deposit.id} 
            />
            <DepositAmount amount={deposit.amount} />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <DepositDateInfo deposit={deposit} />
            </div>
            <p>{deposit.description || deposit.notes || ""}</p>
          </div>
          <DepositActions 
            deposit={deposit} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            isMobile={true} 
          />
        </div>
      ))}
    </div>
  );
};
