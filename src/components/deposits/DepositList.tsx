
import { Table } from "@/components/ui/table";
import { UserCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Deposit } from "./types";

interface DepositListProps {
  deposits: Deposit[];
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositList = ({ deposits, onEdit, onDelete }: DepositListProps) => {
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="p-3">Client</th>
          <th className="p-3">Montant</th>
          <th className="p-3">Date</th>
          <th className="p-3">Notes</th>
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
                  <p className="font-medium">{deposit.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {deposit.id}
                  </p>
                </div>
              </div>
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2 text-success">
                <ArrowUpCircle className="h-4 w-4" />
                <span className="font-medium">
                  {deposit.amount.toLocaleString()} €
                </span>
              </div>
            </td>
            <td className="p-3 text-muted-foreground">{deposit.date}</td>
            <td className="p-3 text-muted-foreground">{deposit.notes}</td>
            <td className="p-3">
              <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(deposit)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all"
                >
                  <Pencil className="h-4 w-4 rotate-12 transition-all hover:rotate-45 hover:scale-110" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(deposit)}
                  className="hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all"
                >
                  <Trash2 className="h-4 w-4 transition-all hover:-translate-y-1 hover:scale-110" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
