
import { Deposit } from "@/features/deposits/types";
import { DesktopDepositsTable } from "./table/DesktopDepositsTable";
import { MobileDepositsTable } from "./table/MobileDepositsTable";

interface DepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositsTable = ({ deposits, onEdit, onDelete }: DepositsTableProps) => {
  return (
    <div className="relative w-full overflow-auto rounded-lg border">
      <div className="hidden md:block">
        <DesktopDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>

      <div className="md:hidden">
        <MobileDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>
    </div>
  );
};
