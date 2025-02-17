
import { User, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "@/components/deposits/types";
import { cn } from "@/lib/utils";

interface DepositsTableProps {
  deposits: Deposit[];
  itemsPerPage: string;
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositsTable = ({ deposits, itemsPerPage, onEdit, onDelete }: DepositsTableProps) => {
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="relative w-full overflow-auto rounded-lg border">
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
          {deposits.slice(0, parseInt(itemsPerPage)).map((deposit) => (
            <tr key={deposit.id} className="group border-b transition-colors hover:bg-muted/50">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <User className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {deposit.client_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      #{deposit.id.toString().padStart(6, '0')}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div className={cn(
                  "font-medium tabular-nums",
                  getAmountColor(deposit.amount)
                )}>
                  {deposit.amount.toLocaleString()} TND
                </div>
              </td>
              <td className="p-3 text-muted-foreground">
                {deposit.date}
              </td>
              <td className="p-3 text-muted-foreground">
                {deposit.description}
              </td>
              <td className="p-3">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                    onClick={() => onEdit(deposit)}
                  >
                    <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                    <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                    onClick={() => onDelete(deposit)}
                  >
                    <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                    <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
