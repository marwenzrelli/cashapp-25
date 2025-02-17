
import { Table } from "@/components/ui/table";
import { UserCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "./types";
import { cn } from "@/lib/utils";

interface DepositListProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositList = ({ deposits, onEdit, onDelete }: DepositListProps) => {
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="p-3">Client</th>
          <th className="p-3">Montant</th>
          <th className="p-3">Date</th>
          <th className="p-3">Description</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map((deposit) => (
          <tr key={deposit.id} className="group border-b hover:bg-muted/50 transition-colors">
            <td className="p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                </div>
                <div>
                  <p className="font-medium">{deposit.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {deposit.id}
                  </p>
                </div>
              </div>
            </td>
            <td className="p-3">
              <div className={cn(
                "flex items-center gap-2",
                getAmountColor(deposit.amount)
              )}>
                <ArrowUpCircle className="h-4 w-4" />
                <span className="font-medium">
                  {deposit.amount.toLocaleString()} €
                </span>
              </div>
            </td>
            <td className="p-3 text-muted-foreground">{deposit.date}</td>
            <td className="p-3 text-muted-foreground">{deposit.description}</td>
            <td className="p-3">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(deposit)}
                  className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                  <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(deposit)}
                  className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
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
  );
};
