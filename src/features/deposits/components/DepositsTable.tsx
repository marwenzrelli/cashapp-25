
import { type Deposit } from "@/components/deposits/types";
import { DesktopDepositsTable } from "./table/DesktopDepositsTable";
import { MobileDepositsTable } from "./table/MobileDepositsTable";
import { DateRange } from "react-day-picker";

interface DepositsTableProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
  dateRange?: DateRange;
}

export const DepositsTable = ({ 
  deposits, 
  onEdit, 
  onDelete,
  dateRange
}: DepositsTableProps) => {
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop table with border */}
      <div className="hidden md:block overflow-auto rounded-lg border">
        <DesktopDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete}
          dateRange={dateRange}
        />
      </div>

      {/* Mobile cards with no container border */}
      <div className="md:hidden w-full">
        <MobileDepositsTable 
          deposits={deposits} 
          onEdit={onEdit} 
          onDelete={onDelete}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
};
