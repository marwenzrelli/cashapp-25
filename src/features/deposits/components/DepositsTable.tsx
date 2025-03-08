
import { type Deposit } from "@/components/deposits/types";
import { DesktopDepositsTable } from "./table/DesktopDepositsTable";
import { MobileDepositsTable } from "./table/MobileDepositsTable";

interface DepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositsTable = ({ deposits, onEdit, onDelete }: DepositsTableProps) => {
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop table with border */}
      <div className="hidden md:block overflow-auto rounded-lg border">
        <DesktopDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>

      {/* Mobile cards with no container border */}
      <div className="md:hidden px-0">
        <MobileDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>
    </div>
  );
};
